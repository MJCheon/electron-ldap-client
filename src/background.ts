'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  MenuItem,
  Menu
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import { LdapServer } from './library/LdapServer'
import { LdapFactory } from './library/LdapFactory'
import { LdapTree } from './library/LdapTree'
import { SearchResult, Entry, Attribute } from 'ldapts'
import { TreeNode, LdapConfig, LdapChange, ModifyAttributeTreeNodeObject, ModifyDnNodeObject, ModifyDnObject, DeleteDnObject, AddDnNodeObject, AddDnObject } from './library/common'
import { Node } from 'tree-model'
import { getAddAttributeList, getAttributeChanges, getDeleteDn, getModifyDn, getParentDn } from './library/LdapUtil'

const isDevelopment = process.env.NODE_ENV !== 'production'

const mainIcon = join(__dirname, './assets/icons/icon.png')

let isLdapConnected: boolean = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    icon: mainIcon,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) { 
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

function createMenu() {
  const file: MenuItem = new MenuItem({
    label: 'File',
    submenu: [
      {
        label: 'Minimize',
        role: 'minimize'
      },
      {
        label: 'Quit',
        role: 'quit'
      }
    ]
  })
  
  const edit: MenuItem = new MenuItem({
    label: 'Edit',
    role: 'editMenu'
  })

  const help: MenuItem = new MenuItem({
    label: 'Help',
    submenu: [
      {
        label: 'Version',
        click: async () => {
          const { dialog } = require('electron')

          const message = 'Version : ' + app.getVersion()
          const option = {
            type: 'info',
            title: 'Version',
            icon: mainIcon,
            message: message
          }
      
          dialog.showMessageBox(option)
        }
      },
      {
        label: 'Help',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/MJCheon/electron-ldap-client/wiki')
        }
      }
    ]
  })

  const template: MenuItem[] = [file, edit, help]
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// Quit when all windows are closed.
app.on('window-all-closed', async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }

  if (isLdapConnected) {
    let ldapServer: LdapServer = LdapFactory.Instance()
    await ldapServer.disconnect()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', String(e))
    }
  }
  createWindow()
  createMenu()
})

// Ldap Connect and Get ldap entries
ipcMain.on('serverBind', async (event : IpcMainEvent , ldapConfig : LdapConfig) => {
  const ldapServer: LdapServer = LdapFactory.Instance()

  if (isLdapConnected && ldapConfig !== ldapServer.ldapConfig) {
    await ldapServer.disconnect()
  }

  ldapServer.ldapConfig = ldapConfig
  const isAuthenticated: boolean = await ldapServer.connect()

  if (isAuthenticated){
    let searchResult: SearchResult | null = await ldapServer.search()
    let ldapTree: LdapTree = new LdapTree()
    if (searchResult){
      ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)
      let rootNode : Node<TreeNode> | undefined = ldapTree.rootNode
      if (rootNode) {
        const searchResponse: Node<TreeNode>[] = [ rootNode.model ]
        event.reply('allSearchResponse', searchResponse )
      }
    }
  }

  if (!isLdapConnected) {
    isLdapConnected = true
  }
})

// Get Attribute of ldap entry
ipcMain.on("attributeTree", (event : IpcMainEvent, nodeName: string, nodeParent: TreeNode, isAddDn: Boolean, attributes?: Entry) => {
  let ldapTree: LdapTree = new LdapTree()
  let parentDn: string = getParentDn(nodeParent)
  const attrResponse: TreeNode[] = ldapTree.makeAttrTree(nodeName, parentDn, attributes)
  event.reply("attributeTreeResponse", attrResponse, isAddDn);
})

// Refresh ldap Entries
ipcMain.on("refreshRootTree", async (event : IpcMainEvent) => {
  const ldapServer: LdapServer = LdapFactory.Instance()
  let searchResult: SearchResult | null = await ldapServer.search()
  let ldapTree: LdapTree = new LdapTree()
  if (searchResult){
    ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)
    let rootNode : Node<TreeNode> | undefined = ldapTree.rootNode
      if (rootNode) {
        const searchResponse: Node<TreeNode>[] = [ rootNode.model ]
        event.reply('allSearchResponse', searchResponse )
      }
  }
})

// Save All Changed Data
ipcMain.on("saveAllChange", async (event: IpcMainEvent, addDnNodeList: AddDnNodeObject[], modifyDnNodeList: ModifyDnNodeObject[], saveAttributeList: ModifyAttributeTreeNodeObject[], deletDnNodeList: TreeNode[]) => {
  const ldapServer: LdapServer = LdapFactory.Instance()

  if (addDnNodeList.length > 0) {
    addDnNodeList.forEach(async (addDnNodeObject: AddDnNodeObject) => {
      let [dn, attrList] = getAddAttributeList(addDnNodeObject.nodeName, addDnNodeObject.attrTree)
      if (ldapServer.isConnected()) {
        await ldapServer.add(dn, attrList)
      }
    })
  }

  if (modifyDnNodeList.length > 0) {
    modifyDnNodeList.forEach(async (modifyDnNodeObject: ModifyDnNodeObject) => {
      let [nodeDn, modifyDn] = getModifyDn(modifyDnNodeObject)
      if (ldapServer.isConnected()) {
        await ldapServer.modifyDn(nodeDn, modifyDn)
      }
    })
  }

  if (saveAttributeList.length > 0) {
    saveAttributeList.forEach(async (attribute: ModifyAttributeTreeNodeObject) => {
      let attrTree: TreeNode[] = attribute.tree
      let deleteList: TreeNode[] = attribute.deleteList
      let changeData: LdapChange = getAttributeChanges(attrTree, deleteList)

      if (ldapServer.isConnected()) {
        await ldapServer.modify(changeData);
      }
    })
  }

  if (deletDnNodeList.length > 0) {
    deletDnNodeList.forEach(async (deleteDnNode: TreeNode) => {
      let [originDn, parentDn] = getDeleteDn(deleteDnNode)

      if (ldapServer.isConnected()) {
        await ldapServer.delete(originDn)
      }
    })
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  event.reply("refreshRootTreeFromMain");
})

ipcMain.on("showChangePage", async (event : IpcMainEvent, addDnNodeList: AddDnNodeObject[], modifyDnNodeList : ModifyDnNodeObject[], saveAttributeList: ModifyAttributeTreeNodeObject[], deleteDnNodeList: TreeNode[]) => {
  const ldapServer: LdapServer = LdapFactory.Instance()

  let addDnList: AddDnObject[] = []
  let modifyDnList: ModifyDnObject[] = []
  let changeAttrList: LdapChange[] = []
  let deleteDnList: DeleteDnObject[] = []

  if (addDnNodeList.length > 0) {
    addDnNodeList.forEach((addDnNode: AddDnNodeObject) => {
      let [dn, attrList]: [string, Attribute[]] = getAddAttributeList(addDnNode.nodeName, addDnNode.attrTree)

      addDnList.push({
        dn: dn,
        attrList: attrList
      })
    })
  }

  if (modifyDnNodeList.length > 0) {
    modifyDnNodeList.forEach((modifyDnNodeObject: ModifyDnNodeObject) => {
      let [originDn, modifyDn]: [string, string] = getModifyDn(modifyDnNodeObject)

      modifyDnList.push({
        originDn: originDn,
        modifyDn: modifyDn
      })
    })
  }

  if (saveAttributeList.length > 0) {
    saveAttributeList.forEach((attribute: ModifyAttributeTreeNodeObject) => {
      let attrTree: TreeNode[] = attribute.tree
      let deleteList: TreeNode[] = attribute.deleteList
      let changeData: LdapChange = getAttributeChanges(attrTree, deleteList)
      changeAttrList.push(changeData)
    })
  }

  if (deleteDnNodeList.length > 0) {
    deleteDnNodeList.forEach((deleteDnNode: TreeNode) => {
      let [originDn, parentDn]: [string, string] = getDeleteDn(deleteDnNode)

      if (originDn !== '' && parentDn !== '') {
        deleteDnList.push({
          originDn: originDn,
          parentDn: parentDn
        })
      }
    })
  }
  
  event.reply("returnShowChangePage", addDnList, modifyDnList, changeAttrList, deleteDnList);
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
