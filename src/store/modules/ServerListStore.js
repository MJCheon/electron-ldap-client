import { v4 as uuidv4 } from 'uuid'

const serverListStore = {
  state: {
    serverList: []
  },
  mutations: {
    SETTING_SERVER: (state, payload) => {
      const server = payload

      if (!server.id) {
        const serverId = uuidv4()
        server.id = serverId
        state.serverList.push(server)
      } else {
        for (let idx = 0; idx < state.serverList.length; idx++) {
          if (server.id === state.serverList[idx].id) {
            const oldServer = state.serverList[idx]
            state.serverList.splice(idx, 1, oldServer, server)
          }
        }
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
