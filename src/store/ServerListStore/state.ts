import { LdapServerList } from './type'

export const serverListState = {
    serverList: [],
} as { serverList: LdapServerList }

export type ServerListState = typeof serverListState