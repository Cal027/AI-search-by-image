<template>
  <div id="app">
    <img alt="logo" src="./assets/icon.png" class="logo"/>
    <YoloUpload/>
  </div>
</template>

<script>

import YoloUpload from './components/YoloUpload'

export default {
  name: 'app',
  components: { YoloUpload },
  data () {
    return {}
  }

}
</script>

<style lang="less">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    .logo {
      padding-bottom: 100px;
      height: 300px;
      width: 100%;
      margin-bottom: 20px;
      background-color: #E9C135;
      object-fit: scale-down;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    }
  }
</style>
