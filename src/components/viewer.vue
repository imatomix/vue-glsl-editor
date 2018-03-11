<template>
  <section id="viewer">
    <header id="viewer-header" class="row  between-xs">
      <div class="row col-xs">
        <button class="col-xs-2" :class="run ? 'pause' : 'play'" @click.prevent="play"></button>
        <button class="col-xs-2 replay" @click.prevent="replay"></button>
        <select class="col-xs-2" v-model="screenRatio">
          <option value = -1>free</option>
          <option value = 0.5625>16:9</option>
          <option value = 0.75>4:3</option>
          <option value = 1>1:1</option>
        </select>
        <select class="col-xs-2" v-model="pixelRatio">
          <option value = 2>2</option>
          <option value = 1>1</option>
          <option value = 0.5>1/2</option>
        </select>
      </div>
      <div class="col-xs-2">
        <select v-model="mode" v-if="$store.getters.mode === 'hide'">
          <option>separate</option>
          <option>overlay</option>
          <option>hide</option>
        </select>
      </div>
    </header>
    <canvas id="canvas"/>
  </section>
</template>

<script>
export default {
  data () {
    return {
      gl: null,
      canvas: null,
      program: null,
      uniLocation: [],
      run: false,
      screenRatio: 1,
      pixelRatio: 1,
      mouse: {
        x: 0.5,
        y: 0.5
      },
      startTime: null,
      time: 0.0,
      tempTime: 0.0,
      fps: 1000 / 30
    }
  },
  props: ['fragment'],
  watch: {
    fragment (value) {
      this.init()
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
    this.canvas = document.getElementById('canvas')
    this.init()
  },
  methods: {
    play () {
      this.run = !this.run
      if (this.run) {
        this.startTime += new Date().getTime() - (this.time * 1000 + this.startTime)
        this.render()
      }
    },
    replay () {
      this.run = true
      this.startTime = new Date().getTime()
      this.render()
    },
    init () {
      this.canvas.width = this.canvas.clientWidth
      this.canvas.height = this.screenRatio > 0
                         ? this.canvas.clientWidth * this.screenRatio
                         : window.innerHeight - 35
      this.gl =
        this.canvas.getContext('webgl') ||
        this.canvas.getContext('experimental-webgl')
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0)

      let vertexShader = this.create_shader('vs')
      if (!vertexShader) return
      let fragmentShader = this.create_shader('fs')
      if (!fragmentShader) return
      this.$store.dispatch('complete')

      this.program = this.create_program(vertexShader, fragmentShader)
      this.run = (this.program !== null)
      this.uniLocation[0] = this.gl.getUniformLocation(this.program, 'time')
      this.uniLocation[1] = this.gl.getUniformLocation(this.program, 'mouse')
      this.uniLocation[2] = this.gl.getUniformLocation(this.program, 'resolution')
      this.createModel()

      this.startTime = new Date().getTime()
      this.render()
    },
    render () {
      this.resize(this.gl.canvas)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

      if (!this.run) return
      this.time = (new Date().getTime() - this.startTime) * 0.001
      this.gl.clear(this.gl.COLOR_BUFFER_BIT)

      this.gl.uniform1f(this.uniLocation[0], this.time + this.tempTime)
      this.gl.uniform2fv(this.uniLocation[1], [this.mouse.x, this.mouse.y])
      this.gl.uniform2fv(this.uniLocation[2], [this.canvas.width, this.canvas.height])

      this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
      this.gl.flush()

      setTimeout(this.render, this.fps)
    },
    createModel () {
      var vertexPosition = [
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0
      ]
      var index = [
        0, 2, 1,
        1, 2, 3
      ]
      var vbo = this.create_vbo(vertexPosition)
      var ibo = this.create_ibo(index)
      var vertexAttribLocation = this.gl.getAttribLocation(
        this.program,
        'position'
      )
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
      this.gl.enableVertexAttribArray(vertexAttribLocation)
      this.gl.vertexAttribPointer(
        vertexAttribLocation,
        3,
        this.gl.FLOAT,
        false,
        0,
        0
      )
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo)
    },
    create_shader (id) {
      var shader = null
      var scriptElement = document.getElementById(id)

      if (!scriptElement) return

      switch (scriptElement.type) {
        case 'x-shader/x-vertex':
          shader = this.gl.createShader(this.gl.VERTEX_SHADER)
          break
        case 'x-shader/x-fragment':
          shader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
          break
        default:
          return
      }

      this.gl.shaderSource(shader, scriptElement.text)
      this.gl.compileShader(shader)

      if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        return shader
      } else {
        this.$store.dispatch('alert', this.gl.getShaderInfoLog(shader))
        return false
      }
    },
    create_program (vs, fs) {
      var program = this.gl.createProgram()
      this.gl.attachShader(program, vs)
      this.gl.attachShader(program, fs)
      this.gl.linkProgram(program)

      if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        this.gl.useProgram(program)
        return program
      } else {
        alert(this.gl.getProgramInfoLog(program))
        return false
      }
    },
    create_vbo (data) {
      var vbo = this.gl.createBuffer()

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(data),
        this.gl.STATIC_DRAW
      )
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

      return vbo
    },
    create_ibo (data) {
      var ibo = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW)
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null)

      return ibo
    },
    resize (canvas) {
      var displayWidth  = Math.floor(canvas.clientWidth  * this.pixelRatio)
      var displayHeight = this.screenRatio > 0
                        ? Math.floor(canvas.clientWidth * this.screenRatio * this.pixelRatio)
                        : Math.floor((window.innerHeight - 35) * this.pixelRatio)
      if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
        canvas.width  = displayWidth
        canvas.height = displayHeight
      }
    }
  }
}
</script>
