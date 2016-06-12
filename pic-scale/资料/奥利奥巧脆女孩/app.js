var App = (function(){

    var shareData1 = {}, shareData2 = {};
    var openid;
    var userinfo = {
        id : 1,
        picurl : 'img/model-1.jpg'
    };
    var music = {
        audio : {}
    };
    var musicOff = false;

    var isFirst = true;
    var modelNum = 1;
    var swiperModel, swiperTerm;

    var init = function(){

        openid = $.fn.cookie('openid');
        if(!openid){
            window.location.href = 'api/auth.php?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        prefix();
        jssdk();
        if(getUrlParam('p')){
            main();
            return;
        }
        document.onreadystatechange = function () {
            if(document.readyState=="complete") {
                var loadedPer= $("#page-loading");
                $.getJSON('api/res.php',function(res){
                    var loadImgs = res,
                        loadTotal = 0,
                        loadImgTotal = loadImgs.length,
                        per = 100/loadImgTotal;
                    for(var i = 0; i < loadImgTotal;i++){
                        var img = new Image();
                        img.onload = img.onerror = function(){
                            loadTotal++;
                            if(loadTotal === loadImgTotal){
                                $("img[data-src*='img']").attr('src',function(){
                                    return $(this).data('src');
                                });
                                setTimeout(function(){
                                    main();
                                },4000);
                            }
                        };
                        img.src = 'img/' + loadImgs[i];
                    }  
                });
            }     
        };
    }

    var main = function(){

        $('.page').css('height', $(window).height() + 'px');
        $('#page-loading').hide();

        $('.btnRule .term').on('tap',function(){
            $('.btnRule .check').addClass('checked');
            showTip('.tipTerm', function(){
                if(!swiperTerm){
                    swiperTerm = new Swiper('.swiper-term', {
                        scrollbar: '.swiper-scrollbar',
                        scrollbarHide: false,
                        direction: 'vertical',
                        slidesPerView: 'auto',
                        freeMode: true
                    });
                }
            });
        });
        $('.btnRule .check').on('tap',function(){
            if(!$(this).hasClass('checked')) $(this).addClass('checked');
            else $(this).removeClass('checked');
        });
        $('.btnStart').on('tap',function(){
            if(!$('.btnRule .check').hasClass('checked')){
                hint('请先阅读本次活动条款');
                return;
            }
            page('model');

            track('开始');
        });
        $('.btnRetry').on('tap',function(){
            page('model');

            track('再试一次');
        });

        $('.btnChange').on('tap',function(){
            swiperModel.slideNext();
        });
        $('.btnPicture').on('click',function(){
            modelNum = swiperModel.activeIndex == 7 ? 1 : swiperModel.activeIndex;
            App.shareData1.imgUrl = getUrl() + '/img/share-' + modelNum + '.jpg';
            App.shareData2.imgUrl = getUrl() + '/img/share-' + modelNum + '.jpg';
            page('picture');

            track('我来摆');
        });
        $('.btnReUpload').on('tap',function(){
            page('model');
        });

        $('.btnSave').on('tap',function(){
            var base64 = canvas.toDataURL('image/jpeg', 0.8);
            // console.log(base64);
            App.userinfo.picurl = base64;
            page('result');

            track('保存并继续');
        });

        $('.btnForm').on('tap',function(){
            $(this).parents('.page').find('.form').addClass('active').siblings('.container').removeClass('active');

            track('提交照片');
        });

        $('.btnSubmit').on('tap',function(){
            var _this = $(this);
            if(_this.hasClass('disabled')) return;

            track('递交');

            var tel = $('#tel').val();

            if(tel.length != 11){
                hint('请输入正确的手机号码'); return;
            }

            _this.addClass('disabled');
            $.post('api/user.php?act=form',{
                tel : tel,
                picurl : App.userinfo.picurl,
            },function(res){
                if(res.code == 1){
                    App.userinfo.id = res.id;
                    page('share');
                }else{
                    hint(res.msg);
                }
                _this.removeClass('disabled');
            },'json');
        });

        page('');
    }

    var page = function(active){
        active = active || getUrlParam('p') || 'index';
        var activePage = $("#page-" + active);
        activePage.addClass("active").siblings(".page").removeClass("active");
        switch(active) {
            case 'index':
                break;
            case 'model':
                if(isFirst){
                    showTip('.tipRule');
                    activePage.addClass('blur');
                    isFirst = false;
                }

                if(!swiperModel){
                    swiperModel = new Swiper('.model .swiper-container',{
                        effect: 'fade',
                        loop: true
                    });
                }
                break;
            case 'picture':
                // modelNum = 6;
                activePage.find('.preview').attr('class','preview model-' + modelNum);
                activePage.find('.btns-1').addClass('active').siblings('.btns').removeClass('active');

                var container, ctrEle, cp_scale;
                var canvas = $('#canvas')[0];
                var canvasWidth = canvas.width,
                    canvasHeight = canvas.height;
                var stage = new createjs.Stage(canvas);

                var bg = new createjs.Shape();
                bg.graphics.f("#000").dr(0, 0, canvasWidth, canvasHeight);
                stage.addChild(bg);

                    // for test
                    // var cPhoto = new createjs.Bitmap('img/model-' + modelNum + '.jpg');
                    // cPhoto.name = "photo";
                    // cPhoto.scaleX = cPhoto.scaleY = cPhoto.scaleMin = cp_scale;
                    // cPhoto.x = canvasWidth / 2;
                    // cPhoto.y = canvasHeight / 2;
                    // stage.addChild(cPhoto);

                var cMask1 = new createjs.Bitmap('img/mask-0.png');
                cMask1.name = "mask1";
                stage.addChild(cMask1);


                var img = $('#mask img').eq(modelNum);
                var cMask2 = new createjs.Bitmap(img[0]);
                cMask2.x = parseInt(img.data('x'));
                cMask2.y = parseInt(img.data('y'));
                cMask2.name = "mask2";
                stage.addChild(cMask2);

                container = new createjs.Container();
                stage.addChild(container);
                stage.update();

                var mc = new Hammer.Manager(canvas);
                mc.add(new Hammer.Pinch());
                mc.add(new Hammer.Rotate());
                mc.add(new Hammer.Pan());

                mc.on('pinchstart rotatestart panstart',function(e){
                    var x = e.changedPointers[0].clientX,
                        y = e.changedPointers[0].clientY;
                    ctrEle = stage.getChildByName('mask2');
                    if(!ctrEle) return;
                    ctrEle.i_x = ctrEle.x;
                    ctrEle.i_y = ctrEle.y;
                    ctrEle.i_rotation = ctrEle.rotation;
                    ctrEle.i_scale = ctrEle.scaleX;
                });

                mc.on('pinchmove rotatemove panmove',function(e){
                    if(!ctrEle) return;
                    var _x = ctrEle.i_x + e.deltaX,
                        _y = ctrEle.i_y + e.deltaY;
                    ctrEle.scaleX = ctrEle.scaleY = ctrEle.i_scale + (e.scale-1);
                    if(_x > 0 && _x < canvasWidth - ctrEle.image.naturalWidth) ctrEle.x = _x;
                    if(_y > 0 && _y < canvasHeight - ctrEle.image.naturalHeight) ctrEle.y = _y;
                    if(ctrEle.scaleX < 0.7){
                        ctrEle.scaleX = ctrEle.scaleY = 0.7;
                    }
                    if(ctrEle.scaleX > 1.3){
                        ctrEle.scaleX = ctrEle.scaleY = 1.3;
                    }
                    ctrEle.rotation = ctrEle.i_rotation + e.rotation;
                    stage.update();
                });

                $('.filedata').on('change',function(source){
                    var file = source.target.files[0];
                    var URL = window.URL || window.webkitURL;
                    var blob = URL.createObjectURL(file);
                    var orientation = 0;
                    EXIF.getData(file, function(){
                        orientation = EXIF.getTag(this, 'Orientation') || 0;
                    });
                    photo = new Image();
                    photo.src = blob;
                    photo.onload=function(){

                        // if( navigator.userAgent.match(/iphone/i) ) {
                        //     var mpImg = new MegaPixImage(img);
                        //     mpImg.render(canvas, { maxWidth: w, maxHeight: h, quality: o.quality || 0.8, orientation: orientation || 0 });
                        //     base64 = canvas.toDataURL(file.type, o.quality || 0.8 );
                        // }

                        photo.orientation = orientation;

                        stage.removeChild(stage.getChildByName('photo'));

                        var cPhoto = new createjs.Bitmap(photo);
                        switch(photo.orientation) {
                            case 3:
                                photo.c_width = photo.width;
                                photo.c_height = photo.height;
                                cPhoto.rotation = 180;
                                break;
                            case 6:
                                photo.c_width = photo.height;
                                photo.c_height = photo.width;
                                cPhoto.rotation = 90;
                                break;
                            case 8: 
                                photo.c_width = photo.height;
                                photo.c_height = photo.width;
                                cPhoto.rotation = 270; 
                                break;
                            default:
                                photo.c_width = photo.width;
                                photo.c_height = photo.height;
                                break;
                        }
                        cp_scale = canvasWidth / photo.c_width;
                        if(cp_scale * photo.c_height < canvasHeight) cp_scale = canvasHeight / photo.c_height;

                        cPhoto.name = "photo";
                        cPhoto.scaleX = cPhoto.scaleY = cPhoto.scaleMin = cp_scale;
                        cPhoto.regX = photo.width / 2;
                        cPhoto.regY = photo.height / 2;
                        cPhoto.x = canvasWidth / 2;
                        cPhoto.y = canvasHeight / 2;
                        stage.addChild(cPhoto);

                        cMask1.parent.addChild(cMask1);
                        cMask2.parent.addChild(cMask2);
                        stage.update();

                        $('.filedata').val('');
                        $('#page-picture .img-2').hide();
                        activePage.find('.btns-2').addClass('active').siblings('.btns').removeClass('active');
                    };

                    track('开始自拍');
                });
                break;
            case 'result':
                var rnd = Math.floor(Math.random() * 5);
                activePage.find('.text div').eq(rnd).addClass('active').siblings('div').removeClass('active');
                activePage.find('.preview').css('background-image', 'url(' + App.userinfo.picurl + ')');
                break;
            case 'share':
                activePage.find('.bubble').removeClass('active');
                activePage.find('.preview').css('background-image', 'url(' + App.userinfo.picurl + ')');
                activePage.find('.save').html('<img src="' + App.userinfo.picurl + '">');

                activePage.find('.bubble-3').one('webkitAnimationEnd',function(){
                    activePage.find('.bubble').addClass('active');
                });
                // activePage.find('.preview').css('background-image', 'url(img/model-' + modelNum + '.jpg)');
                break;
        }
    }

    var showTip = function(tipEle, callback){
        $(tipEle).show();
        if(tipEle == '.tipTerm'){
            $(tipEle).find('.close').one('tap',function(){
                hideTip(tipEle);
            });
        }else{
            $(tipEle).one('tap',function(){
                hideTip(this);
                if(tipEle == '.tipRule') $('#page-model').removeClass('blur');
            });
        }
        setTimeout(function(){
            $(tipEle).addClass('active');
        },50);
        if(callback) $(callback);
    }

    var hideTip = function(tipEle, callback){
        $(tipEle).removeClass('active').one('webkitTransitionEnd', function(){
            $(this).hide();
        });
        if(callback) $(callback);
    }
    
    var getUrl = function() {
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        if(pathName.length == 1) return window.document.location.origin;
        var pos = curWwwPath.indexOf(pathName);
        var localhostPaht = curWwwPath.substring(0, pos);
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);  
        var rootPath = localhostPaht + projectName;
        return rootPath;
    }
    
    var getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    var prefix = function(){
        $(document).ready(function(e) {
            $(window).on('orientationchange',function(e){
                var turnBox = $(".turnBox");
                if(window.orientation==180||window.orientation==0){
                    turnBox.hide();
                }
                if(window.orientation==90||window.orientation==-90){
                    if(turnBox.length){
                        turnBox.show();
                    }else{
                        $("body").append('<aside class="turnBox"><img src="img/turn.png" class="turn"><p>请将手机调至竖屏状态，获得最佳浏览体验！</p></aside>');
                    }
                }
                
            });
            $(document).on('touchmove', function(e){
                var fix = $(e.target).parents('#rule-content').length;
                if(!fix) e.preventDefault();
            });
        });
    }

    var jssdk = function(){
        if (/MicroMessenger/i.test(navigator.userAgent)) {
            $.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function callback() {
                $.ajax({
                    type: "post",
                    url: "api/jssdk.php",
                    dataType: 'json',
                    data: {
                        url: window.location.href.split('#')[0]
                    },
                    success: function (data) {
                        wx.config({
                            debug: false,
                            appId: data.appid,
                            timestamp: data.timestamp,
                            nonceStr: data.noncestr,
                            signature: data.signature,
                            jsApiList: [
                                    'onMenuShareTimeline',
                                    'onMenuShareAppMessage',
                                    'hideMenuItems'
                                ]
                        })
                        wx.ready(function () {
                            App.shareData1 = {
                                title: '拍大片？上杂志？巧轻脆帮你实现心愿吧！',
                                link: getUrl(),
                                desc: '',
                                imgUrl: getUrl() + '/img/model-1.jpg?v=1',
                                success: function () {
                                	page('model');
                                },
                                cancel: function () { 
                                }
                            };
                            App.shareData2 = {
                                title: '寻找巧轻脆女孩',
                                link: getUrl(),
                                desc: '拍大片？上杂志？巧轻脆帮你实现心愿吧！',
                                imgUrl: getUrl() + '/img/model-1.jpg?v=1',
                                success: function () {
                                	page('model');
                                },
                                cancel: function () { 
                                }
                            };
                            wx.onMenuShareTimeline(App.shareData1);
                            wx.onMenuShareAppMessage(App.shareData2);
                            wx.hideMenuItems({
                                menuList: [
                                    'menuItem:share:qq',
                                    'menuItem:share:weiboApp',
                                    'menuItem:favorite',
                                    'menuItem:share:facebook',
                                    'menuItem:copyUrl',
                                    'menuItem:readMode',
                                    'menuItem:openWithQQBrowser',
                                    'menuItem:openWithSafari'
                                ]
                            });
                        })
                        wx.error(function (res) {
                            // alert(res)
                        })
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        //alert("Http status: " + xhr.status + " " + xhr.statusText + "\najaxOptions: " + ajaxOptions + "\nthrownError:" + thrownError + "\n" + xhr.responseText);
                    }
                })
            })
        }
    }

    music.set = function(name, para){
        var _audio = new Audio();
        mergeKey(_audio, para, false);
        music.audio[name] = _audio;
        if(para.autoPlay) music.audio[name].play();
    }
    music.play = function(name){
        if(music.audio[name]) music.audio[name].play();
    }
    music.stop = function(name){
        if(name){
            if(music.audio[name]) music.audio[name].pause();
            return;
        }
        $.each(music.audio, function(key, val){
            val.pause();
        });
    }
    var mergeKey = function(obj1, obj2, union){
        union = typeof(union)=="undefined" ? true : union;
        for(var key in obj2){
            if(obj2.hasOwnProperty(key) && (union || (key in obj1))){
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }

    var hint = function(text){
        if(!text) return;
        var box = $('#hint');
        box.html(text).show();
        if(box[0].timer) clearTimeout(box[0].timer);
        box[0].timer = setTimeout(function () {
            box.hide();
        }, 2000);
    }

    var track = function(label){
        _smq.push(['custom', '页面', label]);
    }

    return {
        init : init,
        shareData1 : shareData1,
        shareData2 : shareData2,
        userinfo : userinfo,
        page : page,
        getUrl : getUrl,
        getUrlParam : getUrlParam,
        prefix : prefix,
        jssdk : jssdk,
        hint : hint
    }

})();