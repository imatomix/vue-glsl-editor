<template>
  <section :id="id" @keyup.meta.enter="run"></section>
</template>
<script>
export default {
  data () {
    return {
      editor: Object,
      beforeContent: ''
    }
  },
  props: ['id', 'content', 'lang', 'theme'],
  watch: {
    content (value) {
      if (this.beforeContent !== value) {
        this.editor.setValue(value, 1)
      }
    }
  },
  mounted () {
    const lang = this.lang || 'glsl'
    const theme = this.theme || 'vibrant_ink'

    this.editor = window.ace.edit(this.id)
    this.$store.dispatch('editor', this.editor.getSession())

    this.editor.getSession().setMode(`ace/mode/${lang}`)
    this.editor.setTheme(`ace/theme/${theme}`)

    this.editor.on('change', () => {
      this.beforeContent = this.editor.getValue()
      this.$emit('change', this.editor.getValue())
    })

    this.editor.commands.addCommand({
    name: 'run',
    exec: this.run,
    bindKey: {mac: 'cmd-enter', win: 'ctrl-enter'}
})
  },
  methods: {
    run () {
      this.beforeContent = this.editor.getValue()
      this.$emit('change', this.editor.getValue())
    }
  }
}
</script>
