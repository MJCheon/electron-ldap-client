// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-electron-ldap';

const electronHandler = {
  store: {
    getAll(key: string) {
      return ipcRenderer.sendSync('server-getAll', key);
    },
    get(key: string, val: any) {
      return ipcRenderer.sendSync('server-get', key, val);
    },
    set(property: string, val: any) {
      ipcRenderer.send('server-set', property, val);
    },
    delete(property: string, val: any) {
      ipcRenderer.send('server-del', property, val);
    },
  },
  ldap: {
    connect(val: any) {
      return ipcRenderer.sendSync('ldap-connect', val);
    },
    modifyDn(name: string, newName: string) {
      return ipcRenderer.sendSync('modifyDn', name, newName);
    },
    refresh() {
      return ipcRenderer.sendSync('refresh');
    },
    getSchemas() {
      return ipcRenderer.sendSync('getSchemas');
    },
  },
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
