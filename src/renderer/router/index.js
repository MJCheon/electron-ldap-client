import Vue from 'vue'
import Router from 'vue-router'

import LoginPage from '@/components/LoginPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: LoginPage
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
