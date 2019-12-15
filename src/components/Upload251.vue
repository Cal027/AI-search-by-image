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
      <section class="cropper" style="position:absolute;left:-99999px;top:-90999px;">
        <vue-cropper ref="cropper" :src="img"
                     :zoomable="false"
                     :scalable="false"
                     :movable="false"
                     :zoomOnWheel="false"/>
      </section>
      <!--对话框开始-->
      <el-dialog title="编辑" :visible.sync="dialogVisible" width="45%">
        <vue-cropper ref="edit" :src="img"
                     :zoomable="false"
                     :scalable="false"
                     :movable="false"
                     :zoomOnWheel="false"/>
        <span slot="footer">
          <el-button round @click="cropImage">截取</el-button>
        </span>
      </el-dialog>
      <!--对话框结束-->
      <el-row type="flex" justify="space-around" :gutter="20">
        <el-col :span="14">
          <el-image :src="img" class="src-img" fit="contain" v-if="img"/>
          <br/>
          <span>原图片</span>
        </el-col>
        <el-col :span="14" v-if="ImgList.length!==0">
          <el-row v-for="(obj,index) in detectObjects" :key="index" style="margin-bottom: 20px;margin-left: 50px">
            <div class="operation">
              <el-image :src="getImage(index)" fit="contain" class="crop-img"/>
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
            </div>
          </el-row>
        </el-col>
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
      box: []
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
      this.img = URL.createObjectURL(file.raw)
      this.showRes = true
    },
    // 上传成功后处理
    onSuccess (response) {
      this.detectObjects = JSON.parse(response)
      if (this.detectObjects.length === 0) {
        this.$message.error('未检测到目标')
        return
      }
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
        console.log(tmpBox)
        this.box.push(tmpBox)
        this.$refs.cropper.setCropBoxData(tmpBox)
        console.log(this.$refs.cropper.getCropBoxData())
        this.ImgList[i] = this.$refs.cropper.getCroppedCanvas().toDataURL()
      }
      // console.log(this.box)
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
      console.log(this.$refs.edit.getCropBoxData())
      this.dialogVisible = false
    },
    // 编辑图片
    editImage (obj, index) {
      this.editImg = index
      this.dialogVisible = true
      // 等待画布初始化
      setTimeout(() => {
        if (this.$refs.edit) {
          this.$refs.edit.setCropBoxData(this.box[index])
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
    height: 500px;
  }

  .crop-img {
    height: 300px;
  }

  .operation {
    margin-top: 5px;
  }

  .cropper {
    width: 614px;
  }
</style>
