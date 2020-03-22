<template>
  <div class="container">
    <div class="card">
      <el-upload drag
                 :action="api"
                 :auto-upload="true"
                 ref="upload"
                 accept=".jpg, .jpeg, .png"
                 :on-success="onSuccess"
                 :name="filename"
                 :show-file-list="false"
                 :multiple=false
                 :before-upload="handleSubmit"
                 :on-change="handleImage">
        <i class="el-icon-upload"/>
        <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <br/>
      <el-button icon="el-icon-delete" size="medium" round @click="cleanImg">清空</el-button>
      <el-button v-show="hasResult" size="medium" round @click="showDialog = true">上次结果</el-button>
    </div>
    <el-dialog fullscreen :visible.sync="showDialog" center title="YoLo检测结果" v-if="showRes">
      <section class="cropper">
        <vue-cropper ref="cropper" :src="img"
                     :zoomable="false"
                     :scalable="false"
                     :movable="false"
                     :zoomOnWheel="false"/>
      </section>
      <!--对话框开始-->
      <el-dialog title="编辑" :visible.sync="dialogVisible" append-to-body>
        <vue-cropper ref="edit" :src="img" :imgStyle="{height:'500px'}"/>
        <span slot="footer">
          <el-button round @click="cropImage">截取并搜索</el-button>
        </span>
      </el-dialog>
      <!--对话框结束-->
      <el-row type="flex" justify="space-around" :gutter="20">
        <el-col :span="14" style="text-align: center">
          <img :src="img" class="src-img" v-if="img" alt="原图"/>
          <br/>
          <span style="font-weight: 500;font-size: 22px">原图</span>
          <br/>
          <el-button icon="el-icon-edit" round size="small" @click="editImage">自定义</el-button>
        </el-col>
        <el-col :span="3"/>
        <el-col :span="8" v-if="ImgList.length!==0" style="text-align: center">
          <el-row v-for="(obj,index) in detectObjects" :key="index" style="margin-bottom: 20px;margin-left: 50px">
            <div class="result">
              <el-badge :value="obj.confidence.toFixed(3)" type="success">
                <img :src="getImage(index)" class="result-image" :alt="obj.class"/>
              </el-badge>
              <br/>
              <em>
                {{obj.class}}
              </em>
              <el-button icon="el-icon-search" @click="searchImg(index)"
                         circle size="mini"/>
              <el-divider/>
            </div>
          </el-row>
        </el-col>
        <el-col :span="3"/>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'YoloUpload',
  components: {
    VueCropper
  },
  data () {
    return {
      api: 'https://www.fastmock.site/mock/53be894d4cacaa6d7b1013e3f7451824/yolo/upload',
      showRes: false,
      filename: 'images',
      img: null,
      ImgList: [],
      showDialog: false,
      dialogVisible: false,
      hasResult: false,
      detectObjects: []
    }
  },
  methods: {
    // 上传后端
    handleSubmit () {
      this.ImgList = []
      this.$message({
        type: 'success',
        message: '上传到华为ModelArt',
        duration: 1500,
        center: true
      })
    },
    // 处理图片
    handleImage (file) {
      const img = URL.createObjectURL(file.raw)
      this.img = img
      this.showRes = true
      this.showDialog = true
      if (this.$refs.cropper) {
        this.$refs.cropper.replace(img)
      }
    },
    // 上传成功后处理
    onSuccess (response) {
      console.log(typeof response)
      if (typeof response === 'string') {
        this.detectObjects = JSON.parse(response)
      } else {
        this.detectObjects = response.data
      }
      console.log(this.detectObjects)
      if (this.detectObjects.length === 0) {
        this.$message.error('未检测到目标')
        return
      }
      this.hasResult = true
      this.$notify({
        type: 'success',
        title: 'YoLo检测成功',
        message: `检测到${this.detectObjects.length}个目标,按ESC或右上角按钮退出`,
        position: 'top-left',
        duration: 8000
      })
      this.cropResultImage()
    },
    // 裁剪图片
    cropResultImage () {
      for (let i = 0; i < this.detectObjects.length; i++) {
        let left = Math.min(this.detectObjects[i].box[2], this.detectObjects[i].box[3])
        let top = Math.min(this.detectObjects[i].box[0], this.detectObjects[i].box[1])
        let height = Math.abs(this.detectObjects[i].box[0] - this.detectObjects[i].box[1])
        let width = Math.abs(this.detectObjects[i].box[2] - this.detectObjects[i].box[3])
        this.$refs.cropper.setCropBoxData({
          'left': left,
          'top': top,
          'width': width,
          'height': height
        })
        this.ImgList.push(this.$refs.cropper.getCroppedCanvas().toDataURL())
      }
    },
    // 获取裁剪后图片
    getImage (index) {
      return this.ImgList[index]
    },
    // 以图搜图
    searchImg (index) {
      const data = new FormData()
      data.append('encoded_image', this.dataURLtoBlob(this.getImage(index)), 'image.png')
      let loading = this.$loading()
      fetch('https://www.google.com/searchbyimage/upload', {
        referrer: '',
        mode: 'cors',
        method: 'POST',
        body: data
      }).then(data => {
        window.open(data.url)
        loading.close()
      }).catch(() => {
        this.$message.error('通过Google搜图失败，请检查网络设置')
        loading.close()
      })
    },
    dataURLtoBlob (dataurl) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    // 裁剪并保存图片
    cropImage () {
      this.$message({
        type: 'success',
        message: '保存并搜索图片',
        duration: 1500,
        center: true
      })
      this.ImgList.push(this.$refs.edit.getCroppedCanvas().toDataURL())
      this.searchImg(this.ImgList.length - 1)
      this.dialogVisible = false
    },
    // 编辑图片
    editImage () {
      this.dialogVisible = true
    },
    cleanImg () {
      this.$message({
        type: 'success',
        message: '清空结果',
        duration: 1500,
        center: true
      })
      this.hasResult = false
      this.img = null
      this.showRes = false
    }
  }
}
</script>

<style scoped>
  .container {
    margin-top: -130px;
  }

  .card {
    background-color: #FFFFFF;
    position: relative;
    width: 400px;
    margin: 0 auto;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .src-img {
    max-height: 450px;
    object-fit: scale-down;
  }

  .result-image {
    min-width: 330px;
    height: 220px;
    object-fit: contain;
  }

  .result {
    margin-top: 5px;
  }

  .cropper {
    max-width: 100%;
    position: absolute;
    left: -99999px;
    top: -90999px;
  }
</style>

<style lang="less">
  .result {
    .el-divider--horizontal {
      margin: 5px 0 !important;
    }
  }
</style>
