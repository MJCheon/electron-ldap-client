'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  IpcMainEvent
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import { LdapServer } from './library/LdapServer'
import { LdapFactory } from './library/LdapFactory'
import { LdapTree } from './library/LdapTree'
import { SearchResult, Entry } from 'ldapts'
import { TreeNode, LdapConfig, LdapChange } from './library/common'
import { Node } from 'tree-model'

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

  win.webContents.on('before-input-event', (event, input) => {
    if (process.platform === 'darwin') {
      if (input.key.toLowerCase() === 'r' && input.meta) {
        win.webContents.send('refreshRootTreeFromMain')
        event.preventDefault()
      } else if (input.key.toLowerCase() === 's' && input.meta) {
        win.webContents.send('saveAttributeFromShortcut')
        event.preventDefault()
      }
    }

    if (process.platform === 'win32') {
      if (input.key.toLowerCase() === 'f5') {
        win.webContents.send('refreshRootTreeFromMain')
        event.preventDefault()
      } else if (input.key.toLowerCase() === 's' && input.control) {
        win.webContents.send('saveAttributeFromShortcut')
        event.preventDefault()
      }
    }
  })
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
})

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

ipcMain.on("attributeTree", (event : IpcMainEvent, id : string, attributes : Entry) => {
  let ldapTree: LdapTree = new LdapTree()
  const attrResponse: TreeNode[] = [ ldapTree.makeAttrTree(id, attributes) ]
  event.reply("attributeTreeResponse", attrResponse);
})

ipcMain.on("saveAttribute", async (event : IpcMainEvent, attrTree : TreeNode[], deleteNodeList : TreeNode[]) => {
  const ldapServer: LdapServer = LdapFactory.Instance()
  let ldapTree: LdapTree = new LdapTree()
  let changeData: LdapChange = ldapTree.getChangesFromData(attrTree, deleteNodeList)

  if (ldapServer.isConnected()) {
    await ldapServer.modify(changeData)
    event.reply("refreshRootTreeFromMain");
  }
})

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
