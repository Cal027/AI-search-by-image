import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import { Cropper } from 'vue-advanced-cropper'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.component(Cropper)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
