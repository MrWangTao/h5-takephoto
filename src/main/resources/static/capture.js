var vConsole = new VConsole();

(function () {
    video = document.getElementById('video');
    video.style.width = $("body").width() - 4 + "px";
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.
    var width = document.getElementById("camera").offsetWidth - 5; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.
    var streaming = false;

    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;
    var open = null;
    var close = null;
    var use = null;
    var retry = null;
    var globalStream = null;
    var openScan = false;
    var cantransferPhoto = false;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        open = document.getElementById('open');
        close = document.getElementById('close');
        use = document.getElementById('use');
        retry = document.getElementById('retry');
        height = video.videoHeight / (video.videoWidth / width);
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
            height = width / (8 / 5);
        }

        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        video.addEventListener('canplay', function (ev) {
            if (!streaming) {
                streaming = true;
            }
        }, false);

        // 拍照
        startbutton.addEventListener('click', function (ev) {
            // 视频流可以是否获取
            if (video.srcObject && video.srcObject.active) {
                takepicture();
            }
            ev.preventDefault();
        }, false);

        // 打开摄像头
        open.addEventListener('click', function (ev) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: ['environment', 'user'],

                },
                audio: false
            })
                .then(function (stream) {
                    // video.setAttribute('width', $('body').width() - 4);
                    globalStream = stream;
                    video.srcObject = stream;
                    video.onloadedmetadata = function (e) {
                        video.play();
                        setScanStyle();
                        startScan();
                    };
                })
                .catch(function (err) {
                    console.log("An error occurred: " + err);
                    alert("请刷新页面并授权摄像头功能 \n please refresh current request and authorize Camera");
                });

            ev.preventDefault();
        }, false);

        // 设置扫描条
        function setScanStyle() {
            var videoWidth = $("video").width();
            var videoHeight = $("video").height();
            var videoShadowHeight = videoWidth / (8 / 5);
            var topBottom = (videoHeight - videoShadowHeight) / 2;
            $("#scan").css({
                "width": videoWidth + "px",
                "height": videoHeight + "px",
                "display": "inline-block",
                "position": "absolute"
            });
            $(".outer-border").css("height", videoShadowHeight + "px");
            $("#videoShadow").css({
                "width": "5px",
                "height": videoShadowHeight + "px",
                "background": "radial-gradient(red 20%, white 100%)",
                "display": "inline-block",
                "position": "absolute",
                "top": topBottom + "px"
            });
            $("#scanTop").css({
                "width": videoWidth + "px",
                "height": topBottom + "px",
                "opacity": "0.5",
                "background-color": "darkgray"
            });
            $("#scanBottom").css({
                "width": videoWidth + "px",
                "height": topBottom + "px",
                "opacity": "0.5",
                "background-color": "darkgray",
                "position": "absolute",
                "bottom": "0px"
            });
        }

        // 关闭摄像头
        close.addEventListener('click', function (ev) {
            if (globalStream != null) {
                var tracks = globalStream.getTracks();
                if (tracks != null && tracks.length > 0) {
                    tracks[0].stop();
                    video.srcObject = new MediaStream();
                    console.log("video width :" + video.width);
                    console.log("video height :" + video.height);
                }
                globalStream = null;
                stopScan();
            }

            ev.preventDefault();
        }, false);

        // 使用
        use.addEventListener('click', function (ev) {
            if (cantransferPhoto) {
                // 非空判断，ajax上传图片并进行提取
                $.ajax({
                    url: "/picture",
                    data: JSON.stringify({"photo": $("#photo").attr("src")}),
                    // data: {"photo": $("#photo").attr("src")},
                    type: "POST",
                    // dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function(data) {
                        /*if (data instanceof String) {
                            console.log(data);
                        } else {
                            var obj = jQuery.parseJSON(data);
                            console.log(obj);
                        }*/
                        alert("识别成功，请跳转页面进行数据填充" + data);
                        // data = jQuery.parseJSON(data);  //dataType指明了返回数据为json类型，故不需要再反序列化
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("失败");
                    }
                });
            } else {
                alert("请先获取照片 \n please take photo");
            }
            ev.preventDefault();
        }, false);

        // 重拍
        retry.addEventListener('click', function (ev) {
            clearphoto();
            ev.preventDefault();
        }, false);

        clearphoto();
    }

    // Fill the photo with an indication that none has been
    // captured.

    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);
        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
        cantransferPhoto = false;
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            var canvW = canvas.width;
            var canH = canvas.height;
            var imgX = $("video").width();
            var imgY = $("video").height();
            var dWidth = 0;//图片按比例缩放后的宽
            var dHeight = 0;//图片按比例缩放以后的高
            if (imgX > imgY) {
                dHeight = canH;
                dWidth = imgX / (imgY / canH);
                if (dWidth < canvW) {
                    dWidth = canvW;
                    dHeight = imgY / (imgX / canvW);
                }
            } else {
                dWidth = canvW;
                dHeight = imgY / (imgX / canvW);
                if (dHeight < canH) {
                    dHeight = canH;
                    dWidth = imgX / (imgY / canH);
                }
            }
            var dx = (dWidth - canvW) / 2;//图像的左上角在目标canvas上 X 轴的位置
            var dy = (dHeight - canH) / 2;//图像的左上角在目标canvas上 Y 轴的位置
            context.drawImage(video, -dx, -dy, dWidth, dHeight);
            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            cantransferPhoto = true;
        } else {
            clearphoto();
        }
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startup, false);

    function startScan() {
        openScan = true;
        var videoWidth = $("#video").width();
        var left = (outerWidth - videoWidth) / 2;
        $("#videoShadow").css({
            left: (left - 5) + "px"
        });
        $("#videoShadow").animate({
            left: "+=" + (width - 5) + "px"
        }, 1000 * 2, "linear", function () {
            $(this).css({
                left: (left - width) + "px"
            });
            startScan();
        });
    }

    // window.setInterval(function () {
    //     if (openScan) {
    //         takepicture()
    //     }
    // }, 5000);

    function stopScan() {
        $('#videoShadow').stop();
        $("#videoShadow").css({"width": "0px", "height": "0px"});
        removeScanStyle();
        openScan = false;
    }

    function removeScanStyle() {
        $("#scan").removeAttr("style");
        $(".outer-border").removeAttr("style");
        $("#videoShadow").removeAttr("style");
        $("#scanTop").removeAttr("style");
        $("#scanBottom").removeAttr("style");
    }

})();