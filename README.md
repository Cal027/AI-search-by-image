# AI以图搜图 - YoloSearch

- 基于在华为云ModelArt部署的Yolo3-SPP物体检测神经网络将多目标图片分割为多张单目标图片进行以图搜图。
- 需要一个简易后端服务器处理华为云API跨域问题。
- Google搜图需要解决跨域问题，临时解决办法是使用Chrome插件[CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)。

## 项目配置

```
npm install
```

### 开发环境

```
npm run serve
```

### 生产环境

```
npm run build
```

### Mock

由于华为云ModelArt部署的Yolo3已过期，这里仅使用Mock.js进行展示。

FastMock API地址：https://www.fastmock.site/mock/53be894d4cacaa6d7b1013e3f7451824/yolo/upload

```json
{
  "data|0-5": [{
    "box|4": [
      "@integer(100,400)"
    ],
    "confidence": "@float(60,100)"
  }]
}
```

## 截图

![Home](https://user-images.githubusercontent.com/49466119/77246951-367fd500-6c67-11ea-9aa3-1b74f75cdba2.jpg)

### 早期UI

![Test](https://user-images.githubusercontent.com/49466119/77247001-d9385380-6c67-11ea-907a-ca91da6b6be8.png)

> 华为云ModelArt检测到5只不同的长颈鹿，前端成功裁切展示

### 新版UI

 ![new](https://user-images.githubusercontent.com/49466119/77248580-7ea5f400-6c75-11ea-8a56-fc70111f3fb8.jpg)

> 由于华为云ModelArt部署的Yolo3已过期，这里物体检测的数据仅为随机数据