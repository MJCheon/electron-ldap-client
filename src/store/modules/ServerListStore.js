import Password from '../../utils/password'
import Uuid from '../../utils/uuid'

const serverListStore = {
  state: {
    serverList: null
  },
  mutations: {
    SETTING_SERVER: (state, payload) => {
      const newServer = payload

      if (!newServer.id) {
        const serverId = Uuid.getServerUuid()
        const serverIv = Password.getIv()

        newServer.id = serverId
        newServer.iv = serverIv
        newServer.password = Password.encrypt(newServer.password, Uuid.getParsedUuid(serverId), serverIv)
        state.serverList.push(newServer)
      } else {
        const serverIdx = state.serverList.findIndex((server) => (server.id === newServer.id))
        state.serverList[serverIdx] = newServer
      }
    },
    DEL_SERVER: (state, payload) => {
      const serverId = payload
      for (let idx = 0; idx < state.serverList.length; idx++) {
        if (serverId === state.serverList[idx].id) {
          state.serverList.splice(idx, 1)
        }
      }
    }
  },
  actions: {
    SET_SERVER: ({ commit }, server) => {
      commit('SETTING_SERVER', server)
    },
    DELETE_SERVER: ({ commit }, id) => {
      commit('DEL_SERVER', id)
    }
  },
  getters: {
    getServer: (state) => (serverId) => {
      const returnServer = state.serverList.find((server) => (server.id === serverId))
      return returnServer
    },
    getAllServerList: (state) => {
      if (state.serverList.length > 0) {
        return state.serverList
      }
    },
    getAllServerNameList: (state) => {
      return state.serverList.map((server) => ({ id: server.id, name: server.name }))
    }
  }
}

export default serverListStore
