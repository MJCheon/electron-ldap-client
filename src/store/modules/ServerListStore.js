import Uuid from '../../utils/uuid'

const serverListStore = {
  state: {
    serverList: []
  },
  mutations: {
    SETTING_SERVER: (state, payload) => {
      const newServer = payload

      if (!newServer.id) {
        const serverId = Uuid.getServerUuid()
        newServer.id = serverId
        state.serverList.push(newServer)
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
      var returnServer = null
      state.serverList.forEach(server => {
        if (serverId === server.id) {
          returnServer = server
        }
      })
      return returnServer
    },
    getAllServerList: (state) => {
      if (state.serverList.length > 0) {
        return state.serverList
      }
    },
    getAllServerNameList: (state) => {
      const serverNameList = []
      if (state.serverList.length > 0) {
        state.serverList.forEach(server => {
          serverNameList.push({
            id: server.id,
            name: server.name
          })
        })
      }
      return serverNameList
    }
  }
}

export default serverListStore
