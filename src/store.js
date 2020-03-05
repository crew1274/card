import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store(
{
  state:
  {
    token: "",
    count: 0,
    _ws: null,
    _ws_back: null,
    _ws_isLogin: false,
    errorMessage: {},
  },
  mutations:
  {
    update_token(state, token)
    {
      state.token = token
    },
    _db_err(state, err)
    {
      state.errorMessage["title"] = "ArangoDB資料庫連線異常"
      state.errorMessage["message"] = err
    },
    _ws_message(state, e)
    {
      state._ws_back = JSON.parse(e.data)
    },
    login(state)
    {
      state._ws_isLogin = true
    }
  },
  actions: 
  {
    _ws_onmessage( { commit }, message)
    {
      commit("_ws_message", message)
    },
    async _ws_login({ commit, state, dispatch }, para) /*para為登入參數 */
    {
      let url 
      if (para.machine == "VCP-20")
      {
        url = "ws://10.11.30.60:9999"
      }
      else if (para.machine == "VCP-30")
      {
        url  = "ws://10.11.30.61:9999"
      } 
      state._ws = new WebSocket(url)
      state._ws.onopen = async function ()
      {
        this.send(JSON.stringify(para))
      }
      state._ws.onmessage = async function (e)
      {
        await dispatch("_ws_onmessage", e) /*呼叫另一action*/
        this.send("Pong")
      }
      state._ws.onerror = async function ()
      {
        this.close()
      }
      state._ws.onclose = async function ()
      {
        state._ws = null
        state._ws_isLogin = false
      }
    },

    async _db({ commit, state, dispatch }, para)
    {
      if (para.method == "GET")
      {
        return fetch("http://10.11.0.156:8529/" + para.url,
        {
          method: para.method,
          headers: {
            'Accept': 'application/json',
            'Authorization': state.token,
            'Content-Type': 'application/json'
          },
        })
        .then( response =>
        {
          return response.json()
        })
        .then( response =>
        {
          if (response["error"])
          {
            throw response["errorMessage"]
          }
          return response
        })
        .catch( err =>
        {
          commit('_db_err', err)
          return false
        })
      } 
      else 
      {
        return fetch("http://10.11.0.156:8529/" + para.url,
        {
          method: para.method,
          headers: {
            'Accept': 'application/json',
            'Authorization': state.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(para.payload)
        })
        .then( response =>
        {
          return response.json()
        })
        .then( response =>
        {
          if (response["error"])
          {
            throw response["errorMessage"]
          }
          return response
        })
        .catch( err =>
        {
          commit('_db_err', err)
          return false
        })
      }
    }
  }
})
