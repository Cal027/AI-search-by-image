<template>
  <div>
    <el-upload drag :action="api"
               :auto-upload="false"
               ref="upload"
               accept=".jpg, .jpeg, .png"
               :before-upload="beforeUpload">
      <i class="el-icon-upload"/>
      <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <br/>
    <el-button icon="el-icon-upload2" size="medium" round @click="handleSubmit">上传</el-button>
    <el-button icon="el-icon-delete" size="medium" circle @click="cleanImg"/>
    <div v-if="showRes">
      <el-divider/>
      <el-row type="flex">
        <el-col :span="14">
          <el-image :src="img" class="src-img" fit="contain" v-if="img"/>
          <br/>
          <span>原图片</span>
        </el-col>
        <el-col :span="14">
          <el-row v-for="(obj,index) in detectObjects" :key="index" style="margin-bottom: 20px">
            <el-col :span="18">
              <cropper :src="img" class="detect-obj"/>
              <div class="operation">
                <span>{{obj.class}}</span>
                <el-button style="margin-left: 5px"
                           icon="el-icon-search"
                           @click="searchImg"
                           type="success" circle
                           size="mini"/>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!--      <cropper :src="img" class="src-img"/>-->
    </div>
  </div>
</template>

<script>
export default {
  name: 'Upload251',
  data () {
    return {
      api: '#',
      showRes: false,
      img: null,
      detectObjects: [
        {
          'box': [
            90,
            970,
            382,
            1061
          ],
          'class': 'person'
        },
        {
          'box': [
            15,
            726,
            50,
            242
          ],
          'class': 'person'
        },
        {
          'box': [
            15,
            726,
            50,
            242
          ],
          'class': 'person'
        }
      ]
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.upload.submit()
      this.$message({
        type: 'success',
        message: '上传到华为ModelArt',
        duration: 1500,
        center: true
      })
    },
    beforeUpload (file) {
      this.viewImage(file)
      this.showRes = true
    },
    viewImage (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.img = e.target.result
      }
      reader.readAsDataURL(file)
    },
    searchImg () {

    },
    cleanImg () {
      this.$message({
        type: 'success',
        message: '清除图片',
        duration: 1500,
        center: true
      })
      this.img = null
    }
  }
}
</script>

<style scoped>
  .src-img {
    height: 500px;
    /*width: 100%;*/
  }

  .detect-obj {
    height: 250px;
  }

  .operation {
    margin-top: 5px;
  }
</style>
