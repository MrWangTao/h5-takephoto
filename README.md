# h5-takephoto
This is a function of calling mobile camera to take pictures
# Getting Started

### 使用H5完成图片扫描，上传

* 简介

    使用H5、JS完成调用摄像头，并拍照截图上传

* 说明

    - ios手机：
        
        在http环境下，在微信端打开，不弹任何东西；
        
        在https环境下，在微信端打开，不弹任何东西
        
        **在http环境下，在safari中打开，走catch方法，分别弹（NotAllowedError）**
        
        （The request is not allowed by the user agent or the plateform in the current context，possibly because the user denied permission）
        在https环境下，在safari中打开，直接弹是否想要访问麦克风，说明调起麦克风成功
        
    - 安卓手机： 
    
          在http环境下，在微信端打开，走catch方法，分别弹（NotSupportedError）（only secure origins are allowed（see： https://goo.gl/YOZkNV））；
          
          在https环境下，在微信端打开，直接弹是否想要访问麦克风，说明调起麦克风成功
         
          **在http环境下，在safari中打开，走catch方法，分别弹（PermissionDeniedError）（）；**
         
          在https环境下，在safari中打开，直接弹是否想要访问麦克风，说明调起麦克风成功

* [Nginx反向代理https文档](https://github.com/MrWangTao/docs/blob/master/nginx.org)



