<template>
  <div>
    <el-upload drag :action="api"
               :auto-upload="false"
               ref="upload"
               accept=".jpg, .jpeg, .png"
               :on-success="onSuccess"
               :headers="uploadHeader"
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
      <!--      <vue-cropper v-if="false" ref="cropper"/>-->
      <!--对话框开始-->
      <el-dialog title="编辑" :visible.sync="dialogVisible" width="45%">
        <vue-cropper ref="edit" :src="img"/>
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
        <el-col :span="14">
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
      api: 'https://4c7298efd5d44a09b1affdafcf7ee5d6.apigw.cn-north-4.huaweicloud.com/v1/infers/0d69f607-0105-4767-8157-38ac4a927bd0',
      filename: 'images',
      uploadHeader: {},
      showRes: false,
      img: null,
      ImgList: [],
      dialogVisible: false,
      editImg: '',
      detectObjects: [
        {
          'box': [
            90,
            270,
            382,
            106
          ],
          'class': 'person'
        },
        {
          'box': [
            15,
            226,
            50,
            242
          ],
          'class': 'person'
        },
        {
          'box': [
            45,
            126,
            50,
            242
          ],
          'class': 'person'
        }
      ]
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
    onSuccess (response, file, fileList) {
      console.log(response)
      console.log(file)
      console.log(fileList)
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
          this.$refs.edit.setCropBoxData({
            'left': 0,
            'top': 0,
            'width': 300,
            'height': 300
          })
        }
      }, 50)
    },
    cleanImg () {
      this.$message({
        type: 'success',
        message: '清除图片',
        duration: 1500,
        center: true
      })
      this.img = null
      this.showRes = false
    }
  },
  mounted () {
    this.uploadHeader = require('@/assets/token.json')
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
</style>
