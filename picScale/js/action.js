;$(function(){
	var initWidth,initHeight;//img初始大小
	
	var initWidth = $("#hammer_img").width();
	var initHeight = $("#hammer_img").height();
	var ele = $("#hammer_img");
	
	//alert("initWidth:"+initWidth +"   initHeight:   "+initHeight);
	
	 //创建一个新的hammer对象并且在初始化时指定要处理的dom元素
         var hammertime = new Hammer(document.getElementById("hammer_wrap"));
		 
         hammertime.on("pan", function (e) {
             document.getElementById("result").innerHTML += "X偏移量：【" + e.deltaX + "】，Y偏移量：【" + e.deltaY + "】<br />";
             //控制台输出
			var _wid = ele.width();
			var _hei = ele.height();						
			var _left = (initWidth - _wid) * 0.5 + e.deltaX;
			var _top = (initHeight - _hei) * 0.5 + e.deltaY;	
							
			 //$("#hammer_img").css({"left":e.deltaX,"top":e.deltaY});
			 $("#hammer_img").css({"left":_left,"top":_top});
         });
		 
/* 		 hammertime.on("pan panend pinch pinchend rotatemove rotatestart", function(e) {
			switch (e.type) {
				case "panend":
					//l += e.deltaX, p += e.deltaY;
					$("#hammer_img").css({"left":e.deltaX,"top":e.deltaY});
					break;
				case "pan":
					//r(l + e.deltaX, p + e.deltaY, f, d);
					$("#hammer_img").css({"left":e.deltaX,"top":e.deltaY});
					break;
				case "pinchend":
					//f *= e.scale;
					$("#hammer_img").scale(e.scale);
					break;
				case "pinch":
					//r(l, p, f * e.scale, d);
					$("#hammer_img").scale(e.scale);
					break;
				case "rotatestart":
					//h = e.rotation, console.log("end" + h);
					break;
				case "rotatemove":
					//d = e.rotation - h, r(l, p, f * e.scale, d)
			}		 
		 }) */
		 
		 
		 var myElement = document.getElementById('hammer_wrap');
			var mc = new Hammer.Manager(myElement);
			// create a pinch and rotate recognizer
			// these require 2 pointers
			var pinch = new Hammer.Pinch();
			var rotate = new Hammer.Rotate();
			// we want to detect both the same time
			pinch.recognizeWith(rotate);
			// add to the Manager
			mc.add([pinch, rotate]);

			mc.on("pinch rotate", function(ev) {	
				//var ele = $("#hammer_img");
				var _wid = ele.width();
				var _hei = ele.height();
				if(!(((_wid > initWidth*2 || _hei > initHeight*2) && ev.scale >=1.2 ) || ((_wid < initWidth*0.5 ||  _hei < initHeight*0.5) && ev.scale <= 0.8))){				
					//ele.css({"width":_wid*ev.scale,"height":_hei*ev.scale});
					if(ev.type == "pinch"){
						if(ev.scale < 1){//缩
							//alert("11:  "+ele.width())
							ele.css({"width":_wid*ev.scale *1.1,"height":_hei*ev.scale*1.1});							
							//ele.css({"left":ele.css("left").split("px")[0]*ev.scale *1.1,"top":ele.css("top").split("px")[0]*ev.scale *1.1});									
						}else{//放
							ele.css({"width":_wid*ev.scale*0.9,"height":_hei*ev.scale * 0.9});
							//ele.css({"left":ele.css("left").split("px")[0]*ev.scale *0.9,"top":ele.css("top").split("px")[0]*ev.scale *0.9});
						}						
						
							var _wid2 = ele.width();
							var _hei2 = ele.height();
//alert("22:  "+ele.width());							
							var _left2 = (initWidth - _wid2) * 0.5;
							var _top2 = (initHeight - _hei2) * 0.5;	
							ele.css({"left":_left2,"top":_top2});
						document.getElementById("result").innerHTML += "scale偏移量：【" + ev.scale + "】   scale type：【" + ev.type + "】<br />";
					}else{//ev.type == "rotate"
						
					}
					
				}				
			});
			
			
		$(".resultbtn").bind("click",function(event){
			event.preventDefault();  
			//html2canvas(document.body, {  
			html2canvas($(".test"), {  
				allowTaint: true,  
				taintTest: false,  
				onrendered: function(canvas) {  
					canvas.id = "mycanvas";  
					//document.body.appendChild(canvas);  
					//生成base64图片数据  
					var dataUrl = canvas.toDataURL();  
					var newImg = document.createElement("img");  
					newImg.src =  dataUrl;  
					alert(newImg.src)
					//to do
					document.body.appendChild(newImg); 
				}
			})
		})
})
