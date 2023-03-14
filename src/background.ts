'use strict'

import { app, protocol, BrowserWindow, ipcMain} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import { LdapServer } from './library/ldap/LdapServer'
import { LdapFactory } from './library/ldap/LdapFactory'
import { getAttributeTree, getNewAttributeTree, refreshRootTree, saveAllToLdap, serverBind, showAllChange } from './library/electron/IpcMainListener'
import { createMenu } from './library/electron/Menu'

const isDevelopment = process.env.NODE_ENV !== 'production'

const mainIcon = join(__dirname, 'assets/icons/png/large/main-icon.png')

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

// Quit when all windows are closed.
app.on('window-all-closed', async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }

  let ldapServer: LdapServer = LdapFactory.Instance()

  if (ldapServer.isConnected()) {  
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
  createMenu(mainIcon)
})

// Ldap Connect and Get ldap entries
ipcMain.addListener('serverBind', serverBind)

// Get Attribute of ldap entry
ipcMain.addListener('getAttributeTree', getAttributeTree )

ipcMain.addListener('getNewAttributeTree', getNewAttributeTree)

// Refresh All ldap Entries
ipcMain.on("refreshRootTree", refreshRootTree)

// Save All Changed Data To Ldap
ipcMain.on("saveAllToLdap", saveAllToLdap)

// Show All Change
ipcMain.on("showAllChange", showAllChange )

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
