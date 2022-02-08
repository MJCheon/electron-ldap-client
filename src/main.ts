import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import EventBus from 'vue-bus-ts'

Vue.config.productionTip = false

Vue.use(EventBus)

var bus = new EventBus.Bus();

new Vue({
  router,
  store,
  vuetify,
  bus,
  render: (h) => h(App)
}).$mount('#app')
