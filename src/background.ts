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
import { TreeNode, LdapConfig } from './library/common'
import { Node } from 'tree-model'

const isDevelopment = process.env.NODE_ENV !== 'production'

const mainIcon = join(__dirname, './assets/icons/icon.png')

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

// function createMenu () {
//   const file = {
//     label: 'File',
//     submenu: [
//       {
//         label: 'Minimize',
//         role: 'minimize'
//       },
//       {
//         label: 'Quit',
//         role: 'quit'
//       }
//     ]
//   }

//   const edit = {
//     label: 'Edit',
//     role: 'editMenu'
//   }

//   const help = {
//     label: 'Help',
//     submenu: [
//       {
//         label: 'Version',
//         click: async () => {
//           const { dialog } = require('electron')

//           const message = 'Version : ' + app.getVersion()
//           const option = {
//             type: 'info',
//             title: 'Version',
//             icon: mainIcon,
//             message: message
//           }

//           dialog.showMessageBox(option)
//         }
//       },
//       {
//         label: 'Help',
//         click: async () => {
//           const { shell } = require('electron')
//           await shell.openExternal(
//             'https://github.com/MJCheon/electron-ldap-client'
//           )
//         }
//       }
//     ]
//   }

//   const template = [file, edit, help]

//   Menu.setApplicationMenu(Menu.buildFromTemplate(template))
// }

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
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
  // createMenu()
})

ipcMain.on('serverBind', async (event : IpcMainEvent , ldapConfig : LdapConfig) => {
  const ldapServer: LdapServer = LdapFactory.Instance()
  ldapServer.ldapConfig = ldapConfig
  const isAuthenticated: boolean = await ldapServer.connect()

  if (isAuthenticated){
    let searchResult: SearchResult | null = await ldapServer.search()
    let ldapTree: LdapTree = new LdapTree()
    if (searchResult){
      ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)
      const searchResponse: Node<TreeNode>[] = [ ldapTree.rootNode.model ]
      event.reply('allSearchResponse', searchResponse )
    }
  }
})

ipcMain.on("attributeTree", (event : IpcMainEvent, id : string, attributes : Entry) => {
  let ldapTree: LdapTree = new LdapTree()
  const attrResponse: TreeNode[] = [ ldapTree.makeAttrTree(id, attributes) ]
  event.reply("attributeTreeResponse", attrResponse);
});

// ipcMain.on("saveAttribute", async (event, attrTree, deleteNodeList) => {
//   const changeData = Tree.getChangesFromData(attrTree, deleteNodeList);
//   await Ldapjs.modify(changeData);
//   event.reply("refreshRootTreeFromMain");
// });

ipcMain.on("refreshRootTree", async (event : IpcMainEvent) => {
  const ldapServer: LdapServer = LdapFactory.Instance()
  let searchResult: SearchResult | null = await ldapServer.search()
  let ldapTree: LdapTree = new LdapTree()
  if (searchResult){
    ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)
    const searchResponse: Node<TreeNode>[] = [ ldapTree.rootNode.model ]
      
    event.reply('allSearchResponse', searchResponse )
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
