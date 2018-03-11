const state = {
  editor: null,
  markers: [],
  mode: 'separate'
}

const getters = {
  editor (state) {
    return state.editor
  },
  mode (state) {
    return state.mode
  }
}

const mutations = {
  editor (state, editor) {
    state.editor = editor
  },
  mode (state, mode) {
    state.mode = mode
  }
}

const actions = {
  editor ({ commit }, editor) {
    commit('editor', editor)
  },
  mode ({ commit }, mode) {
    commit('mode', mode)
  },
  alert ({ commit }, message) {
    var Range = window.ace.require('ace/range').Range
    let messages = message.split(/\r\n|\r|\n/)
    let annotations = []

    for (let marker of state.markers) {
      state.editor.removeMarker(marker)
    }
    state.markers = []

    for (let i = 0; i < messages.length - 1; i++) {
      let message = messages[i].split(':')
      state.markers.push(state.editor.addMarker(new Range(message[2] - 1, message[1], message[2] - 1, message[1] + 1), 'marker', 'fullLine'))
      annotations.push({
        row: Number(message[2] - 1),
        column: Number(message[1]),
        text: message[3] + message[4],
        type: message[0].toLowerCase()
      })
    }
    state.editor.setAnnotations(annotations)
  },
  complete ({commit}) {
    for (let marker of state.markers) {
      state.editor.removeMarker(marker)
    }
    state.markers = []
    if (state.editor) {
      state.editor.clearAnnotations()
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
