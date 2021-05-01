import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serverList: []
  },
  mutations: {
    setServer: (state, payload) => {
      state.serverList.push(payload)
    }
  },
  getters: {
    getServerList: (state) => {
      return state.serverList
    }
  },
  plugins: [createPersistedState()]
})
