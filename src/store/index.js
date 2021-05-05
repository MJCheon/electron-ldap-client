import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import ServerListStore from './modules/ServerListStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    serverListStore: ServerListStore
  },
  plugins: [createPersistedState()]
})
