<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo251.png" class="logo">
    <el-upload drag action="#" :auto-upload="false" ref="upload">
      <i class="el-icon-upload"/>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <br/>
    <el-button icon="el-icon-upload2" size="small" round @click="handleSubmit">上传251</el-button>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {

    }
  },
  methods: {
    handleSubmit () {
      this.$message({
        type: 'success',
        message: '上传到华为ModelArt',
        duration: 1500,
        center: true
      })
      this.$refs.upload.submit()
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
  margin-top: 40px;

  .logo{
    width: 236px;
    height: 321px;
  }
}
</style>
