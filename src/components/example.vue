<template>
  <div>
    <input
      ref="input"
      type="file"
      name="image"
      accept="image/*"
      @change="setImage"
    />

    <div class="content">
      <section class="cropper-area">
        <div class="img-cropper">
          <vue-cropper
            ref="cropper"
            :src="imgSrc"/>
        </div>
        <div class="actions">
          <a
            href="#"
            role="button"
            @click.prevent="cropImage">
            Crop
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="reset">
            Reset
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="getCropBoxData">
            Get CropBox Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="setCropBoxData">
            Set CropBox Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="showFileChooser">
            Upload Image
          </a>
        </div>
        <textarea v-model="data"/>
      </section>
      <section class="preview-area">
        <p>Cropped Image</p>
        <div class="cropped-image">
          <img
            v-if="cropImg"
            :src="cropImg"
            alt="Cropped Image"
          />
          <div v-else class="crop-placeholder"/>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  components: {
    VueCropper
  },
  data () {
    return {
      imgSrc: '/assets/berserk.jpg',
      cropImg: '',
      data: null
    }
  },
  methods: {
    cropImage () {
      // get image data for post processing, e.g. upload or setting image src
      this.$refs.cropper.setCropBoxData({
        'left': 64.15997314453125,
        'top': 22.560089111328125,
        'width': 291.20001220703125,
        'height': 224.63998413085938
      })
      this.cropImg = this.$refs.cropper.getCroppedCanvas().toDataURL()
    },
    getCropBoxData () {
      this.data = JSON.stringify(this.$refs.cropper.getCropBoxData(), null, 4)
    },
    getData () {
      this.data = JSON.stringify(this.$refs.cropper.getData(), null, 4)
    },
    reset () {
      this.$refs.cropper.reset()
    },
    setCropBoxData () {
      if (!this.data) return

      this.$refs.cropper.setCropBoxData(JSON.parse(this.data))
    },
    setData () {
      if (!this.data) return

      this.$refs.cropper.setData(JSON.parse(this.data))
    },
    setImage (e) {
      const file = e.target.files[0]

      if (file.type.indexOf('image/') === -1) {
        alert('Please select an image file')
        return
      }

      if (typeof FileReader === 'function') {
        const reader = new FileReader()

        reader.onload = (event) => {
          this.imgSrc = event.target.result
          // rebuild cropperjs with the updated source
          this.$refs.cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Sorry, FileReader API not supported')
      }
    },
    showFileChooser () {
      this.$refs.input.click()
    },
    zoom (percent) {
      this.$refs.cropper.relativeZoom(percent)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    width: 1024px;
    margin: 0 auto;
  }

  input[type="file"] {
    display: none;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 5px 0;
  }

  .header h2 {
    margin: 0;
  }

  .header a {
    text-decoration: none;
    color: black;
  }

  .content {
    display: flex;
    justify-content: space-between;
  }

  .cropper-area {
    width: 614px;
  }

  .actions {
    margin-top: 1rem;
  }

  .actions a {
    display: inline-block;
    padding: 5px 15px;
    background: #0062CC;
    color: white;
    text-decoration: none;
    border-radius: 3px;
    margin-right: 1rem;
    margin-bottom: 1rem;
  }

  textarea {
    width: 100%;
    height: 100px;
  }

  .preview-area {
    width: 307px;
  }

  .preview-area p {
    font-size: 1.25rem;
    margin: 0;
    margin-bottom: 1rem;
  }

  .preview-area p:last-of-type {
    margin-top: 1rem;
  }

  .preview {
    width: 100%;
    height: calc(372px * (9 / 16));
    overflow: hidden;
  }

  .crop-placeholder {
    width: 100%;
    height: 200px;
    background: #ccc;
  }

  .cropped-image img {
    max-width: 100%;
  }
</style>
