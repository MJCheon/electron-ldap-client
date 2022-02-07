import { ServerListMutations, ServerListMutationType } from './mutations'
import { ActionContext } from 'vuex'
import { ServerListState } from './state'
import { RootState } from '../types'
import { LdapServerConfig } from './type'

export type ServerListActionContext = {
    commit<K extends keyof ServerListMutations>(
        key: K,
        payload?: Parameters<ServerListMutations[K]>[1],
    ): ReturnType<ServerListMutations[K]>;
} & Omit<ActionContext<ServerListState, RootState>, 'commit'>;

export enum ServerListActionsType {
    SETTING_SERVER = 'SETTING_SERVER',
    DELETE_SERVER = 'DELETE_SERVER'
}

export const serverListActions = {
  [ServerListActionsType.SETTING_SERVER](context: ServerListActionContext, payload?: LdapServerConfig) {
     context.commit(ServerListMutationType.SET_SERVER, payload)
  },
  [ServerListActionsType.DELETE_SERVER](context: ServerListActionContext, payload?: string) {
      context.commit(ServerListMutationType.DEL_SERVER, payload)
  }
}

export type ServerListActions = typeof serverListActions;