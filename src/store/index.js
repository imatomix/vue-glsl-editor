import Vue from 'vue'
import Vuex from 'vuex'
import editor from './modules/editor'

Vue.use(Vuex)

const store = () => {
  return new Vuex.Store({
    modules: {
      editor
    }
  })
}

export default store
