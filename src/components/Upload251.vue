<template>
  <div>
    <el-upload drag action=""
               :auto-upload="false"
               ref="upload"
               accept=".jpg, .jpeg, .png"
               :on-error="onSuccess"
               :before-upload="beforeUpload">
      <i class="el-icon-upload"/>
      <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <br/>
    <el-button icon="el-icon-upload2" size="medium" round @click="handleSubmit">上传</el-button>
    <el-button icon="el-icon-delete" size="medium" circle @click="cleanImg"/>
    <div v-if="showRes">
      <el-divider/>
      <vue-cropper v-show="false" ref="cropper"/>
      <el-dialog title="编辑" destroy-on-close :visible.sync="dialogVisible">
        <vue-cropper ref="edit"/>
        <el-button round @click="cropImage">截取</el-button>
      </el-dialog>
      <el-row type="flex" justify="space-around" :gutter="20">
        <el-col :span="14">
          <el-image :src="img" class="src-img" fit="contain" v-if="img"/>
          <br/>
          <span>原图片</span>
        </el-col>
        <el-col :span="14">
          <el-row v-for="(obj,index) in detectObjects" :key="index" style="margin-bottom: 20px;margin-left: 50px">
            <div class="operation">
              <el-image :src="getImage(index)" fit="contain"/>
              <span>{{obj.class}}</span>
              <el-button icon="el-icon-edit"
                         style="margin-left: 5px;margin-right: 5px"
                         @click="editImage(obj,index)"
                         circle size="mini"/>
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
      token: '',
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
    onSuccess (response, file, fileList) {

    },
    getImage (index) {
      return this.ImgList[index]
    },
    viewImage (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.img = e.target.result
        this.$refs.cropper.replace(e.target.result)
      }
      reader.readAsDataURL(file)
    },
    searchImg (index) {

    },
    cropImage () {
      this.$message({
        type: 'success',
        message: '保存图片',
        duration: 1500,
        center: true
      })
      this.ImgList[this.editImg] = this.$refs.edit.getCroppedCanvas().toDataURL()
    },
    editImage (obj, index) {
      this.editImg = index
      this.dialogVisible = true
      this.$refs.edit.replace(this.img)
      this.$refs.edit.setCropBoxData({
        'left': 64.15997314453125,
        'top': 22.560089111328125,
        'width': 291.20001220703125,
        'height': 224.63998413085938
      })
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
    if (localStorage.token) {
      this.token = localStorage.token
    } else {
      // const body = require('@/assets/header.json')
      // console.log(body)
      this.axios({
        url: 'https://iam.cn-north-1.myhuaweicloud.com/v3/auth/tokens',
        method: 'post',
        data: JSON.stringify({
          'auth': {
            'identity': {
              'methods': ['password'],
              'password': {
                'user': {
                  'name': 'getToken',
                  'password': 'token123',
                  'domain': {
                    'name': 'ljhsdsg'
                  }
                }
              }
            },
            'scope': {
              'project': {
                'name': 'cn-north-4'
              }
            }
          }
        })
      }
      ).then(res => {
        console.log(res)
        localStorage.setItem('token', res.headers['X-Subject-Token'])
      })
    }
  }
}
</script>

<style scoped>
  .src-img {
    height: 450px;
    /*width: 80%;*/
  }

  .crop-img {
    max-height: 300px;
  }

  .operation {
    margin-top: 5px;
  }
</style>
