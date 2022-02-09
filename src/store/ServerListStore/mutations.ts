import { ServerListState } from './state'
import { LdapServerConfig } from './type'
import { getServerUuid, getParsedUuid } from '@/utils/uuid'
import { getIv, encrypt } from '@/utils/password'

export enum ServerListMutationType {
  SET_SERVER = 'SET_SERVER',
  DEL_SERVER = 'DEL_SERVER'
}

export const serverListMutations = {
  [ServerListMutationType.SET_SERVER] (state: ServerListState, server: LdapServerConfig) {
    const newServer = server

    if (!newServer.id) {
      const serverId = getServerUuid()
      const serverIv = getIv()

      newServer.id = serverId
      newServer.iv = serverIv
      newServer.passwd = encrypt(
        server.passwd,
        getParsedUuid(serverId),
        serverIv
      )
      state.serverList.push(newServer)
    } else {
      const serverIdx = state.serverList.findIndex(
        (server: LdapServerConfig) => server.id === newServer.id
      )
      newServer.passwd = encrypt(
        newServer.passwd,
        getParsedUuid(newServer.id),
        Buffer.from(newServer.iv)
      )
      state.serverList[serverIdx] = newServer
    }

    state.serverList.sort()
  },
  [ServerListMutationType.DEL_SERVER] (state: ServerListState, serverId: string) {
    for (let idx = 0; idx < state.serverList.length; idx++) {
      if (serverId === state.serverList[idx].id) {
        state.serverList.splice(idx, 1)
      }
    }
  }
}

export type ServerListMutations = typeof serverListMutations
