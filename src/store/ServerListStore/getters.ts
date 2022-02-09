import { ServerListState } from './state'
import { LdapServerConfig } from './type'
import { getParsedUuid } from '@/utils/uuid'
import { decrypt } from '@/utils/password'

export enum ServerListGettersType {
  GET_SERVER = 'GET_SERVER',
  GET_SERVER_LIST = 'GET_SERVER_LIST',
  GET_SERVER_NAME_LIST = 'GET_SERVER_NAME_LIST'
}

export const serverListGetters = {
  [ServerListGettersType.GET_SERVER] (state: ServerListState) {
    return (serverId: string): LdapServerConfig | null => {
      const returnServer = JSON.parse(
        JSON.stringify(
          state.serverList.find(
            (server: LdapServerConfig) => server.id === serverId
          )
        )
      )
      returnServer.passwd = decrypt(
        returnServer.passwd,
        getParsedUuid(serverId),
        Buffer.from(returnServer.iv)
      )
      return returnServer
    }
  },
  [ServerListGettersType.GET_SERVER_LIST] (state: ServerListState) {
    if (state.serverList.length > 0) {
      return state.serverList
    }
  },
  [ServerListGettersType.GET_SERVER_NAME_LIST] (state: ServerListState) {
    const serverNameList = state.serverList.map(
      (server: LdapServerConfig) => ({
        id: server.id,
        name: server.name
      })
    )
    return serverNameList
  }
}

export type ServerListGetters = typeof serverListGetters
