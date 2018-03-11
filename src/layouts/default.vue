<template>
  <div id="app">
    <main id="contents">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import "./src/assets/stylesheets/main";
</style>
