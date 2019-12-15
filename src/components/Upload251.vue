<template>
  <div>
    <el-upload drag :action="api"
               :auto-upload="false"
               ref="upload"
               accept=".jpg, .jpeg, .png"
               :on-success="onSuccess"
               :name="filename"
               :on-change="handleImage">
      <i class="el-icon-upload"/>
      <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <br/>
    <el-button icon="el-icon-upload2" size="medium" round @click="handleSubmit">上传</el-button>
    <el-button icon="el-icon-delete" size="medium" circle @click="cleanImg"/>
    <div v-if="showRes">
      <el-divider/>
      <section class="cropper">
        <vue-cropper ref="cropper" :src="img"
                     :zoomable="false"
                     :scalable="false"
                     :movable="false"
                     :zoomOnWheel="false"/>
      </section>
      <!--对话框开始-->
      <el-dialog title="编辑" :visible.sync="dialogVisible">
        <vue-cropper ref="edit" :src="img"
                     :zoomable="false"
                     :scalable="false"
                     :movable="false"
                     :zoomOnWheel="false"
        />
        <span slot="footer">
          <el-button round @click="cropImage">截取</el-button>
        </span>
      </el-dialog>
      <!--对话框结束-->
      <el-row type="flex" justify="space-around" :gutter="20">
        <el-col :span="14">
          <img :src="img" class="src-img" v-if="img" alt="原图片"/>
          <br/>
          <span style="font-weight: 500;font-size: 22px">原图片</span>
        </el-col>
        <el-col :span="3"/>
        <el-col :span="8" v-if="ImgList.length!==0">
          <el-row v-for="(obj,index) in detectObjects" :key="index" style="margin-bottom: 20px;margin-left: 50px">
            <div class="result">
              <el-badge :value="obj.confidence.toFixed(3)" type="success">
                <img :src="getImage(index)" class="result-image" :alt="obj.class"/>
              </el-badge>
              <br/>
              <el-tooltip content="编辑" placement="left">
                <el-button type="text"
                           style="margin-left: 3px;font-size: 15px"
                           @click="editImage(obj,index)">
                  {{obj.class}}
                </el-button>
              </el-tooltip>
              <el-button icon="el-icon-search"
                         @click="searchImg(index)"
                         circle
                         size="mini"/>
              <el-divider/>
            </div>
          </el-row>
        </el-col>
        <el-col :span="3"/>
      </el-row>
    </div>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'Upload251',
  components: {
    VueCropper
  },
  data () {
    return {
      api: 'http://10.20.184.64:8000/upload/',
      filename: 'images',
      showRes: false,
      img: null,
      ImgList: [],
      dialogVisible: false,
      editImg: '',
      detectObjects: [],
      cropBox: []
    }
  },
  methods: {
    // 上传后端
    handleSubmit () {
      this.$refs.upload.submit()
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
      if (this.$refs.cropper) {
        this.$refs.cropper.replace(img)
      }
    },
    // 上传成功后处理
    onSuccess (response) {
      this.ImgList = []
      this.cropBox = []
      this.detectObjects = JSON.parse(response)
      if (this.detectObjects.length === 0) {
        this.$message.error('未检测到目标')
        return
      }
      this.$message({
        type: 'success',
        message: `成功检测到${this.detectObjects.length}个目标`,
        duration: 1500,
        center: true
      })
      console.log(this.detectObjects)
      for (let i = 0; i < this.detectObjects.length; i++) {
        let left = Math.min(this.detectObjects[i].box[2], this.detectObjects[i].box[3])
        let top = Math.min(this.detectObjects[i].box[0], this.detectObjects[i].box[1])
        let height = Math.abs(this.detectObjects[i].box[0] - this.detectObjects[i].box[1])
        let width = Math.abs(this.detectObjects[i].box[2] - this.detectObjects[i].box[3])
        let tmpBox = {
          'left': left,
          'top': top,
          'width': width,
          'height': height
        }
        // console.log(tmpBox)
        this.cropBox.push(tmpBox)
        this.$refs.cropper.setCropBoxData(tmpBox)
        // console.log(this.$refs.cropper.getCropBoxData())
        this.ImgList.push(this.$refs.cropper.getCroppedCanvas().toDataURL())
      }
    },
    // 获取裁剪后图片
    getImage (index) {
      return this.ImgList[index]
    },
    // 以图搜图
    searchImg (index) {

    },
    // 裁剪并保存图片
    cropImage () {
      this.$message({
        type: 'success',
        message: '保存图片',
        duration: 1500,
        center: true
      })
      this.ImgList[this.editImg] = this.$refs.edit.getCroppedCanvas().toDataURL()
      this.dialogVisible = false
    },
    // 编辑图片
    editImage (obj, index) {
      this.editImg = index
      this.dialogVisible = true
      // 等待画布初始化
      setTimeout(() => {
        if (this.$refs.edit) {
          this.$refs.edit.setCropBoxData(this.cropBox[index])
        }
      }, 100)
    },
    cleanImg () {
      this.$message({
        type: 'success',
        message: '清除图片',
        duration: 1500,
        center: true
      })
      this.img = null
      this.ImgList = []
      this.showRes = false
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
  .src-img {
    max-height: 500px;
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
    .el-divider--horizontal{
      margin: 5px 0!important;
    }
  }
</style>
