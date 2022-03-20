import { app, Menu, MenuItem } from "electron"

export function createMenu(mainIcon: string) {
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