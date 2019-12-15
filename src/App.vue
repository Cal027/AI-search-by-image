<template>
  <div id="app">
    <img alt="logo" src="./assets/icon.png" class="logo"/>
    <Upload251/>
  </div>
</template>

<script>

import Upload251 from './components/Upload251'

export default {
  name: 'app',
  components: { Upload251 },
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
      /*border-width: 3px;*/
      /*border-color: #2D4F89;*/
      /*border-style: solid;*/
      /*border-radius: 15px;*/
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
