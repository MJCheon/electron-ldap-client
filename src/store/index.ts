import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import VuexPersistence from 'vuex-persist'
import ServerListModules from './ServerListStore'
import { RootState } from './types'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

const store: StoreOptions<RootState> = {
  modules: {
    ServerList: ServerListModules
  },
  plugins: [vuexLocal.plugin]
}

export default new Vuex.Store(store)
