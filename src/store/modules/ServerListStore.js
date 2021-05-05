import { v4 as uuidv4 } from 'uuid'

const serverListStore = {
  state: {
    serverList: []
  },
  mutations: {
    SET_SERVER: (state, payload) => {
      const server = payload
      const serverId = uuidv4()

      server.id = serverId
      state.serverList.push(server)
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
    ADD_SERVER: ({ commit }, server) => {
      commit('SET_SERVER', server)
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
