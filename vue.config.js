module.exports = {
  devServer: {
    open: true, // 是否自动弹出浏览器页面
    host: 'localhost',
    port: '8080'
    // port: '8080',
    // proxy: {
    //   '/api': {
    //     target: 'https://4c7298efd5d44a09b1affdafcf7ee5d6.apigw.cn-north-4.huaweicloud.com/', // API服务器的地址
    //     ws: true, // 代理websockets
    //     changeOrigin: true, // 虚拟的站点需要更管origin
    //     secure: true, // 如果是https接口，需要配置这个参数
    //     pathRewrite: { // 重写路径 比如'/api/aaa/ccc'重写为'/aaa/ccc'
    //       '^/api': ''
    //     }
    //   }
    // }
  }
}
