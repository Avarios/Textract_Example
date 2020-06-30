/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import LogoutSuccess from '@/components/LogoutSuccess';
import ErrorComponent from '@/components/Error';

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      //beforeEnter: requireAuth
    },
    {
      path: '/login', beforeEnter(to, from, next){
        auth.auth.getSession();
      }
    },
    {
      path: '/error', component: ErrorComponent
    }
  ]
})
