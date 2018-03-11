<template>
  <article class="row">
    <Viewer class="col-xs-12" :class="$store.getters.mode === 'separate' ? 'col-md-6' : ''"
            :fragment="content"/>
    <div :class="$store.getters.mode ==='separate' ? 'col-xs-12 col-md-6' : 'editor-overlay'"
          v-show="$store.getters.mode !== 'hide'">
      <header id="editor-header" class="row middle-xs between-xs">
        <div class="header-title"><b>GLSL</b>Editor</div>
        <select v-model="mode">
          <option>separate</option>
          <option>overlay</option>
          <option>hide</option>
        </select>
      </header>
      <Editor :id="'editor'" :content="content" @change="change"/>
    </div>
  </article>
</template>
<script>
import Editor from '@/components/editor'
import Viewer from '@/components/viewer'
var file = './static/shaders/sample_frg.glsl'

export default {
  components: {
    Editor,
    Viewer
  },
  data () {
    return {
      content: file
    }
  },
  computed: {
    mode: {
      get () {
        return this.$store.getters.mode
      },
      set (value) {
        this.$store.dispatch('mode', value)
      }
    }
  },
  mounted () {
    this.read(file)
  },
  methods: {
    change (value) {
      if (this.content !== value) {
        document.getElementById('fs').text = value
        this.content = value
      }
    },
    read (textFile) {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', textFile)
      xhr.onload = function () {
        this.change(xhr.responseText)
      }.bind(this)
      xhr.send()
    }
  }
}
</script>
