import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import moment from 'moment'
import VCharts from 'v-charts'

import VueLodash from 'vue-lodash'
import lodash from 'lodash'

Vue.config.productionTip = false
Vue.use(VCharts)
Vue.use(moment)
Vue.use(VueLodash, { lodash: lodash })

router.beforeEach((to, from, next) =>
{
  store.state._ws_isLogin ?
    (to.path === '/login' ? next({ path: '/' }) : next())
    :
    (to.path === '/login' || to.path === '/admin' ? next() : next({ path: '/login' }))
})

if (process.platform != "browser")
{
    const ipc = require('electron').ipcRenderer
    
    ipc.on('RFID', (event, msg) => {
      store.commit('update_rfid_msg', msg)
    })
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')