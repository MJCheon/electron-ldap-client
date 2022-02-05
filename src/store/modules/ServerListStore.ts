import { getIv, encrypt, decrypt } from "../../utils/password";
import { getServerUuid, getParsedUuid } from "../../utils/uuid";
import { LdapServerConfig } from './ServerListStore-type'

const serverListStore = {
  state: {
    serverList : [],
  },
  mutations: {
    SET_SERVER: (state : any, payload : LdapServerConfig) => {
      const newServer = payload;

      if (!newServer.id) {
        const serverId = getServerUuid();
        const serverIv = getIv();

        newServer.id = serverId;
        newServer.iv = serverIv;
        newServer.passwd = encrypt(
          newServer.passwd,
          getParsedUuid(serverId),
          serverIv
        );
        state.serverList.push(newServer);
      } else {
        const serverIdx = state.serverList.findIndex(
          (server : LdapServerConfig) => server.id === newServer.id
        );
        newServer.passwd = encrypt(
          newServer.passwd,
          getParsedUuid(newServer.id),
          Buffer.from(newServer.iv)
        );
        state.serverList[serverIdx] = newServer;
      }

      state.serverList.sort();
    },
    DEL_SERVER: (state : any, payload : any) => {
      const serverId = payload;
      for (let idx = 0; idx < state.serverList.length; idx++) {
        if (serverId === state.serverList[idx].id) {
          state.serverList.splice(idx, 1);
        }
      }
    },
  },
  actions: {
    SETTING_SERVER: ( commit : any, server : LdapServerConfig) => {
      commit("SET_SERVER", server);
    },
    DELETE_SERVER: ( commit : any , id : string) => {
      commit("DEL_SERVER", id);
    },
  },
  getters: {
    getServer: (state : any) => (serverId : string) => {
      const returnServer = JSON.parse(
        JSON.stringify(
          state.serverList.find((server : LdapServerConfig) => server.id === serverId)
        )
      );
      returnServer.password = decrypt(
        returnServer.password,
        getParsedUuid(serverId),
        Buffer.from(returnServer.iv)
      );
      return returnServer;
    },
    getServerList: (state : any) => {
      if (state.serverList.length > 0) {
        return state.serverList;
      }
    },
    getServerNameList: (state : any) => {
      const serverNameList = state.serverList.map((server : LdapServerConfig) => ({
        id: server.id,
        name: server.name,
      }));
      return serverNameList;
    },
  },
};

export default serverListStore;
