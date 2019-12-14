<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo251.png" class="logo">
    <Upload251/>
  </div>
</template>

<script>

import Upload251 from './components/Upload251'
export default {
  name: 'app',
  components: { Upload251 },
  data () {
    return {

    }
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
  margin-top: 30px;

  .logo{
    width: 236px;
    height: 321px;
    margin-bottom: 20px;
  }
}
</style>
