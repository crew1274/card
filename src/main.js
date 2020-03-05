import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import moment from 'moment'
import VCharts from 'v-charts'

Vue.config.productionTip = false
Vue.use(VCharts)
Vue.use(moment)

router.beforeEach((to, from, next) =>
{
  store.state._ws_isLogin ?
  (to.path === '/login' ? next({ path: '/' }) : next()) :
  (to.path !== '/login' ? next({ path: '/login' }) : next())
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')