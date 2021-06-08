'use strict'

import Path from 'path'
import { app, protocol, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Ldap from './library/ldap'
import Tree from './library/Tree'
import Ldapjs from './library/ldap'

const isDevelopment = process.env.NODE_ENV !== 'production'

const mainIcon = Path.join(__dirname,'./assets/icons/icon.png')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
    useContentSize: true,
    icon: mainIcon,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

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
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  globalShortcut.register('F5', () => {
    console.log('F5 event')
  })

  createWindow()
  createMenu()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

function createMenu() {
  const file = {
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
  }
  
  const edit = {
    label: 'Edit',
    role: 'editMenu'
  }

  const help = {
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
          await shell.openExternal('https://github.com/MJCheon/electron-ldap-client')
        }
      }
    ]
  }
  
  const template = [
    file,
    edit,
    help
  ]
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

ipcMain.on('serverBind', async (event, server) => {
  const searchEntries = await Ldap.connect(server)
  const rootTree = Tree.makeEntryTree(searchEntries)
  event.reply('serverBindResponse', rootTree)
})

ipcMain.on('attributeTree', (event, id, attributes) => { 
  const attrTree = Tree.makeAttrTree(id, attributes)
  event.reply('attributeTreeResponse', attrTree)
})

ipcMain.on('saveAttribute', async (event, attrTree, deleteNodeList) => {
  const changeData = Tree.getChangesFromData(attrTree, deleteNodeList)
  await Ldapjs.modify(changeData)
  event.reply('saveAttributeResponse')
})

ipcMain.on('refreshRootTree', async (event) => {
  const searchEntries = await Ldap.search()
  const rootTree = Tree.makeEntryTree(searchEntries)
  event.reply('serverBindResponse', rootTree)
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
