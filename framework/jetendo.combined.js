
/* /var/jetendo-server/jetendo/public/javascript/jetendo/cookie-functions.js */

(function($, window, document, undefined){
	"use strict";
	var zCookieTrackingObj={};
	var zCookieTrackingCount=0;
	var zCookieTrackingEnabled=false;
	function zTrackCookieChanges(){
		for(var i in zCookieTrackingObj){
			var t=zCookieTrackingObj[i];
			var value=zGetCookie(i);
			if(value !== t.value){
				t.value=value;
				t.callback(value);
			}
		}
	}

	function zWatchCookie(key, callback){
		zCookieTrackingObj[key]={
			callback:callback,
			value:zGetCookie(key)
		};
		zCookieTrackingCount++;
		if(!zCookieTrackingEnabled){
			zCookieTrackingEnabled=setInterval(zTrackCookieChanges, 1000);
		}
	}
	function zDeleteWatchCookie(key){
		delete zCookieTrackingObj[key];
		zCookieTrackingCount--;
		if(zCookieTrackingCount===0){
			clearInterval(zCookieTrackingEnabled);
			zCookieTrackingEnabled=false;
		}
	}
	function zGetCookie(key){
	    var currentcookie = document.cookie;
	    if (currentcookie.length > 0)
	    {
	        var firstidx = currentcookie.indexOf(key + "=");
	        if (firstidx !== -1)
	        {
	            firstidx = firstidx + key.length + 1;
	            var lastidx = currentcookie.indexOf(";",firstidx);
	            if (lastidx === -1)
	            {
	                lastidx = currentcookie.length;
	            }
	            return unescape(currentcookie.substring(firstidx, lastidx));
	        }
	    }
	    return "";
	}

	function zDeleteCookie(key){
		zSetCookie({key:key, value:"", futureSeconds:-1, enableSubdomains:false});
	}
	/* zSetCookie({key:"cookie",value:"value",futureSeconds:3600,enableSubdomains:false}); */
	function zSetCookie(obj){
		if(typeof obj !== "object"){
			throw("zSetCookie requires an obj like {key:'cookie'',value:'value',futureSeconds:60,enableSubdomains:false}.");
		}
		var dObj={futureSeconds:0,enableSubdomains:false};
		for(var i in obj){
			dObj[i]=obj[i];	
		}
		var newC=dObj.key+"="+escape(dObj.value);
		if(dObj.futureSeconds !== 0){
			var currtime=new Date();
			currtime = new Date(currtime.getTime() + dObj.futureSeconds*1000);
	         newC+=";expires=" + currtime.toGMTString();
		}
		if(dObj.enableSubdomains){
			newC+=";domain=."+window.location.hostname.replace("www.","").replace("secure.",""); 
		}
		document.cookie=newC;
	}
	window.zTrackCookieChanges=zTrackCookieChanges;
	window.zWatchCookie=zWatchCookie;
	window.zDeleteWatchCookie=zDeleteWatchCookie;
	window.zGetCookie=zGetCookie;
	window.zDeleteCookie=zDeleteCookie;
	window.zSetCookie=zSetCookie;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/css-framework.js */

(function($, window, document, undefined){
	"use strict";
 
	/*

	*/
	function zSetupBreakpointClasses(){
		$(".z-breakpoint").each(function(e){ 
			if(typeof this.arrBreakCache!="undefined"){
				var arrBreak=this.arrBreakCache;
			}else{
				var breakpoints=$(this).attr("data-breakpoints");
				if(breakpoints == null || breakpoints==""){
					return;
				}
				var arrBreak=breakpoints.split(","); 
				for(var i=0;i<arrBreak.length;i++){
					arrBreak[i]=parseInt(arrBreak[i]);
				}
				this.arrBreakCache=arrBreak;
			}
			var a=zGetAbsPosition(this.parentNode); 
			var b=10000; 
			for(var i=0;i<arrBreak.length;i++){ 
				if(arrBreak[i]>a.width){
					b=arrBreak[i];
				}
			}
			if(b!=10000){
				$(this).addClass("z-breakpoint-"+b);
				for(var i=0;i<arrBreak.length;i++){
					if(b!=arrBreak[i]){
						$(this).removeClass("z-breakpoint-"+arrBreak[i]);
					}
				}
			}
		}); 
	}
	zArrResizeFunctions.push({functionName:zSetupBreakpointClasses}); 

	/*

	*/
	function zRunNegativeMarginFit(obj, direction){
		var image;
		if(obj.tagName=="IMG"){
			if(obj.complete!=1){
				return;
			}
			image=$(obj);
		}else{
			image=$("img", obj);
			if(image.length==0){
				console.log("zForceNegativeMarginLeft and zForceNegativeMarginRight only works with images");
			}
		}
		image.width("100%");
		var width=image[0].naturalWidth;
		var parentPosition=zGetAbsPosition(obj.parentNode);
	 
		var parentWidth=Math.round($(obj.parentNode).width()); 
		if(direction=='right'){
			if(zWindowSize.width < parentPosition.x+width){
				var extraWidth=(parentPosition.x+width)-zWindowSize.width;
				width-=extraWidth;//+2+zScrollbarWidth
			}
			
		}else{
			if(width>parentPosition.x+parentWidth){
				var extraWidth=width-(parentPosition.x+parentWidth); 
				width-=extraWidth;  
			} 
		}
		var overflowWidth=width-parentWidth; 
	 
		image.width(width+"px"); 
		$(obj).css("margin-"+direction, -overflowWidth+"px");
	}
	function zSetupNegativeMarginFit(){
		$(".zForceNegativeMarginRight").show().bind("load", function(){
			zRunNegativeMarginFit(this, "right");
		});
		$(".zForceNegativeMarginRight").each(function(){
			if(this.complete){
				zRunNegativeMarginFit(this, "right");
			}
		});
		$(".zForceNegativeMarginLeft").show().bind("load", function(){
			zRunNegativeMarginFit(this, "left");
		});
		$(".zForceNegativeMarginLeft").each(function(){
			if(this.complete){
				zRunNegativeMarginFit(this, "left");
			}
		});
	};
	zArrResizeFunctions.push({functionName:zSetupNegativeMarginFit});

	function sortNumber(a,b) {
		return a - b;
	}
	/*

	*/
	function zSetupLazyLoadImages(){
		function setLazyLoadCache(obj){
			if(typeof obj.arrLazyLoadCache == "undefined"){
				var src=$(obj).attr("data-lazy-src");
				if(src == null){
					throw("img tag is missing data-lazy-src attribute");
				}
				var a=src.split(":");
				var arrSrc=[];
				var arrBreakpoint=[];
				var lastValue="";
				for(var i=0;i<=a.length;i++){
					if(lastValue==""){
						lastValue=a[i];
					}else{
						arrSrc[lastValue]=a[i];
						if(lastValue!="default"){
							arrBreakpoint.push(parseInt(lastValue));
						}
						lastValue="";
					}
				}
				arrBreakpoint.sort(sortNumber);
				obj.arrLazyLoadCache={arrSrc:arrSrc, arrBreakpoint:arrBreakpoint}; 
			}

		}
		/*

		backgrounds:{
			"default":[{ 
				size: "auto", 
				url: "/images/topImage.png", 
				color: "", // rgba(255,255,255,0.8) or #FFFFFF
				position: "right center", // left|right|center and/or top|center|bottom, i.e. center top or width/height values: 100px 50px
				repeat: "no-repeat", repeat (default) | repeat-x | repeat-y | no-repeat
				attachment: "scroll" scroll (default) | fixed (background stays still when main window scrolls) | local (background moves with overflow:scroll content)
			},{
				size:"cover",
				url:"/images/bottomImage.jpg",
				repeat:"repeat",
				attachment: "fixed" 
			}],
			"992":[{
				size:"auto",
				url:"/images/resize-image-test-mobile.jpg",
				color:"#666",
				position:"center top"
				repeat:"repeat"
			}]
		}
		*/ 
		var lazyBackgroundImages=$(".zLazyLoadBackgroundImage"); 
		lazyBackgroundImages.each(function(){
			if(typeof this.arrLazyLoadCache == "undefined"){
				var src=$(this).attr("data-lazy-json");
				if(src == null){
					throw("img tag is missing data-lazy-json attribute");
				}
				var j=JSON.parse(src);
				var arrSrc=[];
				var arrBreakpoint=[]; 
				for(var i in j){
					arrSrc[i]=j[i];
					if(i!="default"){
						arrBreakpoint.push(parseInt(i));
					}
				} 
				arrBreakpoint.sort(sortNumber);
				this.arrLazyLoadCache={arrSrc:arrSrc, arrBreakpoint:arrBreakpoint}; 
				this.lazyLoadLastOffset=-2;
			}
			var b=this.arrLazyLoadCache.arrBreakpoint; 
			var lastBreakpoint="default";
			var offset=-1;
			for(var i=0;i<b.length;i++){
				var bp=b[i];  
				if(zWindowSize.width<bp){
					lastBreakpoint=bp;
					offset=i;
					break;
				}
			}
			var src=this.arrLazyLoadCache.arrSrc[lastBreakpoint];
			if(typeof this.zLazyLoaded == "undefined"){ 
				$(this).css("background", "");
				this.setAttribute("data-lazy-original", src["background-image"]);
				this.zLazyLoaded=true;
				$(this).lazyload({
					threshold : 200,
					load:function(e){  
						$(this).css({
							"background-position": src["background-position"],
							"background-repeat": src["background-repeat"],
							"background-attachment": src["background-attachment"],
							"background-size": src["background-size"],
							"background-color": src["background-color"]
						});  

					}
				}); 
			}else{
				if(this.lazyLoadLastOffset != offset){
					this.lazyLoadLastOffset=offset; 
					this.style.background=src["background-image"];
					$(this).css({  
						"background-position": src["background-position"],
						"background-repeat": src["background-repeat"],
						"background-attachment": src["background-attachment"],
						"background-size": src["background-size"],
						"background-color": src["background-color"]
					}); 
				}
			}
		}); 
		var lazyImages=$("img.zLazyLoadImage"); 
		lazyImages.each(function(){
			setLazyLoadCache(this);
			var b=this.arrLazyLoadCache.arrBreakpoint; 
			var lastBreakpoint="default";
			for(var i=0;i<b.length;i++){
				var bp=b[i];  
				if(zWindowSize.width<bp){
					lastBreakpoint=bp;
					break;
				}
			}
			var src=this.arrLazyLoadCache.arrSrc[lastBreakpoint];
			if(typeof this.zLazyLoaded == "undefined"){
				this.setAttribute("data-original", src);
				this.zLazyLoaded=true;
				$(this).lazyload({
					threshold : 200,
					effect:"fadeIn"
				}); 
			}else{
				if(src==""){
					if(this.style.display=="block"){
						this.style.display="none";
					}
				}else{
					this.style.display="block";
					if(this.src!=src){
						this.src=src;
					}
				}
			}
		
		}); 
	}


	
	zArrResizeFunctions.push({functionName:zSetupLazyLoadImages});

	// add class="z-equal-heights" data-column-count="2" to any element and all the children will have heights made equal for each row. You can change 480 to something else with this optional attribute: data-single-column-width="768"
	// if data-children-class is specified, the equal heights will be performed on the elements matching the class instead of the children of the container.
	function forceChildEqualHeights(children){  
		var lastHeight=0; 
		$(children).height("auto");
		$(children).each(function(){  
			var height=$(this).height(); 
			if(height>lastHeight){
				lastHeight=height;
			}
		});
		if(lastHeight == 0){
			lastHeight="auto";
		} 
		$(children).height(lastHeight); 
	} 
	function zForceChildEqualHeights(){  
		var containers=$(".z-equal-heights");
		// if data-column-count is not specified, then we force all children to have the same height
		// we need to determine when all images are done loading and then run equal heights again for each row to ensure equal heights works correctly.
		containers.each(function(){
			var childrenClass=$(this).attr("data-children-class");
			if(childrenClass==null || childrenClass == ""){
				childrenClass="";
			}
			var singleColumnWidth=$(this).attr("data-single-column-width");
			if(singleColumnWidth==null || singleColumnWidth == ""){
				singleColumnWidth=479;
			}
			var columnCount=$(this).attr("data-column-count");
			if(columnCount==null || columnCount == ""){
				columnCount=0;
			}
			columnCount=parseInt(columnCount);
			if(childrenClass!=""){
				var children=$(childrenClass, this);
			}else{
				var children=$(this).children();
			} 
			if($(this).width()<=singleColumnWidth){
				$(children).height("auto");
				return;
			}
			var columnChildren=[];
			var columnChildrenImages=[];
			if(columnCount==0){
				columnChildren[0]={
					children:children,
					images:[],
					imagesLoaded:0
				}
				$("img", children).each(function(){
					columnChildren[0].images.push(this);
					if(this.complete){
						columnChildren[0].imagesLoaded++;
					}
				});
			}else{
				var count=0;
				var currentOffset=0; 
				for(var i=0;i<children.length;i++){
					if(typeof columnChildren[currentOffset] == "undefined"){
						columnChildren[currentOffset]={
							children:[],
							images:[],
							imagesLoaded:0
						} 
					}
					columnChildren[currentOffset].children.push(children[i]);
					$("img", children[i]).each(function(){
						columnChildren[currentOffset].images.push(this);
						if(this.complete){
							columnChildren[currentOffset].imagesLoaded++;
						}
					});
					count++;
					if(count>=columnCount){
						count=0;
						currentOffset++;
					}
				}  
			} 
			for(var i=0;i<columnChildren.length;i++){
				var c=columnChildren[i]; 
				if(c.images.length){  
					var images=$(c.images); 
					if(c.imagesLoaded != images.length){
						images.bind("load", function(e){
							c.imagesLoaded++;
							if(c.imagesLoaded>images.length){ 
								forceChildEqualHeights(c.children);  
							}
						});
					}
				}
				forceChildEqualHeights(c.children); 
			}
		}); 
		if($(".z-equal-height").length > 0){
			console.log("The class name should be z-equal-heights, not z-equal-height");
		}
	}
	zArrResizeFunctions.push({functionName:zForceChildEqualHeights });

	function setupMobileMenu() {
		if($(".z-mobileMenuButton").length==0){
			return;
		}
		function toggleMenu(e){  
			e.preventDefault();
			var className=$(".z-mobileMenuDiv").attr("data-open-class"); 
			if(className != null){  
				$(".z-mobileMenuDiv").toggleClass(className);
			}else{
				$(".z-mobileMenuDiv").slideToggle("fast");
			}
			return false;
		}
		function hideMenu(){
			var isVisible=false;
			var className=$(".z-mobileMenuDiv").attr("data-open-class"); 
			if(className != null){  
				if($(".z-mobileMenuDiv").hasClass(className)){
					$(".z-mobileMenuDiv").removeClass(className);
					$(".z-mobileMenuDiv").hide();
				}
			}else{
				if($(".z-mobileMenuDiv").is(":visible")){
					$(".z-mobileMenuDiv").hide();
				}
			}
		}
		$(".z-mobileMenuButton").bind("click", toggleMenu);
		$(document).bind("click", function(e){
			if(!zMouseHitTest($(".z-mobileMenuDiv")[0], 0)){
				var isVisible=false;
				var className=$(".z-mobileMenuDiv").attr("data-open-class"); 
				if(className != null){  
					if($(".z-mobileMenuDiv").hasClass(className)){
						e.preventDefault();
						$(".z-mobileMenuDiv").removeClass(className);
					}
				}else{
					if($(".z-mobileMenuDiv").is(":visible")){
						e.preventDefault();
						$(".z-mobileMenuDiv").hide();
					}
				}
			}
		}); 

		function fixMenu(){
			var w=zWindowSize.width+zScrollbarWidth;
			if(w>992){

				$(".z-mobileMenuDiv").removeClass("z-transition-all");
				$(".z-mobileMenuDiv").hide();
				hideMenu();
			}else if(w>=768 && w<=992){
				$(".z-mobileMenuDiv").removeClass("z-transition-all");
				hideMenu();
				$(".z-mobileMenuDiv").show();
			}else{
				$(".z-mobileMenuDiv").addClass("z-transition-all");
			}
		}
		zArrResizeFunctions.push({functionName: fixMenu});
		fixMenu();

	}

	zArrDeferredFunctions.push(setupMobileMenu);
 

 
	zArrDeferredFunctions.push(function(){
		var arrOriginalMenuButtonWidth=[];
		function setEqualWidthMobileMenuButtons(containerDivId, marginSize){ 
			$("#"+containerDivId+" nav").css("visibility", "visible");  
			if(typeof arrOriginalMenuButtonWidth[containerDivId] === "undefined"){
				zArrResizeFunctions.push(function(){ setEqualWidthMobileMenuButtons(containerDivId, marginSize); });
			}
			arrOriginalMenuButtonWidth[containerDivId]={
				ul:$("#"+containerDivId+" > nav "),
				arrLI:$("#"+containerDivId+" > nav > div"),
				arrItem:$("#"+containerDivId+" > nav > div > a"),
				arrItemWidth:[],
				arrItemBorderAndPadding:[],
				containerWidth:	0,
				navWidth:0,
				marginSize:marginSize
			};
			var columnGap=$("#"+containerDivId).attr("data-column-gap");
			if(columnGap==null){
				columnGap=20;
			}else{
				columnGap=parseInt(columnGap);
			}
			var equalDisabled=false;
			var currentMenu=arrOriginalMenuButtonWidth[containerDivId]; 
			for(var i=0;i<currentMenu.arrItem.length;i++){ 
				if(zWindowSize.width+zScrollbarWidth <768){ 
					equalDisabled=true;
					$("#"+containerDivId).width("auto");
					$(currentMenu.arrItem[i]).parent().css({
						"width":"100%",
						"min-width":"auto",
						"float":"left",
						"display":"block",
						"text-align":"left"
					});
					$(currentMenu.arrItem[i]).css({
						"width":"100%",
						"min-width":"auto",
						"display":"block",
						"text-align":"left"
					});

					continue;
				}else{
					$(currentMenu.arrItem[i]).parent().css({
						"width":"auto",
						"min-width":"auto",
						"float":"none",
						"display":"inline-block",
						"text-align":"center"
					});
					$(currentMenu.arrItem[i]).css({
						"width": "auto",
						"min-width":"1px", 
						"float":"left",
						"text-align":"center"
					});
				}
				$(currentMenu.arrItem[i]).css({
					"margin-right": "0px"
				});
			}
			$(currentMenu.arrLI).each(function(){ $(this).css("margin-right", "0px"); });
			if(zWindowSize.width+zScrollbarWidth <768){ 
				return;
			}
			var sLen=currentMenu.arrItem.length;
			var totalWidth1=0;
			for(var i=0;i<sLen;i++){ 
				var jItem=$(currentMenu.arrItem[i]);
	 			jItem.width("auto");
	 			totalWidth1+=jItem.width();
	 			//console.log("new auto width:"+jItem.width());
				var curWidth=jItem.width();
				var borderLeft=parseInt(jItem.css("border-left-width"));
				var borderRight=parseInt(jItem.css("border-right-width"));
				if(isNaN(borderLeft)){
					borderLeft=1;
				}
				if(isNaN(borderRight)){
					borderRight=1;
				}
				var curBorderAndPadding=parseInt(jItem.css("padding-left"))+parseInt(jItem.css("padding-right"))+parseInt(borderLeft)+parseInt(borderRight);
				if(jItem.css("box-sizing") == "border-box"){
					curBorderAndPadding=0;
				}
				//console.log("borpad:"+curBorderAndPadding+":"+borderLeft+":"+borderRight+":"+curWidth+":"+jItem.width()+":"+(jItem.css("padding-left"))+":"+(jItem.css("padding-right"))+":"+jItem.css("border-left-width")); 
				$(jItem).css({
					"padding-left":"0px",
					"padding-right":"0px"
				}); 
				if(i===sLen-1){
					//curWidth-=0.5;
					$(jItem).css({
						"margin-right": "0px"
					});
					curWidth=$(jItem).width(); 
					//console.log("last:"+curWidth);
					$(jItem).css({ 
						"width": curWidth+"px"
					});
					currentMenu.navWidth+=curWidth+curBorderAndPadding; 
					//console.log(curWidth+marginSize+curBorderAndPadding);
				}else{
					$(jItem).css({
						"margin-right": currentMenu.marginSize+"px",
						"width": curWidth
					}); 
					currentMenu.navWidth+=curWidth+marginSize+curBorderAndPadding+columnGap;
					//console.log(curWidth+marginSize+curBorderAndPadding);
				}
				currentMenu.arrItemBorderAndPadding.push(curBorderAndPadding);
				currentMenu.arrItemWidth.push(curWidth);
			} 
			//console.log('totalWidth:'+totalWidth1);
			if(equalDisabled){
				$("#"+containerDivId+" nav").css("visibility", "visible");
				return;
			} 
			//console.log(currentMenu.navWidth);
	 
			//console.log(currentMenu.marginSize);
			//currentMenu.ul.detach(); 
			//console.log(containerDivId+":"+"containerWidth:"+$("#"+containerDivId).width());
			$("#"+containerDivId).width("100%");
			currentMenu.containerWidth=$("#"+containerDivId).width()-1;
			//console.log(currentMenu.containerWidth+":"+currentMenu.navWidth+":"+currentMenu.marginSize);
			//return;
			var totalWidth = currentMenu.containerWidth;//-2;
			var navWidth = 0;
			var deltaWidth = totalWidth - (currentMenu.navWidth);// + currentMenu.marginSize);
			var padding = Math.max(10, Math.floor((deltaWidth / currentMenu.arrItem.length) / 2));// - (currentMenu.marginSize/2); 
			//console.log('padding:'+padding);
			var floatEnabled=false;
			/*if(totalWidth<currentMenu.navWidth + ((currentMenu.arrItem.length-1)*currentMenu.marginSize)){
				//padding=0;
				floatEnabled=true;
				$(currentMenu.arrLI).each(function(){ $(this).css("display", "block"); });
			}else{
				if($.browser.msie && $.browser.version <= 7){
					$(currentMenu.arrLI).each(function(){ $(this).css("display", "inline"); });
				}else{
					$(currentMenu.arrLI).each(function(){ $(this).css("display", "inline-block"); });
				} 
			} */
			//console.log(containerDivId+":"+"marginSize:"+currentMenu.marginSize+" containerWidth:" +currentMenu.containerWidth+" totalWidth:"+totalWidth+" navWidth:"+currentMenu.navWidth+" deltaWidth:"+deltaWidth+" padding:"+padding);
			var totalWidth2=0;
			var totalWidth3=0;
			var sLen=currentMenu.arrItem.length;

			for(var i=0;i<sLen;i++){ 
				
				if(currentMenu.navWidth> zWindowSize.width+zScrollbarWidth){
					var curWidth=currentMenu.arrItemWidth[i]+columnGap;
				}else{
					var curWidth=currentMenu.arrItemWidth[i];//+columnGap;
				}
				//console.log(padding);
				//$(currentMenu.arrItem[i]).width(curWidth-20);
				var newWidth=Math.floor(curWidth+(padding*2)); 
	 
				var addWidth=Math.max(curWidth, newWidth);
				newWidth=(newWidth/currentMenu.containerWidth);
				curWidth=(curWidth/currentMenu.containerWidth);
	 			newWidth=(Math.round(newWidth*100000)/1000)-0.001;
	 			curWidth=(Math.round(curWidth*100000)/1000)-0.001; 
				if(false && sLen-1 == i){
					// this doesn't work
					
					newWidth=(currentMenu.containerWidth-totalWidth2);
		 			addWidth=newWidth;
		 			newWidth=newWidth/currentMenu.containerWidth;
		 			newWidth=(Math.round(newWidth*100000)/1000)-0.001;
		 			if(newWidth<curWidth){
		 			//	newWidth=curWidth;
		 			}
		 			curWidth=newWidth;


					$(currentMenu.arrItem[i]).parent().css({
						"width": (newWidth)+"%",
						"min-width":(curWidth)+"%"
					});
					$(currentMenu.arrItem[i]).css({
						"width": (100)+"%",
						"min-width":(100)+"%" 
					});
				}else{
					$(currentMenu.arrItem[i]).parent().css({
						"width": (newWidth)+"%",
						"min-width":(curWidth)+"%", 
						"margin-right":marginSize+"px"
					});
					$(currentMenu.arrItem[i]).css({
						"width": (100)+"%",
						"min-width":(100)+"%" 
					});
						
				}
				//console.log('newWidth:'+newWidth+" | curWidth:"+curWidth);
				totalWidth2+=Math.round(addWidth+marginSize);
				totalWidth3+=newWidth;
			} 
		//console.log('totalWidth3:'+totalWidth3);
			$("#"+containerDivId).append(currentMenu.ul);
			$("#"+containerDivId+" nav").css("visibility", "visible");
		}
		var uniqueMenuId=1;
		$(".z-mobileMenuDiv").each(function(){
			if(this.id == null || this.id == ""){
				this.id="zMobileMenuDiv"+uniqueMenuId;
				uniqueMenuId++;
			}
			setEqualWidthMobileMenuButtons(this.id, 0);
		});
		
	});


	function zIsVisibleOnScreen(obj){ 
		// obj must be an element with display=block for this to work right.
		if(typeof obj == "string"){
			obj=document.getElementById(obj);
		}
		var p=zGetAbsPosition(obj);
		if(p.y+p.height < zScrollPosition.top || p.y > zWindowSize.height+zScrollPosition.top){
			return false;
		}
		if(p.x+p.width < zScrollPosition.left || p.x > zWindowSize.width+zScrollPosition.left){
			return false;
		}
		return true;
	}
	function zAnimateVisibleElements(){
		var section=document.getElementById('yelpSectionDiv');
		$(".zAnimateOnVisible").each(function(){
			if(zIsVisibleOnScreen(this)){ 
				var d=$(this).attr("data-visible-callback"); 
				if(d != "" && typeof window[d] != "undefined"){
					var callback=window[d]; 
					callback(this);
				}
				$(this).hide().css({ visibility:"visible" }).fadeIn('fast');
				var c=$(this).attr("data-visible-class"); 
				$(this).removeClass("zAnimateOnVisible");
				if(c != "" && !$(this).hasClass(c)){
					$(this).addClass(c);
				}
			}
		});
	}
	zArrDeferredFunctions.push(function(){
		$(".zAnimateOnVisible").each(function(){
			if(!zIsVisibleOnScreen(this)){ 
				$(this).hide().css({ visibility:"hidden" });
			}  
		});
		zArrScrollFunctions.push(zAnimateVisibleElements);
		setTimeout(zAnimateVisibleElements, 100);
	});

 	window.zForceChildEqualHeights=zForceChildEqualHeights;
	window.zIsVisibleOnScreen=zIsVisibleOnScreen;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo/event-functions.js */

var zWindowSize=false;
var zWindowIsLoaded=false;
var zScrollPosition={left:0,top:0};
var zPositionObjSubtractId=false;
var zPositionObjSubtractPos=new Array(0,0);
var zJetendoLoadedRan=false;
var zHumanMovement=false;

(function($, window, document, undefined){
	"use strict";



	function zJetendoLoaded(){ 
		if(zJetendoLoadedRan) return;
		zJetendoLoadedRan=true;
		if(!zWindowIsLoaded){
			zWindowOnLoad();	
		}
		if(typeof zArrDeferredFunctions !== "undefined"){
			var zATemp=zArrDeferredFunctions;
			for(var i=0;i<zATemp.length;i++){
				zATemp[i]();
			}
		}
	}

	var zArrMapFunctionsLoaded=false;
	function zLoadMapFunctions(){
		if(zArrMapFunctionsLoaded) return;
		zArrMapFunctionsLoaded=true;
		if(typeof zArrMapFunctions !== "undefined"){
			for(var i=0;i<zArrMapFunctions.length;i++){
				zArrMapFunctions[i]();
			}
		}
	}
	function zSetScrollPosition(){
		var ScrollTop = document.body.scrollTop;
		if (ScrollTop === 0){
			if (window.pageYOffset){
				ScrollTop = window.pageYOffset;
			}else{
				ScrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
		}
		zScrollPosition.top=ScrollTop;
		var ScrollLeft = document.body.scrollLeft;
		if (ScrollLeft === 0){
			if (window.pageXOffset){
				ScrollLeft = window.pageXOffset;
			}else{
				ScrollLeft = (document.body.parentElement) ? document.body.parentElement.scrollLeft : 0;
			}
		}
		zScrollPosition.left=ScrollLeft;
	}


	function getWindowSize() {
	  var myWidth = 0, myHeight = 0;
	  if( typeof( window.innerWidth ) === 'number' ) {
	    //Non-IE
	    myWidth = window.innerWidth;
	    myHeight = window.innerHeight;
	  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
	    //IE 6+ in 'standards compliant mode'
	    myWidth = document.documentElement.clientWidth;
	    myHeight = document.documentElement.clientHeight;
	  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
	    //IE 4 compatible
	    myWidth = document.body.clientWidth;
	    myHeight = document.body.clientHeight;
	  }
	  return {width:myWidth,height:myHeight};
	}
	function zWindowOnScroll(){
		zHumanMovement=true;
		var r111=true;
		zSetScrollPosition();
		if(typeof updateCountPosition !== "undefined"){
			r111=updateCountPosition();
		}
		for(var i=0;i<zArrScrollFunctions.length;i++){
			var f1=zArrScrollFunctions[i];
			if(typeof f1==="object"){
				if(typeof f1.arguments === "undefined" || f1.arguments.length === 0){
					f1.functionName();
				}else if(f1.arguments.length === 1){
					f1.functionName(f1.arguments[0]);
				}else if(f1.arguments.length === 2){
					f1.functionName(f1.arguments[0], f1.arguments[1]);
				}else if(f1.arguments.length === 3){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2]);
				}else if(f1.arguments.length === 4){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2], f1.arguments[3]);
				}
			}else{
				f1();
			}
				
		}
		return r111;
	} 
	if(typeof window.onscroll === "function"){
		var zMLSonScrollBackup=window.onscroll;
	}else{
		var zMLSonScrollBackup=function(){};
	}
	$(window).bind("scroll", function(ev){
		zMLSonScrollBackup(ev);
		return zWindowOnScroll(ev);

	});
	if(typeof window.onmousewheel === "function"){
		var zMLSonScrollBackup2=window.onmousewheel;
	}else{
		var zMLSonScrollBackup2=function(){};
	} 
	$(window).bind("mousewheel", function(ev){
		zMLSonScrollBackup2(ev);
		return zWindowOnScroll(ev);

	});

	function zWindowOnResize(){
		var windowSizeBackup=zWindowSize;
		zGetClientWindowSize();
		if(typeof windowSizeBackup === "function" && windowSizeBackup.width === zWindowSize.width && windowSizeBackup.height === zWindowSize.height){
			return;	
		}
		if(typeof updateCountPosition !== "undefined"){
			updateCountPosition();
		}
		for(var i=0;i<zArrResizeFunctions.length;i++){
			var f1=zArrResizeFunctions[i];
			if(typeof f1==="object"){
				if(typeof f1.arguments === "undefined" || f1.arguments.length === 0){
					f1.functionName();
				}else if(f1.arguments.length === 1){
					f1.functionName(f1.arguments[0]);
				}else if(f1.arguments.length === 2){
					f1.functionName(f1.arguments[0], f1.arguments[1]);
				}else if(f1.arguments.length === 3){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2]);
				}else if(f1.arguments.length === 4){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2], f1.arguments[3]);
				}
			}else{
				f1();
			}
		}
	}

	if(typeof window.onresize === "function"){
		var zMLSonResizeBackup=window.onresize;
	}else{
		var zMLSonResizeBackup=function(){};
	}
	$(window).bind("resize", function(ev){
		zMLSonResizeBackup(ev);
		return zWindowOnResize(ev);

	});
	$(window).bind("clientresize", function(ev){
		zMLSonResizeBackup(ev);
		return zWindowOnResize(ev);

	});
	function zLoadAllLoadFunctions(){
		zFunctionLoadStarted=true;
		for(var i=0;i<zArrLoadFunctions.length;i++){
			var f1=zArrLoadFunctions[i];
			if(typeof f1==="object"){
				if(typeof f1.arguments === "undefined" || f1.arguments.length === 0){
					f1.functionName();
				}else if(f1.arguments.length === 1){
					f1.functionName(f1.arguments[0]);
				}else if(f1.arguments.length === 2){
					f1.functionName(f1.arguments[0], f1.arguments[1]);
				}else if(f1.arguments.length === 3){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2]);
				}else if(f1.arguments.length === 4){
					f1.functionName(f1.arguments[0], f1.arguments[1], f1.arguments[2], f1.arguments[3]);
				}
			}else{
				f1();
			}
		}
		zFunctionLoadStarted=false;
		
	}

	function zWindowOnLoad(){
		if(zWindowIsLoaded) return;
		zWindowIsLoaded=true; 
		zSetScrollPosition();
		zGetClientWindowSize();
		if(typeof window.zCloseModal !== "undefined" || typeof window.parent.zCloseModal !== "undefined"){ 
			var d1=document.getElementById("js3811");
			if(d1){
				d1.value="j219";
			}	
		}
		
		zLoadAllLoadFunctions();
		if(zPositionObjSubtractId!==false){
			var d1=document.getElementById(zPositionObjSubtractId);
			zPositionObjSubtractPos=zFindPosition(d1);
		}
		zWindowIsLoaded=true; 
		if(typeof updateCountPosition !== "undefined"){
			updateCountPosition();
		}
	}
	if(typeof window.onload === "function"){
		var zMLSonloadBackup=window.onload;
	}else{
		var zMLSonloadBackup=function(){};
	}
	$(window).bind("onload", function(ev){
		zMLSonloadBackup(ev);
		zWindowOnLoad(ev);

	});
	zArrDeferredFunctions.push(function(){
		zWindowOnResize();
	});
	window.zJetendoLoaded=zJetendoLoaded;
	window.zLoadMapFunctions=zLoadMapFunctions;
	window.zSetScrollPosition=zSetScrollPosition;
	window.getWindowSize=getWindowSize;
	window.zLoadAllLoadFunctions=zLoadAllLoadFunctions;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/flash-functions.js */

(function($, window, document, undefined){
	"use strict";
	/*Author: Karina Steffens, www.neo-archaic.net*/
	function zswfr(s,s1,s2){
		var t1pos=s.indexOf(s1);
		if(t1pos !== -1){
			var t1s=s.substr(0,t1pos);
			var t1e=s.substr(t1pos+s1.length,s.length-(t1pos+s1.length));
			return t1s+s2+t1e;
		}else{
			return s;
		}
	}
	function zswf(v){
		v=zswfr(v,'zswf="off"','zswf="off" style="display:block;"');
		document.write(v);
	};
	function zswf2(){
		var is_webkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
		var ie=(document.defaultCharset&&document.getElementById&&!window.home);
		if(ie && !is_webkit){
			$("body").append('<style type="text/css" id="hideObject">object{display:none;}</style>');
		}
		if(!document.getElementsByTagName){
			return;
		}
		var x=[];
		var s=document.getElementsByTagName('object');
		for(var i=0;i<s.length;i++){
			var o=s[i];var h=o.outerHTML;
			if(h && h.indexOf('zswf="off"')!==-1){
				continue;
			}
			var params="";
			var q=true;
			for (var j=0;j<o.childNodes.length;j++){
				var p=o.childNodes[j];
				if(p.tagName==="PARAM"){
					if(p.name==="flashVersion"){
						q=zswfd(p.value);
						if(!q){
							o.id=(o.id==="")?("stripFlash"+i):o.id;x.push(o.id);break;
						}
					}
					params+=p.outerHTML;
				}
			}
			if(!q)continue;
			if(!ie)continue;
			if(o.className.toLowerCase().indexOf("noswap")!==-1)continue;
			var t=h.split(">")[0]+">";
			var j=t+params+o.innerHTML+"</OBJECT>";
			o.outerHTML=j;
		}
		if(x.length)stripFlash(x);
		if(ie && !is_webkit)var x2=document.getElementById("hideObject"); if(x2){ x2.disabled=true;}
	}
	function zswfd(v){
		if(navigator.plugins&&navigator.plugins.length){
			var plugin=navigator.plugins["Shockwave Flash"];
			if(plugin==="undefined")return false;
			var ver=navigator.plugins["Shockwave Flash"].description.split(" ")[2];
			return (Number(ver)>=Number(v));
		}else if(ie&&typeof(ActiveXObject)==="function"){
			try{
				var flash=new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+v);
				return true;
			}catch(e){
				return false;
			}
		}
		return true;
	}
	function zswfs(x){
		if(!document.createElement)return;
		for(var i=0;i<x.length;i++){
			var o=document.getElementById(x[i]);
			var n=o.innerHTML;n=n.replace(/<!--\s/g,"");
			n=n.replace(/\s-->/g,"");
			n=n.replace(/<embed/gi,"<span");
			var d=document.createElement("div");
			d.innerHTML=n;
			d.className=o.className;
			d.id=o.id;
			o.parentNode.replaceChild(d,o);
		}
	}

	zArrDeferredFunctions.push(function(){
		zswf2();
	});
	window.zswf=zswf;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/form-functions.js */

var zSiteOptionGroupLastFormID="";
var zAjaxSortURLCache=[];
var zCacheSliderValues=[];
var selIndex=0;
var zAjaxData=[];
var zAjaxCounter=0;
var zAjaxLastRequestId=false;
var zAjaxLastFormName="";
var zAjaxOnLoadCallback=function(){};
var zAjaxOnErrorCallback=function(){};
var zAjaxLastOnErrorCallback=function(){};
var zInputSlideOldValue="";
var zArrSetSliderInputArray=[];
var zArrSetSliderInputUniqueArray=[];
var zExpOptionLabelHTML=[];
var zAjaxLastOnLoadCallback=false;
var zMotiontimerlen = 10;
var zMotionslideAniLen = 150;
var zMotiontimerID = new Array();
var zMotionstartTime = new Array();
var zMotionobj = new Array();
var zMotionendHeight = new Array();
var zMotionmoving = new Array();
var zMotiondir = new Array();
var zMotionLabel=new Array();
var zMotionHOC=new Array();
var zMotionObjClicked="";
var zFormOnEnterValues=new Array();
var zInputBoxLinkValues=[];
/*var zLastAjaxTableId="";
var zLastAjaxURL="";
var zLastAjaxVarName=""; */

(function($, window, document, undefined){
	"use strict";
 
	$.fn.filterByText = function(textbox, selectSingleMatch) {
		return this.each(function() {
			var select = this;
			var options = [];
			$(select).find('option').each(function() {
				options.push({value: $(this).val(), text: $(this).text()});
			});
			$(select).data('options', options);

			$(textbox).bind('change keyup', function() {
				var options = $(select).empty().data('options');
				var search = $.trim($(this).val());
				var regex = new RegExp(search,"gi");

				$.each(options, function(i) {
					var option = options[i];
					if(option.text.match(regex) !== null) {
						$(select).append(
							$('<option>').text(option.text).val(option.value)
						);
					}
				});
				if (typeof selectSingleMatch != "undefined" && selectSingleMatch === true && $(select).children().length === 1) {
					$(select).children().get(0).selected = true;
				}
			});
		});
	}; 
	function zUpdateImageLibraryCount(){
		var d=document.getElementById("sortable");

		$(window.parent.zImageCountObj).html($("li", d).length+" images in library");
		//$("#imageLibraryDivCount", window.parent.document).html($("li", d).length+" images in library");
	}
	function ajaxSaveSorting(){
		var arrId=$( "#sortable" ).sortable("toArray");
		for(var i=0;i<arrId.length;i++){
			arrId[i]=arrId[i].substr(5);
		}
		var link="/z/_com/app/image-library?method=saveSortingPositions&image_library_id="+currentImageLibraryId+"&image_id_list="+arrId.join(",");
		$.get(link, "",     function(data) { 
			if(debugImageLibrary){
				document.getElementById("forimagedata").value+="\n\nAJAX RESULT:\n"+data+"\n"; 
			}
			zUpdateImageLibraryCount();
		}, "html");  

		if(debugImageLibrary) document.getElementById("forimagedata").value+="ajaxSaveSorting(): array of image_id:\n"+arrId+"\nLINK:"+link;
	}
	function ajaxSaveImage(id){
		if(debugImageLibrary) document.getElementById("forimagedata").value+="ajaxSaveImage(): image_id:"+id+"\n";
		var link="/z/_com/app/image-library?method=saveImageId&action=update&image_library_id="+currentImageLibraryId+"&image_id="+id+"&image_caption="+escape(document.getElementById('caption'+id).value);
		if(debugImageLibrary) document.getElementById("forimagedata").value+="\n\n"+link+"\n\n";
		$.get(link, "",     function(data) { 
			if(debugImageLibrary){
				document.getElementById("forimagedata").value+="\n\nAJAX SAVE IMAGE RESULT:\n"+data+"\n"; 
			}
			zUpdateImageLibraryCount();
		},     "html");  
	}

	function toggleImageCaptionUpdate(id,state,skipUpdate){
		var d=document.getElementById(id);
		var ajaxCall=false;
		if(d.style.display==="block" && state ==="none"){
			ajaxCall=true;	
		}
		var image_id=id.substr("imagecaptionupdate".length);
		d.style.display=state; 
		if(ajaxCall && typeof arrImageLibraryCaptions[image_id] !== "undefined" && arrImageLibraryCaptions[image_id] !== document.getElementById("caption"+image_id).value){
			ajaxSaveImage(image_id);
			arrImageLibraryCaptions[image_id]=document.getElementById("caption"+image_id).value;
		}
	}
	function confirmDeleteImageId(id){
		if(window.confirm("Are you sure you want to PERMANENTLY DELETE this image?")){
			deleteImageId(id);	
		}
	}
	function deleteImageId(id){
		var d = document.getElementById('sortable');
		var olddiv = document.getElementById("image"+id);
		d.removeChild(olddiv);
		var link="/z/_com/app/image-library?method=remoteDeleteImageId&image_id="+id;
		if(debugImageLibrary) document.getElementById("forimagedata").value+="\nDelete Image ID:"+id+"\n\n"+link+"\n\n";
		$.get(link, "",     function(data) { 
			if(debugImageLibrary){
				document.getElementById("forimagedata").value+="\n\nAJAX DELETE IMAGE RESULT:\n"+data+"\n"; 
			}
			zUpdateImageLibraryCount();
		},     "html"); 
		ajaxSaveSorting();
	}
	function setUploadField(){
		var hasFlash = false;
		return;
		/*try {
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if(fo) hasFlash = true;
		}catch(e){
			if(navigator.mimeTypes ["application/x-shockwave-flash"] !== "undefined") hasFlash = true;
		}
		var d = document.getElementById("imagefiles");
		// temporarily disable html 5 multiple file upload until cfml server has fixed the bug with it.
		if(1===0){// typeof d.multiple === "boolean" || !hasFlash){
			document.getElementById("flashFileUpload").style.display="none";
		}else{
			document.getElementById("htmlFileUpload").style.display="none";
			document.getElementById("flashFileUpload").style.display="block";
		}*/
	}
	function zOptionGroupAutoMap(){
		var matchCount=0;
		$("#optionGroupMapForm .fieldLabelDiv").each(function(){
			var id=$(this).attr("data-id");
			var text=this.innerHTML.toLowerCase();
			text=text.replace(/ /, "_");

			var matched=false;
			var s=document.getElementById("mapField"+id);
			if(s.selectedIndex != 0){
				return;
			}
			var custom=0;
			for(var i=0;i<s.options.length;i++){
				if(s.options[i].value == 'inquiries_custom_json'){
					custom=i;
					break;
				}
			}
			for(var i=0;i<s.options.length;i++){
				var v=s.options[i].value.replace(/inquiries_/, '');
				if(v==text){
					//console.log('Matched: '+v);
					s.selectedIndex=i;
					matched=true;
						matchCount++;
					break;
				}
			}
			if(!matched){
				for(var i=0;i<s.options.length;i++){
					var v=s.options[i].value.replace(/inquiries_/, '');
					if(v.indexOf(text) != -1){
						//console.log('Partial match: '+v);
						s.selectedIndex=i;
						matched=true;
						matchCount++;
						break;
					}
				}
			}
			if(!matched){
				//console.log('no match found for '+text, 'should be custom_json now.');
				s.selectedIndex=custom;
			}
		});
		return matchCount;
	}
	 
	$(".zOptionGroupAutoMap").bind("click", function(){
		var matchCount=zOptionGroupAutoMap();
		alert(matchCount+" fields were automatically mapped.");
	}); 

	function zOptionGroupErrorCallback(){
		alert("There was a problem with the submission. Please try again later.");
		$(".zOptionGroupSubmitButton", $("#"+zOptionGroupLastFormID)).show();
		$(".zOptionGroupWaitDiv", $("#"+zOptionGroupLastFormID)).hide();
	}
	function zOptionGroupCallback(d){
		var rs=eval("("+d+")");
		$(".zOptionGroupSubmitButton", $("#"+zOptionGroupLastFormID)).show();
		$(".zOptionGroupWaitDiv", $("#"+zOptionGroupLastFormID)).hide();
		if(zOptionGroupLastFormID != ""){
			$("#"+zOptionGroupLastFormID+" input, #"+zOptionGroupLastFormID+" textarea, #"+zOptionGroupLastFormID+" select").bind("change", function(){
				if(zGetFormFieldDataById(this.id) != ""){
					$(this).closest("tr").removeClass("zFieldError");
				}
			}).bind("keyup", function(){
				if(zGetFormFieldDataById(this.id) != ""){
					$(this).closest("tr").removeClass("zFieldError");
				}
			}).bind("paste", function(){
				if(zGetFormFieldDataById(this.id) != ""){
					$(this).closest("tr").removeClass("zFieldError");
				}
			});
			zJumpToId(zOptionGroupLastFormID, -50);
		}
		if(rs.success){
			var link=$("#"+zOptionGroupLastFormID).attr("data-thank-you-url");
			if(link != ""){
				window.location.href=link;
			}else{
				alert("Your submission was received.");
			}
		}else{
			for(var i=0;i<rs.arrErrorField.length;i++){
				$("#"+rs.arrErrorField[i]).closest("tr").addClass("zFieldError");
			}
			alert("Please correct the following errors and submit the form again\n"+rs.errorMessage);
		}
	}
	function zOptionGroupPostForm(formId){
		zOptionGroupLastFormID=formId;
		$(".zOptionGroupSubmitButton", $("#"+zOptionGroupLastFormID)).hide();
		$(".zOptionGroupWaitDiv", $("#"+zOptionGroupLastFormID)).show();
		var postObj=zGetFormDataByFormId(formId);
		var obj={
			id:"ajaxOptionGroup",
			method:"post",
			postObj:postObj,
			ignoreOldRequests:false,
			callback:zOptionGroupCallback,
			errorCallback:zOptionGroupErrorCallback,
			url:'/z/misc/display-site-option-group/ajaxInsert'
		}; 
		zAjax(obj);
	}
	/*
	function zSetupAjaxTableSortAgain(){
		if(zLastAjaxTableId !=""){
			//zSetupAjaxTableSort(zLastAjaxTableId, zLastAjaxURL, zLastAjaxVarName);
		}
	}*/
	function zSetupAjaxTableSort(tableId, ajaxURL, ajaxVarName, ajaxVarNameOriginal, ajaxCallback){
		/*zLastAjaxTableId=tableId;
		zLastAjaxURL=ajaxURL;
		zLastAjaxVarName=ajaxVarName;*/

		var validated=true;
		var arrError=[];
		zAjaxSortURLCache[tableId]={
			url:ajaxURL
			/*,
			cache:$("#"+tableId).html()*/
		};
		if($( '#'+tableId).length == 0){
			validated=false; 
			return;
		}
		if($( '#'+tableId+' thead' ).length == 0){
			validated=false;
			arrError.push('queueSortCom.ajaxTableId is set to "'+tableId+'", but this table is missing the <thead> tag around the header rows, which is required for table row sorting to function.');
		}
		if($( '#'+tableId+' tbody' ).length == 0){
			validated=false;
			arrError.push('queueSortCom.ajaxTableId is set to "'+tableId+'", but this table is missing the <tbody> tag around the body rows, which is required for table row sorting to function.');
		}
		var arrSort=[];
		$( '#'+tableId+' tbody tr' ).each(function(){
			if(this.id == '' || ($("."+tableId+"_handle", this).length && $("."+tableId+"_handle", this)[0].getAttribute('data-ztable-sort-primary-key-id') == '')){
				validated=false;
			}else{
				if($("."+tableId+"_handle", this).length){
					arrSort.push($("."+tableId+"_handle", this)[0].getAttribute('data-ztable-sort-primary-key-id'));
				}
			}
		}); 
		var originalSortOrderList=arrSort.join("|");
		$("#"+tableId+" tbody").attr("data-original-sort", originalSortOrderList);
		if(validated){
			$('#'+tableId+' tbody' ).sortable({
				handle: '.'+tableId+'_handle',
				stop:function(e, e2){
					var originalSortOrderList=$("#"+tableId+" tbody").attr("data-original-sort");
					var arrId=$("#"+tableId+" tbody").sortable("toArray");
					var arrId2=[]; 
					for(var i=0;i<arrId.length;i++){
						var v=$("#"+arrId[i]+" ."+tableId+"_handle").attr("data-ztable-sort-primary-key-id"); 
						arrId2.push(v); 
					} 
					var sortOrderList=arrId2.join("|");
					//console.log("sorted list:"+sortOrderList);
					var tempObj={};
					tempObj.id="zAjaxChangeSortOrder";
					tempObj.url=zAjaxSortURLCache[tableId].url;
					tempObj.method="post";
					tempObj.postObj={};
					tempObj.postObj[ajaxVarName]=sortOrderList;
					tempObj.postObj[ajaxVarNameOriginal]=originalSortOrderList; 
					tempObj.callback=function(r){
						var d=eval('('+r+')');
						if(!d.success){
							//$("#"+tableId).html(zAjaxSortURLCache[tableId].cache);
							alert(d.errorMessage);
						}else{
							zAjaxSortURLCache[tableId].cache=$("#"+tableId).html();

							arrSort=[];
							$( '#'+tableId+' tbody tr' ).each(function(){
								if(this.id == '' || ($("."+tableId+"_handle", this).length && $("."+tableId+"_handle", this)[0].getAttribute('data-ztable-sort-primary-key-id') == '')){
									validated=false;
								}else{
									arrSort.push($("."+tableId+"_handle", this)[0].getAttribute('data-ztable-sort-primary-key-id'));
								}
							}); 
							originalSortOrderList=arrSort.join("|");
							$("#"+tableId+" tbody").attr("data-original-sort", originalSortOrderList); 
							ajaxCallback(tempObj); 

							
						}
					};
					tempObj.errorCallback=function(){
						//$("#"+tableId).html(zAjaxSortURLCache[tableId].cache);
						alert("Failed to sort records.");
					};
					tempObj.cache=false; 
					tempObj.ignoreOldRequests=false;
					zAjax(tempObj);
				}
			});
		}else{
			arrError.push('Each <tr> row must have a unique id attribute and a data-ztable-sort-primary-key-id attribute with the value set to the primary key id for the current record.');
		}
		if(arrError.length){
			alert(arrError.join("\n"));
		}
	}

	function zGetSelectValues(select) {
		var result = [];
		var options = select && select.options;
		var opt;
		var hasValue=false;
		
		if(options.length >=2){
			if(options[0].value != "" || options[1].value != ""){
				hasValue=true;
			}
		}
		for (var i=0, iLen=options.length; i<iLen; i++) {
			opt = options[i];

			if (opt.selected) {
				if(hasValue){
					result.push(opt.value);
				}else{
					result.push(opt.text);
				}
			}
		}
		return result;
	}

	function zGetFormDataByFormId(formId){
		var obj={};
		$("input, textarea, select", $("#"+formId)).each(function(e, e2){ 
			if(typeof obj[this.name] === 'undefined'){
				if(this.type === 'checkbox' || this.type === 'radio'){
					if(this.checked){
						obj[this.name]=this.value;
					}
				}else if(this.type.substr(0, 6) === 'select'){
					obj[this.name]=zGetSelectValues(this).join(","); 
				}else{
					obj[this.name]=this.value;
				}
			}else{
				if(this.type === 'checkbox' || this.type === 'radio'){
					if(this.checked){
						obj[this.name]+=","+this.value;
					}
				}else if(this.type.substr(0, 6) === 'select'){
					obj[this.name]+=","+zGetSelectValues(this).join(","); 
				}else{
					obj[this.name]+=","+this.value;
				} 
			}
		});
		return obj;
	} 
	function zGetFormFieldDataById(id){
		var field=$("#"+id);
		if(field.length){
			var f=field[0];
			if(this.type === 'checkbox' || this.type === 'radio'){
				if(this.checked){
					return this.value;
				}
			}else if(this.type.substr(0, 6) === 'select'){
				return zGetSelectValues(this).join(","); 
			}else{
				return this.value;
			}
			return ""; 
		}else{
			return "";
		}
	}
	function zDisableEnter(e){
		var key;
	     if(window.event) key = window.event.keyCode;     //IE
	     else key = e.which;     //firefox
	     if(key === 13 || key === 40 || key ===38){
	          return false;
		 }else{
	          return true;
		 }
	}

	function zKeyboardEvent(e, obj,obj2,forceEnter){
		var keynum;
		if(e===null) return;
		var numcheck;
		if(!selIndex){
			selIndex=0;
		}
		if(window.event){
			keynum = e.keyCode;
		}else{
			keynum = e.which;
		}
		if(obj.value.length > 2){	
			var doc = document.getElementById("zTOB");
			//var allLinks = doc.getElementsByTagName('a');
			//arrNewLink
			if(keynum === 13 || forceEnter === true){
				// enter
				if(obj.value === "") return;
				if(doc.style.display==="block"){
					var textToForm = document.getElementById("lid"+arrNewLink[selIndex]).innerHTML;
					var textValue=textToForm;
					for(var i=0;i<zArrCityLookup.length;i++){
						var arrJ=zArrCityLookup[i].split("\t");
						if(arrJ[0]===textToForm){
							textValue=arrJ[1];
							break;
						}
					}
					obj.value=textToForm;
					obj2.value=textValue;
					//zInputPutIntoForm(textToForm,textValue, formName,obj2.id,false);
					zInputHideDiv(formName);
				}else{
					obj2.value=obj.value;
				}
				selIndex=-1;
			}else if(keynum === 40){
				//down
				selIndex++;
				selIndex=Math.min(selIndex,arrNewLink.length-1);
			}else if(keynum===38){
				// up	
				selIndex--;
				selIndex=Math.max(0,selIndex);
			}else{
				if(doc.style.display!=="block"){
					obj2.value=obj.value;
					selIndex=-1;
				}
				return;	
			}
			var firstBlock=-1;
			var matched=false;
			for(i=0;i<arrNewLink.length;i++){
				var c=document.getElementById('lid'+arrNewLink[i]);
				/*if(firstBlock==-1 && c.style.display=="block"){
				//	firstBlock=i;	
				}
				if(c.style.display=="none"){
				//	selIndex++;	
				}*/
				if(i===selIndex){
					matched=true;
					c.className="zTOB-selected";
					// set new value here
					var textToForm = c.innerHTML;
					var textValue=textToForm;
					for(var n=0;n<zArrCityLookup.length;n++){
						var arrJ=zArrCityLookup[n].split("\t");
						if(arrJ[0]===textToForm){
							textValue=arrJ[1];
							break;
						}
					}
					obj.value=textToForm;
					obj2.value=textValue;
				}else{
					c.className="zTOB-link";
				}
			}
		}
	}	


	function zInputHideDiv(name){
		var z=document.getElementById("zTOB");
		if(z!==null){z.style.display="none";}
	}

	function zFormOnKeyUp(formName, fieldIndex){
		var f=zFormData[formName].arrFields[fieldIndex];
		var o=document.getElementById(f.id);
		if(zFormData[formName].error){
			zFormSubmit(formName,true,false);
		}
		
	}
	function zFormOnChange(formName, fieldIndex){
		var f=zFormData[formName].arrFields[fieldIndex];
		var o=document.getElementById(f.id);
		if(zFormData[formName].error){
			zFormSubmit(formName,true,false);
		}
		if(typeof zFormData[formName].onChangeCallback === "undefined") return;
		zFormData[formName].onChangeCallback(formName);
	}
	function zFormSetError(id,error){
		var tr=document.getElementById(id+'_container');
		if(tr !== null){
			if(error){
				tr.className="tr_error";
			}else{
				tr.className="";
			}
		}
	}

	/*
	var tempObj={};
	tempObj.id="zMapListing";
	tempObj.url="/urlInQuotes.html";
	tempObj.callback=functionNameNoQuotes;
	tempObj.errorCallback=functionNameNoQuotes;
	tempObj.cache=false; // set to true to disable ajax request when already downloaded same URL
	tempObj.ignoreOldRequests=true; // causes only the most recent request to have its callback function called.
	zAjax(tempObj);
	*/
	function zAjax(obj){
		var req = null;  
		if(window.XMLHttpRequest){ 
		  req = new XMLHttpRequest();  
		}else if (window.ActiveXObject){ 
		  req = new ActiveXObject('Microsoft.XMLHTTP');  
		}
		if(typeof zAjaxData[obj.id]==="undefined"){
			zAjaxData[obj.id]=new Object();
			zAjaxData[obj.id].requestCount=0;
			zAjaxData[obj.id].requestEndCount=0;
			zAjaxData[obj.id].cacheData=[];
		}
		if(typeof obj.postObj === "undefined"){
			obj.postObj={};	
		}
		var postData="";
		for(var i in obj.postObj){
			postData+=i+"="+encodeURIComponent(obj.postObj[i])+"&";
		}
		if(typeof obj.cache==="undefined"){
			obj.cache=false;	
		}
		if(typeof obj.method==="undefined"){
			obj.method="get";	
		}
		if(typeof obj.debug==="undefined"){
			obj.debug=false;	
		}
		if(typeof obj.errorCallback==="undefined"){
			obj.errorCallback=function(){};	
		}
		if(typeof obj.ignoreOldRequests==="undefined"){
			obj.ignoreOldRequests=false;	
		}
		if(typeof obj.url==="undefined" || typeof obj.callback==="undefined"){
			alert('zAjax() Error: obj.url and obj.callback are required');	
		}
		
		zAjaxData[obj.id].requestCount++;
		zAjaxData[obj.id].cache=obj.cache;
		zAjaxData[obj.id].debug=obj.debug;
		zAjaxData[obj.id].method=obj.method;
		zAjaxData[obj.id].url=obj.url;
		zAjaxData[obj.id].ignoreOldRequests=obj.ignoreOldRequests;
		zAjaxData[obj.id].callback=obj.callback;
		zAjaxData[obj.id].errorCallback=obj.errorCallback;
		if(zAjaxData[obj.id].cache && zAjaxData[obj.id].cacheData[obj.url] && zAjaxData[obj.id].cacheData[obj.url].success){
			zAjaxData[obj.id].callback(zAjaxData[obj.id].cacheData[obj.url].responseText);
		}
		req.onreadystatechange = function(){  
			if(req.readyState === 4 || req.readyState === "complete" || (zMSIEBrowser!==-1 && zMSIEVersion<=7 && this.readyState==="loaded")){
				var id=req.getResponseHeader("x_ajax_id");
				if(typeof id !== "undefined" && new String(id).indexOf(",") !== -1){
					id=id.split(",")[0];
				}
				if(req.status!==200 && req.status!==301 && req.status!==302){
					if(id===null || id===""){
						if(zAjaxLastRequestId !== false){
							id=zAjaxLastRequestId;
							zAjaxData[id].errorCallback(req);
						}else{
							alert("Sorry, but that page failed to load right now, please refresh your browser or come back later.");
						//document.write(req.responseText);
						}
					}else{
						if(zAjaxData[id].debug){
							document.write('AJAX SERVER ERROR - (Click back and refresh to continue):<br />'+req.responseText);
						}else{
							zAjaxData[id].errorCallback(req);
						}
					}
					//return;
				}else if(id===null || id===""){
					if(!zIsDeveloper()){
						alert("Invalid response.  You may need to login again or refresh the page.");
					}else{
						alert("zAjax() Error: The following ajax URL MUST output the x_ajax_id as an http header.\n"+zAjaxData[obj.id].url);	
					}
					return;
				}
				if(typeof zAjaxData[id] !== "undefined"){
					zAjaxData[id].requestEndCount++;
					if(!zAjaxData[id].ignoreOldRequests || zAjaxData[id].requestCount === zAjaxData[id].requestEndCount){
						if(req.status === 200 || req.status===301 || req.status===302){
							if(zAjaxData[id].cache){
								zAjaxData[id].cacheData[zAjaxData[id].url]=new Object();
								zAjaxData[id].cacheData[zAjaxData[id].url].responseText=req.responseText.trim();
								zAjaxData[id].cacheData[zAjaxData[id].url].success=true;
							}
							zAjaxData[id].callback(req.responseText.trim());
						/*}else{ 
							if(zAjaxData[id].debug){
								document.write('AJAX SERVER ERROR - (Click back and refresh to continue):<br />'+req.responseText);
							}else{
								zAjaxData[id].errorCallback(req);
							}
							zAjaxLastRequestId=false;*/
						}
					}
				}
				zAjaxLastRequestId=false;
			} 
		};
		var randomNumber = Math.random()*1000;
		var derrUrl="&zFPE=1";
		if(zAjaxData[obj.id].debug){
			derrUrl="";
		}
		zAjaxLastRequestId=obj.id;
		var action=zAjaxData[obj.id].url;
		/*if(action.indexOf("x_ajax_id=") !== -1){
			alert("zAjax() Error: Invalid URL.  \"x_ajax_id\" can only be added by the system.\nDo not put this CGI variable in the action URL.");
		}*/
		if(action.indexOf("?") === -1){
			action+='?'+derrUrl+'&ztmp='+randomNumber;
		}else{
			action+='&'+derrUrl+'&ztmp='+randomNumber;
		}
		action+="&x_ajax_id="+escape(obj.id);
		if(zAjaxData[obj.id].method.toLowerCase() === "get"){
			req.open(zAjaxData[obj.id].method,action,true);
			//req.setRequestHeader("Accept-Encoding","gzip,deflate;q=0.5");
			//req.setRequestHeader("TE","gzip,deflate;q=0.5");
			req.send("");  
		}else if(zAjaxData[obj.id].method.toLowerCase() === "post"){
			//alert('not implemented - use zForm() instead');
			req.open(zAjaxData[obj.id].method,action,true);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			req.send(postData);  
		}
	}

	
	function zFormSubmit(formName,validationOnly,onChange,debug, returnObject){	
		// validation for all fields...
		if(typeof zFormData[formName] === "undefined" || typeof zFormData[formName].arrFields === "undefined"){
			return;
		}
		if((validationOnly===null || !validationOnly) && onChange===false){
			if(zFormData[formName].submitContainer !== ""){
				var sc=document.getElementById(zFormData[formName].submitContainer);
				if(sc !== null){
					zFormData[formName].submitContainerBackup=sc.innerHTML;
					sc.innerHTML="Please wait...";
				}
			}
		}
		//addHistoryEvent();
		var arrQuery=new Array();
		var error=false;
		var anyError=false;
		var arrError=new Array();
		var obj=new Object();
		for(var i=0;i<zFormData[formName].arrFields.length;i++){
			error=false;
			var f=zFormData[formName].arrFields[i];
			if(typeof f === "undefined"){
				continue;
			}
			var value="";
			if(f.type === "file" && zFormData[formName].ajax){
				alert('File upload doesn\'t work with AJAX. Must use iframe and server-side progress bar (php for non-breaking uploads)');
				return false;
			}else if(f.type === "text" || f.type==="file" || f.type==="hidden"){
				var o=document.getElementById(f.id);
				value=o.value;
			}else if(f.type === "select"){
				var o=document.getElementById(f.id);
				if(typeof o.multiple !== "undefined" && o.multiple){
					for(var g=0;g<o.options.length;g++){
						if(o.options[g].selected){
							if(value.length !== 0){
								value+=",";
							}
							value+=o.options[g].value;
						}
					}
				}else{
					if(o.selectedIndex===-1){
						o.selectedIndex=0;
					}
					if(o.options[o.selectedIndex].value !== ""){
						value=o.options[o.selectedIndex].value;
					}
				}
			}else if(f.type === "radio"){
				var o=document.getElementById(f.id);
				var arrF=document[formName][f.id];
				for(var g=0;g<arrF.length;g++){
					if(arrF[g].checked){
						value=arrF[g].value;
					}
				}
			}else if(f.type === "checkbox"){
				var o=document.getElementById(f.id);
				if(o.checked){
					value=o.value;
				}
			}else if(f.type === "zExpandingBox"){
	            arrV=new Array();
	            for(var g=0;g<zExpArrMenuBox.length;g++){
	            	if(zExpArrMenuBox[g]===f.id){
			            var c=document.getElementById('zExpMenuBoxCount'+g).value;
	                    for(var n=0;n<c;n++){
	                    	var cr=document.getElementById('zExpMenuOption'+g+'_'+n);
	                        if(cr.checked){
	                        	arrV.push(cr.value);
	                        }
	                    }
	                }
	            }
	            value=arrV.join(",");
			}
			value=value.replace(/^\s+|\s+$/g,"");
			obj[f.id]=escape(value);
			arrQuery.push(f.id+"="+escape(value));
			if(value===""){
				if(f.allowNull !== null & f.allowNull){
					continue;
				}else if(f.required !== null && f.required){
					arrError.push(f.friendlyName+' is required.');
					zFormSetError(f.id,true);
					error=true;
					anyError=true;
					continue;
				}
			}
			if(f.number !== null & f.number){
				value2 = parseFloat(value);
				if(value !== value2){
					arrError.push(f.friendlyName+' must be a number.');
					zFormSetError(f.id,true);
					error=true;
					anyError=true;
					continue;
				}
			}
			if(f.email !== null & f.email){
				var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				if (!filter.test(value)) {
					arrError.push(f.friendlyName+' must be a well formatted email address, (ex. johndoe@domain.com).');
					zFormSetError(f.id,true);
					error=true;
					anyError=true;
					continue;
				}
			}
			zFormSetError(f.id,false);
		}
		if(typeof returnObject !== "undefined" && returnObject){
			return obj;	
		}
		var queryString=arrQuery.join("&");
		var fm=document.getElementById("zFormMessage_"+formName);
		if(anyError){
			fm.innerHTML='<table style="width:100%;border-spacing:5px;"><tr><th>Please correct your entry and try again.</th></tr><tr><td>'+arrError.join("</td></tr><tr><td>")+'</td></tr></table>';
			fm.style.display="block";
			zFormData[formName].error=true;
		}else{
			zFormData[formName].error=false;
			fm.style.display="none";
		}
		if(validationOnly!==null && validationOnly){
			return false;
		}
		if(anyError){
			window.location.href='#anchor_'+formName;
			if(zFormData[formName].submitContainer !== ""){
				var sc=document.getElementById(zFormData[formName].submitContainer);
				if(sc !== null){
					sc.innerHTML=zFormData[formName].submitContainerBackup;
				}
			}
			return false;
		}
		// ignore double clicks / incomplete requests.
		if(zFormData[formName].ajax){
			if(zFormData[formName].ignoreOldRequests && zFormData[formName].ajaxStartCount !== zFormData[formName].ajaxEndCount){
				/*if(zFormData[formName].ajaxSuccess){
					// no new data needed
					//alert('already done');
				}*/
			}else{
				var req = null;  
				if(window.XMLHttpRequest){ 
				  req = new XMLHttpRequest();  
				}else if (window.ActiveXObject){ 
				  req = new ActiveXObject('Microsoft.XMLHTTP');  
				}
				zAjaxLastFormName=formName;
				zAjaxLastOnLoadCallback=zFormData[formName].onLoadCallback;
				zAjaxLastOnErrorCallback=zFormData[formName].onErrorCallback;
				//req.formName=formName;
				//req.onLoadCallback=zFormData[formName].onLoadCallback;
				//req.onErrorCallback=zFormData[formName].onErrorCallback;
				req.onreadystatechange = function(){  
					if(req.readyState === 4 || req.readyState === "complete" || (zMSIEBrowser!==-1 && zMSIEVersion<=7 && this.readyState==="loaded")){
						//alert(req.status+":complete"+req.responseText);
						if(typeof zFormData[zAjaxLastFormName] !== "undefined"){
							zFormData[zAjaxLastFormName].ajaxEndCount++;
							if(req.status === 200){
								zAjaxLastOnLoadCallback(req.responseText);
								//zFormData[zAjaxLastFormName].onLoadCallback(req.responseText);
								zFormData[zAjaxLastFormName].ajaxSuccess=true;
								if(zFormData[zAjaxLastFormName].successMessage !== false){
									var fm=document.getElementById("zFormMessage_"+zAjaxLastFormName);
									fm.style.display="block";
									fm.innerHTML='<div class="successBox">Form submitted successfully.<br />'+req.responseText+'</div>';
								}
							}else{ 
								zFormData[zAjaxLastFormName].ajaxStartCount=0;
								zFormData[zAjaxLastFormName].ajaxEndCount=0;
								zFormData[zAjaxLastFormName].ajaxSuccess = false;
								if(zFormData[zAjaxLastFormName].debug){
									document.write('AJAX SERVER ERROR - (Click back and refresh to continue):<br />'+req.responseText);
									//zAjaxLastOnLoadCallback(req.responseText);
								}else{
									zAjaxLastOnErrorCallback(req.status+": The server failed to process your request.\nPlease try again later.");
								}
							} 
							if(zFormData[zAjaxLastFormName].submitContainerBackup !== null && zFormData[zAjaxLastFormName].submitContainer !== ""){
								var sc=document.getElementById(zFormData[zAjaxLastFormName].submitContainer);
								if(sc !== null){
									sc.innerHTML=zFormData[zAjaxLastFormName].submitContainerBackup;
								}
							}
						}
					} 
				};		
				// reset the ajax request status variables
				zFormData[formName].ajaxSuccess=false;
				zFormData[formName].ajaxStartCount++;
				var randomNumber = Math.random()*1000;
				var action=zFormData[formName].action;
				
				var derrUrl="&zFPE=1";
				if(zFormData[formName].debug){
					derrUrl="";
				}
				if(zFormData[formName].method.toLowerCase() === "get"){
					if(action.indexOf("?") === -1){
						action+='?'+queryString+derrUrl+'&ztmp='+randomNumber;
					}else{
						action+='&'+queryString+derrUrl+'&ztmp='+randomNumber;
					}
					req.open(zFormData[formName].method,action,true);
					//req.setRequestHeader("Accept-Encoding","gzip,deflate;q=0.5");
					//req.setRequestHeader("TE","gzip,deflate;q=0.5");
					req.send("");  
				}else if(zFormData[formName].method.toLowerCase() === "post"){
					if(action.indexOf("?") === -1){
						action+=derrUrl+'&ztmp='+randomNumber;
					}else{
						action+=derrUrl+'&ztmp='+randomNumber;
					}
					queryString=encodeURI(queryString);
					req.open(zFormData[formName].method,action,true);
					// call open before sending headers
					//req.setRequestHeader("Accept-Encoding","gzip,deflate;q=0.5");
					//req.setRequestHeader("TE","gzip,deflate;q=0.5");
					req.setRequestHeader("Content-type", zFormData[formName].contentType);
					//req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					req.send(queryString);  
				}
			}
			return false;
		}else{
			return true;
		}
	}


	function zInputSlideOnChange(oid,v1,v2,zExpValue){
		var d1=document.getElementById(oid);
		if(v1==="") v1="min";
		if(v2==="") v2="max";
		var newValue=v1+"-"+v2;
		if(newValue !== zInputSlideOldValue){
			d1.value=newValue;
			zInputSlideOldValue=newValue;
			if(zExpValue!==null){
				zExpOptionSetValue(zExpValue,newValue);
			}
			d1.onchange();
		}
	}

	function zSetSliderInputArray(id){
		if(typeof zArrSetSliderInputUniqueArray[id] === "undefined"){
			zArrSetSliderInputUniqueArray[id]=true;
			var d1=document.getElementById(id); 
			zArrSetSliderInputArray.push(d1);
		}
	}
	function zSliderInputResize(){
		for(var i=0;i<zArrSetSliderInputArray.length;i++){
			zArrSetSliderInputArray[i].onclick();
			zArrSetSliderInputArray[i].onblur();
		}
	}

	zArrResizeFunctions.push({functionName:zSliderInputResize});

	function zInputSliderSetValue(id, zV, zOff, v, zExpValue, sliderIndex){
		var d1=document.getElementById(id);
		var d2=document.getElementById(id+"_label");
		var f=false; 
		var alphaExp = /[^\+0-9\.]/;
		var v=d2.value;//zValues[zV+2];
		v=new String(v).split(",").join("").split("$").join("");
		if(v.match(alphaExp) && v!=="min" && v!=="max"){
			if(zV+3===zOff){
				v=zValues[zV+5];
			}else{
				v=zValues[zV+4];
			}
			d2.value=v; 
			f=true;
			alert('You may type only numbers 0-9.');
		} 
		if(v==="min" || v==="max"){
			return;
		} 
		var a1=zValues[zV];
		var lastV=a1[0];
		var curV=a1[0];
		var curPosition=0;
		var t1=document.getElementById("zInputSliderBox"+(zV-(sliderIndex-1)));
		var curPos=zGetAbsPosition(t1);
		var curSlider=document.getElementById("zInputDragBox"+sliderIndex+"_"+(zV-(sliderIndex-1)));
		var curValue=d2.value;
		curValue=parseFloat(curValue.split(",").join("").split("$").join(""));
		var found=false;
		for(var i=0;i<a1.length;i++){
			var curA=parseFloat(a1[i].split(",").join("").split("$").join(""));
			if(curValue < curA){
				if(i>0){
					found=true;
					var tempLastV=parseFloat(lastV.split(",").join("").split("$").join(""));
					// somewhere between lastV and curV
					curPosition=(i+((curValue-tempLastV)/(curA-tempLastV)));
				}
				break;
			}
			lastV=a1[i];
		} 
		if(!found){
			curPosition=a1.length;	
		}
		
		d2.value=v;
		v=parseFloat(v); 
		/*if(zV+2===zOff){
			if(parseFloat(zValues[zV+1])>parseFloat(v)){
				v=zValues[zV+2];
				if(d1.value===""){
					if(sliderIndex===2){
						d2.value=zValues[zV+3];
					}else{
						d2.value=zValues[zV+2];
					}
				}else{
					d2.value=d1.value;//zValues[zV+5];
				}
				alert('The first value must be smaller than the second value. Your data has been reset..');
				return;
			}
		}else{
			if(parseFloat(v)>parseFloat(zValues[zV+2])){
				v=zValues[zV+2];
				if(d1.value===""){
					if(sliderIndex===2){
						d2.value=zValues[zV+2];
					}else{
						d2.value=zValues[zV+1];
					}
				}else{
					d2.value=d1.value;//zValues[zV+4];
				}
				alert('The first value must be smaller than the second value. Your data has been reset...');
				return;
			}
		}*/
		// get width of the bar
		var tWidth=curPos.width-20;
		var newSliderPos=Math.round((curPosition/(a1.length))*tWidth);
		if(typeof curSlider != "undefined"){
			if(sliderIndex === 2){
				curSlider.style.marginRight=(tWidth-newSliderPos)+"px";
			}else{
				curSlider.style.marginLeft=newSliderPos+"px";
			}
		}
		d1.value=v;
		zValues[zOff]=v;
		var zOff9=(zV-(sliderIndex-1));
		zInputSlideOnChange('zInputHiddenValues'+(zV-(sliderIndex-1)),zValues[zOff9+2],zValues[zOff9+3],zExpValue);
	}

	function zInputSlideLimit(obj,paramObj,forceOnChange){
		var dd1=document.getElementById(paramObj.valueId);
		var dd2=document.getElementById(paramObj.labelId);
		var firstLoad=false;
		if(zDrag_dragObject===null){
			firstLoad=true;
			if(dd2.value===""){
				if(paramObj.constrainLeft){
					dd2.value="max";
					dd1.value="";
				}else{
					dd2.value="min";
					dd1.value="";
				}
			}
		}
		// if(navigator.userAgent.indexOf("MSIE 6.0") !== -1){ - need to double or halve the value to force this to work on IE 6.
		if(!firstLoad){
			var rightSlider=false;
			if(paramObj.zValue+3===paramObj.zValueValue){
				rightSlider=true;
			}
			var d1=zDrag_getPosition(obj);
			var d2=document.getElementById("zInputSliderBox"+paramObj.zValue);
			var d2pos=zGetAbsPosition(d2);
			var d3=zDrag_getPosition(d2);
			if(paramObj.constrainObj){
				var sw=parseInt(d2pos.width)-parseInt(obj.style.width);
			}else{
				var sw=parseInt(d2pos.width);
			}
			var dw=parseInt(obj.style.width);
			if(navigator.userAgent.indexOf("MSIE 6.0") !== -1){
				dw/=2;
				sw/=2;
			}
			var y=d3.y;
			if(rightSlider){
				var x=parseInt(obj.style.marginRight);
			}else{
				var x=parseInt(obj.style.marginLeft);
			}
			var first=false;
			var last=false;
			if(paramObj.constrainObj){
				var d4=document.getElementById(paramObj.constrainObj);
				d4.style.zIndex=1;
				obj.style.zIndex=3;
				if(rightSlider){
					var dx=sw-(dw+parseInt(d4.style.marginLeft));
				}else{
					var dx=sw-(dw+parseInt(d4.style.marginRight));
				}
				var d5=zDrag_getPosition(d4);
				if(paramObj.constrainLeft){
					if(x>=dx){
						x=dx;
						if(x>=sw-dw){
							first=true;
						}
					}else if(x<=0){
						x=0;
						if(x<=0){
							last=true;
						}
					}
				}else{
					var sw2=dx-0;
					if(x<=0){
						x=0;
						first=true;
					}else if(x>=dx){
						x=dx;
						if(x+dw>=0+sw){
							last=true;
						}
					}
				}
			}else{
				if(x<=0){
					x=0;
					first=true;
				}else if(x+dw>=0+sw){
					x=((0+sw)-dw);
					last=true;
				}
			}
			var percent=0;
			if(paramObj.zValue+3===paramObj.zValueValue){
				obj.style.marginRight=x+"px";
				x=sw-(x+dw);
				percent=Math.max(0,(x)/(sw-dw));
			}else{
				obj.style.marginLeft=x+"px";
				percent=Math.min(1,Math.max(0,(x)/(sw-dw)));
			}
			var arrLabel=zValues[paramObj.zValue];
			var arrValue=zValues[paramObj.zValue+1];
			var offset=Math.min(arrLabel.length-1,Math.round(percent*(arrLabel.length-0.5)));
			if(first){
				dd1.value="";
				dd2.value="min";
			}else if(last){
				dd1.value="";
				dd2.value="max";
			}else{
				dd1.value=arrValue[offset];
				dd2.value=arrLabel[offset];
			}
			zValues[paramObj.zValueLabel]=dd2.value;
			zValues[paramObj.zValueValue]=dd1.value;
		}
		if(forceOnChange!==null && forceOnChange){
			zInputSlideOnChange('zInputHiddenValues'+paramObj.zValue,zValues[paramObj.zValue+2],zValues[paramObj.zValue+3],paramObj.zExpOptionValue);
		}
	}

	function zExpOptionSetValue(i,v,h){
		var d1=document.getElementById('zExpOption'+i+'_button');
		if(h===null || typeof h == "undefined") h="none"; 
		if(d1!==null) d1.innerHTML=zExpOptionLabelHTML[i]+" <span id=\"zExpOption"+i+"_value\" style=\"display:"+h+";\">"+zStringReplaceAll(v,",",", ")+"</span>";
	}

	function zCheckboxOnChange(obj,zv){
		var running=true;
		var n=0;
		var arrV=[];
		var arrL=[];
		while(running){
			n++;
			var d2=document.getElementById(obj.name+"label"+n);
			if(d2===null) break;
			var d1=document.getElementById(obj.name+n);
			if(d1.checked){
				arrL.push(d2.innerHTML);
				arrV.push(d1.value);
			}
		}
		var dn=obj.name.substr(0,obj.name.length-5);
		var d1=document.getElementById(dn);
		d1.value=arrV.join(",");
		if(zv!==-1){
			zExpOptionSetValue(zv,"<br />"+arrL.join("<br />"));
		}
		if(d1.onchange != null){
			d1.onchange();
		}
	}



	function zMotionOnMouseDown(objname){
		zMotionObjClicked=objname;
		return false;
	}
	function zMotiontoggleSlide(objname, label, hoc){
		zMotionLabel[objname]=document.getElementById(label);
		if(hoc!==""){
			zMotionHOC[objname]=document.getElementById(hoc);
		}else{
			zMotionHOC[objname]="";	
		}
		if(zMotionObjClicked!==objname) return;
		if(document.getElementById(objname).style.display === "none"){
			zMotionHOC[objname].style.display="none";
			zMotionslidedown(objname);
		}else{
			zMotionslideup(objname);
		}
	}
	function zMotionslidedown(objname){
		if(zMotionmoving[objname])
				return;

		if(document.getElementById(objname).style.display !== "none")
				return; // cannot slide down something that is already visible

		zMotionmoving[objname] = true;
		zMotiondir[objname] = "down";
		zMotionstartslide(objname);
	}

	function zMotionslideup(objname){
		if(zMotionmoving[objname])
				return;

		if(document.getElementById(objname).style.display === "none")
				return; // cannot slide up something that is already hidden

		zMotionmoving[objname] = true;
		zMotiondir[objname] = "up";
		zMotionstartslide(objname);
	}

	function zMotionstartslide(objname){
		zMotionobj[objname] = document.getElementById(objname);

		zMotionendHeight[objname] = parseInt(zMotionobj[objname].style.height);
		zMotionstartTime[objname] = (new Date()).getTime();

		if(zMotiondir[objname] === "down"){
			zMotionobj[objname].style.height = "1px";
		}
		zMotionobj[objname].style.overflow="hidden";
		zMotionobj[objname].style.display = "block";
		zMotiontimerID[objname] = setInterval('zMotionslidetick("' + objname + '");',zMotiontimerlen);
	}

	function zMotionslidetick(objname){
		var elapsed = (new Date()).getTime() - zMotionstartTime[objname];
		if (elapsed > zMotionslideAniLen){
			zMotionendSlide(objname);
		}else{
			var d =Math.round(elapsed / zMotionslideAniLen * zMotionendHeight[objname]);
			if(zMotiondir[objname] === "up") d = zMotionendHeight[objname] - d;
			zMotionobj[objname].style.height = d + "px";
		}
	}

	function zMotionendSlide(objname){
		clearInterval(zMotiontimerID[objname]);

		if(zMotiondir[objname] === "up"){
			zMotionobj[objname].style.display = "none";
			zMotionHOC[objname].style.display="inline";
		}else{
			zMotionobj[objname].style.overflow="auto";
		}
		zMotionobj[objname].style.height = zMotionendHeight[objname] + "px";

		delete(zMotionHOC[objname]);
		delete(zMotionLabel[objname]);
		delete(zMotionmoving[objname]);
		delete(zMotiontimerID[objname]);
		delete(zMotionstartTime[objname]);
		delete(zMotionendHeight[objname]);
		delete(zMotionobj[objname]);
		delete(zMotiondir[objname]);

		return;
	}

	function zCLink(d){d.href='javascript:void(0);';}
	function zSetInput(id,v){
		var d=document.getElementById(id);d.value=v;
		if(d.onchange!==null){
			d.onchange();
		}
	}
	function zFormOnEnterAdd(id,d){
		zFormOnEnterValues[id]=d;
	}
	function zFormOnEnter(e,obj){
		if(zFormOnEnterValues[obj.id]!==null){
			if(e===null){
				eval(zFormOnEnterValues[obj.id]);
			}else{
				if(window.event){
					var keynum= e.keyCode;
				}else{
					var keynum = e.which;
				}
				if(keynum===13){
					eval(zFormOnEnterValues[obj.id]);
				}
			}
		}
	}
	function zInputRemoveOption(id,zOffset){
	    var ab=new Array();
	    var ab2=new Array();
	    var ab3=new Array();
	    for(var i=0;i<zValues[zOffset].length;i++){
	        if(id!==i){ 
				ab.push(zValues[zOffset+1][i]); ab2.push(zValues[zOffset][i]); ab3.push(zValues[zOffset+2][i]); 
			}else{
				if(zValues[zOffset+2][i] !== "" && zValues[zOffset+6] === false){
					var d=document.getElementById(zValues[zOffset+2][i]);
					d.style.display="block";
				}
			}
	    }
	    zValues[zOffset+2]=ab3;
	    zValues[zOffset+1]=ab;
	    zValues[zOffset]=ab2;
		var ofield=document.getElementById(zValues[zOffset+4]);
		var ofieldlabel=document.getElementById(zValues[zOffset+4]+"_zlabel");
		ofield.value=zValues[zOffset+1].join(",");
		ofieldlabel.value=zValues[zOffset].join(",");
		if(ofield.type !== "select-one" && ofield.onchange!==null){
			ofield.onchange();
		}
	    zInputSetSelectedOptions(false,zOffset);
		if(ofield.type === "select-one"){
			ofield.selectedIndex=0;	
		}
	}
	function zHasInnerText(){
		return (document.getElementsByTagName("body")[0].innerText !== "undefined") ? true : false;	
	}


	function zInputSetSelectedOptions(checkField,zOffset,fieldName,linkId,allowAnyText,onlyOneSelection){
		if(checkField){
			var ofield=document.getElementById(fieldName);
			var ofieldlabel=document.getElementById(fieldName+"_zlabel");
			var ofL=document.getElementById(fieldName+"_zmanual");
			var ofV=document.getElementById(fieldName+"_zmanualv");
			var cid=ofV.value;
			var cname=ofL.value;
			var obj=ofL;
			var it=zHasInnerText() ? obj.innerText : obj.textContent;
			if(zValues[zOffset+6]===true && zValues[zOffset+1].length>0 && cname!==""){
				alert('Only one value can be selected for this field');
				ofV.value="";
				ofL.value="";
				return;	
			}
			if(allowAnyText && cname!==""){
				// ignore
			}else if(cid==="0"){
			    alert('Please make a selection before clicking the add button.');
			    return;
			}else if(cname===""){
				return;	
			}
			for(var i=0;i<zValues[zOffset].length;i++){
				if(zValues[zOffset+1][i] === cid){// && zValues[zOffset][i]==cname){
					alert('The option, '+zValues[zOffset][i]+', has already been selected.');
					return;
				}
			}
			// loop links here with the zOffset
			for(var i=0;i<zValues[zOffset+3].length;i++){
				if(zValues[zOffset+3][i] === cid){
					linkId="zInputLinkBox"+zOffset+"_link"+(i+1);
					var d1=document.getElementById(linkId);
					d1.style.display="none";
					break;
				}
			}
			if(!allowAnyText && cid===cname){
				alert('Only valid entries are accepted. Please type an entry that appears in the suggestion box and than select it or press enter.');
				return;
			}
			ofV.value="";
			ofL.value="";
			if(linkId===null) linkId="";
			zValues[zOffset+2].push(linkId);
			zValues[zOffset+1].push(cid);
			zValues[zOffset].push(cname);
			ofield.value=zValues[zOffset+1].join(",");
			ofieldlabel.value=zValues[zOffset].join(",");
			if(ofield.onchange!==null){
				ofield.onchange();
			}
			var arrM=[];
			for(var i=0;i<zValues[zOffset].length;i++){
				arrM[zValues[zOffset][i]]=i;
			}
			zValues[zOffset].sort();
			var arrN=[];
			var arrN2=[];
			for(var i=0;i<zValues[zOffset].length;i++){
				arrN[i]=zValues[zOffset+1][arrM[zValues[zOffset][i]]];
				arrN2[i]=zValues[zOffset+2][arrM[zValues[zOffset][i]]];
			}
			zValues[zOffset+1]=arrN;
			zValues[zOffset+2]=arrN2;
		}
		zExpOptionSetValue(zValues[zOffset+5],"<br />"+zValues[zOffset].join("<br />"));
		var cb=document.getElementById("zInputOptionBlock"+zOffset);
		var arrBlock2=new Array();
		if(zValues[zOffset].length!==0){
			arrBlock2.push('<div class="zInputLinkBoxSelected"><div class="zInputLinkBoxSelectedHead">SELECTED VALUES:<br /><span style="font-weight:normal">Click X to remove a value.</span></div>');
			for(var i=0;i<zValues[zOffset].length;i++){
				var s='zInputLinkBoxRow1';
				if(i%2===0){
					s="zInputLinkBoxRow2";
				}
				if(zValues[zOffset+2][i] !== ""){
					var d1=document.getElementById(zValues[zOffset+2][i]);
					if(d1){
						d1.style.display="none";
					}
				}
				arrBlock2.push('<div style="float:left;width:100%;" class="'+s+'"><a href="javascript:zInputRemoveOption('+(arrBlock2.length-1)+','+zOffset+');" style="float:left;text-decoration:none;display:block;" class="zInputLinkBoxSItem '+s+'"><span title="Click the X to remove this option." class="zTOB-closeBox">X</span>'+zValues[zOffset][i]+'</a></div>');
			}
			arrBlock2.push('</div><br style="clear:both;" />');
		}
		cb.innerHTML=arrBlock2.join('');
		if(arrBlock2.length===0){
			cb.style.display="inline";
		}else{
			cb.style.display="block";
		}
	}


	function zOS_mode_check(){
		if(document.zOS_mode_form.zOS_modeVarDumpName){
			if(document.zOS_mode_form.zOS_modeVarDumpName.value.length !== 0){
				document.zOS_mode_form.zOS_mode.value = 'varDump';
				document.zOS_mode_form.zOS_modeValue.value = 'true';					
			}
		}
		return true;
	}
	function zOS_mode_submit(mode, value, value2, value3){
		var theform=document.getElementById("zOS_mode_form");
		var theaction=theform.getAttribute("action");
		if(mode === 'viewMeta'){
			document.getElementById("zOS_modeVarDumpName").value = 'request.zos.templateData.tagContent';
			mode = 'varDump';
		}
		if(typeof value3 === "undefined"){ value3=""; }
		document.getElementById("zOS_mode").setAttribute("value", mode);
		document.getElementById("zOS_modeValue").setAttribute("value", value);
		if(mode === 'viewAsXML'){
			theaction=zURLAppend(theaction, 'zOS_viewAsXML=1'+value3);
		}
		if(mode === 'validateXHTML' && value2 !== "undefined"){
			theaction=zURLAppend(theaction, 'zOS_viewXHTMLError=1'+value3);
		}
		if(mode === 'reset'){
			theaction=zURLAppend(theaction, 'zReset='+value2+value3);
		}
		theform.setAttribute("action", theaction);
		theform.submit();
	}
	function zOS_mode_status(){
		window.status = 'Warning: All variables will be reposted.';
	}
	function zOS_mode_status_off(){
		window.status = '';
	}
	function zOS_mode_hide(){
		var el = document.getElementById("zOS_mode_table_tag");
		el.style.display='none';
	}
	function zOS_mode_show(){
		var el = document.getElementById("zOS_mode_table_tag");
		el.style.display='block';
	}

	zArrDeferredFunctions.push(function(){
		$(".zEditReadOnly").bind("click", function(){
			var id=$(this).attr("data-fieldid");
			var id2=$(this).attr("data-readonlyid");
			$("#"+id).removeClass("zHideReadOnlyField");
			$("#"+id2).hide();
			alert('Warning: Changing read only values may cause things to break, or your changes may be overwritten during a future import process.');
			return false;
		});
	});




	function zCalculateTableCells(table){
		var max = 0;
		for(var i=0;i<table.rows.length;i++) {
			if(max < table.rows[i].cells.length){
				max = table.rows[i].cells.length;
			}
		}
		return max;
	}
	var zRowBeingEdited=false;
	var zRowEditIndex=0;
	var zCurrentHash="";
	function zTableRecordEdit(obj){
		zShowModalStandard(obj.href, 2000,2000, true, true);
		zRowEditIndex++;
		zCurrentHash="#zEditTableRecord"+zRowEditIndex+"-"+new Date().getTime()+"-"+Math.random();
		window.location.href=zCurrentHash;
		var i=0;
		while(true){
			i++;
			if(obj.tagName.toLowerCase() == 'tr'){ 
				break;
			}
			obj=obj.parentNode;
			if(i > 50){
				alert('infinite loop. invalid table html structure');
				return false;
			}
		}
		zRowBeingEdited=obj;
	}
	function zReplaceTableRecordRow(html){
		$(zRowBeingEdited).html(html); 
	}
	zArrDeferredFunctions.push(function(){
		$(window).bind("hashchange", function() {

			if (window.location.hash.indexOf(zCurrentHash) == -1){
				zCloseModal();
			}else{

			}
		});
	});
	function zDeleteTableRecordRow(obj, deleteLink){
		var tr, table;
		var i=0;
		while(true){
			i++;
			if(obj.tagName.toLowerCase() == 'tr'){
				tr=obj;
			}else if(obj.tagName.toLowerCase() == 'table'){
				table=obj;
				break;
			}
			obj=obj.parentNode;
			if(i > 50){
				alert('infinite loop. invalid table html structure');
				return false;
			}
		}
		var cellCount=zCalculateTableCells(table);

		$("td", tr).css("border-top", "2px solid #900");
		$("td", tr).css("border-bottom", "2px solid #900");
		$("td", tr).css("background-color", "#FFF0F0");
		var r=confirm("Are you sure you want to delete this record?");
		$("td", tr).css("border-top", "0px solid #CCC");
		$("td", tr).css("border-bottom", "1px solid #CCC");
		$("td", tr).css("background-color", "inherit");
		if(r){
			var obj={
				id:"ajaxDeleteTableRecord",
				method:"get",
				ignoreOldRequests:true,
				callback:function(r){
					r=eval('('+r+')');
					if(r.success){
						$(tr).html('<td class="zDeletedRow" colspan="'+cellCount+'">Row Deleted</td>');
					}else{
						alert('Failed to delete the record. Error: '+r.errorMessage);
					}

				},
				errorCallback:function(r){
					alert('Failed to delete the record. Unknown error');
				},
				url:deleteLink
			}; 
			zAjax(obj);
		}
		return false;
		
	}
	window.zCalculateTableCells=zCalculateTableCells;
	window.zTableRecordEdit=zTableRecordEdit;
	window.zReplaceTableRecordRow=zReplaceTableRecordRow;
	window.zDeleteTableRecordRow=zDeleteTableRecordRow;
	window.zUpdateImageLibraryCount=zUpdateImageLibraryCount;
	window.ajaxSaveSorting=ajaxSaveSorting;
	window.ajaxSaveImage=ajaxSaveImage;
	window.toggleImageCaptionUpdate=toggleImageCaptionUpdate;
	window.confirmDeleteImageId=confirmDeleteImageId;
	window.deleteImageId=deleteImageId;
	window.setUploadField=setUploadField;
	window.zOptionGroupErrorCallback=zOptionGroupErrorCallback;
	window.zOptionGroupCallback=zOptionGroupCallback;
	window.zOptionGroupPostForm=zOptionGroupPostForm;
	window.zSetupAjaxTableSort=zSetupAjaxTableSort;
	window.zGetFormDataByFormId=zGetFormDataByFormId;
	window.zGetFormFieldDataById=zGetFormFieldDataById;
	window.zDisableEnter=zDisableEnter;
	window.zKeyboardEvent=zKeyboardEvent;
	window.zInputHideDiv=zInputHideDiv;
	window.zFormOnKeyUp=zFormOnKeyUp;
	window.zFormOnChange=zFormOnChange;
	window.zFormSetError=zFormSetError;
	window.zAjax=zAjax;
	window.zFormSubmit=zFormSubmit;
	window.zInputSlideOnChange=zInputSlideOnChange;
	window.zSetSliderInputArray=zSetSliderInputArray;
	window.zSliderInputResize=zSliderInputResize;
	window.zInputSliderSetValue=zInputSliderSetValue;
	window.zInputSlideLimit=zInputSlideLimit;
	window.zExpOptionSetValue=zExpOptionSetValue;
	window.zCheckboxOnChange=zCheckboxOnChange;
	window.zMotionOnMouseDown=zMotionOnMouseDown;
	window.zMotiontoggleSlide=zMotiontoggleSlide;
	window.zMotionslidedown=zMotionslidedown;
	window.zMotionslideup=zMotionslideup;
	window.zMotionstartslide=zMotionstartslide;
	window.zMotionslidetick=zMotionslidetick;
	window.zMotionendSlide=zMotionendSlide;
	window.zCLink=zCLink;
	window.zSetInput=zSetInput;
	window.zFormOnEnterAdd=zFormOnEnterAdd;
	window.zFormOnEnter=zFormOnEnter;
	window.zInputRemoveOption=zInputRemoveOption;
	window.zHasInnerText=zHasInnerText;
	window.zInputSetSelectedOptions=zInputSetSelectedOptions;
	window.zOS_mode_check=zOS_mode_check;
	window.zOS_mode_submit=zOS_mode_submit;
	window.zOS_mode_status=zOS_mode_status;
	window.zOS_mode_status_off=zOS_mode_status_off;
	window.zOS_mode_hide=zOS_mode_hide;
	window.zOS_mode_show=zOS_mode_show;
	//window.zSetupAjaxTableSortAgain=zSetupAjaxTableSortAgain;

})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/history-functions.js */

var zContentTransition=new Object();

if(typeof zLocalDomains === "undefined"){
	var zLocalDomains=[];
}

(function($, window, document, undefined){
	"use strict";
	zContentTransition.transitionOverrideId=false;
	zContentTransition.processManually=false;
	zContentTransition.processManuallyResult="{}";
	zContentTransition.processManuallyRan=false;
	zContentTransition.manuallyProcessTransition=function(){
		zContentTransition.processManuallyRan=true;
		if(zContentTransition.processResultStored){
			zContentTransition.processResultStored=false;
			zContentTransition.processAjaxPageTransition(zContentTransition.processManuallyResult);
		}
	};
	// the problem is that animation is finishing before the ajax complete is called.
	zContentTransition.processAjaxPageTransition=function(d){
		if(zContentTransition.processManually && zContentTransition.processManuallyRan === false){
			zContentTransition.processResultStored=true;
			zContentTransition.processManuallyResult=d;
			return;	
		}
		var d2=document.body || document.documentElement;
		d2.style.overflow="auto";
		var d1={};
		try{
			d1=eval("("+d+")");
			if(typeof d1.forceReload === "undefined" || d1.forceReload){
				window.location.href=zContentTransition.lastURL;
			}
			$("#zContentTransitionContentDiv").html(d1.content);
		}catch(e){ 
			window.location.href=zContentTransition.lastURL;
		}
		var $target;
		if(zContentTransition.transitionOverrideId !== false){
			$target = $("#"+zContentTransition.transitionOverrideId);
		}else{
			$target = $("#zContentTransitionTitleSpan");
		}
		var pageNavElement = $("#zContentTransitionPageNavSpan");
		if(d1.pagenav ===''){
			pageNavElement.html('');
			$("#zpagenav").hide();
		}else{
			$("#zpagenav").show();
			pageNavElement.html(d1.pagenav);
		}
		//n.innerHTML=d1.content;
		zContentTransition.load();
		//n.style.display="block";
		if(!zContentTransition.disableNextAnimation){
			if(zContentTransition.lastJumpHash!==""){
				$('#zContentTransitionContentDiv').css("display","block");
				var $target = $("#"+zContentTransition.lastJumpHash);
				//alert('test'+$target+"\n"+$target.offset().top);
				if ($target && $target.length) {
					var targetOffset = Math.max(0,Math.max(0,$target.offset().top-50));
						$(window).scrollTop(targetOffset);
					/*if (zIsTouchscreen()) {
						$(window).scrollTop(targetOffset);
					}else{
						if($("html").scrollTop() !== targetOffset){
							$('html,body').animate({scrollTop: targetOffset}, 200);
						}
					}*/
				}
				zContentTransition.lastJumpHash="";
			}else{
				var doingTheScrollAnimation=false;
				if ($target.length) {
					var targetOffset = Math.max(0,Math.max(0,$target.offset().top-50));
						$(window).scrollTop(targetOffset);
						/*
					if (zIsTouchscreen()) {
						$(window).scrollTop(targetOffset);
					}else{
						if($("html").scrollTop() !== targetOffset){
							doingTheScrollAnimation=true;
							$('html,body').animate({scrollTop: targetOffset}, 200);
						}
					}*/
				}
				if(doingTheScrollAnimation){
					setTimeout(function(){$('#zContentTransitionContentDiv').fadeIn(200,function(){});},200);
				}else{
					$('#zContentTransitionContentDiv').fadeIn(200,function(){});
				}
			}
		}
		zContentTransition.disableNextAnimation=false;
		var c=document.getElementById("zContentTransitionTitleSpan");
		if(c){
			c.innerHTML=d1.pagetitle;
		}
		if(zContentTransition.popNextStateChange){
			zContentTransition.popNextStateChange=false;
		}else{
			History.pushState({rand:Math.random()}, d1.title , zContentTransition.lastURL, false);//Math.random()
			History.Adapter.trigger(window,'statechange');
			History.busy(false);
		}
		if(zMSIEBrowser!==-1 && zMSIEVersion<=9){
		}else{
			zContentTransition.skipNextStateChange=false;
		}
		zLoadAllLoadFunctions();
				
	};
	zContentTransition.processFailedAjaxPageTransition=function(d){
		zContentTransition.processManuallyRan=true;
		zContentTransition.skipNextStateChange=false;
		zContentTransition.processResultStored=true;
		window.location.href=zContentTransition.lastURL;
		// alert("Failed to load url, please try again or contact the webmaster.");//+d);
	};
	zContentTransition.urlHistory=new Array();
	zContentTransition.lastURL="";
	zContentTransition.skipNextStateChange=true;
	zContentTransition.requestAjaxPageTransition=function(theURL, dontPush){
		
		zContentTransition.skipNextStateChange=true;
		if(theURL.substr(0,4) === "http"){
			for(var n=0;n<zLocalDomains.length;n++){
				if(theURL.substr(0,zLocalDomains[n].length) === zLocalDomains[n]){
					theURL=theURL.replace(zLocalDomains[n],"");
					break;
				}
			}
		}
		var p=theURL.indexOf("#");
		if(p !== -1){
			var p2=theURL.indexOf("&_suid=");
			if(p2 !== -1){
				var n=theURL.substr(p+1, p2-(p+1));
				if(n.length>0){
					theURL=n;
				}
			}
		}
		zContentTransition.processManuallyRan=false;
		zContentTransition.processResultStored=false;
		zContentTransition.onPageChange(theURL);
		if(dontPush===false){
			zContentTransition.urlHistory.push(theURL);
		}
		zContentTransition.lastURL=theURL;
		var q=theURL.indexOf("?");
		if(q!==-1){
			theURL+="&";
		}else{
			theURL+="?";
		}
		theURL+="zajaxdownloadcontent=1";
		var tempObj={};
		tempObj.id="zAjaxPageTransition";
		tempObj.url=theURL;
		tempObj.callback=zContentTransition.processAjaxPageTransition;
		tempObj.errorCallback=zContentTransition.processFailedAjaxPageTransition;
		tempObj.cache=false; 
		tempObj.ignoreOldRequests=true; 
		zAjax(tempObj);
	};
	zContentTransition.checkHashChange=function(){
		// zContentTransitionLog.value+="\nhashchangeout url: "+window.location.href+"\n";
		if(!zContentTransition.skipNextStateChange){
			var u="";
			if(zContentTransition.urlHistory.length > 1){
				// zContentTransitionLog.value+="hashchangein \n";
				var u2=zContentTransition.urlHistory.pop();
				// zContentTransitionLog.value+=u2+" | cur \n";
				u=zContentTransition.urlHistory[zContentTransition.urlHistory.length-1];
				var p=u.indexOf("#");
				if(p !== -1){
					var p2=u.indexOf("&_suid=");
					if(p2 !== -1){
						var n=u.substr(p+1, p2-(p+1));
						if(n.length>0){
							u=n;
						}
					}
				}
				zContentTransition.popNextStateChange=true;
				zContentTransition.requestAjaxPageTransition(u, true);
				//zContentTransitionLog.value+=u+" | prev \n";
			}
		}
		zContentTransition.skipNextStateChange=false;
	};
	zContentTransition.stateChange=function(){ 

		// zContentTransitionLog.value+="\nstatechangeout ";
		if(!zContentTransition.skipNextStateChange){
			//zContentTransitionLog.value+=zContentTransition.urlHistory.join("\n");
			//var State = History.getState();
			if(zContentTransition.urlHistory.length > 1){
				// zContentTransitionLog.value+="statechangein \n";
				if(zMSIEBrowser!==-1 && zMSIEVersion<=9){
				}else{
					var u2=zContentTransition.urlHistory.pop();
					// zContentTransitionLog.value+=u2+" | cur \n";
				}
				var u=zContentTransition.urlHistory[zContentTransition.urlHistory.length-1];
				zContentTransition.popNextStateChange=true;
				//zContentTransition.skipNextStateChange=false;
				// zContentTransitionLog.value+=u+" | prev \n";
				zContentTransition.requestAjaxPageTransition(u, true);
			}
		}
	};
	zContentTransition.arrIgnoreURLs=["/z/listing/search-form/index"];
	zContentTransition.arrIgnoreURLContains=["mailto:",
	"/z/misc/system/ext",
	"/z/listing/sl/index",
	"/z/_a/member/",
	"/z/listing/search-js/index",
	"/z/user/preference/",
	".xml"];
	zContentTransition.disable=function(){
		zContentTransition.enabled=false;
	};

	zContentTransition.gotoURL=function(url){
		var newA= document.createElement('a');
		newA.href=url;
		zContentTransition.linkOnClick(false, newA);
	};
	zContentTransition.doLinkOnClick=function(obj){
		if(zContentTransition.enabled){
			zContentTransition.linkOnClick(false, obj);
			return false;
		}else{
			return true;
		}
	};
	zContentTransition.linkOnClick=function(e, obj){
		var thisObj=false;
		if(typeof obj !== "undefined"){
			thisObj=obj;
		}else{
			thisObj=this;
		}
		if(thisObj.target==="_parent"){
			parent.zContentTransition.gotoURL(thisObj.href);
			return false;
		}else if(thisObj.target==="_top"){
			top.zContentTransition.gotoURL(thisObj.href);
			return false;	
		}
		zHideMenuPopups();
		var m=false;
		var shortUrl=thisObj.href;
		for(var n=0;n<zLocalDomains.length;n++){
			if(thisObj.href.substr(0,zLocalDomains[n].length) === zLocalDomains[n]){
				m=true;
				var shortUrl=thisObj.href.replace(zLocalDomains[n],"");
				var a9_2=shortUrl.split("#");
				if(a9_2.length > 1){
					shortUrl=a9_2[0];
				}
				for(var g=0;g<zContentTransition.arrIgnoreURLs.length;g++){
					if(shortUrl === zContentTransition.arrIgnoreURLs[g]){
						window.location.href=thisObj.href;
						return false;
					}
				}
				for(var g=0;g<zContentTransition.arrIgnoreURLContains.length;g++){
					if(shortUrl.indexOf(zContentTransition.arrIgnoreURLContains[g]) !== -1){
						window.location.href=thisObj.href;
						return false;
					}
				}
			}
		}
		if(!m){
			window.location.href=thisObj.href;
			return false;	
		}
		var a9=thisObj.href.split("#");
		if(a9.length > 1){
			var a92=window.location.href.split("#");
			if(a92[0] === a9[0]){
				if(a9.length > 1){
					var $target = $("#"+a9[1]);
					if ($target && $target.length) {
						var targetOffset = Math.max(0,Math.max(0,$target.offset().top-50));
						if(zIsTouchscreen()){
							$(window).scrollTop(targetOffset);
						}else{
							$('html,body').animate({scrollTop: targetOffset}, 200);
						}
					}
					zContentTransition.lastJumpHash="";
					/*History.pushState({rand:Math.random()}, document.title , a9[0], false);//Math.random()
					History.Adapter.trigger(window,'statechange');
					History.busy(false);*/
					//zContentTransition.stateChange();
					return false;
				}else{
					return true;	
				}
			}
			zContentTransition.lastJumpHash=a9[1];
			thisObj.href=a9[0];
		}else{
			zContentTransition.lastJumpHash="";
		}
		zContentTransition.skipNextStateChange=true;
		if(typeof _gaq !== "undefined"){
			_gaq.push(['_trackPageview', shortUrl]);
		}else if(typeof pageTracker !== "undefined"){
			pageTracker._trackPageview(shortUrl);
		}
		//console.log("link clicked:"+thisObj.href);
		zContentTransition.requestAjaxPageTransition(thisObj.href, false); 
		
		return false;	
	};
	//var zContentTransitionLog=false;
	zContentTransition.disableNextAnimation=false;
	zContentTransition.enabled=true;
	zContentTransition.firstLoad=true;
	zContentTransition.popNextStateChange=false;
	zContentTransition.lastJumpHash="";
	zContentTransition.load=function(){
		
		if(zContentTransition.enabled===false) return;
		//zContentTransitionLog=document.getElementById("log");
		if(zContentTransition.firstLoad){
			zContentTransition.firstLoad=false;
			if(zMSIEBrowser!==-1 && zMSIEVersion<=9){
				if(History !== "undefined" && History.Adapter !== "undefined"){
					History.Adapter.bind(window,'hashchange',zContentTransition.checkHashChange);
				}
				var p=window.location.href.indexOf("#");

				if(p !== -1){
					var p2=window.location.href.indexOf("&_suid=");
					if(p2 !== -1){
						var n=window.location.href.substr(p+1, p2-(p+1));
						var p3=window.location.href.indexOf("/",8);
						var n2=window.location.href.substr(p3, p-p3);
						//alert('me\n'+n2+"\n"+n);
						if(n2 !== n){
							zContentTransition.requestAjaxPageTransition(n, false);	
						}
					}
				}
			}else{
				History.Adapter.bind(window,'statechange',zContentTransition.stateChange);
				if(History.storedStates.length>1){
					var s=History.getState();
					zContentTransition.requestAjaxPageTransition(s.url, false);	
				}
			}
			var theURL=window.location.href;
			if(theURL.substr(0,4) === "http"){
				//alert(i+" | "+zContentTransition.lastURL);
				for(var n=0;n<zLocalDomains.length;n++){
					if(theURL.substr(0,zLocalDomains[n].length) === zLocalDomains[n]){
						theURL=theURL.replace(zLocalDomains[n],"");
						break;
					}
				}
			}
			zContentTransition.urlHistory.push(theURL);
		}
		var a=document.getElementsByTagName("a");//zGetElementsByClassName("zContentTransition");
		var clone =[]; // need clone because the array automatically changes when removing the class name
		for(var i=0;i<a.length;i++){
			var targetCheck=false;
			if(window.location.href+"#" === a[i].href){
				continue;
			}
			if(a[i].target !== ""){
				if(a[i].target==="_parent"){
					try{
						if(typeof parent.zContentTransition === "undefined"){
							targetCheck=true;
						}
					}catch(e){
						targetCheck=true;
					}
				}else if(a[i].target==="_top"){
					try{
						if(typeof top.zContentTransition === "undefined"){
							targetCheck=true;
						}
					}catch(e){
						targetCheck=true;
					}
				}else{
					targetCheck=true;
				}
			}
			try{
				if(typeof a[i].onclick !== "function" && !targetCheck){
					if(a[i].id === "" && a[i].name !== ""){
						a[i].id=a[i].name;
					}
					if(a[i].className.indexOf("zNoContentTransition")!==-1){
						continue;	
					}
					clone.push(a[i]);	
				}
			}catch(e){
				throw("The onclick code was invalid for a link on this page.  Onclick code:"+a[i].getAttribute("onclick"));
			}
		}
		for(var i=0;i<clone.length;i++){
			//clone[i].className=clone[i].className.replace("zContentTransition","");
			clone[i].onclick=zContentTransition.linkOnClick;
		}
		zLoadAndCropImagesDefer();
	};

	zContentTransition.bind=function(obj, func){
		if(typeof func !== "undefined"){
			zContentTransition.arrPageChangeObjs.push(obj);
			zContentTransition.arrPageChangeFunctions.push(func);
		}else{
			zContentTransition.arrPageChangeObjs.push(false);
			zContentTransition.arrPageChangeFunctions.push(obj);
		}
	};
	zContentTransition.arrPageChangeObjs=[];
	zContentTransition.arrPageChangeFunctions=[];
	zContentTransition.pageChangeUrl="";
	zContentTransition.onPageChange=function(newUrl){
		
		if(newUrl === zContentTransition.pageChangeUrl) return;
		zContentTransition.pageChangeUrl=newUrl;
		for(var i=0;i<zContentTransition.arrPageChangeObjs.length;i++){
			if(typeof zContentTransition.arrPageChangeObjs[i] === "boolean"){
				zContentTransition.arrPageChangeFunctions[i](newUrl);
			}else{
				zContentTransition.arrPageChangeObjs[i][zContentTransition.arrPageChangeFunctions[i]](newUrl);
			}
		}
	};
	zContentTransition.checkLoad=function(){
		if(typeof zContentTransitionEnabled !== "undefined" && zContentTransitionEnabled && typeof zContentTransitionDisabled === "undefined"){
			if(zWindowIsLoaded){
				zContentTransition.load();
			}else{
				zArrLoadFunctions.push({functionName:zContentTransition.load});
			}
		}
	};


	function zTrackPageview(link){
		if(typeof window['GoogleAnalyticsObject'] != "undefined"){
			var b=eval(window['GoogleAnalyticsObject']); 
			b('send', 'pageview', link);
		}else if(typeof _gaq !== "undefined"){
			_gaq.push(['_trackPageview', link]);
		}else if(typeof pageTracker !== "undefined"){
			pageTracker._trackPageview(link);
		} 
	}
	window.zTrackPageview=zTrackPageview;
			
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/image-functions.js */

var zLoadAndCropImagesIndex=0;
var zArrSlideshowIds=[];
var zArrGalleryViewSlideshowTemplate=[];
var zGalleryReloadTimeoutId=0;


(function($, window, document, undefined){
	"use strict";


	function zLoadAndCropImages(){
		var debug=false;
		var e=zGetElementsByClassName("zLoadAndCropImage");
		var time=new Date().getTime();
		for(var i=0;i<e.length;i++){
			if(e[i].getAttribute("data-imageloaded")==="1"){
				continue;
			}
			e[i].setAttribute("data-imageloaded", "1");
			var url=e[i].getAttribute("data-imageurl");
			var style=e[i].getAttribute("data-imagestyle");
			var width=parseInt(e[i].getAttribute("data-imagewidth"));
			var height=parseInt(e[i].getAttribute("data-imageheight"));
			var crop=false;
			if(e[i].getAttribute("data-imagecrop")==="1"){
				crop=true;
			}
			if(typeof e[i].style.maxWidth !== "undefined" && e[i].style.maxWidth !== ""){
				var tempWidth=parseInt(e[i].style.maxWidth);
				if(tempWidth<width){
					width=tempWidth;
					height=width;
				}
			}
			zLoadAndCropImage(e[i], url, debug, width, height, crop, style);
		}
	}
	function zLoadAndCropImagesDefer(){
		setTimeout(zLoadAndCropImages, 1);
	}
	zArrLoadFunctions.push({functionName:zLoadAndCropImagesDefer});
	function zLoadAndCropImage(obj, imageURL, debug, width, height, crop, style){ 
		if(zMSIEBrowser!==-1 && zMSIEVersion<=9){
			if(height===10000){
				obj.innerHTML='<img src="'+imageURL+'" />';
			}else{
				obj.innerHTML='<img src="'+imageURL+'" width="'+width+'" height="'+height+'" />';
			}
			return;	
		}
		//debug=true;
		var p=window.location.href.indexOf("/", 8);
		var currentHostName="a";
		if(p != -1){
			currentHostName=window.location.href.substr(0, p);
		}
		p=imageURL.indexOf("/", 8);
		var imageHostName="b";
		if(imageHostName != -1){
			imageHostName=imageURL.substr(0, p);
		}
		var proxyPath="/zimageproxy/";
		if(imageURL.substr(0,4) == 'http' && currentHostName != imageHostName && imageURL.substr(0, proxyPath.length) != proxyPath){
			// use proxy when it is a remote domain to avoid crossdomain security error
			imageURL="/zimageproxy/"+imageURL.replace("http://", "").replace("https://", "");
		}
		if(debug) console.log('Loading: '+imageURL);
		var canvas = document.createElement('canvas');
		zLoadAndCropImagesIndex++;
		canvas.id="zCropImageID"+zLoadAndCropImagesIndex+"_canvas";
		canvas.width=width;
		canvas.height=height;
		canvas.style.cssText=style;
		var context = canvas.getContext('2d');
		var imageObj = new Image();
		imageObj.startTime=new Date().getTime();
		imageObj.onerror=function(){
			if(debug) console.log('image load fail: '+this.src);
			this.src='/z/a/listing/images/image-not-available.gif';	
		};
		imageObj.onload = function() {
			var end = new Date().getTime();
			var time2 = end - this.startTime;
			//if(debug) 
			if(debug) console.log((time2/1000)+" seconds to load image");
			var time=new Date().getTime();
			if(this.width <= 10 || this.width >= 2000 || this.height <= 10 || this.height >= 2000){
				if(debug) console.log("Failed to draw canvas because computed width x height was invalid: "+this.width+"x"+this.height);
				return;
			}
			if(this.src.indexOf('/z/a/listing/images/image-not-available.gif') !== -1){
				canvas.width=this.width;
				canvas.height=this.height;
				context.drawImage(this, 0,0);//Math.floor((width-this.width)/2), Math.floor((height-this.height)/2));
				//context.drawImage(this, Math.floor((width-this.width)/2), Math.floor((height-this.height)/2));
				obj.appendChild(canvas);
				return;
			}
			if(debug) console.log("image loaded:"+this.src);
			var start=new Date();
			canvas.width=this.width;
			canvas.height=this.height;
			context.drawImage(this, 0, 0);
			var imageData=context.getImageData(0,0, this.width, this.height);
			var end = new Date().getTime();
			var time2 = end - time;
			//if(debug) 
			if(debug) console.log((time2/1000)+" seconds to getimagedata");
			var time=new Date().getTime();
			var xCheck=Math.round(this.width/5);
			var yCheck=Math.round(this.height/5);
			var xmiddle=Math.round(this.width/2);
			var ymiddle=Math.round(this.height/2);
			var xcrop=0;
			var xcrop2=0;
			var ycrop=0;
			var newy=0;
			var newx=0;
			var ycrop2=0;
			if(debug) console.log("top side");
			for (var y=0;y<this.height;y++){
				var p=(xmiddle*4)+(y*4*this.width);
				var rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				var curX=Math.max(1, xmiddle-xCheck);
				p=(curX*4)+(y*4*this.width);
				var rgb2=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				curX=Math.min(this.width, xmiddle+xCheck);
				p=(curX*4)+(y*4*this.width);
				var rgb3=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				//if(debug) console.log("finding y: "+rgb1+" | "+rgb2+" | "+rgb3);
				if((rgb1+rgb2+rgb3)/3 < 16400000){
					ycrop=y+6;
					newy=y;
					for(y=Math.max(0,y-9);y<=newy;y++){
						var p=(xmiddle*4)+(y*4*this.width);
						rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
						if(debug) console.log(y+" | refining y: "+rgb1+" | red: "+imageData.data[p]+" | green: "+imageData.data[p+1]+" | blue: "+imageData.data[p+2]);
						if(rgb1<16400000){
							if(debug) console.log("final y:"+y);
							ycrop=y+6;
							break;
						}
					}
					break;
				}
			}
			if(debug) console.log("bottom side");
			for (var y=0;y<this.height;y++){
				var curY=((this.height-1)*4*this.width)-(y*4*this.width);
				var p=(xmiddle*4)+(curY);
				rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				var curX=Math.max(1, xmiddle-xCheck);
				p=(curX*4)+(curY);
				rgb2=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				curX=Math.min(this.width, xmiddle+xCheck);
				p=(curX*4)+(curY);
				rgb3=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				//if(debug) console.log("finding y: "+rgb1+" | "+rgb2+" | "+rgb3);
				if((rgb1+rgb2+rgb3)/3 < 16400000){
					ycrop2=y+6;
					newy=y;
					for(y=Math.max(0,y-9);y<=newy;y++){
						var p=(xmiddle*4)+(y*4*this.width);
						rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
						if(debug) console.log(y+" | refining y: "+rgb1+" | red: "+imageData.data[p]+" | green: "+imageData.data[p+1]+" | blue: "+imageData.data[p+2]);
						if(rgb1<16400000){
							if(debug) console.log("final y:"+y);
							ycrop2=y+6;
							break;
						}
					}
					break;
				}
			}
			
			
			if(debug) console.log("left side");
			for (var x=0;x<this.width;x++){
				var p=(x*4)+(ymiddle*4*this.width);
				rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				var curY=Math.max(1, ymiddle-yCheck);
				p=(x*4)+(curY*4*this.width);
				rgb2=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				curY=Math.min(this.height, ymiddle+yCheck);
				p=(x*4)+(curY*4*this.width);
				rgb3=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				//if(debug) console.log("finding y: "+rgb1+" | "+rgb2+" | "+rgb3);
				if((rgb1+rgb2+rgb3)/3 < 16400000){
					xcrop=x+6;
					newx=x; 
					for(x=Math.max(0,x-9);x<=newx;x++){
						var p=(x*4)+(ymiddle*4*this.width);
						rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
						if(debug) console.log(x+" | refining x: "+rgb1+" | red: "+imageData.data[p]+" | green: "+imageData.data[p+1]+" | blue: "+imageData.data[p+2]);
						if(rgb1<16400000){
							if(debug) console.log("final x:"+x);
							xcrop=x+6;
							break;
						}
					}
					break;
				}
			}
			if(debug) console.log("right side");
			for (var x=0;x<this.width;x++){
				//var curX=((this.width-1)*4)-(ymiddle*4*this.width);
				var curX2=(((this.width-1)-x)*4);
				var curX=(((this.width-1)-x)*4)+(ymiddle*4*this.width);
				var p=(x*4)+(curX);
				rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				var curY=Math.max(1, ymiddle-yCheck);
				p=(curX2)+(curY*4*this.width);
				rgb2=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				curY=Math.min(this.height, ymiddle+yCheck);
				p=(curX2)+(curY*4*this.width);
				rgb3=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
				//if(debug) console.log("finding x: "+rgb1+" | "+rgb2+" | "+rgb3+" | x:"+curX+" x:"+(this.width-x)+" y:"+curY);
				if((rgb1+rgb2+rgb3)/3 < 16400000){
					xcrop2=x+6;
					newx=x;
					for(x=Math.max(0,x-9);x<=newx;x++){
						var p=(xmiddle*4)+(curY);
						rgb1=imageData.data[p]*imageData.data[p+1]*imageData.data[p+2];
						if(debug) console.log(x+" | refining y: "+rgb1+" | red: "+imageData.data[p]+" | green: "+imageData.data[p+1]+" | blue: "+imageData.data[p+2]);
						if(rgb1<16400000){
							if(debug) console.log("final x:"+x);
							xcrop2=x+6;
							break;
						}
					}
					break;
				}
			}
			if(debug) console.log("left:"+xcrop+" | top:"+ycrop+" | right:"+xcrop2+" | bottom:"+ycrop2);
			
			var originalWidth=this.width;
			var originalHeight=this.height;
			if(debug) console.log("original size:"+this.width+"x"+this.height);
			var newWidth=this.width-(xcrop+xcrop2);
			var newHeight=this.height-(ycrop+ycrop2);
			if(newHeight < 10 || newWidth < 10){
				// prevent mistakes
				if(Math.abs(xcrop-xcrop2) > 50){
					xcrop=Math.min(xcrop, xcrop2);
				}else{
					xcrop=Math.max(xcrop, xcrop2);
				}
				if(Math.abs(ycrop-ycrop2) > 50){
					ycrop=Math.min(ycrop, ycrop2);
				}else{
					ycrop=Math.max(ycrop, ycrop2);
				}
				newWidth=(originalWidth-(xcrop*2));
				newHeight=(originalHeight-(ycrop*2));
				if(newHeight < 10 || newWidth < 10){
					// image can't be cropped correctly, show entire image
					newWidth=originalWidth;
					newHeight=originalHeight;
				}
				crop=false;
			}
			if(newWidth < this.width/2 || newHeight < this.height/2){
				// preventing incorrect cropping of images that are mostly white, by restoring them to display as full size
				newWidth=this.width;
				newHeight=this.height;
			}
			if(debug) console.log("size without whitespace:"+newWidth+"x"+newHeight);
			
			var x2crop=0;
			var x2crop2=0;
			var y2crop=0;
			var y2crop2=0;
			if(width === 10000 && height === 10000){
				nw=newWidth;
				nh=newHeight;
				width=newWidth;
				height=newHeight;
			}else{
				if(crop){
					// resize and crop
					var ratio=width/newWidth;
					var nw=width;
					var nh=(newHeight*ratio);
					if(nh < height){
						ratio=height/newHeight;
						nw=(newWidth*ratio);
						nh=height;
					}
					if(nw>width){
						x2crop=((nw-width)/2);
						x2crop2=((nw-width)/2);
					}
					if(nh>height){
						y2crop=((nh-height)/2);
						y2crop2=((nh-height)/2);
						
					}
					xcrop+=(x2crop/2)/ratio;
					ycrop+=(y2crop/2)/ratio;
					if(debug) console.log("crop | left:"+x2crop+" | top:"+y2crop+" | right:"+x2crop2+" | bottom:"+y2crop2);
				}else{
					// resize preserving scale	
					var ratio=width/newWidth;
					var nw=width;
					var nh=Math.ceil(newHeight*ratio);
					if(nh > height){
						ratio=height/newHeight;
						nw=Math.ceil(newWidth*ratio);
						nh=height;
					}
				}
			}
			
			if(this.width<nw){
				if(debug) console.log("width exceeded original");
				ratio=this.width/nw;
				width=this.width;
				nw=this.width;
				nh=this.height;//ratio*this.height;
				height=nh;
				xcrop=0;
				ycrop=0;
				x2crop=0;
				y2crop=0;
			}
			if(this.height<nh){
				if(debug) console.log("height exceeded original");
				ratio=this.height/nh;
				height=this.height;
				nh=this.height;
				nw=this.width;//ratio*this.width;
				xcrop=0;
				ycrop=0;
				x2crop=0;
				y2crop=0;
			}
			/*newWidth+=10;
			newHeight+=10;
			*/
			if(debug) console.log("final size:"+nw+"x"+nh);
			if(debug) console.log("sizes:"+width+"x"+height+":"+this.width+"x"+this.height);
			
			var end = new Date().getTime();
			var time2 = end - time;
			//if(debug) 
			if(debug) console.log((time2/1000)+" seconds to detect crop");
			var time=new Date().getTime();
			
			if(debug) console.log(Math.ceil(xcrop)+" | "+Math.ceil(ycrop)+" | "+Math.floor(newWidth-(x2crop))+" | "+Math.floor(newHeight-(y2crop))+" | "+-Math.ceil(x2crop/2)+" | "+-Math.ceil(y2crop/2)+" | "+Math.ceil(nw)+" | "+Math.ceil(nh));
			if(width <= 10 || width >= 1000 || height <= 10 || height >= 1000){
				if(debug) console.log("Failed to draw canvas because computed width x height was invalid: "+width+"x"+height);
				return;
			}
			canvas.width=width;
			canvas.height=height;
			if(debug) console.log(newWidth+":"+newHeight+":"+canvas.height+":"+Math.ceil(nh)+":"+Math.ceil(y2crop));
			context.drawImage(imageObj, Math.ceil(xcrop), Math.ceil(ycrop), Math.floor(newWidth-(xcrop*2)), Math.floor(newHeight-(ycrop*2)),-Math.ceil(x2crop/2), -Math.ceil(y2crop/2), Math.ceil(nw), Math.ceil(nh));
			obj.appendChild(canvas);
			var end = new Date().getTime();
			var time = end - start;
			//if(debug) 
			if(debug) console.log((time/1000)+" seconds to crop image");
		};
		imageObj.src = imageURL;
	}

	function zImageLazyLoadUpdate(currSlideElement, nextSlideElement, options, forwardFlag){
		var d='zUniqueSlideshowLargeId';
		var id=parseInt(nextSlideElement.parentNode.id.substr(d.length, nextSlideElement.parentNode.id.length-d.length));
		var i=zGetSlideShowId(id);
		if(zArrSlideshowIds[i].moveSliderId !== false){
			if(zArrSlideshowIds[i].ignoreNextRotate===false && zArrSlideshowIds[i].rotateIndex % zArrSlideshowIds[i].movedTileCount === 0){
				zArrSlideshowIds[i].ignoreNextRotate=true;
				$('.zlistingslidernext'+zArrSlideshowIds[i].id).trigger("click");
				if(zArrSlideshowIds[i].rotateGroupIndex+1===3){
					zArrSlideshowIds[i].rotateGroupIndex=0;
				}else{
					zArrSlideshowIds[i].rotateGroupIndex++;
				}
			}
			zArrSlideshowIds[i].ignoreNextRotate=false;
			if(zArrSlideshowIds[i].rotateIndex+1===zArrSlideshowIds[i].movedTileCount*3){
				zArrSlideshowIds[i].rotateIndex=0;
			}else{
				zArrSlideshowIds[i].rotateIndex++;
			}
		}
		var d1=document.getElementById(nextSlideElement.id+"_img");
		var d2=document.getElementById(currSlideElement.id+"_img");
		if(d1 && d1.src !== nextSlideElement.title){
			d1.src=nextSlideElement.title;
		}
		if(d2 && d2.src !== nextSlideElement.title){
			d2.src=currSlideElement.title;
		}
	}
	function zLoadHomeSlides(id){
		var c=0;
		for(var i=0;i<zArrSlideshowIds.length;i++){
			if(zArrSlideshowIds[i].id === id){
				zArrSlideshowIds[i].rotateIndex=0;
				zArrSlideshowIds[i].rotateGroupIndex=0;
				zArrSlideshowIds[i].ignoreNextRotate=true;
				c=zArrSlideshowIds[i];	
				break;
			}
		}
		zSlideshowSetupSliderButtons(c);
		if(c.layout===2 || c.layout === 0){
			$('#zUniqueSlideshowLargeId'+c.id).cycle({
				before: zImageLazyLoadUpdate,
				fx: 'fade',
				startingSlide: 0,
				timeout: c.slideDelay
			});
		}
		if(c.layout === 1 || c.layout === 0){
			var d=c.slideDelay;
			var e1="slide";
			if(c.slideDirection==='y'){
				e1='verticalslide';//'fade';
			}
			if(c.layout===0){
				d=false;
				
			}
			// thumbnails	
			$('#zUniqueSlideshowId'+c.id).slides({
				newClassNames:true,
				newId: c.id,
				play: d,
				pause: d,
				effect:e1,
				next: 'zlistingslidernext'+c.id,
				prev: 'zlistingsliderprev'+c.id,
				hoverPause: false
			});
		}
		zLoadAndCropImages();
	}
	function zGetSlideShowId(id){
		for(var i=0;i<zArrSlideshowIds.length;i++){
			if(zArrSlideshowIds[i].id === id){
				return i;
			}
		}
		return false;
	}

	function zUpdateListingSlides(id, theLink){
		var c=0;
		for(var i=0;i<zArrSlideshowIds.length;i++){
			if(zArrSlideshowIds[i].id === id){
				c=zArrSlideshowIds[i];	
				break;
			}
		}
		$.ajax({
			url: theLink,
			context: document.body,
			success: function(data){
				if(zArrSlideshowIds[i].layout === 0){
					// need to load both html and init both here
					var a1=data.split("~~~");
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).html(a1[0]);
					var a2='';
					if(zArrSlideshowIds[i].slideDirection==='x'){
						a2+='<div id="zslideshowhomeslidenav'+zArrSlideshowIds[i].id+'">'+document.getElementById('zslideshowhomeslidenav'+zArrSlideshowIds[i].id).innerHTML+'<\/div>';
					}
					a2+='<div class="zslideshow'+zArrSlideshowIds[i].id+'-38-2">		<a href="#" class="zlistingsliderprev'+zArrSlideshowIds[i].id+'"><span class="zlistingsliderprevimg'+zArrSlideshowIds[i].id+'">&nbsp;<\/span><\/a><div id="zslideshowslides'+zArrSlideshowIds[i].id+'"><div id="zlistingcontainer'+zArrSlideshowIds[i].id+'" class="zslideshowslides_container'+zArrSlideshowIds[i].id+'"><div class="zslideshowslide'+zArrSlideshowIds[i].id+'">'+a1[1]+'<\/div><\/div><\/div>		<a href="#" class="zlistingslidernext'+zArrSlideshowIds[i].id+'"><span class="zlistingslidernextimg'+zArrSlideshowIds[i].id+'">&nbsp;<\/span><\/a><\/div>';
					$('#zUniqueSlideshowId'+zArrSlideshowIds[i].id).html(a2);
				}else if(c.layout === 2){
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).html(data);
				}else{
					$('#zUniqueSlideshowId'+zArrSlideshowIds[i].id).html('<div id="zslideshowhomeslidenav'+zArrSlideshowIds[i].id+'">'+document.getElementById('zslideshowhomeslidenav'+zArrSlideshowIds[i].id).innerHTML+'<\/div><div class="zslideshow'+zArrSlideshowIds[i].id+'-38-2">		<a href="#" class="zlistingsliderprev'+zArrSlideshowIds[i].id+'"><span class="zlistingsliderprevimg'+zArrSlideshowIds[i].id+'">&nbsp;<\/span><\/a><div id="zslideshowslides'+zArrSlideshowIds[i].id+'"><div id="zlistingcontainer'+zArrSlideshowIds[i].id+'" class="zslideshowslides_container'+zArrSlideshowIds[i].id+'"><div class="zslideshowslide'+zArrSlideshowIds[i].id+'">'+data+'<\/div><\/div><\/div>		<a href="#" class="zlistingslidernext'+zArrSlideshowIds[i].id+'"><span class="zlistingslidernextimg'+zArrSlideshowIds[i].id+'">&nbsp;<\/span><\/a><\/div>');
				}
				if(window.location.href.indexOf('/z/misc/slideshow/embed') !== -1){
					$('a').attr('target', '_parent');
				}
				zLoadHomeSlides(id);
			}
		});
	}
	function zSlideshowSetupSliderButtons(c){
			$('.zlistingsliderprev'+c.id).bind('click',function(){
				var d='zlistingsliderprev';
				var id=parseInt(this.className.substr(d.length, this.className.length-d.length));
				var i=zGetSlideShowId(id);
				if(zArrSlideshowIds[i].rotateGroupIndex===0){
					zArrSlideshowIds[i].rotateGroupIndex=2;
				}else{
					zArrSlideshowIds[i].rotateGroupIndex--;
				}
				if(zArrSlideshowIds[i].layout === 0 && zArrSlideshowIds[i].rotateIndex !== zArrSlideshowIds[i].rotateGroupIndex * zArrSlideshowIds[i].movedTileCount){
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).cycle('destroy');
					zArrSlideshowIds[i].rotateIndex=zArrSlideshowIds[i].rotateGroupIndex * zArrSlideshowIds[i].movedTileCount;
					zArrSlideshowIds[i].ignoreNextRotate=true;
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).cycle({
						before: zImageLazyLoadUpdate,
						fx: 'fade',
						startingSlide: zArrSlideshowIds[i].rotateIndex,
						timeout: zArrSlideshowIds[i].slideDelay
					});
				}
			});
			$('.zlistingslidernext'+c.id).bind('click',function(){
				var d='zlistingslidernext';
				var id=parseInt(this.className.substr(d.length, this.className.length-d.length));
				var i=zGetSlideShowId(id);
				if(zArrSlideshowIds[i].ignoreNextRotate){
					return;
				}
				if(zArrSlideshowIds[i].rotateGroupIndex===2){
					zArrSlideshowIds[i].rotateGroupIndex=0;
				}else{
					zArrSlideshowIds[i].rotateGroupIndex++;
				}
				if(zArrSlideshowIds[i].layout === 0 && zArrSlideshowIds[i].rotateIndex !== zArrSlideshowIds[i].rotateGroupIndex * zArrSlideshowIds[i].movedTileCount){
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).cycle('destroy');
					zArrSlideshowIds[i].rotateIndex=zArrSlideshowIds[i].rotateGroupIndex * zArrSlideshowIds[i].movedTileCount;
					zArrSlideshowIds[i].ignoreNextRotate=true;
					$('#zUniqueSlideshowLargeId'+zArrSlideshowIds[i].id).cycle({
						before: zImageLazyLoadUpdate,
						fx: 'fade',
						startingSlide: zArrSlideshowIds[i].rotateIndex,
						timeout: zArrSlideshowIds[i].slideDelay
					});
				}
			});
	}
	function zSlideshowInit(){
		for(var i=0;i<zArrSlideshowIds.length;i++){
			$('.zslideshowslides_container'+zArrSlideshowIds[i].id).css("display","block");
			var c=zArrSlideshowIds[i];
			zSlideshowSetupSliderButtons(c);
			//c.slideDelay=1000;
			//zArrSlideshowIds[i].slideDelay=1000;
			zArrSlideshowIds[i].ignoreNextRotate=true;
			if(c.layout === 0){
				zArrSlideshowIds[i].moveSliderId='#zUniqueSlideshowId'+c.id;
			}else{
				zArrSlideshowIds[i].moveSliderId=false;
			}
				//	zArrSlideshowIds[i].slideDelay=2000;
					//c.slideDelay=2000;
			if(c.layout===2){
				var slideCount=zGetChildElementCount('zUniqueSlideshowLargeId'+c.id);
				if(slideCount===0){
					document.getElementById("zUniqueSlideshowContainerId"+c.id).style.display="none";
				}else if(slideCount===1){
					var d0=document.getElementById("zUniqueSlideshowLargeId"+c.id);
					var d_0=0;
					if(d0.childNodes[0].nodeName==="#text"){
						d_0=1;
					}
					var d1=document.getElementById(d0.childNodes[d_0].id+"_img");
					if(d1 && d1.src !== d0.childNodes[d_0].title){
						d1.src=d0.childNodes[d_0].title;
					}	
				}
			}
			if(c.layout===2 || c.layout === 0){
				if(c.slideDelay === 0){
					c.slideDelay=4000;
					zArrSlideshowIds[i].slideDelay=4000;
				}
				$('#zUniqueSlideshowLargeId'+c.id).cycle({
					before: zImageLazyLoadUpdate,
					fx: 'fade',
					timeout: c.slideDelay
				});
			}
			if(c.layout === 1 || c.layout===0){
				var d=c.slideDelay;
				var e1="slide";
				if(c.slideDirection==='y'){
					e1='verticalslide';//'fade';
				}
				if(c.layout===0){
					d=false;//c.slideDelay*zGetChildElementCount('zUniqueSlideshowLargeId'+c.id);
					
				}
				// thumbnails	
				$('#zUniqueSlideshowId'+c.id).slides({
					newClassNames:true,
					newId: c.id,
					play: d,
					pause: d,
					effect:e1,
					next: 'zlistingslidernext'+c.id,
					prev: 'zlistingsliderprev'+c.id,
					hoverPause: false
				});
			}
				if(window.location.href.indexOf('/z/misc/slideshow/embed') !== -1){
					$('a', document.body).attr('target', '_parent');
				}
		}
	}
	function zSlideshowClickLink(u){
		if(window.location.href.indexOf('/z/misc/slideshow/embed') !== -1){
			top.location.href=u;
		}else{
			window.location.href=u;
		}
			
	}

	function loadDetailGallery(){
		var c="zGalleryViewSlideshow";
		var a=zGetElementsByClassName(c);
		for(var i=0;i<a.length;i++){
			if($("li", a[i]).length){
				$("#"+a[i].id)[0].parentNode.setAttribute("data-galleryview-id", a[i].id);
				var d2=document.getElementById(a[i].id+"_data").value;
				var myObj=eval("("+d2+")");
				zArrGalleryViewSlideshowTemplate[a[i].id]={
					html:$("#"+a[i].id).prop('outerHTML'),
					originalWidth:myObj.panel_width,
					originalThumbWidth:myObj.frame_width
				};
			}
		}
		//reloadDetailGallery();
		/*
		for(var i=0;i<a.length;i++){
			$(a[i]).show().galleryView(myObj);
		}*/
	}
	function reloadDetailGalleryTimeout(){
		clearTimeout(zGalleryReloadTimeoutId);
		zGalleryReloadTimeoutId=setTimeout(reloadDetailGallery, 200);
	}
	function reloadDetailGallery(){
		var c="zGalleryViewSlideshowContainer";
		var a2=zGetElementsByClassName(c);
		for(var i=0;i<a2.length;i++){
			var id=a2[i].getAttribute("data-galleryview-id");
			if(typeof zArrGalleryViewSlideshowTemplate[id] != "undefined"){
				var b=zArrGalleryViewSlideshowTemplate[id];
				a2[i].innerHTML=b.html;
				var d2=document.getElementById(id+"_data").value;
				var myObj=eval("("+d2+")");
				var windowWidth=$(window).width()*.9;
				var parentWidth=$(a2[i]).parent().width();
				if(!isNaN(parentWidth) && parentWidth != 0 && parentWidth<windowWidth){
					var width=Math.min(parentWidth, b.originalWidth);
				}else{
					var width=Math.min(windowWidth, b.originalWidth);
				}
				var thumbWidth=Math.min(Math.abs(windowWidth/4), b.originalThumbWidth);
				var ratio=width/myObj.panel_width;
				var thumbRatio=thumbWidth/myObj.frame_width;
				myObj.panel_width=width;
				myObj.panel_height=Math.abs(myObj.panel_height*ratio);
				myObj.frame_width=thumbWidth;
				myObj.frame_height=Math.abs(myObj.frame_height*thumbRatio); 
				$("#"+id).show().galleryView(myObj);
			}
		}
	}
	zArrLoadFunctions.push({functionName:loadDetailGallery});
	//zArrLoadFunctions.push({functionName:reloadDetailGalleryTimeout});
	zArrResizeFunctions.push({functionName:reloadDetailGalleryTimeout});

	window.zLoadAndCropImages=zLoadAndCropImages;
	window.zLoadAndCropImagesDefer=zLoadAndCropImagesDefer;
	window.zLoadAndCropImage=zLoadAndCropImage;
	window.zImageLazyLoadUpdate=zImageLazyLoadUpdate;
	window.zLoadHomeSlides=zLoadHomeSlides;
	window.zGetSlideShowId=zGetSlideShowId;
	window.zUpdateListingSlides=zUpdateListingSlides;
	window.zSlideshowSetupSliderButtons=zSlideshowSetupSliderButtons;
	window.zSlideshowInit=zSlideshowInit;
	window.zSlideshowClickLink=zSlideshowClickLink;
	window.loadDetailGallery=loadDetailGallery;
	window.reloadDetailGalleryTimeout=reloadDetailGalleryTimeout;
	window.reloadDetailGallery=reloadDetailGallery;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/login-functions.js */
var zLoggedIn=false;

(function($, window, document, undefined){
	"use strict";
	function zIsAdminLoggedIn(){
		if(!zIsLoggedIn()){
			return false;
		}

		var d=zGetCookie("ZISADMIN");
		if(d === "1"){
			return true;
		}else{
			return false;
		}
	}
	var showingIdleLogoutWarning=false;

	function zIsLoggedIn(){
		var loggedIn=zGetCookie("ZLOGGEDIN");
		var d=zGetCookie("ZSESSIONEXPIREDATE");
		if(loggedIn === "1" && d !== ""){
			var n=new Date(d.toLocaleString()); 
			var newDate=new Date();
			if(n < newDate){
				if(showingIdleLogoutWarning){
					showingIdleLogoutWarning=false;
					zCloseModal();
				}
				zDeleteCookie("ZSESSIONEXPIREDATE");
				return false;
			}else{
				
				var secondsBeforeLogout=130;
				if(n-newDate-30<=secondsBeforeLogout*1000){ 
					if(!showingIdleLogoutWarning){
						showingIdleLogoutWarning=true;
						var modalContent1='<h2>Idle Session Warning</h2><p>You will be logged out in <span id="zIdleWarningDiv1"></span> seconds.</p><p><strong><a href="##" id="zIdleWarningButton" style="border-radius:5px; padding:5px; padding-left:10px; padding-right:10px; text-decoration:none; background-color:#666; color:#FFF;">Continue session</a> <a href="##" id="zIdleLogoutButton" style="border-radius:5px; padding:5px; padding-left:10px; padding-right:10px; text-decoration:none; background-color:#666; color:#FFF;">Log Out</a></strong></p>';
						zShowModal(modalContent1,{'width':370,'height':180, 'disableClose':true});
						$("#zIdleLogoutButton").bind("click", function(e){
							e.preventDefault();
							window.location.replace('/z/user/home/index?zlogout=1');
						});
						$("#zIdleWarningButton").bind("click", function(e){
							e.preventDefault();

							var obj={
								id:"zContinueSession",
								method:"get",
								callback:function(r){
									console.log('Session extended');
								},
								errorCallback:function(){ alert('Unknown error occurred'); },
								url:"/z/user/home/extendSession"
							}; 
							zAjax(obj);
							showingIdleLogoutWarning=false;
							zCloseModal();
						});
					}
					$("#zIdleWarningDiv1").html(Math.round((n-newDate)/1000));
				}else{
					if(showingIdleLogoutWarning){
						showingIdleLogoutWarning=false;
						zCloseModal();
					}
				}
				return true;
			}
		}else{
			if(showingIdleLogoutWarning){
				showingIdleLogoutWarning=false;
				zCloseModal();
			}
			showingIdleLogoutWarning=false;
			return false;
		}
	}
	var zWasLoggedIn=false;
	var zLoggedInTimeoutID=false;

	zArrDeferredFunctions.push(function(){
		/*if(zIsTestServer() || zIsDeveloper()){
			return;
		}*/
		zLoggedInTimeoutID=setInterval(function(){
			zLoggedIn=zIsLoggedIn(); 
			if((typeof zUserLoggedIn != "undefined" || zWasLoggedIn) && !zLoggedIn){
				// this was a login protected page, we must redirect away for security.
				document.body.innerHTML='Your session has expired.';
				var isAdmin=zGetCookie("ZISADMIN");
				if(isAdmin=="1"){
					window.location.replace('/z/expired-admin.htm');
				}else{
					window.location.replace('/z/expired.htm');
				}
			}
			if(zLoggedIn){
				zWasLoggedIn=true;
			}
		}, 1000);
	});

	var zLogin={
		autoLoginValue:-1,
		autoLoginCallback:0,
		devLogin:false,
		devLoginURL:"",
		loginErrorCallback:function(r){
			console.log("Login service temporarily unavailable. Try again later.");
			zLogin.enableLoginButtons();
		},
		enterPressed:false,
		lastKeyPressed:0,
		loginCallback:function(r){
			var json=eval('(' + r + ')');
			// supplement ip developer security with cookie to identify a single computer from the IP.
			if(typeof json.developer !== "undefined"){
				// cookie expires one year in future
				zSetCookie({key:"ZDEVELOPER",value:json.developer,futureSeconds:31536000,enableSubdomains:false}); 
			}
			if(json.success){
				zLogin.zShowLoginError("Logging in...");
				var d1=window.parent.document.getElementById("zRepostForm");
				if(d1){
					setTimeout('window.parent.document.zRepostForm.submit();',5000);
					d1.submit();
				}
			}else{
				zLogin.zShowLoginError('<strong>'+json.errorMessage+'<\/strong>');
				zLogin.enableLoginButtons();
			}
			zLogin.enableLoginButtons();
		},
		disableLoginButtons:function(){
			document.getElementById("submitForm").disabled=true;
			document.getElementById("submitForm2").disabled=true;
		},
		enableLoginButtons:function(){
			document.getElementById("submitForm").disabled=false;
			document.getElementById("submitForm2").disabled=false;
		},
		zAjaxResetPasswordCallback:function(r){
			var json=eval('(' + r + ')');
			if(typeof json === "object"){
				if(json.success){
					zLogin.zShowLoginError("Reset password email sent. Click the link in the email to complete the process.");
				}else{
					zLogin.zShowLoginError(json.errorMessage);
				}
			}else{
				zLogin.zShowLoginError("The username provided is not a valid user.");
			}
			zLogin.enableLoginButtons();
		},
		zAjaxResetPassword:function(){
			var tempObj={};
			tempObj.id="zAjaxUserResetPassword";
			tempObj.url="/z/user/preference/update";
			if(document.getElementById('z_tmpusername2').value.length===""){
				zLogin.zShowLoginError("Email and the new password are required before clicking \"Reset Password\".");
				return;
			}
			if(document.getElementById('z_tmppassword2').value.length===""){
				zLogin.zShowLoginError("You must enter a new password before clicking \"Reset Password\"");
				return;
			}
			tempObj.postObj={
				k:"",
				e:document.getElementById('z_tmpusername2').value,
				user_password:document.getElementById('z_tmppassword2').value,
				submitPref:"Reset Password"
			};
			tempObj.method="post";
			tempObj.cache=false;
			tempObj.errorCallback=zLogin.loginErrorCallback;
			tempObj.callback=zLogin.zAjaxResetPasswordCallback;
			tempObj.ignoreOldRequests=true;
			zAjax(tempObj);	
			return false;
		},
		zShowLoginError:function(message){
			var d2=document.getElementById('statusDiv');
			if(d2){
				d2.style.display="block";
				d2.innerHTML='<span style="color:#900;">'+message+'<\/span>';
				document.getElementById("submitForm2").style.display="block";
				document.getElementById("submitForm").style.display="block";
			}
		},
		setAutoLogin:function(r){ 
			if (r===true){
				zLogin.autoLoginValue="1";
				zSetCookie({key:"zautologin",value:"1",futureSeconds:60,enableSubdomains:false}); 
			}else{
				zLogin.autoLoginValue="0";
				zSetCookie({key:"zautologin",value:"0",futureSeconds:60,enableSubdomains:false}); 
			}
			//zLogin.autoLoginCallback();
		},
		checkAutoLogin:function(){

			if(document.getElementById("zRememberLogin").checked){
				zLogin.setAutoLogin(true);
			}else{
				zLogin.setAutoLogin(false);
			}
		},
		/*autoLoginPrompt:function(callback){
			zSetCookie({key:"zautologin",value:"",futureSeconds:60,enableSubdomains:false}); 
			// Avoid calling the model window again during this login session
			if(zLogin.autoLoginValue===-1 && zGetCookie("zautologin") === ""){
				zLogin.autoLoginCallback=callback;
				var modalContent1='<div class="zmember-autologin-heading">Do you want to<br />login automatically<br />in the future?<\/div><div><a class="zmember-autologin-button" style="border:2px solid #000;" href="#" onclick="zLogin.setAutoLogin(true);zCloseModal();return false;">Yes<\/a>   <a class="zmember-autologin-button" href="#"  style="border:2px solid #999;" onclick="zLogin.enterPressed=false;zLogin.setAutoLogin(false);zCloseModal();return false;">No<\/a><\/div>';
				zShowModal(modalContent1,{'disableClose':true,'width':Math.min(350, zWindowSize.width-50),'height':Math.min(250, zWindowSize.height-50),"maxWidth":350, "maxHeight":250});
				$(window).keypress(function(event){
					if(event.keyCode === 13){
						if(zLogin.lastKeyPressed===13){
							return;
						}
						if(zLogin.enterPressed){
							zLogin.enterPressedTwice=true;
						}
						zLogin.enterPressed=true;
						zLogin.lastKeyPressed=13; 
					}
				});
				$(window).bind("keyup", function(event){
						zLogin.lastKeyPressed=0;
						if(zLogin.enterPressedTwice && event.keyCode === 13){
							zLogin.startKeyPressCheck=false;
							zLogin.setAutoLogin(true);
							zCloseModal();
						}
					}
				});
				$("#zModalOverlayDiv").focus();
			}else{
				callback();
			}
		},*/
		startKeyPressCheck:false,
		autoLoginConfirm:function(){
			zLogin.autoLoginCallback=zLogin.zAjaxSubmitLogin;
			if(document.getElementById("zRememberLogin").checked){
				zLogin.setAutoLogin(true);
			}else{
				zLogin.setAutoLogin(false);
			}
			zLogin.zAjaxSubmitLogin();
			//zLogin.autoLoginPrompt(zLogin.zAjaxSubmitLogin);
			return false;
		},
		zAjaxSubmitLogin:function(){
			var tempObj={};
			tempObj.id="zAjaxUserLogin"; 
			tempObj.url="/z/user/login/process";
			zLogin.zShowLoginError("Processing login credentials...");
			if(document.getElementById('z_tmpusername2').value.length==="" || document.getElementById('z_tmppassword2').value.length===""){
				zLogin.zShowLoginError("Email and password are required.");
				return;
			}
			tempObj.postObj={
				z_tmpusername2:document.getElementById('z_tmpusername2').value,
				z_tmppassword2:document.getElementById('z_tmppassword2').value,
				zIsMemberArea:document.getElementById('zIsMemberArea').value,
				zautologin:zLogin.autoLoginValue
			};
			tempObj.method="post";
			tempObj.cache=false;
			tempObj.errorCallback=zLogin.loginErrorCallback;
			tempObj.callback=zLogin.loginCallback;
			tempObj.ignoreOldRequests=true;
			zAjax(tempObj);	
			return false;
		},
		openidAutoConfirm:function(dev){
			zLogin.checkAutoLogin();
			zLogin.zOpenidLogin2();
			//zLogin.autoLoginPrompt(zLogin.zOpenidLogin);
		},
		openidAutoConfirm2:function(theLink){
			zLogin.devLoginURL=theLink;
			zLogin.checkAutoLogin();
			zLogin.zOpenidLogin2();
			//zLogin.autoLoginPrompt(zLogin.zOpenidLogin);
		},
		zOpenidLogin2:function(){
			window.location.href=zLogin.devLoginURL;
		},
		zOpenidLogin3:function(devLoginURL){
			window.location.href=devLoginURL;
		},
		zOpenidLogin:function(dev){
			var d1=0;
			if(dev){
				d1=document.getElementById("openidhiddenurl2");
			}else{
				d1=document.getElementById("openidhiddenurl");
			}
			d2=document.getElementById("openidurl");
			zSetCookie({key:"zopenidurl",value:d2.value,futureSeconds:315360000,enableSubdomains:false}); 
			if(d2.value === "" || (d2.value.substr(0,7) !== "http://" && d2.value.substr(0,8) !== "https://")){
				alert('You must enter an OpenID Provider URL or click one of the Google / Yahoo login buttons.');
				return;
			}
			window.location.href=d2.value+d1.value;
			return;
		},
		checkIfPasswordsMatch:function(){
			var d1=document.getElementById("passwordPwd");
			var d2=document.getElementById("passwordPwd2");
			var d3=document.getElementById("passwordMatchBox");
			if(d1.value===""){
				return true;
			}else if(d1.value !== d2.value){
				d3.style.display="block";
				return false;
			}else{
				d3.style.display="none";
				return true;
			}
		},
		confirmToken:function(){
			var tempObj={};
			tempObj.id="zAjaxConfirmToken";
			tempObj.method="post";
			tempObj.cache=false;
			tempObj.errorCallback=zLogin.loginErrorCallback;
			tempObj.callback=zLogin.confirmTokenCallback;
			tempObj.ignoreOldRequests=true;
			tempObj.url="/z/user/login/confirmToken";
			
			if(typeof zLoginServerToken !== "undefined" && zLoginServerToken.loggedIn){
				tempObj.postObj={
					tempToken:zLoginServerToken.token
				};
				if(typeof zLoginServerToken.developer !== "undefined"){
					zSetCookie({key:"ZDEVELOPER",value:zLoginServerToken.developer,futureSeconds:31536000,enableSubdomains:false}); 
				};
				zAjax(tempObj);	
				return false;
			}else if(typeof zLoginParentToken !== "undefined" && zLoginParentToken.loggedIn){
				if(typeof zLoginParentToken.developer !== "undefined"){
					zSetCookie({key:"ZDEVELOPER",value:zLoginParentToken.developer,futureSeconds:31536000,enableSubdomains:false}); 
				};
				tempObj.postObj={
					tempToken:zLoginParentToken.token
				};
				zAjax(tempObj);	
				return false;
			}else{
				/*
				// show message that you can login to parent domain
				var d1=document.getElementById('loginFooterMessage');
				var d2='Global login available for your sites: ';
				var d3=false;
				if(typeof zLoginParentToken !== "undefined"){
					d3=true;
					d2+='<a href="'+zLoginParentToken.loginURL+'" target="_blank">Parent Site Manager Login</a>';
				}
				if(typeof zLoginServerToken !== "undefined"){
					// show message you can login to server manager
					if(d3){
						d2+' or ';
					}
					d2+='<a href="'+zLoginServerToken.loginURL+'" target="_blank">Server Manager Login</a>';
				}
				d1.innerHTML=d2;
				*/
			}
		},
		confirmTokenCallback:function(r){
			var json=eval('(' + r + ')');
			if(typeof json === "object"){
				if(json.success){
					// do the repost form
					zLogin.zShowLoginError("Logging in...");
					var d1=window.parent.document.getElementById("zRepostForm");
					if(d1){
						setTimeout('window.parent.document.zRepostForm.submit();',5000);
						d1.submit();
					}
				}
			}
		},
		init:function(){
			var d1=document.getElementById("z_tmpusername2");
			//var d2=zGetCookie("zparentlogincheck"); d2 === "" || 
			if((typeof d1 !== "undefined") && window.location.href.toLowerCase().indexOf("zlogout=") === -1){
				//zSetCookie({key:"zparentlogincheck",value:"1",futureSeconds:0,enableSubdomains:false}); 
				zLogin.confirmToken();
			}
		}
		
	};
	zArrDeferredFunctions.push(zLogin.init);
	window.zLogin=zLogin;
	window.zIsLoggedIn=zIsLoggedIn;
	window.zIsAdminLoggedIn=zIsAdminLoggedIn;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo/map-functions.js */

(function($, window, document, undefined){
	"use strict";

	function zCreateMap(mapDivId, optionsObj) {
		
		var mapOptions = { 
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		for(var i in optionsObj){
			mapOptions[i]=optionsObj[i];
		}
		var eventObj={};
		if(typeof mapOptions.bindEvents !== "undefined"){
			eventObj=mapOptions.bindEvents;
			delete mapOptions.bindEvents;
		}
		document.getElementById(mapDivId).style.display="block";
		var map = new google.maps.Map(document.getElementById(mapDivId), mapOptions);
		for(var i in eventObj){
			google.maps.event.addListener(map, i, eventObj[i]);
		}
		return map;
	}
	var globalInfoWindow=null;
	function zCreateMapMarker(markerObj){
		if(typeof markerObj === 'undefined'){
			markerObj={};
		}
		var eventObj={};
		var infoWindowHTML="";
		if(typeof markerObj.infoWindowHTML !== "undefined"){
			infoWindowHTML=markerObj.infoWindowHTML;
			delete markerObj.infoWindowHTML;
		}
		if(typeof markerObj.bindEvents !== "undefined"){
			eventObj=markerObj.bindEvents;
			delete markerObj.bindEvents;
		}
		var marker = new google.maps.Marker(markerObj);
		for(var i in eventObj){
			google.maps.event.addListener(marker	, i, eventObj[i]);
		} 
		if(!globalInfoWindow){
			globalInfoWindow = new google.maps.InfoWindow({
				content: ""
			});
		}
		if(infoWindowHTML !== ""){
			marker.infoWindowHTML=infoWindowHTML; 
			google.maps.event.addListener(marker	, 'click', function(){ 
				globalInfoWindow.close();
				globalInfoWindow.setPosition(marker.getPosition());
				globalInfoWindow.setContent(marker.infoWindowHTML);
				globalInfoWindow.open(marker.getMap(), marker);
			});
		}
		return marker;
	}

	function zMapFitMarkers(mapObj, arrMarker){ 
		if(arrMarker.length === 0){
			return;
		}else if(arrMarker.length === 1){
			if(arrMarker[0].getPosition().lat() !== 0){
				mapObj.setCenter(arrMarker[0].getPosition());
				mapObj.setZoom(10);
			}
			return;
		}
		var bounds = new google.maps.LatLngBounds ();
		var extended=false;
		for (var i = 0, LtLgLen = arrMarker.length; i < LtLgLen; i++) {
			if(typeof arrMarker[i].getPosition() !== "undefined" && arrMarker[i].getPosition().lat() !== 0){
				bounds.extend(arrMarker[i].getPosition());
				extended=true;
			}
		} 
		if(extended){
			mapObj.fitBounds(bounds);
		} 
	} 
	function zAddMapMarkerByLatLng(mapObj, markerObj, latitude, longitude, successCallback){ 
		var marker=zCreateMapMarker(markerObj); 
		var location=new google.maps.LatLng( latitude, longitude);
		marker.setPosition(location);
		marker.setMap(mapObj);
		if(typeof successCallback !== "undefined"){
			setTimeout(function(){ successCallback(marker, location); }, 10);
		}
		return marker;
	}
	function zGetLatLongByAddress(address, successCallback, delayMilliseconds){ 
		var geocoder = new google.maps.Geocoder(); 
		if(typeof delayMilliseconds === 'undefined'){
			delayMilliseconds=0;
		}
		setTimeout(function(){
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) { 
					successCallback(results[0].geometry.location);
				} else {
					console.log('Geocode was not successful for address, "'+address+'", for the following reason: ' + status);
				}
			});
		}, delayMilliseconds);
	}
	function zAddMapMarkerByAddress(mapObj, markerObj, address, successCallback, delayMilliseconds){ 
		var marker=zCreateMapMarker(markerObj);
		var geocoder = new google.maps.Geocoder(); 
		if(typeof delayMilliseconds === 'undefined'){
			delayMilliseconds=0;
		}
		setTimeout(function(){
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) { 
					marker.setPosition(results[0].geometry.location);
					marker.setMap(mapObj);
					if(typeof successCallback !== "undefined"){
						successCallback(marker, results[0].geometry.location);
					}
				} else {
					console.log('Geocode was not successful for address, "'+address+'", for the following reason: ' + status);
				}
			});
		}, delayMilliseconds);
		return marker;
	}
	function zCreateMapWithAddress(mapDivId, address, optionsObj, successCallback, markerObj) {
		var marker=zCreateMapMarker(markerObj); 
		var geocoder = new google.maps.Geocoder(); 
		if(address.length === ""){ 
			if(typeof optionsObj.defaultAddress !== "undefined"){
				address=optionsObj.defaultAddress;
			}else{
				return;
			}
		}
		var mapOptions = {
			zoom: 8,
	   		center: new google.maps.LatLng(0, 0),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		for(var i in optionsObj){
			mapOptions[i]=optionsObj[i];
		} 
		var map=zCreateMap(mapDivId, mapOptions); 
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				setTimeout(function(){
					google.maps.event.trigger(map, 'resize');
					map.setCenter(results[0].geometry.location); 
				}, 1);
				marker.setPosition(results[0].geometry.location);
				marker.setMap(map);
				if(typeof mapOptions.triggerEvents !== "undefined"){
					for(var i in mapOptions.triggerEvents){
						google.maps.event.trigger(map, i);
					}
				} 
				successCallback(marker); 
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
		return { map: map, marker: marker};
	}
	function zCreateMapWithLatLng(mapDivId, latitude, longitude, optionsObj, successCallback, markerObj) {  
		var mapOptions = {
			zoom: 8,
	   		center: new google.maps.LatLng(latitude, longitude),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		for(var i in optionsObj){
			mapOptions[i]=optionsObj[i];
		} 
		var map=zCreateMap(mapDivId, mapOptions); 
		if(typeof markerObj === "undefined"){
			markerObj={};
		}
		markerObj.position=mapOptions.center;
		markerObj.map=map;
		var marker=zCreateMapMarker(markerObj);  
		if(typeof mapOptions.triggerEvents !== "undefined"){
			for(var i in mapOptions.triggerEvents){
				google.maps.event.trigger(map, i);
			}
		} 
		successCallback(marker); 
		return { map: map, marker: marker};
	}

	window.zCreateMap=zCreateMap;
	window.zCreateMapMarker=zCreateMapMarker;
	window.zMapFitMarkers=zMapFitMarkers;
	window.zAddMapMarkerByLatLng=zAddMapMarkerByLatLng;
	window.zGetLatLongByAddress=zGetLatLongByAddress;
	window.zAddMapMarkerByAddress=zAddMapMarkerByAddress;
	window.zCreateMapWithAddress=zCreateMapWithAddress;
	window.zCreateMapWithLatLng=zCreateMapWithLatLng;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/menu-functions.js */
 
var zValues=[];
var zFormData=new Object();
	var zTouchPosition={x:[0],y:[0],curX:[0],curY:[0],count:0,curCount:0};
if(typeof window.zMenuDisablePopups === "undefined"){
	window.zMenuDisablePopups=false;	
}
var arrOriginalMenuButtonWidth=[]; 

(function($, window, document, undefined){
	"use strict";
	var zMenuButtonCache=new Array();
	var zMenuDivIndex=0;
	var zTabletStylesheetLoaded=false;


	function zInitZValues(v){
		for(var i=0;i<v;i++){
			zValues[i]=[];	
		}
	}
	function zFixMenuOnTablets(){
		var a=zGetElementsByClassName("trigger");
		$(".zMenuBarDiv ul").css("display", "none");
		for(var i=0;i<a.length;i++){
			a[i].onmousedown=function(){ 
				var pos=zGetAbsPosition(this);
				var pos2=$(this).position();
				var c2=document.getElementById(this.parentNode.id+"_menu"); 
				if(zContentTransition.firstLoad===false){
					$(this).children("ul").css("display","block");
				} 
				if(c2){
					 c2.style.position="absolute";
					 var vertical=zo(this.id.split("_")[0]+"Vertical");
					 if(vertical){
						 c2.style.top=(pos2.top)+"px";c2.style.left=(pos2.left+pos.width)+"px";
					 }else{ 
						 c2.style.top=(pos2.top+pos.height)+"px";c2.style.left=pos2.left+"px";
					 }
				}
			}; 
			a[i].onclick=function(){  
				if(zWindowSize.width < 960){
					return true;
				}
				var c2=document.getElementById(this.parentNode.id+"_menu"); 
				var currentDisplay=c2.style.display;
				$(".zMenuBarDiv ul").css("display", "none");
				c2.style.display='block'; 
				if(c2){
					if(currentDisplay!='none'){
						var v=zContentTransition.doLinkOnClick(this); 
						if(v){
							$(".zMenuBarDiv ul").css("display", "none");
						}
						return v;
					}else{
						return false;
					}
				}else{
					var v=zContentTransition.doLinkOnClick(this); 
					if(v){
						$(".zMenuBarDiv ul").css("display", "none");
					}
					return v;
				} 
			};
		}
	}
	zArrDeferredFunctions.push(function(){
		$(document.body).bind('touchstart', function (event) {
			zTouchPosition.x=[];
			zTouchPosition.y=[];
			if(typeof event.targetTouches === "undefined"){
				return;
			}
			zTouchPosition.count=event.targetTouches.length;
			for(var i=0;i<event.targetTouches.length;i++){
				zTouchPosition.x.push(event.targetTouches[i].pageX);
				zTouchPosition.y.push(event.targetTouches[i].pageY);
			}
		});
		$(document.body).bind('touchmove', function (event) {
			zTouchPosition.curX=[];
			zTouchPosition.curY=[];
			if(typeof event.targetTouches === "undefined"){
				return;
			}
			for(var i=0;i<event.targetTouches.length;i++){
				zTouchPosition.curX.push(event.targetTouches[i].pageX);
				zTouchPosition.curY.push(event.targetTouches[i].pageY);
			} 
		});  
		$(document.body).bind('touchend', function (event) {
			zTouchPosition.x=[];
			zTouchPosition.y=[];
			zTouchPosition.curX=[];
			zTouchPosition.curY=[];
			if(typeof event.targetTouches === "undefined"){
				return;
			}
			zTouchPosition.count=event.targetTouches.length;
			for(var i=0;i<event.targetTouches.length;i++){
				zTouchPosition.curX.push(event.targetTouches[i].pageX);
				zTouchPosition.curY.push(event.targetTouches[i].pageY);
				zTouchPosition.x.push(event.targetTouches[i].pageX);
				zTouchPosition.y.push(event.targetTouches[i].pageY);
			}
		}); 
		
		
	});
	function zMenuInit(){ // modified version of v1.1.0.2 by PVII-www.projectseven.com 
		//if(zMSIEBrowser==-1){return;}
		//return;
		var i,k,g,lg,r=/\s*zMenuHvr/,nn='',c,bv='zMenuDiv';
		 lg=document.getElementsByTagName("LI"); 
		var $wrapper=$(".zMenuWrapper").css("visibility", "visible").show();

		var arrButtons=$(".trigger", $wrapper);
		arrButtons.each(function(){
			if(this.href==window.location.href){
				$(this).addClass("trigger-selected");
			}
		});
		 $(".zMenuWrapper").each(function(){ 
			 if(this.className.indexOf('zMenuEqualDiv') === -1){
				 return; 
			 } 
			var arrA=$(".zMenuWrapper > ul > li > a");
			var menuWidth=$(".zMenuBarDiv", this).width();
			var borderTotal=0; 
			$(this).width(menuWidth);
			if(arrA.length){
				var padding=($(arrA[0]).outerWidth()-$(arrA[0]).width())/2;
			}
			if(this.id === ''){
				this.id='zMenuContainerDiv'+zMenuDivIndex;
				zMenuDivIndex++;
			} 
			var buttonMargin=0;
			if(this.getAttribute("data-button-margin") !== ''){
				buttonMargin=parseInt(this.getAttribute("data-button-margin"));
			}
			 zSetEqualWidthMenuButtons(this.id, buttonMargin);
		 });
		 if(zMenuDisablePopups){
			 $(".zMenuBarDiv .trigger").each(function(){
				 $("ul", this.parentNode).detach();
			});
		 }else if(!zIsTouchscreen()){ 
			 if(lg){
				 for(k=0;k<lg.length;k++){
					if(lg[k].parentNode.id.indexOf("zMenuDiv")!==-1){ 
						zMenuButtonCache.push(lg[k]); 
						 lg[k].onmouseover=function(){
							 var pos=zGetAbsPosition(this);
							 var pos2=$(this).position();
							 var c2=document.getElementById(this.id+"_menu"); 
							if(zContentTransition.firstLoad===false){
								$(this).children("ul").css("display","block");
							}
							if(c2){
								 c2.style.position="absolute";
								 var vertical=zo(this.id.split("_")[0]+"Vertical");
								 if(vertical){
									 c2.style.top=(pos2.top)+"px";c2.style.left=(pos2.left+pos.width)+"px";
								 }else{ 
									 c2.style.top=(pos2.top+pos.height)+"px";c2.style.left=pos2.left+"px";
								 }
								c2.style.zIndex=2000;
							 }
							if(this.className.indexOf('zMenuEqualUL') === -1){ 
								this.className="zMenuHvr";
							 }else{
								this.className="zMenuEqualLI zMenuHvr";
							 } 
						 };
						 lg[k].onmouseout=function(){
							c=this.className;
							if(this.className.indexOf('zMenuEqualUL') === -1){ 
								this.className="zMenuNoHvr";
							}else{ 
								this.className="zMenuEqualLI zMenuNoHvr";
							}
							if(zContentTransition.firstLoad===false){
								$(this).children("ul").css("display","none");
							} 
						 };
					}
				}
			}
		}
		nn=i+1;
		
		if((zTabletStylesheetLoaded===false && zIsTouchscreen())){
			zTabletStylesheetLoaded=true;
			zLoadFile("/z/stylesheets/tablet.css","css");
			zFixMenuOnTablets(); 
		}
	}
	function zHideMenuPopups(){
		//alert(zMenuButtonCache.length);
		for(var i=0;i<zMenuButtonCache.length;i++){
			$(zMenuButtonCache[i]).children("ul").css("display","none");
			//zMenuButtonCache[i].onmouseout();	
		}
		$(".zdc-sub").css("display","none");
		
	}
	/*
	example html:
	<div id="menu" class="zMenuEqualDiv"><ul class="zMenuEqualUL"><li class="zMenuEqualLI"><a href="#" class="zMenuEqualA">test1</a></li><li class="zMenuEqualLI"><a href="#" class="zMenuEqualA">test2</a></li></ul></div>

	example js:
	zSetEqualWidthMenuButtons("menu");
	*/
	function zSetEqualWidthMenuButtons(containerDivId, marginSize){ 
		$("#"+containerDivId).css("visibility", "hidden");

		if(typeof arrOriginalMenuButtonWidth[containerDivId] === "undefined"){
			zArrResizeFunctions.push(function(){ zSetEqualWidthMenuButtons(containerDivId, marginSize); });
		}
		arrOriginalMenuButtonWidth[containerDivId]={
			ul:$("#"+containerDivId+" > ul "),
			arrLI:$("#"+containerDivId+" > ul > li"),
			arrItem:$("#"+containerDivId+" > ul > li > a"),
			arrItemWidth:[],
			arrItemBorderAndPadding:[],
			containerWidth:	0,
			navWidth:0,
			marginSize:marginSize
		};
		var currentMenu=arrOriginalMenuButtonWidth[containerDivId];
		for(var i=0;i<currentMenu.arrItem.length;i++){ 
			$(currentMenu.arrItem[i]).css({
				"width": "auto",
				"min-width":"1px"
			});
			$(currentMenu.arrItem[i]).css({
				"margin-right": "0px"
			});
		}
		$(currentMenu.arrLI).each(function(){ $(this).css("margin-right", "0px"); });

		//console.log("run equal width: "+ containerDivId+":"+currentMenu.arrItem.length);
		var sLen=currentMenu.arrItem.length;
		for(var i=0;i<sLen;i++){ 
			var jItem=$(currentMenu.arrItem[i]);
				/*$(currentMenu.arrItem[i]).css({ 
					"padding-left": "0px",
					"padding-right": "0px"
				});*/
 			jItem.width("auto");
 			//console.log("new auto width:"+jItem.width());
			var curWidth=jItem.width();
			var borderLeft=parseInt(jItem.css("border-left-width"));
			var borderRight=parseInt(jItem.css("border-right-width"));
			if(isNaN(borderLeft)){
				borderLeft=1;
			}
			if(isNaN(borderRight)){
				borderRight=1;
			}
			var curBorderAndPadding=parseInt(jItem.css("padding-left"))+parseInt(jItem.css("padding-right"))+parseInt(borderLeft)+parseInt(borderRight);
			if(jItem.css("box-sizing") == "border-box"){
				curBorderAndPadding=0;
			}
			//console.log("borpad:"+curBorderAndPadding+":"+borderLeft+":"+borderRight+":"+curWidth+":"+jItem.width()+":"+(jItem.css("padding-left"))+":"+(jItem.css("padding-right"))+":"+jItem.css("border-left-width")); 
			$(jItem).css({
				"padding-left":"0px",
				"padding-right":"0px"
			}); 
			if(i===sLen-1){
				//curWidth-=0.5;
				$(jItem).css({
					"margin-right": "0px"
				});
				curWidth=$(jItem).width();
				//console.log("last:"+curWidth);
				$(jItem).css({ 
					"width": curWidth+"px"
				});
				currentMenu.navWidth+=curWidth+curBorderAndPadding; 
				//console.log(curWidth+marginSize+curBorderAndPadding);
			}else{
				$(jItem).css({
					"margin-right": currentMenu.marginSize+"px",
					"width": curWidth
				}); 
				currentMenu.navWidth+=curWidth+marginSize+curBorderAndPadding;
				//console.log(curWidth+marginSize+curBorderAndPadding);
			}
			currentMenu.arrItemBorderAndPadding.push(curBorderAndPadding);
			currentMenu.arrItemWidth.push(curWidth);
		} 
		//console.log(currentMenu.navWidth);
 
		//console.log(currentMenu.marginSize);
		//currentMenu.ul.detach(); 
		//console.log(containerDivId+":"+"containerWidth:"+$("#"+containerDivId).width());
		$("#"+containerDivId).width("100%");
		currentMenu.containerWidth=$("#"+containerDivId).width()-1;
		//console.log(currentMenu.containerWidth+":"+currentMenu.navWidth+":"+currentMenu.marginSize);
		//return;
		var totalWidth = currentMenu.containerWidth;//-2;
		var navWidth = 0;
		var deltaWidth = totalWidth - (currentMenu.navWidth);// + currentMenu.marginSize);
		var padding = Math.floor((deltaWidth / currentMenu.arrItem.length) / 2);// - (currentMenu.marginSize/2); 
		var floatEnabled=false;
		if(totalWidth<currentMenu.navWidth + ((currentMenu.arrItem.length-1)*currentMenu.marginSize)){
			//padding=0;
			floatEnabled=true;
			$(currentMenu.arrLI).each(function(){ $(this).css("display", "block"); });
		}else{
			if($.browser.msie && $.browser.version <= 7){
				$(currentMenu.arrLI).each(function(){ $(this).css("display", "inline"); });
			}else{
				$(currentMenu.arrLI).each(function(){ $(this).css("display", "inline-block"); });
			} 
		} 
		//console.log(containerDivId+":"+"marginSize:"+currentMenu.marginSize+" containerWidth:" +currentMenu.containerWidth+" totalWidth:"+totalWidth+" navWidth:"+currentMenu.navWidth+" deltaWidth:"+deltaWidth+" padding:"+padding);
		var totalWidth2=0;
		var sLen=currentMenu.arrItem.length;
		for(var i=0;i<sLen;i++){ 
			var curWidth=currentMenu.arrItemWidth[i];
			//console.log(padding);
			//$(currentMenu.arrItem[i]).width(curWidth-20);
			var newWidth=Math.floor(curWidth+(padding*2)); 
 
			var addWidth=Math.max(curWidth, newWidth);
			newWidth=(newWidth/currentMenu.containerWidth);
			curWidth=(curWidth/currentMenu.containerWidth);
 			newWidth=(Math.round(newWidth*100000)/1000)-0.001;
 			curWidth=(Math.round(curWidth*100000)/1000)-0.001; 
			if(sLen-1 == i){
				
				newWidth=(currentMenu.containerWidth-totalWidth2);
	 			addWidth=newWidth;
	 			newWidth=newWidth/currentMenu.containerWidth;
	 			newWidth=(Math.round(newWidth*100000)/1000)-0.001;
	 			curWidth=newWidth;
				$(currentMenu.arrItem[i]).parent().css({
					"width": (newWidth)+"%",
					"min-width":(curWidth)+"%"
				});
				$(currentMenu.arrItem[i]).css({
					"width": (100)+"%",
					"min-width":(100)+"%" 
				});
			}else{
				$(currentMenu.arrItem[i]).parent().css({
					"width": (newWidth)+"%",
					"min-width":(curWidth)+"%", 
					"margin-right":marginSize+"px"
				});
				$(currentMenu.arrItem[i]).css({
					"width": (100)+"%",
					"min-width":(100)+"%" 
				});
					
			}
			totalWidth2+=Math.round(addWidth+marginSize);
		} 
		$("#"+containerDivId).append(currentMenu.ul);
		$("#"+containerDivId).css("visibility", "visible");
	}



	zArrLoadFunctions.push({functionName:function(){
		if($(".zMenuClear").length){
			zMenuInit(); 
		}
	}});


	function zSetGearMenuPosition(obj){

		var p=zGetAbsPosition(obj);
		var p2=zGetAbsPosition($("#zGearWindowPreDiv1")[0]);
		p.y+=Math.round(p.height/2);
		p.x+=Math.round(p.width/2);
		if(p.x+p2.width+10 > zWindowSize.width){
			p.x=zWindowSize.width-p2.width-10;
		}
		if(p.y+p2.height+10 > zWindowSize.height){
			p.y=zWindowSize.height-p2.height-10;
		}
		if(p.x<10){
			p.x=10;
		}
		if(p.y<10){
			p.y=10;
		}
		$("#zGearWindowPreDiv1").css({
			"left":p.x,
			"top":p.y
		});
	}
	function zSetupGearMenu(obj){
		if(zMSIEBrowser!==-1 && zMSIEVersion<=7){
			$(".zGearButton").html('<img src="/z/a/images/gear.png" alt="Settings" />');
		}
		$(".zGearButton").bind("click", function(){
			var json=this.getAttribute("data-button-json");
			var currentGearObj=this;
			if(!$("#zGearWindowPreDiv1").length){
				$("body").append('<div id="zGearWindowPreDiv1" class="zGearPopupMenu"><div class="zGearPopupInnerMenu"></div></div>');
				$("body").bind("click", function(){
					if($("#zGearWindowPreDiv1").css("visibility") == "visible"){
						$("#zGearWindowPreDiv1").slideToggle(100, function(){ $(this).css("visibility", "hidden");});
					}
				});
				zArrResizeFunctions.push(function(){
					zSetGearMenuPosition(currentGearObj);
				});
			}
			$("#zGearWindowPreDiv1").css("visibility", "hidden").show();
			$("#zGearWindowPreDiv1 .zGearPopupInnerMenu").html(json);
			zSetGearMenuPosition(currentGearObj);
			var p2=zGetAbsPosition($("#zGearWindowPreDiv1")[0]);
			$("#zGearWindowPreDiv1 .zGearPopupMenuButton").css({
				"width":(p2.width-20)+"px"
			}).last().css("margin-bottom", "0px");
			$("#zGearWindowPreDiv1").css({
				"display": "none",
				"visibility":"visible"
			}).slideToggle(100);
			return false;
		});
	}
	zArrDeferredFunctions.push(function(){
		zSetupGearMenu();
	});

	window.zInitZValues=zInitZValues;
	window.zHideMenuPopups=zHideMenuPopups;

})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/misc-functions.js */

var zHumanMovement=false;

if (typeof window.console === "undefined") { 
    window.console = {
        log: function(obj){ }
    };  
}

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

function zKeyExists(obj, key){
	return (key in obj);
}
function zGetURLParameter(sParam){
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
			return sParameterName[1];
		}
	}
	return "";
}

function zHtmlEditFormat(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') 
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
        ;
}

var zDisableSearchFilter=0;

 
 zArrDeferredFunctions.unshift(function(){
	 // gist Source: https://gist.github.com/brucekirkpatrick/7026682
	(function($){

		$.unserialize = function(serializedString){
			var str = decodeURI(serializedString); 
			var pairs = str.split('&');
			var obj = {}, p, idx;
			for (var i=0, n=pairs.length; i < n; i++) {
				p = pairs[i].split('=');
				idx = p[0]; 
				if (typeof obj[idx] === 'undefined') {
					obj[idx] = decodeURIComponent(p[1]);
				}else{
					if (typeof obj[idx] === "string") {
						obj[idx]=[obj[idx]];
					}
					obj[idx].push(decodeURIComponent(p[1]));
				}
			}
			return obj;
		};
		
	})($);
});

var zPageHelpId='';
function zGetHelpForThisPage(obj){
	obj.id="getHelpForThisPageLinkId";
	if(zPageHelpId==''){
		alert("No help resources exist for this page yet.\n\nFeel free to browse the documentation or contact the web developer for further assistance.");
		return false;
	}
	obj.href=zPageHelpId;
	return true;
}


function zUpgradeBrowserMessage(){
	if(zMSIEBrowser!==-1 && zMSIEVersion<=7){
		$(".adminBrowserCompatibilityWarning").show();
	}
}
zArrLoadFunctions.push({functionName:zUpgradeBrowserMessage});



function zGetChildElementCount(id){
	var c=0;
	for(var i=0;i<document.getElementById(id).childNodes.length;i++){
		if(document.getElementById(id).childNodes[i].nodeName !== "#text"){
			c++;
		}
	}
	return c;
}

var zPopUnderURL="";
var zPopUnderFeatures="";
var zPopUnderLoaded=false;
function zLoadPopUnder(u, winfeatures){
	zPopUnderURL=u;
	zPopUnderFeatures=winfeatures;
	if (zPopUnderLoaded === false && zGetCookie('zpopunder')===''){
		zPopUnderLoaded=true;
		document.body.onclick = function(){
			zSetCookie({key:"zpopunder",value:"yes",futureSeconds:3600 * 12,enableSubdomains:false}); 
			win2=window.open(zPopUnderURL,"zpopunderwindow",zPopUnderFeatures);
			win2.blur();
			window.focus();	
		};
	} 
}
function zURLEscape(str){
	var s=encodeURIComponent(str.toString().trim());
	
	var g=new RegExp('/+/', 'g');
	s=s.replace(g,"+");
	g=new RegExp('/@/', 'g');
	s=s.replace(g,"@");
	g=new RegExp('///', 'g');
	s=s.replace(g,"/");
	g=new RegExp('/*/', 'g');
	s=s.replace(g,"*");
	return(s);
}
function zLoadVideoJSID(id, autoplay){
	VideoJS.setup(id);
	if(autoplay){
		document.getElementById(id).player.play();
	}
}
function walkTheDOM (node, func) {
	func(node);
	node = node.firstChild;
	while (node) {
		walkTheDOM(node, func);
		node = node.nextSibling;
	}
}
function zGetElementsByClassName(className) {
	if(typeof document.getElementsByClassName !== "undefined"){
		return document.getElementsByClassName(className);
	}else{
		var results = [];
		walkTheDOM(document.body, function (node) {
			var a, c = node.className, i;
			if (c) {
				a = c.split(' ');
				for (i=0; i<a.length; i++) {
					if (a[i] === className) {
						results.push(node);
						break;
					}
				}
			}
		});
		return results;
	}
}
function zToggleDisplay(id){
	var d=document.getElementById(id);
	if(d.style.display==="none"){
		d.style.display="block";
	}else{
		d.style.display="none";
	}
}

var zArrBlink=new Array();
function zBlinkId(aname, blink_speed){
var dflash=document.getElementById(aname);
 if(typeof zArrBlink[aname] === "undefined"){
	zArrBlink[aname]=0; 
 }
 if(zArrBlink[aname]%2===0){
 dflash.style.visibility="visible";
 }else{
 dflash.style.visibility="hidden";
 }
 if(zArrBlink[aname]<1){
	zArrBlink[aname]=1;
 }else{
	zArrBlink[aname]=0;
 }
 setTimeout("zBlinkId('"+aname+"',"+blink_speed+")",blink_speed);
}




var zIgnoreClickBackup=false;
function zRenable(){
	if(zIgnoreClickBackup){
		zIgnoreClickBackup=false;
	}else{
		zInputHideDiv();
	}
	return true;
}
if(typeof document.onclick === "function"){
	var zDocumentClickBackup=document.onclick;
}else{
	var zDocumentClickBackup=function(){};
}
$(document).bind("click", function(ev){
	zDocumentClickBackup(ev);
	zRenable(ev);
});


function zFixText(myString){
	myString = zMakeEnglish(myString);	
	myString = zIsAlphabet(myString);
	myString = myString.toLowerCase();
	return myString;
}


function zFormatTheArray(myArray){
	var useThisArray = [];
	for(i=0;i < myArray.length; i++){
	useThisArray[i] = zFixText(myArray[i]);
	}
	
return useThisArray;	
}



	

function zIsAlphabet(elem){
	var alphaExp = /^[a-zA-Z0-9 ]+$/;
	if(elem.match(alphaExp)){
		return elem;
	}else{
		return elem;
	}
}


var daysToOffset=0;

function zMakeEnglish(elem){
	var elem1 = elem;
	var alphaExp = /^[a-zA-Z ]+$/;
	if(elem.match(alphaExp)){
		return elem;
	}else{
		var englishList = "A,A,A,A,A,A,AE,C,E,E,E,E,I,I,I,I,ETH,N,O,O,O,O,O,O,U,U,U,U,Y,THORN,s,a,a,a,a,a,a,ae,c,e,e,e,e,i,i,i,i,eth,n,o,o,o,o,o,o,u,u,u,u,y,thorn,y,OE,oe,S,s,Y,f";		 
		var foreignList="�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�,�";		
		var arrEnglish = englishList.split( "," );
		var arrForeign = foreignList.split( "," );
		for(e = 0; e < elem.length; e ++){
			for(f=0; f < arrForeign.length; f++){				
				if (elem1.charAt(e) === arrForeign[f]){
					myChar = elem1.charAt(e);
					if (!(myChar.match(alphaExp))){
						pattern = new RegExp(arrForeign[f]);
						elem1 = elem1.replace(pattern, arrEnglish[f]);
					}
				}
			}
		}
		return elem1;
	}
}

function zStringReplaceAll(str, strTarget, strSubString){
	return str.replace( new RegExp(strTarget,"g"), strSubString ); 
}






function zLoadFile(filename, filetype){
	if (filetype==="js"){
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", filename);
	}else if (filetype==="css"){
		var fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref!=="undefined"){
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
}
function zSet9(id){
	var d1=document.getElementById(id);
	d1.value="9989";
	zHumanMovement=true;
}
if(typeof String.prototype.trim === "undefined"){
	String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
}


var zMSIEVersion=-1;
var zMSIEBrowser=window.navigator.userAgent.indexOf("MSIE");
if(zMSIEBrowser !== -1){
	zMSIEVersion= (window.navigator.userAgent.substring (zMSIEBrowser+5, window.navigator.userAgent.indexOf (".", zMSIEBrowser )));
}
function zo(variable){
	var a=document.getElementById(variable);
	if(a !== null){
		return a;
	}else if(typeof(window[variable]) === "undefined"){
		return false;	
	}else{
		return eval(variable);	
	}
}
function zso(obj, varName, isNumber, defaultValue){
	if(typeof isNumber==="undefined") isNumber=false;
	if(typeof defaultValue==="undefined") defaultValue=false;
	var tempVar = "";
	if(isNumber){
		if(zKeyExists(obj, varName)){
			tempVar = obj[varName];
			if(!isNaN(tempVar)){
				return tempVar;
			}else{
				if(defaultValue !== ""){
					return defaultValue;
				}else{
					return 0;
				}
			}
		}else{
			if(defaultValue !== ""){
				return defaultValue;
			}else{
				return 0;
			}
		}
	}else{
		if(zKeyExists(obj, varName)){
			return obj[varName];
		}else{
			return defaultValue;
		}
	}
}


function forceCustomFontDesignModeOn(id){
	doc=tinyMCE.get(id).getDoc();
	doc.designMode="on";
	$("span", doc).each(function(){
		if(this.innerHTML==="BESbswy"){
			$(this).remove();
		}
	});
}


function forceCustomFontLoading(editor){
	doc=editor.getDoc();
	if(navigator.userAgent.indexOf("MSIE ") === -1){
		doc.designMode="off";
	} 
	if(typeof zFontsComURL !== "undefined" && zFontsComURL !== ""){
		if(zFontsComURL.substr(zFontsComURL.length-4) === ".js"){
			head = doc.getElementsByTagName('head')[0];
			script = doc.createElement('script');
			script.src = zFontsComURL;
			script.type = 'text/javascript';
			head.appendChild(script);
		}else{
			head = doc.getElementsByTagName('head')[0];
			script = doc.createElement('link');
			script.href = zFontsComURL;
			script.rel = 'stylesheet';
			script.type = 'text/css';
			head.appendChild(script);
		}
	}
	if(typeof zTypeKitURL !== "undefined" && zTypeKitURL !== ""){
		head = doc.getElementsByTagName('head')[0];
		script = doc.createElement('script');
		script.src = zTypeKitURL;
		script.type = 'text/javascript';
		head.appendChild(script);
		script = doc.createElement('script');
		script.type = 'text/javascript';
		script.src='/z/javascript/zTypeKitOnLoad.js';
		head.appendChild(script);
	}
	if(navigator.userAgent.indexOf("MSIE ") === -1 && document.getElementById(editor.editorId)){
		setTimeout('forceCustomFontDesignModeOn("'+editor.editorId+'");',2000);
	}
}
function zGetCurrentRootRelativeURL(theURL){
	var a=theURL.split("/");
	var a2="";
	for(var i=3;i<a.length;i++){
		a2+="/"+a[i];
	}
	a2=(a2).split("#");
	return a2[0];
} 
function zIsTestServer(){
	if(typeof zThisIsTestServer !== "undefined" && zThisIsTestServer){
		return true;
	}else{
		return false;
	}
}
function zIsDeveloper(){
	if(typeof zThisIsDeveloper !== "undefined" && zThisIsDeveloper){
		return true;
	}else{
		return false;
	}
}



var zAddThisLoaded=false;
function zLoadAddThisJsDeferred(){
	setTimeout(zLoadAddThisJs, 300);
}
function zLoadAddThisJs(){
	if(zIsTestServer()) return;
	var a1=[];
	var found=false;
	for(var i=1;i<=5;i++){
		d1=document.getElementById("zaddthisbox"+i);
		if(d1==null || typeof d1 == "undefined" || d1.style.display == 'none'){
			continue;
		} 
		if(d1){
			found=true;
			d1.innerHTML='<div style="float:left; padding-right:5px;padding-bottom:5px;"><div class="g-plus" data-action="share" data-annotation="bubble"></div></div><div style="float:left; padding-right:5px; padding-bottom:5px;"><iframe style="overflow: hidden; border: 0px none; width: 90px; height: 25px; " src="//www.facebook.com/plugins/like.php?href='+escape(window.location.href)+'&amp;layout=button_count&amp;show_faces=false&amp;width=90&amp;action=like&amp;font=arial&amp;layout=button_count"></iframe></div><div style="float:left; padding-right:5px; padding-bottom:5px;"><script type="IN/Share" data-counter="right"></script></div><div style="float:left; padding-right:5px;padding-bottom:5px;"><a class="twitter-share-button" href="https://twitter.com/share">Tweet</a></div>';

			d1.id="zaddthisbox"+i+"_loaded";
			a1.push(d1);
		}
	}
	if(found){
		zLoadFile("//platform.twitter.com/widgets.js","js");
		zLoadFile("//platform.linkedin.com/in.js","js");
	    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	    po.src = 'https://apis.google.com/js/platform.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
	}
}
zArrLoadFunctions.push({functionName:zLoadAddThisJsDeferred});
 
function zeeo(m,n,o,w,l,r,h,b,v,z,z2){
	var k='ai',g='lto',f='m',e=':';
	if(z){return o+n+w+m;}else{ if(l){var cr3=('<a href="'+f+k+g+e+o+n+w+m+'">');
	if(b+h+v+r!==''){cr3+=(b+h+v+r);}else{cr3+=(o+n+w+m);} cr3+=('<\/a>');
	}else{
		cr3+=(o+n+w+m);}var d=document.getElementById('zencodeemailspan'+z2); 
		if(d){d.innerHTML=cr3;}
	}
}
	


function zSetEmailBody(c,t) {
	var ifrm = document.getElementById('zEmailBody'+c);
    var d=(ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
    d.document.open();
    d.document.write(t);
    d.document.close();
}

function zSetEmailBodyHeight(c){
    var ifrm = document.getElementById('zEmailBody'+c);
    var el=ifrm;
    ifrm.style.display="block";
    // this code is required to force the browser to set the correct heights after display:block is set
	var d=false;
    while (el.parentNode!==null){el=el.parentNode;d=el.scrollTop;d=el.offsetHeight;d=el.clientHeight;}
	d=false;
    if(ifrm.contentWindow){
        ifrm.style.height=((ifrm.contentWindow.document.body.scrollHeight+1))+'px';
    }else if(ifrm.contentDocument.document){
        ifrm.style.height=(ifrm.contentDocument.document.body.scrollHeight+1)+'px';
    }else{
        ifrm.style.height=(ifrm.contentDocument.body.scrollHeight+1)+'px';
    }
} 
 
function zCheckIfPageAlreadyLoadedOnce(){
	var once=document.getElementById('zPageLoadedOnceTracker');
	// if field was empty, the page was already loaded once and should be reloaded
	if(once.value.length ===""){
		var curURL=window.location.href;
		window.location.href=curURL;
	}
	once.value='';
}



zArrDeferredFunctions.push(function(){
	if(zIsTouchscreen()){
		 $(".zPhoneLink").each(function(){
			this.href="tel:"+this.innerText;
		 });
	}
});

function zConvertToMilitaryTime( ampm, hours, minutes, leadingZero ) {
	var militaryHours;
	ampm=ampm.toLowerCase();
	hours=parseInt(hours);
	minutes=parseInt(minutes);
	if( ampm == "pm" || ampm == "p.m." ) {
		if(hours!=12){
			hours+=12;
		}
	}
	if(minutes < 10){
		if(leadingZero){
			return "0"+parseInt(hours+"0"+minutes);
		}else{
			return parseInt(hours+"0"+minutes);
		}
	}else{
		if(leadingZero){
			return "0"+hours + minutes;
		}else{
			return hours + minutes;
		}
	}
}

function gotoReimport(){
	var d2=document.getElementById('mls_id1');
	var d1=d2.options[d2.selectedIndex].value;
	if(d1 !== ''){
		window.open('/z/listing/idx/reimport?mls_id='+d1);
		return false;
	}
}
function gotoFieldNotOutput(){
	var d2=document.getElementById('mls_provider1');
	var d1=d2.options[d2.selectedIndex].value;
	if(d1 !== ''){
		window.open('/z/listing/admin/listing-misc/index?mlsName='+d1);
		return false;
	}
}
function gotoSite(id){
	if(id !== ''){
		window.location.href='/z/server-manager/admin/robots/edit?sid='+escape(id);
	}
}

function setHidden(obj, row){
	me = eval("document.myForm.log_resolver"+row);
	if(obj.checked){
		me.disabled = false;
	}else{
		me.disabled = true;
	}
}
var zIntervalIdForCFCExplorer=0;
function resize_iframe()
{
	clearInterval(zIntervalIdForCFCExplorer);
	var height=window.innerWidth;//Firefox
	if (document.body.clientHeight)
	{
		height=document.body.clientHeight;//IE
	}
	//resize the iframe according to the size of the
	//window (all these should be on the same line)
	if (document.getElementById("comframe")) {
		if (height > 0 && document.getElementById("comframe").offsetTop) {
			var newh = parseInt(height - document.getElementById("comframe").offsetTop - (15));
			if (newh > 0) {
				document.getElementById("comframe").style.height = newh + "px";
			}
		}
	}
} 

   


function zURLAppend(theLink, appendString){
	if(theLink.indexOf("?") !== -1){
		return theLink+"&"+appendString;
	}else{
		return theLink+"?"+appendString;
	}
}

function rentalForceReserve(obj){
	if(obj.value === "0" && obj.checked){
		var d=document.getElementById("rental_config_reserve_online_name2");
		d.checked=true;
	}
}
function rentalForceCalendar(obj){
	if(obj.value === "1" && obj.checked){
		var d=document.getElementById("rental_config_availability_calendar_name1");
		d.checked=true;
	}
}

var zArrURLParam=[];
function zParseURLParam() {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    zArrURLParam = {};
    while (true){
		match = search.exec(query);
		if(match){
			zArrURLParam[decode(match[1])] = decode(match[2]);
		}else{
			break;
		}
	}
}
zArrDeferredFunctions.push(function(){
	$(window).bind("popstate", zParseURLParam);
	zParseURLParam();
});



function zFormatDollar(num) {
	var p = num.toFixed(2).split(".");
	return ["$", p[0].split("").reverse().reduce(function(acc, num, i) {
		return num + (i && !(i % 3) ? "," : "") + acc;
	}, "."), p[1]].join("");
}
function zGetPMIRate(loanYears, loanToValue){
	if(loanToValue<0.8){
		return 100;	
	}
	if(loanYears===30){
		if(loanToValue>0.8 && loanToValue<=0.85){
			return 0.32;
		}else if(loanToValue>0.85 && loanToValue<=0.90){
			return 0.52;
		}else if(loanToValue>0.90 && loanToValue<=0.95){
			return 0.78;
		}else if(loanToValue>0.95 && loanToValue<=0.97){
			return 0.90;
		}else{
			return 0;
		}
	}else{
		if(loanToValue>0.8 && loanToValue<=0.85){
			return 0.19;
		}else if(loanToValue>0.85 && loanToValue<=0.90){
			return 0.23;
		}else if(loanToValue>0.90 && loanToValue<=0.95){
			return 0.26;
		}else if(loanToValue>0.95 && loanToValue<=0.97){
			return 0.79;
		}else{
			return 0;	
		}
	}
}
function zCalculateMonthlyPayment(){
	var homeprice=parseFloat(document.getElementById("homeprice").value);
	var percentdown=parseFloat(document.getElementById("percentdown").value);
	var loantype=document.getElementById("loantype");
	var loantypevalue=parseFloat(loantype.options[loantype.selectedIndex].value);	
	var currentrate=parseFloat(document.getElementById("currentrate").value);	
	var homeinsurance=parseFloat(document.getElementById("homeinsurance").value);	
	var hometax=parseFloat(document.getElementById("hometax").value);	
	var homehoa=parseFloat(document.getElementById("homehoa").value);	
	//var homepmi=document.getElementById("homepmi");
	var armEnabled=false;
	if(loantypevalue === 30.5){
		armEnabled=true;	
		loantypevalue=30;
	}
	
	var monthlyInsurance=homeinsurance/12;
	var monthlyTax=hometax/12;
	var results=document.getElementById("zMortgagePaymentResults");	
	arrT=[];
	var totalPayments=(loantypevalue*12); 
	var originalLoanBalance=homeprice-(homeprice*(percentdown/100)); 
	
	var monthlyInterestRate=(currentrate/100)/12;
	var payment = (monthlyInterestRate * originalLoanBalance*Math.pow(1 + monthlyInterestRate,totalPayments)) / (Math.pow(1 + monthlyInterestRate, totalPayments)-1);
	var interest=originalLoanBalance*monthlyInterestRate;
	var interestFormatted=zFormatDollar(Math.round(interest*100)/100);
	var principalFormatted=zFormatDollar(Math.round((payment-interest)*100)/100);
	
	var principalAndInterestFormatted=zFormatDollar(Math.round(payment*100)/100);
	
	var monthlyHoa=homehoa/12;
	var monthlyHoaFormatted=zFormatDollar(Math.round(monthlyHoa*100)/100);
	var monthlyInsuranceFormatted=zFormatDollar(Math.round(monthlyInsurance*100)/100);
	var monthlyTaxFormatted=zFormatDollar(Math.round(monthlyTax*100)/100);
	var loanToValue=originalLoanBalance/homeprice;
	var monthlyPMI=0;
	if(loanToValue>0.8){
		var pmiRate=zGetPMIRate(loantypevalue, loanToValue);
		if(pmiRate===0){
			alert("Loan to value must be 97% or less");	
			results.value="";
			return;
		}else if(pmiRate===100){
			monthlyPMI=0;
			var monthlyPMIFormatted="$0.00";
		}else{
			monthlyPMI=(originalLoanBalance*(pmiRate/100))/12;
			var monthlyPMIFormatted=zFormatDollar(Math.round(monthlyPMI*100)/100);
		}					
	}
	var paymentFormatted=zFormatDollar(Math.round((monthlyHoa+monthlyPMI+monthlyInsurance+monthlyTax+payment)*100)/100);
	arrHTML=['<span class="zMorgagePaymentTextTotal">'+paymentFormatted+"/month</span> (Principal+Interest+Tax+Insurance+PMI)<hr />"+principalAndInterestFormatted+" principal & interest<br />"+monthlyInsuranceFormatted+" Insurance<br />"+monthlyTaxFormatted+" Taxes<br />"+monthlyHoaFormatted+" HOA dues<br />"];
	if(loanToValue>0.8){
		arrHTML.push(monthlyPMIFormatted+" PMI");
	}
	results.innerHTML=arrHTML.join("");
}


/* /var/jetendo-server/jetendo/public/javascript/jetendo/mobile-functions.js */

(function($, window, document, undefined){
	"use strict";
	function zIsAppleIOS(){
		if(navigator.userAgent.indexOf("iPhone") !== -1 || navigator.userAgent.indexOf("iPad") !== -1){
			return true;
		}else{
			return false;
		}
	}


	var zSetFullScreenMobileAppLoaded=false;
	function zSetFullScreenMobileApp(){
		// this was disabled on purpose.
		//console.log("zSetFullScreenMobileApp called");
		return;
		/*if(zSetFullScreenMobileAppLoaded) return;
		zSetFullScreenMobileAppLoaded=true;
		if(zIsTouchscreen()){
			$('head').append('<meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1, initial-scale=1 user-scalable=no" \/><meta name="apple-mobile-web-app-capable" content="yes" \/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" \/><style type="text/css"> a, area {-webkit-touch-callout: none;}*{ -webkit-text-size-adjust: none; }<\/style>');
		}*/
	}
	var zIsTouchscreenCache=3;
	function zIsTouchscreen(){
		if(zIsTouchscreenCache!==3){
			return zIsTouchscreenCache;
		}
		var n=navigator.userAgent.toLowerCase();
		
		var patt=/(android|iphone|ipad|viewpad|tablet|bolt|xoom|touchpad|playbook|kindle|gt-p|gt-i|sch-i|sch-t|mz609|mz617|mid7015|tf101|g-v|ct1002|transformer|silk| tab)/g;
		if(n.replace(patt,"anything") !== n){
			zIsTouchscreenCache=true;
			return true;
		}else if(n.indexOf("MSIE 10") !== -1 && window.navigator && (typeof window.navigator.msPointerEnabled !== "undefined" && window.navigator.msPointerEnabled === false)) {
			// doesn't have pointer support, touch only tablet maybe.
			zIsTouchscreenCache=true;
			return true;
		}else{
			zIsTouchscreenCache=false;
			return false;
		}
	}

	function zIsMobilePhone(){
		var a=navigator.userAgent||navigator.vendor||window.opera;
		if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.toLowerCase().substr(0,4))){
			return true;
		}else{
			return false;
		}
	}
	
	window.zIsAppleIOS=zIsAppleIOS;
	window.zIsTouchscreen=zIsTouchscreen;
	window.zSetFullScreenMobileApp=zSetFullScreenMobileApp;
	window.zIsMobilePhone=zIsMobilePhone;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/modal-functions.js */

(function($, window, document, undefined){
	"use strict";
	var zModalObjectHidden=new Array();
	var zModalScrollPosition=new Array();
	var zArrModal=[];
	var zModalPosIntervalId=false;
	var zModalIndex=0;
	var zModalKeepOpen=false;
	var zModalSideReduce=50;
	function zModalLockPosition(e){
		var el = document.getElementById("zModalOverlayDiv"); 
		if(el && el.style.display==="block"){
			var yPos=$(window).scrollTop();
			el.style.top=yPos+"px";
			return false;
		}else{
			return true;
		}
	}
	function zShowModalStandard(url, maxWidth, maxHeight, disableClose, fullscreen){
		var windowSize=zGetClientWindowSize();
		if(url.indexOf("?") === -1){
			url+="?";
		}else{
			url+="&";
		}
		if(typeof maxWidth === "undefined"){
			maxWidth=3000;	
		}
		if(typeof maxHeight === "undefined"){
			maxHeight=3000;	
		}
		if(typeof disableClose === "undefined"){
			disableClose=false;	
		}
		if(typeof fullscreen === "undefined"){
			fullscreen=false;	
		}
		zModalSideReduce=30;
		var padding=20;
		if(disableClose){
			zModalSideReduce=0;
			padding=0;
		}else if(zWindowSize.width < 550){
			zModalSideReduce=10;
			padding=10;
		}
		var modalContent1='<iframe src="'+url+'ztv='+Math.random()+'" frameborder="0"  style=" margin:0px; border:none; overflow:auto;" seamless="seamless" width="100%" height="98%" />';		
		zShowModal(modalContent1,{
			'width':Math.min(maxWidth, windowSize.width-zModalSideReduce),
			'height':Math.min(maxHeight, windowSize.height),
			"maxWidth":maxWidth, 
			"maxHeight":maxHeight, 
			"padding":padding,

			"disableClose":disableClose, 
			"fullscreen":fullscreen});
	}
	function zFixModalPos(){
		zScrollbarWidth=1;
		zGetClientWindowSize();
		var windowSize=zWindowSize;
		for(var i=1;i<=zModalIndex;i++){
			var el = document.getElementById("zModalOverlayDivContainer"+i);
			var el2 = document.getElementById("zModalOverlayDivInner"+i);
			zArrModal[i].scrollPosition=[
			self.pageXOffset ||
			document.documentElement.scrollLeft ||
			document.body.scrollLeft
			,
			self.pageYOffset ||
			document.documentElement.scrollTop ||
			document.body.scrollTop
			];
			if(isNaN(zArrModal[i].modalWidth)){
				zArrModal[i].modalWidth=10000;
			}
			if(isNaN(zArrModal[i].modalHeight)){
				zArrModal[i].modalHeight=10000;
			}

			el.style.top=zArrModal[i].scrollPosition[1]+"px";
			el.style.left=zArrModal[i].scrollPosition[0]+"px"; 
			if(zArrModal[i].fullscreen){
				var newWidth=windowSize.width-(zModalSideReduce*2);
				var newHeight=windowSize.height-(zModalSideReduce*2); 
			}else{
				var newWidth=Math.min(zArrModal[i].modalWidth, Math.min(windowSize.width-(zModalSideReduce*2),((zArrModal[i].modalMaxWidth))));
				var newHeight=Math.min(zArrModal[i].modalHeight, Math.min(windowSize.height-(zModalSideReduce*2),((zArrModal[i].modalMaxHeight)))); 
			}
			var finalWidth=newWidth;
			var finalHeight=newHeight;
			if(windowSize.width < 768 && zArrModal[i].modalMaxMobileWidth < 768){
				finalWidth=zArrModal[i].modalMaxMobileWidth;
				finalHeight=zArrModal[i].modalMaxMobileHeight; 
			} 
			var left=Math.round(Math.max(0, windowSize.width-finalWidth)/2);
			var top=Math.round(Math.max(0, windowSize.height-finalHeight)/2);
			el2.style.left=left+'px';
			if(zArrModal[i].disableClose){
				el2.style.top=(top)+'px';
			}else{
				el2.style.top=(top+25)+'px';
			} 
			if(zArrModal[i].forceSize){
				if(windowSize.width < 768 && zArrModal[i].modalMaxMobileWidth < 768){
					finalWidth=zArrModal[i].modalMaxMobileWidth;
					finalHeight=zArrModal[i].modalMaxMobileHeight; 
				}else{
					finalWidth=zArrModal[i].width;
					finalHeight=zArrModal[i].height; 
				} 
			}else if(!zArrModal[i].disableResize){
				if(windowSize.width < 768 && zArrModal[i].modalMaxMobileWidth < 768){

				}else{
					if(zArrModal[i].disableClose){
						finalWidth=finalWidth-(zArrModal[i].padding);
						finalHeight=finalHeight-(zArrModal[i].padding);
					}else{
						finalWidth=finalWidth-(zArrModal[i].padding)-5;
						finalHeight=finalHeight-(zArrModal[i].padding)-22;
					}
				} 
				el2.style.width=finalWidth+"px";
				el2.style.height=finalHeight+"px"; 
			}
			$(".zCloseModalButton"+i).css({
				"left":((left+finalWidth)-80)+"px",
				"top":(top)+"px"
			});
			
		}
	}
	function zShowModal(content, obj){
		var d=document.body || document.documentElement;
		zModalIndex++;
		zArrModal[zModalIndex]={
			"disableClose":false,
			"padding":20,
			"disableResize":false,
			"modalMaxWidth":10000,
			"modalMaxHeight":10000,
			"modalMaxMobileWidth":10000,
			"modalMaxMobileHeight":10000,
			"modalWidth":10000,
			"modalHeight":10000,
			"fullscreen":false,
			"forceSize":false
		};
		if(typeof obj.fullscreen !== "undefined" && obj.fullscreen){
			zArrModal[zModalIndex].fullscreen=obj.fullscreen;	
		}
		if(typeof obj.disableResize !== "undefined" && obj.disableResize){
			zArrModal[zModalIndex].disableResize=obj.disableResize;	
		}
		if(typeof obj.forceSize !== "undefined" && obj.forceSize){
			zArrModal[zModalIndex].forceSize=obj.forceSize;	
		}
		var disableClose=false;
		if(typeof obj.disableClose !== "undefined" && obj.disableClose){
			disableClose=obj.disableClose;	
			zArrModal[zModalIndex].disableClose=obj.disableClose;
		}
		if(typeof obj.padding !== "undefined"){
			zArrModal[zModalIndex].padding=obj.padding;	
		}
		var b='';
		if(!disableClose){
			b='<div class="zCloseModalButton'+zModalIndex+'" style="width:80px; text-align:right; left:0px; top:0px; position:relative; float:left;  font-weight:bold;"><a href="javascript:void(0);" onclick="zCloseModal();" style="color:#CCC;">X Close</a></div>';  
		}
		var h='<div id="zModalOverlayDivContainer'+zModalIndex+'" class="zModalOverlayDiv">'+b+'<div id="zModalOverlayDivInner'+zModalIndex+'" class="zModalOverlayDiv2"></div></div>';
		$(d).append(h);
		if(!zArrModal[zModalIndex].disableResize){
			d.style.overflow="hidden";
		}
		zGetClientWindowSize();
		$(".zModalOverlayDiv2").css("padding", zArrModal[zModalIndex].padding+"px");
		var windowSize=zWindowSize;
		zArrModal[zModalIndex].modalWidth=obj.width;
		zArrModal[zModalIndex].modalHeight=obj.height;
		if(zArrModal[zModalIndex].fullscreen){
			obj.width=windowSize.width;
			obj.height=windowSize.height;
		}else{
			obj.width=Math.min(zArrModal[zModalIndex].modalMaxWidth, Math.min(obj.width, windowSize.width));
			obj.height=Math.min(zArrModal[zModalIndex].modalMaxHeight, Math.min(obj.height, windowSize.height));
		}
		if(typeof obj.maxWidth !== "undefined"){
			zArrModal[zModalIndex].modalMaxWidth=obj.maxWidth;
		}
		if(typeof obj.maxHeight !== "undefined"){
			zArrModal[zModalIndex].modalMaxHeight=obj.maxHeight;
		}
		if(typeof obj.maxMobileWidth !== "undefined"){
			zArrModal[zModalIndex].modalMaxMobileWidth=obj.maxMobileWidth;
		}
		if(typeof obj.maxMobileHeight !== "undefined"){
			zArrModal[zModalIndex].modalMaxMobileHeight=obj.maxMobileHeight;
		}
	    zArrModal[zModalIndex].scrollPosition = [
	        self.pageXOffset ||
	        document.documentElement.scrollLeft ||
	        document.body.scrollLeft
	        ,
	        self.pageYOffset ||
	        document.documentElement.scrollTop ||
	        document.body.scrollTop
	    ];
	    if(zModalIndex==1){

			var arr=document.getElementsByTagName("iframe");
			for(var i=0;i<arr.length;i++){
				if(arr[i].style.visibility==="" || arr[i].style.visibility === "visible"){
					arr[i].style.visibility="hidden";
					zModalObjectHidden.push(arr[i]);
				}
			}
			if(navigator.userAgent.indexOf("MSIE 6.0") !== -1){
				var arr=document.getElementsByTagName("select");
				for(var i=0;i<arr.length;i++){
					if(arr[i].style.visibility==="" || arr[i].style.visibility === "visible"){
						arr[i].style.visibility="hidden";
						zModalObjectHidden.push(arr[i]);
					}
				}
				arr=document.getElementsByTagName("object");
				for(var i=0;i<arr.length;i++){
					if(arr[i].style.visibility==="" || arr[i].style.visibility === "visible"){
						arr[i].style.visibility="hidden";
						zModalObjectHidden.push(arr[i]);
					}
				}
				// don't use the png here...
				var dover1=document.getElementById("zModalOverlayDiv");
				dover1.style.backgroundImage="url(/z/a/images/bg-checker.gif)";
			}
		}
		var el = document.getElementById("zModalOverlayDivContainer"+zModalIndex);
		var el2 = document.getElementById("zModalOverlayDivInner"+zModalIndex);
		el.style.display = "block";
		el2.style.display = "block";
		el2.onclick=function(){
			zModalKeepOpen=true;
			setTimeout(function(){zModalKeepOpen=false;},100); 
			return false;
		};
			el2.innerHTML=content;  	
		if(disableClose){
			el.onclick=function(){};
		}else{
			el.onclick=function(){
				if(zModalKeepOpen) return;
				zCloseModal();
			};
			//right:20px; top:5px; position:fixed; 
			//el2.innerHTML='<div class="zCloseModalButton" style="width:80px; text-align:right; left:0px; top:0px; position:relative; float:left;  font-weight:bold;"><a href="javascript:void(0);" onclick="zCloseModal();" style="color:#CCC;">X Close</a></div>'+content;  
		}

		if($(".zModalOverlayDiv2 iframe").length){
			$(".zModalOverlayDiv2").css("overflow", "hidden");
			$(".zModalOverlayDiv2 iframe").height("100%");
		}else{
			$(".zModalOverlayDiv2").css("overflow", "auto");
		}
		el.style.top=zArrModal[zModalIndex].scrollPosition[1]+"px";
		el.style.left=zArrModal[zModalIndex].scrollPosition[0]+"px";
		el.style.height="100%";
		el.style.width="100%";
		var left=Math.round(Math.max(0,((windowSize.width)-obj.width))/2);
		var top=Math.round(Math.max(0, (windowSize.height-obj.height))/2);
		el2.style.left=left+'px';
		el2.style.top=top+'px';
		if(zArrModal[zModalIndex].disableClose){
			el2.style.width=(obj.width-(zArrModal[zModalIndex].padding))+"px";
			el2.style.height=(obj.height-(zArrModal[zModalIndex].padding))+"px";
		}else{
			el2.style.width=(obj.width-(zArrModal[zModalIndex].padding)-5)+"px";
			el2.style.height=(obj.height-(zArrModal[zModalIndex].padding)-22)+"px";
		}
		$(".zCloseModalButton"+zModalIndex).css({
			"left":((left+obj.width)-80)+"px",
			"top":(top-25)+"px"
		});
		zModalPosIntervalId=setInterval(zFixModalPos,500);
	}
	function zCloseModal(){
		var el = document.getElementById("zModalOverlayDivContainer"+zModalIndex);
		if(!el){
			return;
		}
		clearInterval(zModalPosIntervalId);
		for(var i=0;i <zArrModalCloseFunctions.length;i++){
			zArrModalCloseFunctions[i]();
		}
		zArrModalCloseFunctions=[];
		zModalPosIntervalId=false;
		var d=document.body || document.documentElement;
		d.style.overflow="auto";
		el.parentNode.removeChild(el);
	    if(zModalIndex==1){
			for(var i=0;i<zModalObjectHidden.length;i++){
				zModalObjectHidden[i].style.visibility="visible";
			}
		}
		zModalIndex--;
		if(zModalIndex<0){
			zModalIndex=0;
		}
	}

	function zShowGridEditorWindow(link){
		var windowSize=zGetClientWindowSize();
		var modalContent1='<iframe src="'+link+'"  style="margin:0px;border:none; overflow:auto;" seamless="seamless" width="100%" height="95%"><\/iframe>';		
		zShowModal(modalContent1,{'width':windowSize.width-100,'height':windowSize.height-100});
	}
	
	function zShowImageUploadWindow(imageLibraryId, imageLibraryFieldId, imageCountId){
		var windowSize=zGetClientWindowSize();

		window.zImageCountObj=document.getElementById(imageCountId);
		var modalContent1='<iframe src="/z/_com/app/image-library?method=imageform&image_library_id='+imageLibraryId+'&fieldId='+encodeURIComponent(imageLibraryFieldId)+'&ztv='+Math.random()+'"  style="margin:0px;border:none; overflow:auto;" seamless="seamless" width="100%" height="95%"><\/iframe>';		
		zShowModal(modalContent1,{'width':windowSize.width-100,'height':windowSize.height-100});
	}

	function zCloseThisWindow(reload){
		if(typeof reload === 'undefined'){
			reload=false;
		}
		if(window.parent.zCloseModal){
			if(reload){
				var curURL=window.parent.location.href;
				window.parent.location.href = curURL;
			}else{
				window.parent.zCloseModal();
			}
		}else{
			if(reload){
				var curURL=window.parent.location.href;
				window.parent.location.href = curURL;
			}else{
				window.close();
			}
		}
	}
	window.zArrModalCloseFunctions=[];
	if(typeof window.zModalCancelFirst == "undefined"){
		window.zModalCancelFirst=false;
	}
	window.zShowGridEditorWindow=zShowGridEditorWindow;
	window.zModalLockPosition=zModalLockPosition;
	window.zShowModalStandard=zShowModalStandard;
	window.zFixModalPos=zFixModalPos;
	window.zShowModal=zShowModal;
	window.zCloseModal=zCloseModal;
	window.zShowImageUploadWindow=zShowImageUploadWindow;
	window.zCloseThisWindow=zCloseThisWindow;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/mouse-functions.js */
var zMousePosition={x:0,y:0};
var zDrag_dragObject  = null;
var zDragTableOnMouseMove=function(){};
var zMapMarkerRollOutV3=function(){};
var zHumanMovement=false;

(function($, window, document, undefined){
	"use strict";
	var zDrag_arrParam=new Array();
	var zDrag_mouseOffset = null;
	var zDrag_dropTargets = [];
	var zCurOverEditLink="";
	var zOverEditDisableMouseOut=false;
	var zCurOverEditObj=null;
	var zOverEditLastLink="";
	var zOverEditLastPos={x:0,y:0};

	function zDrag_mouseCoords(e) {
		var sl=document.documentElement.scrollLeft;
		var st=document.documentElement.scrollTop;
		if(typeof sl === "undefined") sl=document.body.scrollLeft;
		if(typeof st === "undefined") st=document.body.scrollTop;
	    if (document.layers) {
	        var xMousePosMax = window.innerWidth+window.pageXOffset;
	        var yMousePosMax = window.innerHeight+window.pageYOffset;
	    } else if (document.all) {
			var cw=document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;
			var ch=document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	        var xMousePosMax = cw+sl;
	        var yMousePosMax = ch+st;
	    } else if (document.getElementById) {
	        var xMousePosMax = window.innerWidth+window.pageXOffset;
	        var yMousePosMax = window.innerHeight+window.pageYOffset;
	    }
		var xMousePos=0;
		var yMousePos=0;
		if (e.pageX){ xMousePos=e.pageX;
		}else if(e.clientX){ xMousePos=e.clientX + (sl);}
		if (e.pageY){ yMousePos=e.pageY;
		}else if (e.clientY){ yMousePos=e.clientY + (st);}
		return {x:xMousePos,y:yMousePos,pageWidth:xMousePosMax,pageHeight:yMousePosMax};	
	}
	function zDrag_makeClickable(object){
		object.onmousedown = function(){
			zDrag_dragObject = this;
		};
	}
	function zDragTableOnMouseUp(){};
	function zDrag_mouseUp(ev){
		ev           = ev || window.event;
		zDragTableOnMouseUp(ev);
		var mousePos = zDrag_mouseCoords(ev);
		for(var i=0; i<zDrag_dropTargets.length; i++){
			var curTarget  = zDrag_dropTargets[i];
			var targPos    = zDrag_getPosition(curTarget);
			var targWidth  = parseInt(curTarget.offsetWidth);
			var targHeight = parseInt(curTarget.offsetHeight);
		}
		if(zDrag_dragObject!==null){
			var paramObj=zDrag_arrParam[zDrag_dragObject.id];
			if(typeof paramObj !== "undefined"){
				paramObj.callbackFunction(zDrag_dragObject,paramObj,true);
			}
		}
		zDrag_dragObject   = null;
	}

	function zDrag_getMouseOffset(target, ev){
		ev = ev || window.event;
		var docPos    = zDrag_getPosition(target);
		var mousePos  = zDrag_mouseCoords(ev);
		return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
	}
	function zDrag_getPosition(e){
		var left = 0;
		var top  = 0;
		while (e.offsetParent){
			left += e.offsetLeft;
			top  += e.offsetTop;
			e     = e.offsetParent;
		}
		left += e.offsetLeft;
		top  += e.offsetTop;
		return {x:left, y:top};
	}

	function zDrag_mouseMove(ev){
		zDragTableOnMouseMove(ev);
		zOutEditDiv(ev);
		zMapMarkerRollOutV3(false);
		ev           = ev || window.event;
		var mousePos = zDrag_mouseCoords(ev); 
		zMousePosition=mousePos;
		if(zMousePosition.x+zMousePosition.y > 0){
			zHumanMovement=true;
		}
		if(zDrag_dragObject){
			var pObj=zDrag_arrParam[zDrag_dragObject.id];
			if(typeof pObj === "undefined" || typeof pObj.boxObj === "undefined"){
				return;
			}
			var bObj=document.getElementById(pObj.boxObj);
			var p1=zGetAbsPosition(bObj);
			if(navigator.userAgent.indexOf("MSIE 6.0") !== -1){
				if(zDrag_arrParam[zDrag_dragObject.id].zValue+3===zDrag_arrParam[zDrag_dragObject.id].zValueValue){
					zDrag_dragObject.style.marginRight=(((parseInt(p1.width)-((mousePos.x - zDrag_mouseOffset.x) - p1.x))-parseInt(zDrag_dragObject.style.width))/2)+"px";
				}else{
					zDrag_dragObject.style.marginLeft=(((mousePos.x - zDrag_mouseOffset.x) - p1.x)/2)+"px";
				}
			}else{
				if(zDrag_arrParam[zDrag_dragObject.id].zValue+3===zDrag_arrParam[zDrag_dragObject.id].zValueValue){
					zDrag_dragObject.style.marginRight=((parseInt(p1.width)-((mousePos.x - zDrag_mouseOffset.x) - p1.x))-parseInt(zDrag_dragObject.style.width))+"px";
				}else{
					zDrag_dragObject.style.marginLeft=Math.min(p1.width, Math.max(0,((mousePos.x - zDrag_mouseOffset.x) - p1.x)))+"px";
				}
			}
			zDrag_arrParam[zDrag_dragObject.id].callbackFunction(zDrag_dragObject,zDrag_arrParam[zDrag_dragObject.id]);
			return false;
		}
	}
	function zDrag_makeDraggable(obj,paramObj){
		if(!obj) return;
		zDrag_arrParam[obj.id]=paramObj;
		obj.ondragstart = function(ev){
			return false;
		};
		obj.onmousedown = function(ev){
			zDrag_dragObject  = this;
			zDrag_mouseOffset = zDrag_getMouseOffset(this, ev);
			return false;
		};
		paramObj.callbackFunction(obj,paramObj);
	}

	function zDrag_addDropTarget(dropTarget){
		zDrag_dropTargets.push(dropTarget);
	}

	if(typeof document.onmousemove === "function"){
		var zDragOnMouseMoveBackup=document.onmousemove;
	}else{
		var zDragOnMouseMoveBackup=function(){};
	}
	$(document).bind("mousemove", function(ev){
		zDragOnMouseMoveBackup(ev);
		zDrag_mouseMove(ev);

	});
	if(typeof document.onmouseup === "function"){
		var zDragOnMouseUpBackup=document.onmouseup;
	}else{
		var zDragOnMouseUpBackup=function(){};
	}
	$(document).bind("mouseup", function(ev){
		zDragOnMouseUpBackup(ev);
		zDrag_mouseUp(ev);

	});




	function zEnableTextSelection(target){
		target.onmousedown=function(){return true;};
		target.onselectstart=function(){return true;};
		target.style.MozUserSelect="text";
	}
	function zDisableTextSelection(target){
		if (typeof target.onselectstart!=="undefined"){ //IE route
			target.onselectstart=function(){return false;};
		}else if (typeof target.style.MozUserSelect!=="undefined"){ //Firefox route
			target.style.MozUserSelect="none";
		}else if(target.onmousedown===null){ //All other route (ie: Opera)
			target.onmousedown=function(){return false;};
		}
	}
	function zMouseHitTest(object, marginInPixels){ 
		var p=zGetAbsPosition(object);
		if(typeof marginInPixels == "undefined"){
			marginInPixels=0;
		} 
		if(p.x-marginInPixels <= zMousePosition.x){
			if(p.x+p.width+marginInPixels >= zMousePosition.x){
				if(p.y-marginInPixels <= zMousePosition.y){
					if(p.y+p.height+marginInPixels >= zMousePosition.y){
						return true;
					}
				}
			}
		} 
		return false;
	}

	function zOverEditDiv(o,theLink){
		var zOverEditDivTag1=document.getElementById("zOverEditDivTag");
		if(theLink !== zOverEditLastLink){
			zOverEditLastLink=theLink;
			zCurOverEditObj=document.getElementById(o);
			zCurOverEditLink=theLink;
			zOverEditDivTag1.style.left=(zMousePosition.x+10)+"px";
			zOverEditDivTag1.style.top=(zMousePosition.y+10)+"px";
			zOverEditLastPos={x:zMousePosition.x,y:zMousePosition.y};
			zOverEditDivTag1.style.display="block";
		}else{
			zOverEditDivTag1.style.display="block";
			var xChange=Math.abs((zMousePosition.x+10)-zOverEditLastPos.x);
			var yChange=Math.abs((zMousePosition.y+10)-zOverEditLastPos.y);
			if(xChange<=70 && yChange<=70){
				return;
			}else{
				zCurOverEditObj=document.getElementById(o);
				zCurOverEditLink=theLink;
				zOverEditDivTag1.style.left=(zMousePosition.x+10)+"px";
				zOverEditDivTag1.style.top=(zMousePosition.y+10)+"px";
				zOverEditLastPos={x:zMousePosition.x,y:zMousePosition.y};
			}
		}
	}


	function zOutEditDiv(){
		var zOverEditDivTag1=document.getElementById("zOverEditDivTag");
		if(zOverEditDivTag1 !== null && zOverEditDivTag1.style.display==="block"){
			var xChange=Math.abs((zMousePosition.x+10)-zOverEditLastPos.x);
			var yChange=Math.abs((zMousePosition.y+10)-zOverEditLastPos.y);
			if(xChange>300 || yChange>300){
				zOverEditDivTag1.style.display="none";
			}
		}
	}
	function zOverEditGoToURL(url) { 
		window.top.location.href=url;
	}
	function zOverEditClick(){
		if(zCurOverEditLink!==""){
			zOverEditGoToURL(zCurOverEditLink);
		}
	}
	var zOverEditContentLoaded=false;
	function zLoadOverEditButton(){
		if(!zOverEditContentLoaded){
			zOverEditContentLoaded=true;
			$('body').append('<div id="zOverEditDivTag" style="z-index:20001;  position:absolute; background-color:#FFFFFF; display:none; cursor:pointer; left:0px; top:0px; width:50px; height:27px; text-align:center; font-weight:bold; line-height:18px; "><a id="zOverEditATag" href="##" class="zNoContentTransition" target="_top" title="Click EDIT to edit this content">EDIT</a></div>');
			
			$("#zOverEditATag").bind("click", function(){
				if(typeof zIsAdminLoggedIn != "undefined" && zIsAdminLoggedIn()){
					zLoadOverEditButton();
					zOverEditClick();
					return false;
				}
			});
		}
	}
	$(".zOverEdit").bind("mouseover", function(){
		if(typeof zIsAdminLoggedIn != "undefined" && zIsAdminLoggedIn()){
			zLoadOverEditButton();
			var u=$(this).attr("data-editurl");
			if(u != ""){
				zOverEditDiv(this, u);
			}
		}
	});

	window.zMouseHitTest=zMouseHitTest;
	window.zDisableTextSelection=zDisableTextSelection;
	window.zEnableTextSelection=zEnableTextSelection;
	window.zDrag_addDropTarget=zDrag_addDropTarget;
	window.zDrag_makeDraggable=zDrag_makeDraggable;
	window.zDrag_mouseMove=zDrag_mouseMove;
	window.zDrag_getPosition=zDrag_getPosition;
	window.zDrag_getMouseOffset=zDrag_getMouseOffset;
	window.zDrag_mouseUp=zDrag_mouseUp;
	window.zDragTableOnMouseUp=zDragTableOnMouseUp;
	window.zDrag_makeClickable=zDrag_makeClickable;
	window.zDrag_mouseCoords=zDrag_mouseCoords;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo/navigation-functions.js */

(function($, window, document, undefined){
	"use strict";


var zPagination=function(options){
	var self=this;
	if(typeof options === undefined){
		options={};
	}
	options.id=zso(options, 'id');
	if(options.id == ""){
		throw("zPagination: options.id is required");
	} 
	options.count=zso(options, 'count'); 
	if(options.count === ""){
		throw("zPagination: options.count is required");
	}
	options.perpage=zso(options, 'perpage', true, 20);
	options.offset=zso(options, 'offset', true, 0);
	options.loadFunction=zso(options, 'loadFunction', false, function(){});
	if(typeof options.loadFunction != "function"){
		throw("zPagination: options.loadFunction is required and must be a function");
	}
	self.updatePerPage=function(perpage){
		options.perpage=perpage;
		render();
	};
	self.updateCount=function(count){
		options.count=count;
		render();
	};
	self.updateOffset=function(offset){
		options.offset=offset;
		render();
	};
	function render(){
		drawNavLinks(options.id, options.count, options.offset, options.perpage);
	};
	function runLoad(){
		options.loadFunction(options);
	}
	function drawNavLinks(id, count, curOffset, perPage){
		var arrR=new Array();
		var firstOffset=0;
		var linkCount=5;
		var firstLinkCount=Math.floor((linkCount-1)/2); 
		var beforeLinkCount=Math.min(firstLinkCount, options.offset/options.perpage);
		
		var pageCount=Math.min(Math.ceil(1000/perPage), Math.ceil(count/perPage));
		var lastLinkCount=(linkCount-1)-firstLinkCount;
		
		var firstOffset=curOffset-(beforeLinkCount*perPage);
		
		var arrBind=[];
		if(firstOffset!=curOffset){ 
			arrR.push('<a href="##" class="zPagination-previousLink">Previous<\/a>');	

			arrBind.push({
				"selector":".zPagination-previousLink",
				"offset":curOffset-perPage
			});
		} 
		for(var i=0;i<linkCount;i++){
			var coff=((i*perPage)+firstOffset);
			var clabel=(coff/perPage)+1;
			if(clabel <= pageCount){
				if(clabel == pageCount && coff+perPage == curOffset){
					arrR.push('<span class="search-nav-t">'+clabel+'</span>');
				}else if(coff == curOffset){
					arrR.push('<span class="search-nav-t">'+clabel+'</span>');
				}else{
					arrR.push('<a href="##" class="zPagination-link'+clabel+'">'+clabel+'</a>');	 
					arrBind.push({
						"selector":'.zPagination-link'+clabel,
						"offset": coff
					});
				}
			}
		} 
		if(pageCount >= curOffset/perPage){
			var clabel=((curOffset+perPage)/perPage)+1;
			if(clabel <= pageCount){
				arrR.push('<a href="##" class="zPagination-nextLink">Next<\/a>'); 
				
				arrBind.push({
					"selector":".zPagination-nextLink",
					"offset":curOffset+perPage
				});
			}
		}

		var r='<div style="width:100%; float:left" class="zPagination-container">'+arrR.join("")+'</div>';
		$("#"+id).html(r);
		for(var i=0;i<arrBind.length;i++){
			$(arrBind[i].selector, "#"+id).unbind("click");
			var c=arrBind[i];
			$(arrBind[i].selector, "#"+id).attr("data-offset", c.offset);
			$(arrBind[i].selector, "#"+id).bind("click", function(){ 
				var offset=parseInt($(this).attr("data-offset")); 
				options.offset=offset;
				runLoad(); 
				return false;
			});
		}
	}
	render();

}

	
window.zPagination=zPagination;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo/position-functions.js */

var zScrollbarWidth=0;

(function($, window, document, undefined){
	"use strict";
	var zScrollTopComplete=true;
	var zScrollBarWidthCached=-1;
	function zFindPosition(obj) {
		var curleft,curtop,curwidth,curheight;
		curleft = curtop = curwidth = curheight = 0;
		if (obj.offsetParent) {
			curleft = obj.offsetLeft;
			curtop = obj.offsetTop;
			curwidth=obj.offsetWidth;
			curheight=obj.offsetHeight;
			while (true) {
				obj = obj.offsetParent;
				if(typeof obj === "undefined" || obj ===null){
					break;
				}else{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				}
			}
		}
		return [curleft,curtop,curwidth,curheight];
	}
	
	function zGetAbsPosition(object) {  
		var position = new Object();
		position.x = 0;
		position.y = 0; 
		if( object ) {
			position.x = object.offsetLeft;
			position.y = object.offsetTop;

			if( object.offsetParent ) {
				var parentpos = zGetAbsPosition(object.offsetParent);
				position.x += parentpos.x;
				position.y += parentpos.y;
			}
			position.cx = object.offsetWidth;
			position.cy = object.offsetHeight;
		}
		position.width=position.cx;
		position.height=position.cy;
		var $obj=$(object);
		position.innerWidth=$obj.innerWidth(),
		position.innerHeight=$obj.innerHeight()
		return position;
	}

	function zScrollTop(elem, y, forceAnimate){
		if(typeof elem === "undefined" || typeof elem === "boolean"){
			elem='html, body';	
		}
		if(zScrollTopComplete){
			if(typeof forceAnimate !== "undefined" && forceAnimate){
				$(elem).animate({scrollTop: y}, { 
					"duration":200, 
					"complete":function(){
						zScrollTopComplete=true;
					}
				});
				zScrollTopComplete=false;
			}else{
				$(window).scrollTop(y);
				zScrollTopComplete=true;
			}
		}
	}

	var zBoxHitTest=function(object1, object2){
		var p=zGetAbsPosition(object1);
		var p2=zGetAbsPosition(object2);

		//console.log(p.x+":"+p.y+":"+p.width+":"+p.height+" | "+p2.x+":"+p2.y+":"+p2.width+":"+p2.height);
		if(p2.x <= p.x+p.width){
			if(p2.x+p2.width >= p.x){
				if(p2.y <= p.y+p.height){
					if(p2.y+p2.height >= p.y){
						return true;
					}
				}
			}
		}
		return false;
	}

	function zJumpToId(id,offset){	
		var r94=document.getElementById(id);
		if(r94===null) return;
		var p=zFindPosition(r94);
		var isWebKit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
		if(!offset || offset === null){
			offset=0;
		}
		if(isWebKit){
			document.body.scrollTop=p[1]+offset;
		}else{
			document.documentElement.scrollTop=p[1]+offset;
		}
	}
	function zGetScrollBarWidth () {
		if(zScrollBarWidthCached !== -1){
			return zScrollBarWidthCached;
		}
		var inner = document.createElement('p');
		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild (inner);

		var b=document.documentElement || document.body;
		b.appendChild (outer);
		var w1 = inner.offsetWidth;
		outer.style.overflow = 'scroll';
		var w2 = inner.offsetWidth;
		if (w1 === w2) w2 = outer.clientWidth;

		b.removeChild (outer);
		zScrollBarWidthCached=(w1-w2);
		return zScrollBarWidthCached;
	};

	function zGetClientWindowSize() {
		var myWidth = 0, myHeight = 0;
		if( typeof( window.innerWidth ) === 'number' ) {
			//Non-IE
			myWidth = window.innerWidth;
			myHeight = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
			//IE 6+ in 'standards compliant mode'
			myWidth = document.documentElement.clientWidth;
			myHeight = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			//IE 4 compatible
			myWidth = document.body.clientWidth;
			myHeight = document.body.clientHeight;
		}
		if(zScrollbarWidth===0){
		zScrollbarWidth=zGetScrollBarWidth();	
		}
		zWindowSize={
			"width":myWidth-zScrollbarWidth,
					"height":myHeight
		};
		return zWindowSize;
	}

	var parentIdIndex=0;
	function zForceEqualHeights(className){  
		// only the elements with the same parent should be made the same height
		var arrParent=[];  
		$(className).height("auto");
		$(className).each(function(){
			if(this.parentNode.id == ""){
				// force parent to have unique id
				this.parentNode.id="zEqualHeightsParent"+parentIdIndex;
				parentIdIndex++;
			}
			if(typeof arrParent[this.parentNode.id] == "undefined"){
				arrParent[this.parentNode.id]=0;
			}
			var pos=zGetAbsPosition(this);
			var height=pos.height;  
			var height2=$(this).height();
			height=Math.max(height,height2);
			if(height>arrParent[this.parentNode.id]){
				arrParent[this.parentNode.id]=height;
			}
		});

		$(className).each(function(){
			if(arrParent[this.parentNode.id] == 0){
				arrParent[this.parentNode.id]="auto";
			}
			$(this).height(arrParent[this.parentNode.id]);
		});
 
	}
 
	function forceAutoHeightFix(){ 
		var images=$(".zForceEqualHeights img");
		var imagesCount=images.length;
		var imagesLoaded=0; 
		images.each(function(){
			if(this.complete){
				imagesLoaded++;
			}
		}); 
		if(imagesLoaded != imagesCount){
			images.bind("load", function(e){
				imagesLoaded++; 
				if(imagesLoaded>imagesCount){
					zForceEqualHeights(".zForceEqualHeights"); 
				}
			});
		}
		zForceEqualHeights(".zForceEqualHeights"); 
		if($(".zForceEqualHeight").length > 0){
			console.log("The class name should be zForceEqualHeights, not zForceEqualHeight");
		}
	} 
	zArrResizeFunctions.push({functionName:forceAutoHeightFix });

	window.zFindPosition=zFindPosition;
	window.zGetAbsPosition=zGetAbsPosition;
	window.zScrollTop=zScrollTop;
	window.zBoxHitTest=zBoxHitTest;
	window.zJumpToId=zJumpToId;
	window.zGetScrollBarWidth=zGetScrollBarWidth;
	window.zGetClientWindowSize=zGetClientWindowSize;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/search-functions.js */

(function($, window, document, undefined){
	"use strict";

	var searchCriteriaTrackSubGroup=[];

	function clickSearchCriteriaSubGroup(obj){
		var groupId=parseInt(obj.target.getAttribute("data-group-id"));
		$(".zSearchCriteriaSubGroup").each(function(){
			var currentGroupId=parseInt(this.getAttribute("data-group-id"));
			if(typeof searchCriteriaTrackSubGroup[currentGroupId] === "undefined"){
				searchCriteriaTrackSubGroup[currentGroupId]={};
				if(document.getElementById("zSearchCriteriaSubGroupContainer"+currentGroupId).style.display=== "block"){
					searchCriteriaTrackSubGroup[currentGroupId].open=true;
				}else{
					searchCriteriaTrackSubGroup[currentGroupId].open=false;
				}
			}
			if(currentGroupId === groupId){
				if(currentGroupId !== groupId || searchCriteriaTrackSubGroup[currentGroupId].open){
					// close the group.
					$("#zSearchCriteriaSubGroupContainer"+currentGroupId).slideUp("fast");
					searchCriteriaTrackSubGroup[currentGroupId].open=false;
					$("#zSearchCriteriaSubGroupToggle"+currentGroupId).html("+");
				}else{
					$("#zSearchCriteriaSubGroupContainer"+currentGroupId).slideDown("fast");
					searchCriteriaTrackSubGroup[currentGroupId].open=true;
					$("#zSearchCriteriaSubGroupToggle"+currentGroupId).html("-");
				}
			}
		});
		return false;
	}
	var searchResultsTimeoutID=0;
	var searchCriteriaTimeoutID=0;
	var searchDisableJump=false;
	function ajaxSearchResultsCallback(r){
		clearTimeout(searchResultsTimeoutID);
		var searchForm=$("#zSearchResultsDiv");
		searchForm.fadeIn('fast');
		// uncomment next line to debug easier
		//searchForm.html(r);return;
		var r2=eval('(' + r + ')');
		if(r2.success){ 
			searchForm.html(r2.html);
		}else{
			searchForm.html(r2.errorMessage);
		}
		if(!searchDisableJump){
			zJumpToId("zSearchTitleDiv", -20);
		}
		searchDisableJump=false;
	}
	var delayedSearchResultsTimeoutId=0;
	function getDelayedSearchResults(){
		$("#zSearchTrackerzIndex").val(1);
		clearTimeout(delayedSearchResultsTimeoutId);
		searchDisableJump=true;
		delayedSearchResultsTimeoutId=setTimeout(getSearchResults, 500);
	}
	function getSearchResults(groupId, zIndex){
		if(typeof groupId === "undefined"){
			groupId=$("#zSearchTrackerGroupId").val();
		}
		if(typeof zIndex=== "undefined"){
			zIndex=$("#zSearchTrackerzIndex").val();
		}
		var tempObj={};
		$("#zSearchTrackerGroupId").val(groupId);
		$("#zSearchTrackerzIndex").val(zIndex);
		tempObj.id="ajaxGetSearchResults";
		tempObj.postObj=zGetFormDataByFormId("searchForm"+groupId);
		tempObj.postObj.groupId=groupId;
		tempObj.postObj.zIndex=zIndex;
		tempObj.postObj.disableSidebar=$("#zSearchFormDiv").attr("data-disable-sidebar");
		
		searchResultsTimeoutID=setTimeout(function(){
			$("#zSearchResultsDiv").html("One moment while we load your search results.");
		}, 500);
		if(groupId === 0){
			if($("#zSearchTextInput").length){
				tempObj.postObj.searchtext=$("#zSearchTextInput").val();
			}
		}else{
			
		}
		tempObj.method="post";
		tempObj.url="/z/misc/search-site/ajaxGetPublicSearchResults";
		
		tempObj.cache=false;
		tempObj.callback=ajaxSearchResultsCallback;
		tempObj.ignoreOldRequests=true;
		zAjax(tempObj);
		if(document.getElementById('contenttop')){
			window.location.href='#contenttop';
		}else{
			var d=$('h1').first();
			if(d.length){
				if(d[0].id===""){
					d[0].id="zHeadingSearchTopLinkId";
				}
				window.location.href='#'+d[0].id;
			}else{
				window.scrollTo(0, 0);
			}
		}
	}
	function zSearchCriteriaSetupSubGroupButtons(){
			$(".zSearchCriteriaSubGroup").bind("click", clickSearchCriteriaSubGroup);
			$(".zSearchCriteriaSubGroupToggle").bind("click", clickSearchCriteriaSubGroup);
			$(".zSearchCriteriaSubGroupLabel").bind("click", clickSearchCriteriaSubGroup);
		
	}
	function ajaxSearchCriteriaCallback(r){
		clearTimeout(searchCriteriaTimeoutID);
		var r2=eval('(' + r + ')');
		var searchForm=$("#zSearchFormDiv");
		var searchTitle=$("#zSearchTitleDiv");
		if(r2.success){ 
			searchTitle.html(r2.title);
			searchForm.html(r2.html);
			zSearchCriteriaSetupSubGroupButtons();
			if(r2.groupId === "0"){
				if($("#zSearchTextInput").val() === ""){
					return;
				}
			}
			getSearchResults(r2.groupId, r2.zIndex);
		}else{
			searchForm.html(r2.errorMessage);
		}
	}
	function getSearchCriteria(groupId, clearCache){
		if(typeof clearCache === "undefined"){
			clearCache=false;
		}
		$("#zSearchTrackerzIndex").val(1);
		$("#zSearchTabDiv a").each(function(){
			var currentGroupId=parseInt(this.getAttribute("data-groupId"));
			
			if(groupId===currentGroupId){
				$(this).addClass("zSearchTabDivSelected");
			}else{
				$(this).removeClass("zSearchTabDivSelected");
			}
		});
		searchCriteriaTimeoutID=setTimeout(function(){
			$("#zSearchFormDiv").html("One moment while we load the search form.");
		}, 500);
		
		var tempObj={};
		tempObj.id="ajaxGetSearchCriteria";
		tempObj.url="/z/misc/search-site/ajaxGetPublicSearchCriteria?groupId="+encodeURIComponent(groupId)+"&clearCache="+encodeURIComponent(clearCache);
		if(groupId==0){
			tempObj.url+="&searchtext="+encodeURIComponent(zGetURLParameter("searchtext"));
		}
		
		tempObj.cache=false;
		tempObj.callback=ajaxSearchCriteriaCallback;
		tempObj.ignoreOldRequests=true;
		zAjax(tempObj);
	}
	function reloadResultsIfBackDetected(){
		var zSearchGroupId=$("#zSearchTrackerGroupId").val();
		if(zSearchGroupId!==""){
			getSearchCriteria(zSearchGroupId);
		}
	}
	window.getSearchCriteria=getSearchCriteria;
	window.getSearchResults=getSearchResults;
	window.getDelayedSearchResults=getDelayedSearchResults;
	window.zSearchCriteriaSetupSubGroupButtons=zSearchCriteriaSetupSubGroupButtons;
	window.reloadResultsIfBackDetected=reloadResultsIfBackDetected;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/tooltip-functions.js */

var zHelpTooltip=new Object();

(function($, window, document, undefined){
	"use strict";

	zHelpTooltip.arrTrack=[];
	zHelpTooltip.curId=false;
	zHelpTooltip.curTimeoutId=false;
	zHelpTooltip.helpDiv=false;
	zHelpTooltip.helpInnerDiv=false;
	zHelpTooltip.showTooltip=function(){
		clearTimeout(zHelpTooltip.curTimeoutId);
		zHelpTooltip.curTimeoutId=false;
		zHelpTooltip.arrTrack[this.id].hovering=false;
		var d=document.getElementById(this.id);
		var p=zGetAbsPosition(d);
		//alert(this.id+" tooltip "+p.x+":"+p.y+":"+p.width+":"+p.height);
		var ws=getWindowSize();	
		zHelpTooltip.helpDiv.style.display="block";
		zHelpTooltip.helpInnerDiv.innerHTML=zHelpTooltip.arrTrack[this.id].title;
		var p2=zGetAbsPosition(zHelpTooltip.helpDiv);
		zHelpTooltip.helpDiv.style.left=Math.min(ws.width-p2.width-10, p.x+p.width+5)+"px";
		zHelpTooltip.helpDiv.style.top=Math.max(10,(p.y)-p2.height)+"px";
		//alert(Math.min(ws.width-p.width, p.x+p.width+5)+" | "+(p.y-p.height-5));
		return false;
	};
	zHelpTooltip.hoverOut=function(e){
		clearTimeout(zHelpTooltip.curTimeoutId);
		zHelpTooltip.curTimeoutId=false;
		zHelpTooltip.curId=false;
		zHelpTooltip.arrTrack[this.id].hovering=false;
		zHelpTooltip.helpDiv.style.display="none";
		// hideTooltip
	};
	zHelpTooltip.hover=function(e){
		clearTimeout(zHelpTooltip.curTimeoutId);
		zHelpTooltip.curTimeoutId=false;
		zHelpTooltip.curId=this.id;
		if(zHelpTooltip.arrTrack[this.id].hovering){
			zHelpTooltip.arrTrack[this.id].hovering=false;
			document.getElementById(zHelpTooltip.curId).onclick();
		}else{
			zHelpTooltip.arrTrack[this.id].hovering=true;
			zHelpTooltip.curTimeoutId=setTimeout(function(){ document.getElementById(zHelpTooltip.curId).onmouseover(); }, 1000);	
		}
	};
	zHelpTooltip.setupHelpTooltip=function(){
		zHelpTooltip.helpDiv=document.getElementById("zHelpToolTipDiv");
		zHelpTooltip.helpInnerDiv=document.getElementById("zHelpToolTipInnerDiv");
		var a=zGetElementsByClassName("zHelpToolTip");
		for(var i=0;i<a.length;i++){
			if(a[i].title == ""){
				continue;
			}
			a[i].style.display="block"; 
			zHelpTooltip.arrTrack[a[i].id]={hovering:false,title:a[i].title};
			a[i].title="";
			a[i].onmouseover=zHelpTooltip.hover;
			a[i].onmouseout=zHelpTooltip.hoverOut;
			a[i].ondragout=zHelpTooltip.hoverOut;
			a[i].onclick=zHelpTooltip.showTooltip;
		}
	};
	zArrDeferredFunctions.push(function(){
		if($("#zHelpToolTipDiv").length==0){
			$(document.body).append('<div id="zHelpToolTipDiv"><div id="zHelpToolTipInnerDiv"></div></div>');
		}
		zHelpTooltip.setupHelpTooltip();
	});

})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/tracking-functions.js */

(function($, window, document, undefined){
	"use strict";


	function zSetupClickTrackDisplay(){
		$(".zClickTrackDisplayValue").each(function(){
			if(this.getAttribute('data-zclickbindset')!=null){
				return;
			}
			$(this).attr('data-zclickbindset', '1');
			$(this).bind("click", zClickTrackDisplayValue); 
		});
		$(".zClickTrackDisplayURL").each(function(){
			if(this.getAttribute('data-zclickbindset')!=null){
				return;
			}
			$(this).attr('data-zclickbindset', '1');
			$(this).bind("click", zClickTrackDisplayURL);
		});
	}		
	function zClickTrackDisplayValue(){ 
		var postValue=this.getAttribute("data-zclickpostvalue");
		var eventCategory=this.getAttribute("data-zclickeventcategory");
		var eventLabel=this.getAttribute("data-zclickeventlabel");
		var eventAction=this.getAttribute("data-zclickeventaction");
		var eventValue=this.getAttribute("data-zclickeventvalue");
		
		zTrackEvent(eventCategory, eventAction, eventLabel, eventValue, '', false);
		if(postValue != ""){
			this.parentNode.innerHTML=postValue;
		}
		return false;
	}
	function zClickTrackDisplayURL(){
		var postValue=this.getAttribute("data-zclickpostvalue");
		var eventCategory=this.getAttribute("data-zclickeventcategory");
		var eventLabel=this.getAttribute("data-zclickeventlabel");
		var eventAction=this.getAttribute("data-zclickeventaction");
		var eventValue=this.getAttribute("data-zclickeventvalue");
		var newWindow=false;
		if(this.target == "_blank"){
			newWindow=true;
		}
		zTrackEvent(eventCategory, eventAction, eventLabel, eventValue, postValue, newWindow);
		if(this.target == "_blank"){
			return true;
		}else{
			return false;
		}
	}

	function zTrackEvent(eventCategory,eventAction, eventLabel, eventValue, gotoToURLAfterEvent, newWindow){
		// detect when google analytics is disabled on purpose to avoid running this.
		if(typeof zVisitorTrackingDisabled != "undefined"){
			if(gotoToURLAfterEvent != ""){
				setTimeout(function(){
					if(!newWindow){
						window.location.href = gotoToURLAfterEvent;
					}
				}, 100);
			}
			return; 
		}
			if(typeof window['GoogleAnalyticsObject'] != "undefined"){
				var b=window[window['GoogleAnalyticsObject']];
				if(gotoToURLAfterEvent != ""){
					if(eventLabel != ""){
						console.log('track event 1:'+eventValue);
						b('send', 'event', eventCategory, eventAction, eventLabel, eventValue, {'hitCallback': function(){if(!newWindow){window.location.href = gotoToURLAfterEvent;}}});
					}else{
						console.log('track event 2:'+eventAction);
						b('send', 'event', eventCategory, eventAction, {'hitCallback': function(){if(!newWindow){window.location.href = gotoToURLAfterEvent;}}});
					}
				}else{
					if(eventLabel != ""){
						console.log('track event 3:'+eventValue);
						b('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
					}else{
						console.log('track event 4:'+eventAction);
						b('send', 'event', eventCategory, eventAction);
					}
				}
			}else if(typeof pageTracker != "undefined" && typeof pageTracker._trackPageview != "undefined"){
				if(eventLabel != ""){
					pageTracker._trackEvent(eventCategory, eventAction, eventLabel, eventValue);
				}else{
					pageTracker._trackEvent(eventCategory, eventAction);
				}
				if(gotoToURLAfterEvent != ""){
					setTimeout(function(){ 
						if(!newWindow){
							window.location.href = gotoToURLAfterEvent;
						}
					}, 500);
				}
			}else if(typeof _gaq != "undefined" && typeof _gaq.push != "undefined"){
				if(gotoToURLAfterEvent != ""){
					_gaq.push(['_set','hitCallback',function(){
						if(!newWindow){
							window.location.href = gotoToURLAfterEvent;
						}
					}]);
				}
				if(eventLabel != ""){
					_gaq.push(['_trackEvent', eventCategory, eventAction, eventLabel, eventValue]);
				}else{
					_gaq.push(['_trackEvent', eventCategory, eventAction]);
				}
			}else{
				if(zIsLoggedIn()){
					if(!newWindow){
						window.location.href = gotoToURLAfterEvent;
					}
				}else{
					throw("Google analytics tracking code is not installed, or is using different syntax. Event tracking will not work until this is correct.");
				}
				//alert("Google analytics tracking code is not installed, or is using different syntax. Event tracking will not work until this is correct.");
			}
		/*try{
		}catch(e){
			if(zIsLoggedIn()){
				if(!newWindow){
					window.location.href = gotoToURLAfterEvent;
				}
			}else{
				//throw("Google analytics tracking code is not installed, or is using different syntax. Event tracking will not work until this is correct.");
			}
		}*/
	}

	// track all outbound links in google analytics events
	$(document).on("click", "a", function(e){
   		var d=window.location.href;
   		var slash=d.indexOf("/", 9); 
   		if(slash==-1){
   			return true;
   		}else{
	   		d=d.substr(0, slash);  
	   		var link="";
	   		if(typeof this.href != "undefined"){
	   			link=this.href;
	   		} 
	   		if(link == "" || link.substr(0,1) == "#"){
	   			return true;
	   		}
	   		var clickDomain=this.href.substr(0, d.length);
	   		if(clickDomain != d){  
	   			if(typeof this.target != "undefined" && this.target=="_blank"){
					zTrackEvent("outbound", link, "", "", link, true); 
	   				return true;
	   			}else{
					zTrackEvent("outbound", link, "", "", link, false); 
	   				return false;
	   			}
	   		}else{
		   		return true;
		   	}
	   	}
   	}); 

   	

	zArrLoadFunctions.push({functionName:zSetupClickTrackDisplay});
	window.zSetupClickTrackDisplay=zSetupClickTrackDisplay;
	window.zTrackEvent=zTrackEvent;
	window.zClickTrackDisplayURL=zClickTrackDisplayURL;
	window.zClickTrackDisplayValue=zClickTrackDisplayValue;
	window.zSetupClickTrackDisplay=zSetupClickTrackDisplay;
})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/video-library-functions.js */

// start video-library
var debugVideoLibrary=false;
var arrVideoLibrary=new Object();
var zVideoLibraryIntervalId=false;
var arrCurVideo=[];
var arrQueueVideoMap=[];
var progressBarWidth=100;		
var arrProgressVideo=[];
var videoSortingStarted=false;
var videoSortingChanged=false; 
var currentVideoLibraryId="";
var arrVideoLibraryCaptions=new Array();
var zVideoJsEmbedded=false;
var zVideoJsEmbedIndex=0;


(function($, window, document, undefined){
	"use strict";

	function zAjaxDeleteVideoCallback(r){
		var r2=eval('(' + r + ')');
		if(r2.success){
			var t=arrVideoLibraryComplete[r2.libraryId];
			
			var d=document.getElementById("sortable");
			d.removeChild(arrVideoLibraryComplete[r2.libraryId].NewLI);
			delete arrVideoLibraryComplete[r2.libraryId];
		}else{
			alert('Failed to delete video.');
		}
	}
	function zDeleteVideo(libraryId){
		var t=arrVideoLibraryComplete[libraryId];
		var r=confirm("Are you sure you want to delete: "+t.name);
		if (r===true){
			//document.getElementById('embedVideoDiv').innerHTML="";
			//document.getElementById('embedMenuDiv').style.display="none";
			var tempObj={};
			tempObj.id="zAjaxDeleteVideo";
			tempObj.url="/z/_com/app/video-library?method=deleteVideo&video_id="+t.video_id+"&libraryid="+libraryId;
			tempObj.cache=false;
			tempObj.callback=zAjaxDeleteVideoCallback;
			tempObj.ignoreOldRequests=false;
			zAjax(tempObj);	
		}
	}
	function zAjaxSaveQueueToVideoCallback(r){
		var r2=eval('(' + r + ')');
		if(r2.success === false){
			alert("Failed to save video to database.");	
			return;
		}
		var uploadId=arrQueueVideoMap[r2.queue_id];
		arrVideoLibrary[uploadId].width=r2.video_width;
		arrVideoLibrary[uploadId].height=r2.video_height;
		arrVideoLibrary[uploadId].video_id=r2.video_id;
		document.getElementById('divprogressbar'+uploadId).style.display="none";
		arrVideoLibrary[uploadId].divProgressBg.style.display="none";
		arrVideoLibrary[uploadId].divProgressBg2.style.display="none";
		arrVideoLibrary[uploadId].divProgressName.innerHTML+=' | <a href="#" onclick="showEmbedOptions(\''+uploadId+'\'); return false;">Embed</a> | <a href="#" onclick="zDeleteVideo(\''+uploadId+'\'); return false;">Delete</a>';
		
		arrVideoLibraryComplete[uploadId]=arrVideoLibrary[uploadId];
	}
	function zFixVideoObject(t){
		t.divVideoError=document.getElementById('divvideoerror'+t.id);
		t.divProgressName=document.getElementById('divprogressname'+t.id);
		t.divProgress=document.getElementById('divprogress'+t.id);
		t.divProgressBg=document.getElementById('divprogressbg'+t.id);
		t.divProgressBg2=document.getElementById('divprogressbg2'+t.id);
	}
	function zAjaxEncodeProgressCallback(r){
		var r2=eval('(' + r + ')');
		var a9=[];
		for(var i=0;i<r2.arrVideos.length;i++){
			r=r2.arrVideos[i];
			var uploadId=arrQueueVideoMap[r.queue_id];
			var t=arrVideoLibrary[uploadId];
			zFixVideoObject(t);
			var curDate=new Date();
			var mult=(100/Math.max(0.01,r.percent));
			var etaTime=mult*(curDate.getTime()-t.startEncodeDate.getTime());
			var dTime=(curDate.getTime()-t.startEncodeDate.getTime())/1000;
			var remainingTime=Math.round(Math.round(((etaTime-(curDate.getTime()-t.startEncodeDate.getTime()))/1000)*100)/100);
			if(r.status === 2){
				t.divVideoError.innerHTML='There was an error encoding the video, please try again or contact the webmaster for assistance. Cause: '+r.errorMessage;
			}else if(r.percent === 100){
				if(r.previewImage){
					$("#divprogressbar"+t.id).css("float", "none");
					t.divProgress.style.width="110px";
					t.divProgress.style.cssFloat="left";
					t.divProgress.innerHTML='<img src="/zupload/video/'+r.filename+'-00001.jpg" width="100" alt="Video" />';
					t.posterImage='/zupload/video/'+r.filename+'-00001.jpg';
				}else{
					t.divProgress.innerHTML='Complete - Image Preview Not Available';
					t.posterImage=false;
				}
				$("#divprogress2_"+t.id).html("Encoding complete.");
				t.divProgressName.style.width="80%";
				t.divProgressName.style.cssFloat="left";
				t.videoFile='/zupload/video/'+r.filename;
				var tempObj={};
				tempObj.id="zAjaxSaveQueueToVideo";
				tempObj.url="/z/_com/app/video-library?method=saveQueueToVideo&queue_id="+r.queue_id;
				tempObj.cache=false;
				tempObj.callback=zAjaxSaveQueueToVideoCallback;
				tempObj.ignoreOldRequests=false;
				zAjax(tempObj);	
			}else{
				if(r.percent === 0){
					remainingTime='Calculating';
				}
				$("#divprogress2_"+t.id).html('Encoding | Progress: '+r.percent+'% | Seconds remaining: '+(remainingTime));
			}
			t.divProgressBg2.style.width=Math.round((r.percent/100)*progressBarWidth)+"px";
			if(r.percent < 100){
				for(var n=0;n<arrProgressVideo.length;n++){
					if(arrProgressVideo[n] === parseInt(r.queue_id)){
						a9.push(arrProgressVideo[n]);
						break;
					}
				}
			}
		}
		arrProgressVideo=a9;
		if(a9.length===0 && zVideoLibraryIntervalId!==false){
			clearInterval(zVideoLibraryIntervalId);
			zVideoLibraryIntervalId=false;
			
		}
	}
	function zAjaxEncodeProgress(){
		var tempObj={};
		tempObj.id="zAjaxVideoEncodeProgress";
		tempObj.url="/z/_com/app/video-library?method=videoencodeprogress&queue_id_list="+arrProgressVideo.join(",");
		tempObj.cache=false;
		tempObj.callback=zAjaxEncodeProgressCallback;
		tempObj.ignoreOldRequests=false;
		zAjax(tempObj);	
	}
	function zAjaxEncodeCancelCallback(r){
		var r2=eval('(' + r + ')');
		for(var i in arrVideoLibrary){
			var c=arrVideoLibrary[i];
			if(typeof c.video_id !== "undefined"){
				continue;
			}
			var d=document.getElementById("sortable");
			d.removeChild(c.NewLI);
			delete arrVideoLibrary[i];
		}
		if(zVideoLibraryIntervalId!==false){
			clearInterval(zVideoLibraryIntervalId);
			zVideoLibraryIntervalId=false;
		}
		arrVideoLibrary=[];
		arrProgressVideo=[];
	}
	function cancelEncoding(){
		if(arrProgressVideo.length === 0){
			alert('No videos are currently being encoded.'); 
			return;
		}
		var tempObj={};
		tempObj.id="zAjaxVideoEncodeCancel";
		tempObj.url="/z/_com/app/video-library?method=videoencodecancel&queue_id_list="+arrProgressVideo.join(",");
		tempObj.cache=false;
		tempObj.callback=zAjaxEncodeCancelCallback;
		tempObj.ignoreOldRequests=false;
		zAjax(tempObj);	
			
	}
			
	function myUploadSuccess(obj, serverData){ 
		var r2=eval('(' + serverData + ')'); 
		//alert(serverData);
		var ac=arrCurVideo;
		arrCurVideo=[];
		//alert(ac);
		for(var i=0;i<r2.arrVideos.length;i++){
			var r=r2.arrVideos[i];
			if(r.success===false){
				alert(r.message);
				continue;
			}
			arrProgressVideo.push(parseInt(r.queue_id));
			arrQueueVideoMap[parseInt(r.queue_id)]=ac[i];
			arrVideoLibrary[ac[i]].startEncodeDate=new Date();
			arrVideoLibrary[ac[i]].width=r.width;
			arrVideoLibrary[ac[i]].height=r.height;
			arrVideoLibrary[ac[i]].divProgressName.innerHTML=r.video_file;
		}
		clearInterval(zVideoLibraryIntervalId);
		zVideoLibraryIntervalId=setInterval(function(){zAjaxEncodeProgress();},1000);
	}
	function myUploadError(obj, serverData,s3){			
		alert('Upload Cancelled');//:'+obj.name+" | "+serverData+" | "+s3);	
	}
	function zAjaxKeepSessionActiveCallback(file, serverdata){
		// do nothing	
	}
	function keepSessionActive(){ 
		var tempObj={};
		tempObj.id="zKeepSessionActive";
		tempObj.url="/z/_com/app/video-library?method=videokeepsessionactive";
		tempObj.cache=false;
		tempObj.callback=zAjaxKeepSessionActiveCallback;
		tempObj.ignoreOldRequests=false;
		zAjax(tempObj);	
	}


	function ajaxSaveVideo(id){
		if(debugVideoLibrary) document.getElementById("forvideodata").value+="ajaxSaveVideo(): video_id:"+id+"\n";
		var link="/z/_com/app/video-library?method=saveVideoId&action=update&video_library_id="+currentVideoLibraryId+"&video_id="+id+"&video_caption="+escape(document.getElementById('caption'+id).value);
		if(debugVideoLibrary) document.getElementById("forvideodata").value+="\n\n"+link+"\n\n";
		$.get(link, "",     function(data) { if(debugVideoLibrary) document.getElementById("forvideodata").value+="\n\nAJAX SAVE IMAGE RESULT:\n"+data+"\n"; },     "html");  
	}
	 
	function videoModalClose(){
		var embedVideoDiv=document.getElementById('embedVideoDiv');
		embedVideoDiv.innerHTML="";
	}

	function showEmbedOptions(libraryid){
		var modalContent1=embedCode;		
		zArrModalCloseFunctions.push(videoModalClose);
		zShowModal(modalContent1,{'width':Math.min(1920, zWindowSize.width-50),'height':Math.min(1080, zWindowSize.height-50),"maxWidth":1920, "maxHeight":1080});
		var titleDiv=document.getElementById('embedMenuDivTitle');
		titleDiv.innerHTML=arrVideoLibraryComplete[libraryid].name;
		document.getElementById('video_embed_id').value=libraryid;
		document.getElementById('video_embed_width').value=arrVideoLibraryComplete[libraryid].width;
		document.getElementById('video_embed_height').value=arrVideoLibraryComplete[libraryid].height;
	}
	function generateEmbedCode(){
		var libraryid = document.getElementById('video_embed_id').value;
		var t=arrVideoLibraryComplete[libraryid];
		var video_embed_width=document.getElementById('video_embed_width').value;
		var video_embed_height=document.getElementById('video_embed_height').value;
		var video_embed_autoplay=0;
		if(document.getElementById('video_embed_autoplay1').checked){
			video_embed_autoplay=1;
		}
		var video_embed_viewing_method=0;
		if(document.getElementById('video_embed_viewing_method_name1').checked){
			video_embed_viewing_method=1;
		}else if(document.getElementById('video_embed_viewing_method_name2').checked){
			video_embed_viewing_method=2;
		}
		var embedCodeTr=document.getElementById('embedCodeTr');
		embedCodeTr.style.display="block";
		var embedTextarea=document.getElementById('embedTextarea');
		
		if(zVideoJsEmbedded===false){
			zVideoJsEmbedded=true;
		}
		zVideoJsEmbedIndex++;
		
		t.video_hash=t.videoFile.split("-")[1].substr(0,32);
		var autoplay=0;
		if(video_embed_autoplay === 1){
			autoplay=1;
		}
		
		var s='<iframe src="'+zVideoJSDomain+'/z/misc/embed/video/'+t.video_id+'-'+t.video_hash+'-'+video_embed_width+'-'+video_embed_height+'-'+autoplay+'-0-0-0-0"  style="margin:0px; border:none; overflow:auto;" seamless="seamless" width="'+video_embed_width+'" height="'+video_embed_height+'"></iframe>';
		 
		embedTextarea.value=s;
		var embedVideoDiv=document.getElementById('embedVideoDiv');
		embedVideoDiv.innerHTML=s;
	}
	window.zAjaxEncodeProgressCallback=zAjaxEncodeProgressCallback;
	window.zFixVideoObject=zFixVideoObject;
	window.zAjaxSaveQueueToVideoCallback=zAjaxSaveQueueToVideoCallback;
	window.zDeleteVideo=zDeleteVideo;
	window.zAjaxDeleteVideoCallback=zAjaxDeleteVideoCallback;
	window.generateEmbedCode=generateEmbedCode;
	window.showEmbedOptions=showEmbedOptions;
	window.videoModalClose=videoModalClose;
	window.ajaxSaveVideo=ajaxSaveVideo;
	window.keepSessionActive=keepSessionActive;
	window.zAjaxKeepSessionActiveCallback=zAjaxKeepSessionActiveCallback;
	window.zAjaxEncodeCancelCallback=zAjaxEncodeCancelCallback;
	window.zAjaxEncodeProgress=zAjaxEncodeProgress;
	window.myUploadError=myUploadError;
	window.myUploadSuccess=myUploadSuccess;
	window.cancelEncoding=cancelEncoding;

})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo/zAjaxCycle.js */

(function($, window, document){
	"use strict";
	var arrListingTab=[];
	var itemCount=0;
	var curOffset=0;
	var curTimeout=0;
	var startSlide=0;
	var cycleOptions=0;
	var slidePanel0=0;
	var slidePanel1=0;
	var curTabURL="";
	var curTabOffset=0;
	var curFX='scrollLeft';
	var slideIsAnimating=false;
	function zUpdateAjaxSlides(tabOffset){
		if(slideIsAnimating){
			setTimeout(function(){ 
				zUpdateAjaxSlides(tabOffset); 
			}, 200);
			return;
		}
		curTabOffset=tabOffset;
		curTabURL=arrListingTab[curTabOffset];
		curOffset=0;
		//startSlide=0;
		clearTimeout(curTimeout);
		$.ajax({
			url: curTabURL,
			context: document.body,
			success: function(data){
				var curSlidePanel=0;
				if(startSlide===0){
					curSlidePanel=slidePanel1;
					startSlide=1;
				}else{
					curSlidePanel=slidePanel0;
					startSlide=0;
				}
				curSlidePanel.html(data);
				cycleOptions.fx='fade';
				$("#homePageListingCycleContainer").cycle("next");
				curTimeout=setTimeout(loadNextPanel, 5000);
			}
		});
	}
	function loadNextPanel(){ 
		loadListingPanel(5);
	}
	function slideAnimationDone(){
		slideIsAnimating=false;	
	}
	function zSetupAjaxCycle(newItemCount, arrNewListingTab){
		if(typeof newItemCount !== "undefined"){
			itemCount=newItemCount;
			arrListingTab=arrNewListingTab;
			slidePanel0=$("#sliderPanel0");
			slidePanel1=$("#sliderPanel1");
			$("#listingslidernext").bind("click", function(){
				console.log("next:"+slideIsAnimating);
				if(slideIsAnimating){
					return false;
				}
				loadListingPanel(5);
				return false;
			});
			$("#listingsliderprev").bind("click", function(){
				if(slideIsAnimating){
					return false;
				}
				loadListingPanel(-5);
				return false;
			});
		}
		$("#homePageListingCycleContainer").cycle({
			fx:'scrollLeft',
			timeout:0,
			pause:1,
			after: slideAnimationDone,
			before:slideAnimationBegin
		});
		//clearInterval(loadNextPanel);
		curTimeout=setTimeout(loadNextPanel, 5000);
	}
	function slideAnimationBegin(a,b,c){
		c.fx='scrollLeft';
		cycleOptions=c;
		slideIsAnimating=true;	
	}
	function listingPanelLoaded(r){
		var curSlidePanel=0;
		if(startSlide===0){
			curSlidePanel=slidePanel0;
		}else{
			curSlidePanel=slidePanel1;
		}
		curSlidePanel.html(r);
		cycleOptions.fx=curFX;
		cycleOptions.speed=300;
		if(curFX === 'scrollLeft'){
			$("#homePageListingCycleContainer").cycle("next");
		}else{
			$("#homePageListingCycleContainer").cycle("prev");
		}
		cycleOptions.speed=1000;
		curTimeout=setTimeout(loadNextPanel, 5000);
	}
	function loadListingPanel(offset){
		if(curOffset+offset < 0 || curOffset+offset >= itemCount){
			// can't go negative or above the listing count!
			return;
		}
		if(startSlide === 0){
			startSlide=1;
		}else{
			startSlide=0;
		}
		clearTimeout(curTimeout);
		curOffset+=offset;
		if(offset > 0){
			curFX='scrollLeft';	
		}else{
			curFX='scrollRight';
		}
		curTabURL=arrListingTab[curTabOffset];
		var tempObj={};
		tempObj.id="listingSlidePanelAjax";
		tempObj.url=curTabURL+"&offset="+curOffset;
		tempObj.cache=false;
		tempObj.callback=listingPanelLoaded;
		tempObj.ignoreOldRequests=false;
		zAjax(tempObj);		
	}
	window.zSetupAjaxCycle=zSetupAjaxCycle;
	window.zUpdateAjaxSlides=zUpdateAjaxSlides;
	/*
	 $.fn.ajaxCycle = function(initObject){
		 return this.each(function(){
			 
			 initObject.container=this;
			 this.zAjaxCycle=new zAjaxCycle(initObject);
		 });
	 }*/
})(jQuery, window, document);


/* /var/jetendo-server/jetendo/public/javascript/jetendo/zCart.js */

(function($, window, document, undefined){
	"use strict";
	var zCart=function(options){
		var self=this;
		var $cartDiv=false;
		var idOffset=0;
		var count=0;
		var cartLoaded=false;
		var items={};
		var itemIds={};
		if(typeof options === undefined){
			options={};
		}
		/* TODO Only store the ids in cookie, when user clicks on View, load the data from ajax request.
		 * setInterval to read the cookie because other browser windows are able to change it and this window would appear out of date. use setInterval to do this.
		 */
		
		// force defaults
		options.arrData=zso(options, 'arrData', false, []);
		options.viewCartCallback=zso(options, 'viewCartCallback', false, function(jsonCartData){});
		options.viewCartURL=zso(options, 'viewCartURL', false, '');
		options.debug=zso(options, 'debug', false, false);
		options.name=zso(options, 'name', false, '');
		options.label=zso(options, 'label', false, 'cart');
		options.emptyCartMessage=zso(options, 'emptyCartMessage', false, 'Nothing has been added to your cart.');
		options.selectedButtonText=zso(options, 'selectedButtonText', false, 'Already in cart');
		options.checkoutCallback=zso(options, 'checkoutCallback', false,  function(){self.checkout(); }); 
		options.changeCallback=zso(options, 'changeCallback', false, function(){});
		function setQuantity(){
			var itemId=this.getAttribute("data-zcart-id");
			var quantity=parseInt(this.value);
			if(isNaN(quantity)){
				this.value=1;
				return false;
			}
			self.updateQuantity(itemId, quantity);
			return true;
		}
		function init(options){
			$cartDiv=$(".zcart."+options.name);
			if($cartDiv.length === 0){
				throw(options.name+" is not defined.  zCart requires a valid object or selector for the cart items to be rendered in.");
			}
			// setup mouse events for add and remove buttons for this cart's name only.
			$(".zcart-add."+options.name).bind('click', function(){
				var jsonObj=eval("("+this.getAttribute("data-zcart-json")+")"); 
				var $quantity=$(".zcart-quantity[data-zcart-item-id='"+jsonObj.id+"']");
				if($quantity.length){
					jsonObj.quantity=parseInt($quantity.val());
					if(isNaN(jsonObj.quantity)){
						jsonObj.quantity=1;
					}
				}else{
					jsonObj.quantity=1;
				}
				self.add(jsonObj);
				return false;
			}).each(function(){
				var jsonObj=eval("("+this.getAttribute("data-zcart-json")+")");
				this.setAttribute("data-zcart-id", jsonObj.id);
				
				if(zKeyExists(itemIds, jsonObj.id)){
					$(this).addClass("zcart-add-saved");
					$(this).html(jsonObj.removeHTML);
				}
			});
			$(".zcart-item-quantity-input").bind('keyup paste blur', setQuantity);
			$(".zcart-remove."+options.name).bind('click', function(){
				var itemId=this.getAttribute("data-zcart-id");
				self.remove(itemId);
				return false;
			});
			$(".zcart-refresh."+options.name).bind('click', function(){
				self.renderItems();
				return false;
			});
			$(".zcart-view."+options.name).bind('click', function(){
				if($(this).hasClass("zcart-view-open")){
					$(this).removeClass("zcart-view-open");
					$(this).html(this.getAttribute("data-zcart-viewHTML"));
				}else{
					$(this).addClass("zcart-view-open");
					$(this).html(this.getAttribute("data-zcart-hideHTML"));
				}
				self.view();
				return false;
			});
			$(".zcart-checkout."+options.name).bind('click', function(){
				self.checkout();
				return false;
			});
			$(".zcart-clear."+options.name).bind('click', function(){
				self.clear();
				return false;
			});
			self.readCookie();
			self.updateCount(); 
			cartLoaded=true;
		};
		self.viewCallback=function(jsonCartData){
			options.viewCartCallback(jsonCartData);
			$cartDiv.slideToggle("fast");
		}
		self.view=function(){

			if(options.viewCartURL != ""){
				console.log("loading options.viewCartURL:"+options.viewCartURL);
				// maybe show a loading screen here
				var tempObj={};
				tempObj.id="zCartView";
				tempObj.url=options.viewCartURL;
				tempObj.callback=self.viewCallback;
				tempObj.errorCallback=function(d){
					alert("There was a problem loading the cart. Please try again later.");
				};
				tempObj.cache=false; 
				tempObj.ignoreOldRequests=true;
				zAjax(tempObj);

			}else{
				$cartDiv.slideToggle("fast");
			}
		};
		self.renderCount=function(){ 
			if(typeof options.countRenderCallback === "function"){
				options.countRenderCallback(count);
				return;
			}
			$(".zcart-count."+options.name).html(count);
		};
		self.getItems=function(){
			return items;
		};
		self.readCookie=function(){
			var value=zGetCookie("zcart-"+options.name);
			if(value === ""){
				return;
			}
			var arrId=value.split(",");
			if(options.debug) console.log("From cookie:"+arrId.join(","));
			for(var i in arrId){
				if(arrId[i] !== ""){
					var arrItem=arrId[i].split("|");
					if(options.debug) console.log("Added from cookie: "+options.arrData[arrItem[0]].id);
					options.arrData[arrItem[0]].quantity=arrItem[1];
					self.add(options.arrData[arrItem[0]]);
				}
			} 
		};
		self.updateCookie=function(){
			var arrId=[];
			for(var i in items){
				arrId.push(items[i].id+"|"+items[i].quantity);
			}
			zSetCookie({key:"zcart-"+options.name,value:arrId.join(","),futureSeconds:31536000,enableSubdomains:false}); 
		};
		self.updateCount=function(){
			if(options.debug) console.log("count is:"+count);
			if(count===0){
				$cartDiv.html(options.emptyCartMessage);
			}
			self.updateCookie();
			self.renderCount();
			if(cartLoaded){
				options.changeCallback(self);
				$(".zcart-count-container."+options.name).css({
					"background-color": "#000",
					"color": "#FFF"
				}).animate({
					"background-color": "#FFF",
					"color": "#000"
				}, 
				{
					duration:'slow',
					easing:'easeInElastic'
				});
				}
		};
		self.getCount=function(){
			return count;
		}
		self.add=function(jsonObj){
			// mark all other "add" buttons as saved too if their id matches.
			if(zKeyExists(itemIds, jsonObj.id)){ 
				self.remove(jsonObj.id);
				return;
			}else{
				$(".zcart-add."+options.name).each(function(){
					if(!$(this).hasClass("zcart-add-saved")){
						var tempJsonObj=eval("("+this.getAttribute("data-zcart-json")+")"); 
						if(jsonObj.id === tempJsonObj.id){
							$(this).addClass("zcart-add-saved").html(tempJsonObj.removeHTML);
						}
					}
				});
			}

			
			idOffset++;
			count++;
			if(options.debug) console.log('Adding item #'+jsonObj.id+" to cart: "+options.name+" with quantity="+jsonObj.quantity);
			var itemString=self.renderItem(jsonObj, idOffset); 
			if(count===1){
				$cartDiv.html(itemString);
			}else{
				$cartDiv.append(itemString);
			}
			$('#'+options.name+'zcart-item-delete-link'+idOffset).bind('click', function(){
				var itemId=this.getAttribute("data-zcart-id");
				self.remove(itemId);
				return false;
			});
			$("#"+options.name+"zcart-item"+idOffset).hide().fadeIn('fast');
			$(".zcart-item-quantity-input[data-zcart-id='"+jsonObj.id+"']").bind('keyup paste blur', setQuantity);
			jsonObj.cartId=idOffset;
			jsonObj.div=document.getElementById(options.name+"zcart-item"+idOffset);
			items[idOffset]=jsonObj;
			itemIds[jsonObj.id]=idOffset; 
			self.updateCount();
		};
		self.updateQuantity=function(itemId, quantity){
			if(!zKeyExists(itemIds, itemId)){
				return;
			}
			var id=itemIds[itemId];
			items[id].quantity=quantity;
		}
		self.remove=function(itemId){
			if(!zKeyExists(itemIds, itemId)){
				return;
			}
			var id=itemIds[itemId];
			if(options.debug) console.log('Removing item #'+itemId+" to cart: "+options.name);   
			delete items[id];
			delete itemIds[itemId];
			
			$(".zcart-add."+options.name).each(function(){
				if($(this).hasClass("zcart-add-saved")){
					var tempJsonObj=eval("("+this.getAttribute("data-zcart-json")+")"); 
					if(itemId === tempJsonObj.id){
						$(this).removeClass("zcart-add-saved").html(tempJsonObj.addHTML);
					}
				}
			});
			
			$("#"+options.name+"zcart-item"+id).fadeOut('fast',
				function(){
					$("#"+options.name+"zcart-item"+id).remove();
				}
			);
			count--;
			self.updateCount();
		}; 
		self.replaceTags=function(html, obj){
			for(var i in obj){
				var regEx=new RegExp("{"+i+"}", "gm"); 
				html=html.replace(regEx, zHtmlEditFormat(obj[i]));
			}
			return html;
		};
		self.renderItem=function(obj, id){
			var arrR=[];
			var itemTemplate=$(".zcart-templates .zcart-item");
			if(itemTemplate.length===0){
				throw(".zcart-template .zcart-item template is missing and it's required.");
			}
			itemTemplate=itemTemplate[0].outerHTML;
			var tempObj={};
			for(var i in obj){
				tempObj[i]=obj[i];
			}
			tempObj.itemId=options.name+'zcart-item'+id;
			tempObj.deleteId=options.name+'zcart-item-delete-link'+id;
			var newHTML=$(self.replaceTags(itemTemplate, tempObj));
			$(".zcart-item-image", newHTML).each(function(){
				var a=this.getAttribute("data-image");
				if(a !== ""){
					this.setAttribute("src", a);
				}
			});
			$("a", newHTML).each(function(){
				this.href=this.getAttribute("data-url");
			});
			newHTML.addClass(options.name);
			return newHTML[0].outerHTML;
		};
		self.renderItems=function(){
			var arrItems=[];
			for(var i in items){
				arrItems.push(self.renderItem(items[i], items[i].cartId));
			}
			$cartDiv.html(arrItems).hide().fadeIn('fast');
			self.updateCount();
		};
		self.ajaxAddCallback=function(){

		};
		self.ajaxAdd=function(){

		};
		self.clear=function(){
			items=[];
			itemIds=[]; 
			count=0;
			idOffset=0;
			$(".zcart-add."+options.name).each(function(){
				if($(this).hasClass("zcart-add-saved")){
					var tempJsonObj=eval("("+this.getAttribute("data-zcart-json")+")"); 
					$(this).removeClass("zcart-add-saved").html(tempJsonObj.addHTML);
				}
			});
			
			$(".zcart-item."+options.name).fadeOut('fast',
				function(){
					if ($(".zcart-item."+options.name+":animated").length === 0){
						$cartDiv.html("");
						self.updateCount();
					}
				}
			);
		};
		self.checkout=function(){
			// for listing inquiry, I pass comma separated obj.id
		// need a callback function for
			if(typeof options.checkoutCallback === "function"){
				options.checkoutCallback(self);
				return;
			}
			if(options.debug) console.log("No checkout callback defined.");
		};
		init(options);
		return this;
	}; 
	window.zCart=zCart;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo/zRecurringEvent.js */

(function($, window, document, undefined){
	"use strict";
	var zRecurringEvent=function(options){
		var self=this;
		var recurType="Daily";
		var lastPreviewColumnCount=0;
		var arrExclude=[];
		var calendarWidth=160; 
		var calendarColumns=0;
		var arrMarked=[];
		var calendarRows=3;
		var disableFormOnChange=false;

		var monthLookup={
			"January":0, 
			"February":1, 
			"March":2, 
			"April":3, 
			"May":4, 
			"June":5,
			"July":6,
			"August":7, 
			"September":8, 
			"October":9, 
			"November":10, 
			"December":11
		};

		var dayLookup={
			"Sunday":0,
			"Monday":1,
			"Tuesday":2,
			"Wednesday":3,
			"Thursday":4,
			"Friday":5,
			"Saturday":6,
			"Day":-1
		};
		var whichNameLookup={
			1:"The First",
			2:"The Second",
			3:"The Third",
			4:"The Fourth",
			5:"The Fifth",
			"-1":"The Last"
		};
		var whichLookup={
			"The First":1,
			"The Second":2,
			"The Third":3,
			"The Fourth":4,
			"The Fifth":5,
			"The Last":-1
		};
		var pythonDayToJs={
			6:0,
			0:1,
			1:2,
			2:3,
			3:4,
			4:5,
			5:6
		};
		var pythonDayToRRuleName={
			6:"SU",
			0:"MO",
			1:"TU",
			2:"WE",
			3:"TH",
			4:"FR",
			5:"SA"
		};
		var jsDayToPython={
			0:6,
			1:0,
			2:1,
			3:2,
			4:3,
			5:4,
			6:5
		};
		var pythonDayNameLookup={
			6:"Sunday",
			0:"Monday",
			1:"Tuesday",
			2:"Wednesday",
			3:"Thursday",
			4:"Friday",
			5:"Saturday"
		};
		var pythonDayLookup={
			"Sunday":6,
			"Monday":0,
			"Tuesday":1,
			"Wednesday":2,
			"Thursday":3,
			"Friday":4,
			"Saturday":5
		};
		var dayNameLookup={
			0:"Sunday",
			1:"Monday",
			2:"Tuesday",
			3:"Wednesday",
			4:"Thursday",
			5:"Friday",
			6:"Saturday"
		};

		if(typeof options === undefined){
			options={};
		}
		var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		
		// force defaults
		options.ruleObj=zso(options, 'ruleObj', false, {});
		options.arrExclude=zso(options, 'arrExclude', false, []);
		options.renderingEnabled=zso(options, 'renderingEnabled', false, true);
		function init(options){
			//$cartDiv=$(".zcart."+options.name);
			self.buildMonthlyCalendar();
			for(var i=0;i<options.arrExclude.length;i++){
				var d=new Date(Date.parse(options.arrExclude[i]));
				if(d=='Invalid Date'){
					alert(options.arrExclude[i]+' is an invalid exclude date, and was automatically removed.');
				}else{
					arrExclude[d.getTime()]=d;
				}
			}
 
			self.setFormFromRules(options.ruleObj, true); 

			recurType=$("#zRecurTypeSelect").val();
			$("#zRecurType"+recurType).show();
			$("#zRecurTypeSelect").bind("change", function(){
				recurType=$(this).val();
				$(".zRecurType").hide();
				$("#zRecurType"+recurType).show();
			});

			$("#zRecurTypeRangeDate").datepicker();
			$("#zRecurTypeExcludeDate").datepicker();
			zArrResizeFunctions.push(function(){

				calendarColumns=Math.floor((($(".zRecurPreviewBox").width()))/calendarWidth);
				if(lastPreviewColumnCount== calendarColumns){
					return;
				}
				lastPreviewColumnCount=calendarColumns;
				arrMarked=self.getMarkedDates();
				self.drawPreviewCalendars();
			});

			self.drawExcludedDates();
			$("#zRecurTypeExcludeDateButton").bind("click", function(){
				try{
					var date=new Date(Date.parse($("#zRecurTypeExcludeDate").val()));
					if(date=='Invalid Date'){
						alert($("#zRecurTypeExcludeDate").val()+' is an invalid date.  The date should be formatted: month/day/year using only numbers and /.');
						return false;
					}
				}catch(e){
					alert("You must specify a valid date first.");
					return false;
				}
				self.addExcludeDate(date);
				self.updateState();

				self.drawPreviewCalendars();
				return false;
			});

			$('.zRecurEventBox :input').bind("change", function(){
				self.drawPreviewCalendars();
			}); 
			/*setTimeout(function(){ 

				calendarColumns=Math.floor((($(".zRecurPreviewBox").width()))/calendarWidth);
				lastPreviewColumnCount=calendarColumns;
				arrMarked=self.getMarkedDates();
				self.drawPreviewCalendars();
			}, 200);*/
		};
		self.updateState=function () { 
			if(disableFormOnChange){
				return false;
			}
			var ruleObj=self.getRulesFromForm();
			var rule=self.convertFromRecurringEventToRRule(ruleObj);
			arrMarked=self.getMarkedDates();

			var arrDate2=[];
			for(var i in arrMarked){
				var d=new Date();
				d.setTime(i);
				var m=d.getMonth()+1;
				if(m<10){
					m="0"+m;
				}
				var d2=d.getDate();
				if(d2<10){
					d2="0"+d2;
				}
				arrDate2.push(d.getFullYear()+"-"+(m)+"-"+d2);
			}
			console.log("['"+arrDate2.join("','")+"']");

			if($("#event_recur_ical_rules", window.parent.document).length){
				var r=rule.toString();
				$("#event_recur_ical_rules", window.parent.document).val(r);

				var arrExclude2=[];
				for(var i in arrExclude){
					var n=new Date();
					n.setTime(i);
					var d=(n.getMonth()+1)+"/"+n.getDate()+"/"+n.getFullYear();
					if(d.indexOf("NaN") == -1){
						arrExclude2.push(d);
					}
				}

				$("#event_excluded_date_list", window.parent.document).val(arrExclude2.join(","));
				if($("#zRecurTypeSelect").val() == "None"){
					$("#recurringConfig1", window.parent.document).html("No");
				}else{
					$("#recurringConfig1", window.parent.document).html("Yes");

					var tempObj={};
					tempObj.id="zRecurAsPlainEnglish";
					tempObj.url="/z/_com/ical/ical?method=getIcalRuleAsPlainEnglishAsJson&rule="+escape(r);
					tempObj.callback=function(r2){
						var m=eval("("+r2+")");
						if(m.success){
							$("#recurringConfig1", window.parent.document).html("Yes | "+m.string);
						}
					};
					tempObj.cache=false;
					zAjax(tempObj);
				}
				if($("#zRecurTypeRangeRadio3")[0].checked){
					$("#event_recur_until_datetime", window.parent.document).val($("#zRecurTypeRangeDate").val());
				}else{
					$("#event_recur_until_datetime", window.parent.document).val("");
				}
				if(rule.options.count != null){
					$("#event_recur_count", window.parent.document).val(rule.options.count);
				}else{
					$("#event_recur_count", window.parent.document).val(0);
				}
				if(rule.options.interval != null){
					$("#event_recur_interval", window.parent.document).val(rule.options.interval);
				}else{
					$("#event_recur_interval", window.parent.document).val(1);
				}
				if(rule.options.freq != null){
					$("#event_recur_frequency", window.parent.document).val(rule.options.freq);
				}else{
					$("#event_recur_frequency", window.parent.document).val(1);
				}
			}

		};
		self.buildMonthlyCalendar=function(){
			var arrHTML=[];
			arrHTML.push('<div style="width:100%; float:left;">');
			for(var i=1;i<=31;i++){
				arrHTML.push('<span class="zRecurDayButton" style="width:36px;margin-bottom:3px;"><span style="width:15px; float:left;"><input type="checkbox" name="zRecurTypeMonthlyCalendarDay" class="zRecurTypeMonthlyCalendarDay" id="zRecurTypeMonthlyCalendarDay'+i+'" value="'+i+'" /></span> <label for="zRecurTypeMonthlyCalendarDay'+i+'" style="display:block; float:left;width:21px;">'+i+'</label></span></span>');
				if(i % 7 == 0){
					arrHTML.push('</div><div style="width:100%; float:left;">');
				}
			}
			arrHTML.push('<span class="zRecurDayButton" style="width:70px;margin-bottom:3px;"><span style="width:15px;display:block; float:left;"><input type="checkbox" name="zRecurTypeMonthlyCalendarDay" class="zRecurTypeMonthlyCalendarDay" id="zRecurTypeMonthlyCalendarDay0" value="0" /></span> <label for="zRecurTypeMonthlyCalendarDay0" style="display:block; float:left;width:52px;">Last Day</label></span></span>');
			arrHTML.push('</div>');
			$("#zRecurTypeMonthlyCalendar").html(arrHTML.join(""));
		};
		self.drawPreviewCalendars=function(){ 
			self.updateState();
			if(!options.renderingEnabled){
				return;
			}
			var $calendarDiv=$("#zRecurPreviewCalendars");
			var arrHTML=[];
			var count=0;

			calendarColumns=Math.floor((($(".zRecurPreviewBox").width()))/calendarWidth);
			var startDate=$("#event_start_datetime_date").val();
			if(startDate == ""){
				return;
			}
			try{
				var currentDate=new Date(Date.parse(startDate));
			}catch(e){
				return;
			}
			for(var i=0;i<calendarRows;i++){
				arrHTML.push('<div style="width:100%; float:left;">');
				for(var n=0;n<calendarColumns;n++){
					// currentDate + 1 month
					var newDate=new Date(currentDate.getTime());
					newDate.setDate(1);
					newDate.setMonth(newDate.getMonth()+count);
					newDate.setDate(1);
					arrHTML.push('<div class="zRecurCalendarContainer">'+self.buildCalendarHTML(newDate)+'</div>');
					count++;
				}
				arrHTML.push('</div>');
			}
			$calendarDiv.html(arrHTML.join(""));
			$(".zRecurCalendarDayMarked").bind("click", function(){
				var e=$(this).hasClass("zRecurCalendarDayExcluded");
				var date=new Date(parseInt($(this).attr("data-date")));
				if(e!=""){
					self.removeExcludedDate(date);
					$(this).removeClass("zRecurCalendarDayExcluded");
				}else{
					self.addExcludeDate(date);
					$(this).addClass("zRecurCalendarDayExcluded");
				}
			});
		};
		self.buildCalendarHTML=function(date){
			// 6 rows to make them all the same
			var month=monthNames[date.getMonth()]+" "+date.getFullYear();
			var arrHTML=['<div class="zRecurCalendarMonth">'+month+'</div><div class="zRecurCalendar">'];
			arrHTML.push('<div class="zRecurCalendarDayLabels">');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Su</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Mo</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Tu</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">We</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Th</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Fr</div>');
			arrHTML.push('<div class="zRecurCalendarDayLabel">Sa</div>');
			arrHTML.push('</div>');


			var monthString=monthNames[date.getMonth()];
			var firstDayOfWeek=date.getDay();
			var currentMonth=date.getMonth();
			date.setDate(date.getDate()-firstDayOfWeek);
			var day=date;
			for(var i=0;i<6;i++){
				arrHTML.push('<div class="zRecurCalendarWeek">');
				for(var n=0;n<7;n++){
					var dayMonth=day.getMonth();
					var currentDate=day.getDate();
					if(dayMonth != currentMonth){
						arrHTML.push('<div class="zRecurCalendarDayOtherMonth">'+currentDate+'</div>');
					}else{
						var markedCSS='';

						if(typeof arrMarked[day.getTime()] != "undefined"){
							markedCSS+=' zRecurCalendarDayMarked';
							if(typeof arrExclude[day.getTime()] != "undefined"){
								markedCSS+=' zRecurCalendarDayExcluded';
							}
						}
						var dateAsString=(day.getMonth()+1)+"/"+day.getDate()+"/"+day.getFullYear();
						arrHTML.push('<div class="zRecurCalendarDay'+markedCSS+'" id="zRecurCalendarDay'+day.getTime()+'" data-date="'+day.getTime()+'">'+currentDate+'</div>');
					}
					day.setDate(day.getDate()+1);
				}
				arrHTML.push('</div>');
			}
			arrHTML.push('</div>');
			return arrHTML.join("");
		}
		self.addExcludeDate=function(date){
			arrExclude[date.getTime()]=date;
			self.drawExcludedDates();
		};
		self.removeExcludedDate=function(date){
			var arrNew=[];
			var t=date.getTime();
			for(var i in arrExclude){
				if(i!=t){
					arrNew[i]=arrExclude[i];
				}
			}
			arrExclude=arrNew;
			self.drawExcludedDates();
		};
		self.drawExcludedDates=function(){
			var arrSort=[];
			for(var i in arrExclude){
				arrSort.push(parseInt(i));
			}
			arrSort.sort();
			var arrHTML=[];
			for(var i=0;i<arrSort.length;i++){
				var day=new Date(arrSort[i]);
				var dateAsString=(day.getMonth()+1)+"/"+day.getDate()+"/"+day.getFullYear();
				arrHTML.push('<div class="zRecurExcludedDay" data-date="'+day.getTime()+'"><div class="zRecurExcludedDayText">'+dateAsString+'</div><div class="zRecurExcludedDayDeleteButton">X</div></div>');
			}
			if(arrSort.length == 0){
				arrHTML.push('No dates are excluded');
			}
			$("#zRecurExcludedDates").html(arrHTML.join(""));
			$(".zRecurExcludedDay").bind("click", function(){
				var date=new Date(parseInt($(this).attr("data-date")));
				self.removeExcludedDate(date);
				$("#zRecurCalendarDay"+date.getTime()).removeClass("zRecurCalendarDayExcluded");
				return false;
			});
			self.drawPreviewCalendars();
		};
		self.setFormFromRules=function(ruleObj, disablePreviewUpdate){
			var defaultRuleObj={
				recurType:"None",
				noEndDate:false,
				everyWeekday:false,
				skipDays:1,
				recurLimit:0,
				endDate:false,
				skipWeeks:1,
				skipMonths:1,
				skipYears:1,
				arrWeeklyDays:[],
				monthlyWhich:"",
				monthlyDay:"",
				arrMonthlyCalendarDay:[],
				annuallyWhich:"",
				annuallyDay:"",
				annuallyMonth:""
			};

			for(var i in defaultRuleObj){
				if(typeof ruleObj[i] == "undefined"){
					ruleObj[i]=defaultRuleObj[i];
				}
			}
			disableFormOnChange=true;
			$("#zRecurTypeSelect").val(ruleObj.recurType);
			$("#zRecurTypeSelect").trigger("change");

			if(ruleObj.recurType == "Daily"){
				if(!ruleObj.everyWeekday){
					$("#zRecurTypeDailyRadio1").prop("checked", true);
					$("#zRecurTypeDailyDays").val(ruleObj.skipDays);
				}else{	
					$("#zRecurTypeDailyRadio2").prop("checked", true);
					ruleObj.everyWeekday=true;
				}

			}else if(ruleObj.recurType == "Weekly"){
				$("#zRecurTypeWeeklyWeeks").val(ruleObj.skipWeeks);
				var arrC=[];
				for(var i=0;i<ruleObj.arrWeeklyDays.length;i++){
					arrC[ruleObj.arrWeeklyDays[i]]=true;
				}
				$(".zRecurTypeWeeklyDay").each(function(){
					if(typeof arrC[this.value] != "undefined"){
						this.checked=true;
					}else{
						this.checked=false;
					}
				});

			}else if(ruleObj.recurType == "Monthly"){


				$("#zRecurTypeMonthlyDays").val(ruleObj.skipMonths);
				if(ruleObj.arrMonthlyCalendarDay.length == 0){
					$("#zRecurTypeMonthlyType1").prop("checked", true);

					$("#zRecurTypeMonthlyWhich").val(ruleObj.monthlyWhich); 
					$("#zRecurTypeMonthlyDay").val(ruleObj.monthlyDay);
				}else{
					
					$("#zRecurTypeMonthlyType2").prop("checked", true);
					var arrC=[];
					for(var i=0;i<ruleObj.arrMonthlyCalendarDay.length;i++){
						arrC[ruleObj.arrMonthlyCalendarDay[i]]=true;
					}
					$(".zRecurTypeMonthlyCalendarDay").each(function(){
						if(typeof arrC[this.value] != "undefined"){
							this.checked=true;
						}else{
							this.checked=false;
						}
					});
				}
			}else if(ruleObj.recurType == "Annually"){
				$("#zRecurTypeAnnuallyDays").val(ruleObj.skipYears);
				if(ruleObj.annuallyDay == ""){
					$("#zRecurTypeAnnuallyType1").prop("checked", true);
					$("#zRecurTypeAnnuallyWhich").val(ruleObj.annuallyWhich);
					$("#zRecurTypeAnnuallyMonth").val(ruleObj.annuallyMonth);
				}else{
					$("#zRecurTypeAnnuallyType2").prop("checked", true);
					$("#zRecurTypeAnnuallyWhich2").val(ruleObj.annuallyWhich);
					$("#zRecurTypeAnnuallyDay2").val(ruleObj.annuallyDay);
					$("#zRecurTypeAnnuallyMonth2").val(ruleObj.annuallyMonth);
				} 
			}

			if(typeof ruleObj.endDate != "boolean"){
				$("#zRecurTypeRangeRadio3").prop("checked", true);
				if(ruleObj.endDate != ""){
					ruleObj.endDate=new Date(Date.parse(ruleObj.endDate));
					var dateAsString=(ruleObj.endDate.getMonth()+1)+"/"+ruleObj.endDate.getDate()+"/"+ruleObj.endDate.getFullYear();
					$("#zRecurTypeRangeDate").val(dateAsString);
				}
			}else if(ruleObj.recurLimit != 0 && ruleObj.recurLimit != null){ 
				$("#zRecurTypeRangeDays").val(ruleObj.recurLimit);
				$("#zRecurTypeRangeRadio2").prop("checked", true);
			}else{ 
				$("#zRecurTypeRangeRadio1").prop("checked", true);
			}
			disableFormOnChange=false; 
			if(typeof disablePreviewUpdate == "undefined"){
				disablePreviewUpdate=false;
			}
			if(!disablePreviewUpdate){
				arrMarked=self.getMarkedDates();
				self.drawPreviewCalendars();
			}
		}
		self.getRulesFromForm=function(){
			var ruleObj={};
			ruleObj.recurType="Daily";
			ruleObj.noEndDate=false;
			ruleObj.everyWeekday=false;
			ruleObj.skipDays=1;
			ruleObj.recurLimit=0;
			ruleObj.endDate=false;
			ruleObj.skipWeeks=1;
			ruleObj.skipMonths=1;
			ruleObj.skipYears=1;
			ruleObj.arrWeeklyDays=[];
			ruleObj.monthlyWhich="";
			ruleObj.monthlyDay="";
			ruleObj.arrMonthlyCalendarDay=[];
			ruleObj.annuallyWhich="";
			ruleObj.annuallyDay="";
			ruleObj.annuallyMonth="";

			ruleObj.recurType=$("#zRecurTypeSelect").val();

			if(ruleObj.recurType == "Daily"){
				if($("#zRecurTypeDailyRadio1").prop("checked")){	
					try{
						ruleObj.skipDays=parseInt($("#zRecurTypeDailyDays").val());
						if(isNaN(ruleObj.skipDays)){
							alert('Interval must be a number');
							$("#zRecurTypeDailyDays").val('1');
							ruleObj.skipDays=1;
						}
					}catch(e){
						alert("X must be a valid number for the Every X Day(s) field.");
						$("#zRecurTypeDailyDays").val(1);
					}

				}else if($("#zRecurTypeDailyRadio2").prop("checked")){	
					ruleObj.everyWeekday=true;
				}

			}else if(ruleObj.recurType == "Weekly"){
					try{
						ruleObj.skipWeeks=parseInt($("#zRecurTypeWeeklyWeeks").val());
						if(isNaN(ruleObj.skipWeeks)){
							alert('Interval must be a number');
							$("#zRecurTypeWeeklyWeeks").val('1');
							ruleObj.skipWeeks=1;
						}
					}catch(e){
						alert("X must be a valid number for the Every X Week(s) field.");
						$("#zRecurTypeWeeklyWeeks").val(1);
					}
					
					$(".zRecurTypeWeeklyDay").each(function(){
						if(this.checked){
							ruleObj.arrWeeklyDays.push(this.value);
						}
					});

			}else if(ruleObj.recurType == "Monthly"){
				try{
					ruleObj.skipMonths=parseInt($("#zRecurTypeMonthlyDays").val());
					if(isNaN(ruleObj.skipMonths)){
						alert('Interval must be a number');
						$("#zRecurTypeMonthlyDays").val('1');
						ruleObj.skipMonths=1;
					}
				}catch(e){
					alert("X must be a valid number for the Every X Month(s) field.");
					$("#zRecurTypeMonthlyDays").val(1);
				}
				if($("#zRecurTypeMonthlyType1").prop("checked")){
					ruleObj.monthlyWhich=$("#zRecurTypeMonthlyWhich").val();
					ruleObj.monthlyDay=$("#zRecurTypeMonthlyDay").val();
				}else if($("#zRecurTypeMonthlyType2").prop("checked")){
					
					$(".zRecurTypeMonthlyCalendarDay").each(function(){
						if(this.checked){
							ruleObj.arrMonthlyCalendarDay.push(parseInt(this.value));
						}
					});
				}
			}else if(ruleObj.recurType == "Annually"){
				try{
					ruleObj.skipYears=parseInt($("#zRecurTypeAnnuallyDays").val());
					if(isNaN(ruleObj.skipYears)){
						alert('Interval must be a number');
						$("#zRecurTypeAnnuallyDays").val('1');
						ruleObj.skipYears=1;
					}
				}catch(e){
					alert("X must be a valid number for the Every X Year(s) field.");
					$("#zRecurTypeAnnuallyDays").val(1);
				}
				if($("#zRecurTypeAnnuallyType1").prop("checked")){
					ruleObj.annuallyWhich=$("#zRecurTypeAnnuallyWhich").val();
					ruleObj.annuallyMonth=$("#zRecurTypeAnnuallyMonth").val();


				}else if($("#zRecurTypeAnnuallyType2").prop("checked")){
					ruleObj.annuallyWhich=$("#zRecurTypeAnnuallyWhich2").val();
					ruleObj.annuallyDay=$("#zRecurTypeAnnuallyDay2").val();
					ruleObj.annuallyMonth=$("#zRecurTypeAnnuallyMonth2").val();
				}
			}

			if($("#zRecurTypeRangeRadio1").prop("checked")){
				// do nothing
			}else if($("#zRecurTypeRangeRadio2").prop("checked")){
				try{
					ruleObj.recurLimit=parseInt($("#zRecurTypeRangeDays").val());
				}catch(e){

				}
			}else if($("#zRecurTypeRangeRadio3").prop("checked")){
				var d=$("#zRecurTypeRangeDate").val();
				if(d!=""){
					try{
						ruleObj.endDate=new Date(Date.parse(d));
					}catch(e){
						alert("Invalid end date");
						$("#zRecurTypeRangeDate").val("");
					}
				}
			}
			return ruleObj;
		}
		self.getDaysInMonth=function(date){
			var newDate=new Date(date.getTime());
			newDate.setMonth(newDate.getMonth()+1);
			newDate.setDate(0);
			return newDate.getDate();
		};
		self.getProjectedDateCount=function(startDate){
			
			var d=$("#zRecurTypeRangeDate").val();
			var endDate=new Date();
			if(d!=""){
				try{
					endDate=new Date(Date.parse(d));
				}catch(e){
					alert("Invalid end date");
					endDate=new Date();
				}
			}
			var d=new Date(startDate.getTime());
			d.setFullYear(d.getFullYear()+2);
			if(endDate > d){
				d=endDate;
			}
			var count=(d-startDate)/(1000*60*60*24);
			console.log("Project "+count+" days | startDate:"+startDate.toString()+" | endDate:"+d.toString());
			return count;
			/*
			var projectedDateCount=0;
			var monthCount=Math.max(24, Math.floor($(".zRecurPreviewBox").width()/calendarWidth)*calendarRows);
			var d=new Date(startDate.getTime());
			for(var i=0;i<monthCount;i++){
				var daysInMonth=self.getDaysInMonth(d);
				projectedDateCount+=daysInMonth;
				d.setMonth(d.getMonth()+1);
			}
			return projectedDateCount;*/
		};
		self.lastDayOfWeekOfMonth=function(date, day){
			var month = date.getMonth();
			var year = date.getFullYear(); 
			var d = new Date(year,month+1,0);
			if(day==-1){
				return d;
			}
			while (d.getDay() != day) {
				d.setDate(d.getDate() -1);
			}
			return d;
		};

		/* self.isNthDay(new Date(), 1, 2); */
		self.isNthDay=function(theDate, dayOfWeek, dayNum){
			if(Math.ceil(theDate.getDate()/7) == dayNum){
				if(theDate.getDay() == dayOfWeek){
					return true;
				}
			}
			return false;
		}
		self.getMarkedDates=function(){
			var arrDate=[];
			var startDate=$("#event_start_datetime_date").val();
			if(startDate == ""){
				return arrDate;
			}
			try{
				var currentDate=new Date(Date.parse(startDate));
			}catch(e){
				return arrDate;
			}
			var startTime=currentDate.getTime();
			// this was wrong...
			//currentDate.setDate(1);


			var ruleObj=self.getRulesFromForm();
			if(ruleObj.recurLimit != 0){
				var projectedDateCount=50000;
				console.log("Project "+projectedDateCount+" days | startDate:"+startDate.toString());
			}else{
				var projectedDateCount=self.getProjectedDateCount(currentDate);
			}


			//console.log("projectedDateCount:"+projectedDateCount);
			var arrDebugDate=[];
			var recurCount=0;
			//console.log(ruleObj);

			//return arrDate;

			var lastDate=new Date(currentDate.getTime());
			lastDate.setDate(lastDate.getDate()+projectedDateCount);
			var lastTime=lastDate.getTime();

			// weekly fields
			var arrWeeklyDayLookup={
				0:false,
				1:false,
				2:false,
				3:false,
				4:false,
				5:false,
				6:false
			};
			var weeklyLookupCount=ruleObj.arrWeeklyDays.length; 
			for(var i=0;i<ruleObj.arrWeeklyDays.length;i++){
				arrWeeklyDayLookup[ruleObj.arrWeeklyDays[i]]=true;
			}

			var monthlyDayLookup=[];
			for(var i=0;i<ruleObj.arrMonthlyCalendarDay.length;i++){
				monthlyDayLookup[ruleObj.arrMonthlyCalendarDay[i]]=true;
			}
			var monthDayCount=0;
			var monthDayCountMonth=-1;
			var monthlyLastDayOfWeekMatch=0;

			try{
				var d=dayLookup[ruleObj.monthlyDay];
			}catch(e){
				alert("Invalid value for ruleObj.monthlyDay: "+ruleObj.monthlyDay);
				return arrDate;
			}
			try{
				var d=dayLookup[ruleObj.monthlyDay];
			}catch(e){
				alert("Invalid value for ruleObj.monthlyDay: "+ruleObj.monthlyDay);
				return arrDate;
			}
			var lastDayOfMonth=0;
			var firstMonth=true;
			var totalMonthCount=0;
			var firstWeek=true;
			var firstYear=true;
			var lastYear=currentDate.getFullYear();
			var firstDay=true;


			//var endDate=new Date($("#event_end_datetime_date").val()); 
			for(var i=0;i<projectedDateCount;i++){ 
				if(i == 50000){
					alert("Infinite loop detected");
					break;
				}
				if(!firstDay && ruleObj.recurType == "Daily" && ruleObj.skipDays-1){
					currentDate.setDate(currentDate.getDate()+(ruleObj.skipDays-1));
				}
				if(!firstWeek && ruleObj.recurType == "Weekly" && currentDate.getDay()==0){
					if(ruleObj.skipWeeks-1){
						currentDate.setDate(currentDate.getDate()+((ruleObj.skipWeeks-1)*7));
					}
				}
				if(monthDayCountMonth != currentDate.getMonth()){
					totalMonthCount++;
					if(ruleObj.recurType == "Monthly"){
						if(!firstMonth && currentDate.getDate() == 1 && ruleObj.skipMonths-1){
							currentDate.setMonth(currentDate.getMonth()+(ruleObj.skipMonths-1));
						}
						firstMonth=false;
					}else if(ruleObj.recurType == "Annually"){
						if(currentDate.getFullYear()!=lastYear && ruleObj.skipYears-1){
							currentDate.setFullYear(currentDate.getFullYear()+(ruleObj.skipYears-1));
							lastYear=currentDate.getFullYear();
						}
					}
					monthDayCount=0;
					monthDayCountMonth=currentDate.getMonth();
					lastDayOfMonth=new Date(currentDate);
					lastDayOfMonth.setMonth(lastDayOfMonth.getMonth()+1);
					lastDayOfMonth.setDate(0);
					var lastDayOfMonthTime=lastDayOfMonth.getTime();
					if(ruleObj.monthlyDay != ""){
						monthlyLastDayOfWeekMatch=self.lastDayOfWeekOfMonth(currentDate, dayLookup[ruleObj.monthlyDay]);
					}
					if(ruleObj.annuallyDay != ""){
						monthlyLastDayOfWeekMatch=self.lastDayOfWeekOfMonth(currentDate, dayLookup[ruleObj.annuallyDay]);
					}
				}
				var day=currentDate.getDay();
				var debugDate=new Date(currentDate.getTime());
				var currentTime=currentDate.getTime(); 
				var isEvent=false;
				var disableEvent=false;
				/*if(currentDate.getTime() > endDate.getTime()){ 
					break;
				}*/
				if(!ruleObj.noEndDate && typeof ruleObj.endDate != "boolean"){
					if(currentTime > ruleObj.endDate.getTime()){
						break;
					}
				}
				/*if(typeof arrExclude[currentTime] != "undefined"){
				//	disableEvent=true;
				}*/
				if(ruleObj.recurType == "Daily"){
					if(ruleObj.everyWeekday){
						if(day != 0 && day != 6){
							isEvent=true;
						}
					}else{
						isEvent=true;
					}
				}else if(ruleObj.recurType == "Weekly"){
					if(arrWeeklyDayLookup[day]){
						isEvent=true;
					}
				}else if(ruleObj.recurType == "Monthly"){
					if(ruleObj.arrMonthlyCalendarDay.length){
						if(typeof monthlyDayLookup[0] != "undefined" && currentTime == lastDayOfMonthTime){
							isEvent=true;
						}
						if(typeof monthlyDayLookup[currentDate.getDate()] != "undefined"){
							isEvent=true;
						}
					}else{
						if(ruleObj.monthlyDay != ""){
							var dayMatch=false;
							if(ruleObj.monthlyDay == "Day"){
								monthDayCount++;	
								dayMatch=true;
							}else if(day == dayLookup[ruleObj.monthlyDay]){
								monthDayCount++;	
								dayMatch=true;
							}

							if(ruleObj.monthlyWhich == "Every"){
								if(dayMatch){
									isEvent=true;
								}
							}else if(ruleObj.monthlyWhich == "The Last"){
								if(dayMatch && currentDate.getDate() == monthlyLastDayOfWeekMatch.getDate()){
									isEvent=true;
								}
							}else if(ruleObj.monthlyDay == "Day"){
								if(currentDate.getDate() == whichLookup[ruleObj.monthlyWhich]){
									isEvent=true;
								}
							}else{
								if(dayMatch && self.isNthDay(currentDate, day, whichLookup[ruleObj.monthlyWhich])){
									isEvent=true;
								}
							}
						}
					}
				}else if(ruleObj.recurType == "Annually"){

					if(currentDate.getMonth() == ruleObj.annuallyMonth){

						if(ruleObj.annuallyDay != ""){
							var dayMatch=false;
							if(ruleObj.annuallyDay == "Day"){
								monthDayCount++;	
								dayMatch=true;
							}else if(day == dayLookup[ruleObj.annuallyDay]){
								monthDayCount++;	
								dayMatch=true;
							}
							if(ruleObj.annuallyWhich == "Every"){
								if(dayMatch){
									isEvent=true;
								}
							}else if(ruleObj.annuallyWhich == "The Last"){
								if(dayMatch && currentDate.getDate() == monthlyLastDayOfWeekMatch.getDate()){
									isEvent=true;
								}
							}else if(ruleObj.annuallyDay == "Day"){
								if(currentDate.getDate() == whichLookup[ruleObj.annuallyWhich]){
									isEvent=true;
								}
							}else{
								if(dayMatch && self.isNthDay(currentDate, day, whichLookup[ruleObj.annuallyWhich])){
									isEvent=true;
								}
							}
						}else{
							if(ruleObj.annuallyWhich == currentDate.getDate()){
								isEvent=true;
							}
						}
					}
				}
				if(currentTime==startTime){
					if(!isEvent){
						recurCount--;
					}
					isEvent=true;
				}
				currentDate.setDate(currentDate.getDate()+1);
				if(isEvent){
					if(!disableEvent && currentTime>=startTime && currentTime<=lastTime){
						arrDate[currentTime]=true;
						arrDebugDate.push(debugDate.toGMTString());
						recurCount++;
						firstDay=false;
						firstWeek=false;
					}
				}
				if(ruleObj.recurLimit != 0 && recurCount==ruleObj.recurLimit){
					break;
				}
			}

			//console.log(arrDebugDate);
			return arrDate;
		}

		self.convertFromRRuleToRecurringEvent=function(r){
			var rule = RRule.fromString(r);
			var options=rule.options;
			console.log(rule);
			console.log(rule.toString()); 
			/*

			docs: 
			https://www.npmjs.org/package/rrule
			http://www.kanzaki.com/docs/ical/rrule.html

			byeaster: null
			byhour: Array[1]
			byminute: Array[1]
			bymonth: Array[1]
			bymonthday: Array[1]
			bynmonthday: Array[0]
			bynweekday: null
			bysecond: Array[1]
			bysetpos: null
			byweekday: null
			byweekno: null
			byyearday: null
			count: 3
			dtstart: Sun Aug 17 2014 09:45:07 GMT-0400 (Eastern Daylight Time)
			freq: 0
			interval: 1
			until: null
			wkst: 0

			TODO: need to add support for dtstart and until
			*/
			if(options.byeaster == null){
				options.byeaster=[];
			}
			if(options.byhour == null){
				options.byhour=[];
			}
			if(options.byminute == null){
				options.byminute=[];
			}
			if(options.bymonth == null){
				options.bymonth=[];
			}
			if(options.bymonthday == null){
				options.bymonthday=[];
			}
			if(options.bynmonthday == null){
				options.bynmonthday=[];
			}
			if(options.bynweekday == null){
				options.bynweekday=[];
			}
			if(options.bysecond == null){
				options.bysecond=[];
			}
			if(options.bysetpos == null){
				options.bysetpos=[];
			}
			if(options.byweekday == null){
				options.byweekday=[];
			}
			if(options.byweekno == null){
				options.byweekno=[];
			}
			if(options.byyearday == null){
				options.byyearday=[];
			}
			if(options.bymonth.length > 1 || options.bynweekday.length > 1 || 
				options.byeaster.length > 0 || options.bynmonthday.length > 1 || options.bysetpos.length > 0){ 
				//options.bymonthday.length > 1 || 
				console.log(options);
				throw("Unsupported RRule: "+r);
			}
			var ruleObj={};
			ruleObj.recurLimit=options.count;
			/*if(options.dtstart != null){
				$("#event_start_datetime_date").val((options.dtstart.getMonth()+1)+"/"+options.dtstart.getDate()+"/"+options.dtstart.getFullYear());
				var hours=options.dtstart.getHours();
				var ampm="am";
				if(hours>12){
					hours-12;
					ampm="pm";
				}
				$("#event_start_datetime_time").val(hours+":"+options.dtstart.getMinutes()+" "+ampm);
			}
			if(options.dtend != null){
				$("#event_end_datetime_date").val((options.dtstart.getMonth()+1)+"/"+options.dtstart.getDate()+"/"+options.dtstart.getFullYear());
				var hours=options.dtend.getHours();
				var ampm="am";
				if(hours>12){
					hours-12;
					ampm="pm";
				}
				$("#event_end_datetime_time").val(hours+":"+options.dtend.getMinutes()+" "+ampm);
			}*/
			if(typeof options.until != "undefined" && options.until != null && options.until != ""){
				ruleObj.endDate=options.until;
				ruleObj.recurLimit=0;
			}
			if(options.freq == RRule.YEARLY){
				ruleObj.recurType="Annually";
				if(options.bynweekday.length){
					if(typeof pythonDayNameLookup[options.bynweekday[0][0]] == "undefined"){
						alert('Invalid bynweekday value.');
						return [];
					}
					ruleObj.annuallyDay=pythonDayNameLookup[options.bynweekday[0][0]];
					if(options.bynweekday[0][1]==-1){
						ruleObj.annuallyWhich="The Last";
					}else if(options.bynweekday[0][1]<0){
						throw("Unsupported RRule: "+r);
					}else{
						ruleObj.annuallyWhich=whichNameLookup[options.bynweekday[0][1]];
					}
				}else if(options.byweekday.length){
					if(typeof pythonDayNameLookup[options.byweekday[0]] == "undefined"){
						alert('Invalid byweekday value.');
						return [];
					}
					ruleObj.annuallyWhich="Every";
					ruleObj.annuallyDay=pythonDayNameLookup[options.byweekday[0]];
					if(options.byweekday.length == 7){
						ruleObj.annuallyDay="Day";
					}else if(options.byweekday.length>1){
						throw("Unsupported RRule: "+r);
					}
				}else if(options.byyearday.length){
					throw("RRULE BYYEARDAY is not implemented in zRecurringEvent");
				}else if(options.bymonthday.length){
					ruleObj.annuallyWhich=options.bymonthday[0];
				}else if(options.bynmonthday.length){
					ruleObj.annuallyDay="Day";
					ruleObj.annuallyWhich="The Last";
				}else{
					throw("Unsupported RRule: "+r);
				}
				ruleObj.skipYears=options.interval;
				ruleObj.annuallyMonth=options.bymonth[0];
			}else if(options.freq == RRule.MONTHLY){
				ruleObj.recurType="Monthly";
				ruleObj.skipMonths=options.interval;
				if(options.bynweekday.length){
					if(typeof pythonDayNameLookup[options.bynweekday[0][0]] == "undefined"){
						alert('Invalid bynweekday value.');
						return [];
					}
					ruleObj.monthlyDay=pythonDayNameLookup[options.bynweekday[0][0]];
					if(options.bynweekday[0][1]==-1){
						ruleObj.monthlyWhich="The Last";
					}else if(options.bynweekday[0][1]<0){
						throw("Unsupported RRule: "+r);
					}else{
						ruleObj.monthlyWhich=whichNameLookup[options.bynweekday[0][1]];
					}
					console.log('day lookup:'+options.bynweekday[0][0]+":"+pythonDayNameLookup[1]+" python:"+pythonDayNameLookup[options.bynweekday[0][0]]+" final day:"+ruleObj.monthlyDay);
				}else if(options.byweekday.length){
					if(typeof pythonDayNameLookup[options.byweekday[0]] == "undefined"){
						alert('Invalid byweekday value.');
						return [];
					}
					ruleObj.monthlyWhich="Every";
					ruleObj.monthlyDay=pythonDayNameLookup[options.byweekday[0]];
					if(options.byweekday.length == 7){
						ruleObj.monthlyDay="Day";
					}else if(options.byweekday.length>1){
						throw("Unsupported RRule: "+r);
					}

					if(options.bymonthday.length){
						throw("Unsupported RRule (bymonthday is missing from monthly interface in zRecurringEvent): "+r);
					}
				}else if(options.bymonthday.length){
					ruleObj.arrMonthlyCalendarDay=options.bymonthday;
				}else if(options.bynmonthday.length){
					ruleObj.monthlyDay="Day";
					ruleObj.monthlyWhich="The Last";
				}else{
					throw("Unsupported RRule: "+r);
				}

			}else if(options.freq == RRule.WEEKLY){
				ruleObj.recurType="Weekly";
				ruleObj.skipWeeks=options.interval;
				if(options.byweekday.length){
					ruleObj.arrWeeklyDays=[];
					for(var i=0;i<options.byweekday.length;i++){
						ruleObj.arrWeeklyDays.push(pythonDayToJs[options.byweekday[i]]);
					}
				}else{
					throw("Unsupported RRule: "+r);
				}
			}else if(options.freq == RRule.DAILY){
				ruleObj.recurType="Daily";
				if(options.byweekday.length){
					if(options.byweekday.length != 5){
						throw("Unsupported RRule: "+r);
					}
					for(var i=0;i<options.byweekday.length;i++){
						if(options.byweekday[i] == 6 || options.byweekday[i] == 5){
							throw("Unsupported RRule: "+r);
						}
					}
					ruleObj.everyWeekday=true;
					ruleObj.skipDays=1;
				}else{
					ruleObj.skipDays=options.interval;
				}
			}else if(options.freq == RRule.HOURLY){
				throw("FREQ=HOURLY is not implemented in zRecurringEvent");
			}else if(options.freq == RRule.MINUTELY){
				throw("FREQ=MINUTELY is not implemented in zRecurringEvent");
			}else if(options.freq == RRule.SECONDLY){
				throw("FREQ=SECONDLY is not implemented in zRecurringEvent");
			}
			return ruleObj;
		};

		self.convertFromRecurringEventToRRule=function(ruleObj){
			var options={
				byeaster: [],
				byhour: [],
				byminute: [],
				bymonth: [],
				bymonthday: [],
				bynmonthday: [],
				bynweekday: [],
				bysecond: [],
				bysetpos: [],
				byweekday: [],
				byweekno: [],
				byyearday: [],
				count: 0,
				dtstart: null,
				freq: 0,
				interval: 1,
				until: null
			}; 
			if(typeof ruleObj.endDate != "undefined" && ruleObj.endDate != "" && ruleObj.endDate != false && ruleObj.endDate != null){
				options.until=ruleObj.endDate;
			}else{
				options.until=null;
			}
			if(typeof ruleObj.recurLimit != "undefined"){
				options.count=ruleObj.recurLimit;
			}
			if(ruleObj.recurType=="None"){
				var rule = new RRule({});
				console.log(rule);
				console.log(rule.toString()); 
				return rule;
			}else if(ruleObj.recurType=="Annually"){
				options.freq=RRule.YEARLY;
				if(ruleObj.annuallyDay !="" && ruleObj.annuallyWhich!="" && ruleObj.annuallyWhich!="Every"){
					//?
					if(ruleObj.annuallyDay == "Day"){
						options.bymonthday[0]=whichLookup[ruleObj.annuallyWhich];
					}else{
						options.byweekday[0]=pythonDayLookup[ruleObj.annuallyDay];
						if(ruleObj.annuallyWhich=="The Last"){
							options.byweekday[0]=RRule[pythonDayToRRuleName[options.byweekday[0]]].nth(-1); // The Last
						}else{
							options.byweekday[0]=RRule[pythonDayToRRuleName[options.byweekday[0]]].nth(whichLookup[ruleObj.annuallyWhich]);
						}
					}
				}else if(ruleObj.annuallyDay!="" && ruleObj.annuallyWhich=="Every"){
					if(ruleObj.annuallyDay == "Day"){
						options.byweekday=("0,1,2,3,4,5,6").split(",");
					}else{
						options.byweekday[0]=pythonDayLookup[ruleObj.annuallyDay];
					}
				}else{
					options.bymonthday[0]=ruleObj.annuallyWhich;
				}
				options.interval=ruleObj.skipYears;
				options.bymonth[0]=ruleObj.annuallyMonth;
			}else if(ruleObj.recurType=="Monthly"){
				options.freq = RRule.MONTHLY;
				options.interval=ruleObj.skipMonths;
				if(ruleObj.monthlyWhich!="" && ruleObj.monthlyWhich!="Every"){
					if(ruleObj.monthlyDay == "Day"){
						options.bymonthday[0]=whichLookup[ruleObj.monthlyWhich];
					}else{
						options.byweekday[0]=pythonDayLookup[ruleObj.monthlyDay];
						if(ruleObj.monthlyWhich=="The Last"){
							options.byweekday[0]=RRule[pythonDayToRRuleName[options.byweekday[0]]].nth(-1);
						}else{
							options.byweekday[0]=RRule[pythonDayToRRuleName[options.byweekday[0]]].nth(whichLookup[ruleObj.monthlyWhich]);
						}
					}
				}else if(ruleObj.monthlyWhich=="Every"){
					if(ruleObj.monthlyDay == "Day"){
						options.byweekday=("0,1,2,3,4,5,6").split(",");
					}else{
						options.byweekday[0]=pythonDayLookup[ruleObj.monthlyDay];
					}

				}else{
					options.bymonthday=ruleObj.arrMonthlyCalendarDay;
				}

			}else if(ruleObj.recurType == "Weekly"){
				options.freq = RRule.WEEKLY;
				options.interval=ruleObj.skipWeeks;
				if(ruleObj.arrWeeklyDays.length){
					for(var i=0;i<ruleObj.arrWeeklyDays.length;i++){
						options.byweekday.push(jsDayToPython[ruleObj.arrWeeklyDays[i]]);
					}
				}
			}else if(ruleObj.recurType == "Daily"){
				options.interval=ruleObj.skipDays;
				options.freq = RRule.DAILY;
				if(ruleObj.everyWeekday){
					options.byweekday=[0,1,2,3,4];
				}
			}
			for(var i in options){
				if(options[i] != null && typeof options[i].length != "undefined" && options[i].length == 0){
					delete options[i];
				}
			}
			var rule = new RRule(options);
			console.log(rule);
			console.log(rule.toString()); 
			return rule;
		};
		init(options);
		return this;
	}; 
	window.zRecurringEvent=zRecurringEvent;
})(jQuery, window, document, "undefined"); 


/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/listing-ajax.js */

(function($, window, document, undefined){
"use strict";
function zLoadListingSavedSearches(){
	var arrMap=[];
	$(".zls-listingSavedSearchMapSummaryDiv").each(function(){
		var ssid=$(this).attr("data-ssid");
		if(ssid == ""){
			return;
		}
		arrMap[ssid]=this;
	});

	$(".zls-listingSavedSearchDiv").each(function(){
		var currentDiv=this;
		var ssid=$(this).attr("data-ssid");
		if(ssid == ""){
			return;
		}
		var tempObj={};
		tempObj.id="zListingSavedSearchAjax"+ssid;
		tempObj.cache=false;
		tempObj.method="get"; 
		
		tempObj.callback=function(d){   
			try{
				var r=JSON.parse(d); 
				if(r.success){ 
					$(currentDiv).html(r.listingOutput);
					if(ssid in arrMap){
						$(".contentPropertySummaryDiv", arrMap[ssid]).html(r.mapSummaryOutput);
						$(".mapContentDiv", arrMap[ssid]).html('<iframe id="embeddedmapiframe" src="/z/listing/map-embedded/index?ssid='+ssid+'" width="100%" height="340" style="border:none; overflow:auto;" seamless="seamless"></iframe>');
					}
					zlsEnableImageEnlarger();
					zLoadAndCropImages();
				}else{
					$(currentDiv).html("Listings not available at this time. Please try again later. Error Code ##1");
				}
			}catch(e){
				$(currentDiv).html("Listings not available at this time. Please try again later. Error Code ##2");
				throw e;
				return;
			} 
		};

		tempObj.errorCallback=function(d){
			$(currentDiv).html("Listings not available at this time. Please try again later.");
		};
		tempObj.ignoreOldRequests=false;
		tempObj.url="/z/listing/ajax-listing/index?ssid="+ssid; 
		if(ssid in arrMap){
			tempObj.url+="&getMapSummary=1";
		}
		zAjax(tempObj); 
	});
}
zArrLoadFunctions.push({functionName:zLoadListingSavedSearches});

function zListingLoadSavedCart(){
	if(typeof zIsModalWindow != "undefined"){
		return;
	}
	var listingCount=zGetCookie("SAVEDLISTINGCOUNT"); 
	var enabled=true;
	if(listingCount=="0" || listingCount==""){
		enabled=false; 
	} 
	if(enabled){
		var tempObj={};
		tempObj.id="zListingLoadSavedCart";
		tempObj.cache=false;
		tempObj.method="get"; 
		tempObj.callback=function(d){  
			var r=JSON.parse(d);
			if(r.success){ 
				if($("#sl894nsdh783").length==0){
					$("#zTopContent").append('<div id="sl894nsdh783" style="width:100%; float:left; clear:both;"></div>');
				}
				var listingCount=zGetCookie("SAVEDLISTINGCOUNT"); 
				if(listingCount=="0" || listingCount==""){
					$("#sl894nsdh783").html("").hide(); 
				}else{
					$("#sl894nsdh783").show().html(r.output);   
				}
			} 
		}; 
		tempObj.ignoreOldRequests=false;
		tempObj.url="/z/listing/sl/index";  
		zAjax(tempObj);  
	}else{
		$("#sl894nsdh783").html("").hide(); 
	}
}



zArrDeferredFunctions.push(zListingLoadSavedCart);


function zSetupListingCartButtons(){

	$(document).on("click", ".zls-saveListingButton", function(e){
		e.preventDefault();
		var tempObj={};
		tempObj.id="zListingLoadSavedCart";
		tempObj.cache=false;
		tempObj.method="get"; 
		tempObj.callback=function(d){  
			var r=JSON.parse(d); 
			if(r.success){ 
				zListingLoadSavedCart();
			}else{
				alert('Listing saved');
			} 
		}; 
		tempObj.ignoreOldRequests=false;
		var id=$(e.target).attr("data-listing-id");

		tempObj.url="/z/listing/sl/add?listing_id="+id;  
		zAjax(tempObj);   
	}); 


	$(document).on("click", ".zls-removeListingButton", function(e){
		e.preventDefault();
		var tempObj={};
		tempObj.id="zListingLoadSavedCart";
		tempObj.cache=false;
		tempObj.method="get"; 
		tempObj.callback=function(d){  
			var r=JSON.parse(d); 
			if(r.success){ 
				zListingLoadSavedCart();
			} 
		}; 
		tempObj.ignoreOldRequests=false;
		var id=$(e.target).attr("data-listing-id");
		tempObj.url="/z/listing/sl/delete?listing_id="+id;  
		zAjax(tempObj);   
	});
	$(document).on("click", ".zls-removeAllListingButton", function(e){
		e.preventDefault();
		var tempObj={};
		tempObj.id="zListingLoadSavedCart";
		tempObj.cache=false;
		tempObj.method="get"; 
		tempObj.callback=function(d){  
			var r=JSON.parse(d);
			if(r.success){ 
				zListingLoadSavedCart();
			} 
		}; 
		tempObj.ignoreOldRequests=false;
		tempObj.url="/z/listing/sl/deleteAll";  
		zAjax(tempObj);   
	});
}
zArrLoadFunctions.push({functionName:zSetupListingCartButtons});




})(jQuery, window, document, "undefined"); 

/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/listing-functions.js */

function zClearSelection() {
    if(document.selection && document.selection.empty) {
        document.selection.empty();
    } else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}
function zConvertSliderToSquareMeters(id1,id2, force){
	if(!force){
		setTimeout(function(){zConvertSliderToSquareMeters(id1,id2, true);},1);
		return;
	}
	var d0=document.getElementById("search_sqfoot_low_zvalue");
	if(d0===null) return;
	var d1=document.getElementById("zInputSliderBottomBox_"+d0.value);
	var f1=document.getElementById(id1);
	var f2=document.getElementById(id2);
	var sm1="";
	var sm2="";
	if(f1.value !== ""){
		var f1_2=parseInt(f1.value);
		if(!isNaN(f1_2)){
			sm1=Math.round(f1_2/10.7639);
		}
	}
	if(f2.value !== ""){
		var f2_2=parseInt(f2.value);
		if(!isNaN(f2_2)){
			sm2=Math.round(f2_2/10.7639);
		}
	}
	d1.innerHTML='<div style="width:50%; float:left; text-align:left;">'+sm1+'m&#178;</div><div style="width:50%; float:left; text-align:right;">'+sm2+'m&#178;</div>';
	d1.style.display="block";
}

function zInactiveCheckLoginStatus(f){
	if(zGetCookie("Z_USER_ID")==="" || zGetCookie("Z_USER_ID")==='""'){
		var found=false;
		if(f.type==="select" || f.type==="select-multiple"){
			var d1=document.getElementById("search_liststatus");
			for(var i=0;i<d1.options.length;i++){
				if(d1.options[i].value==="1"){
					d1.options[i].selected=true;
				}else{
					if(d1.options[i].selected){
						found=true;
						d1.options[i].selected=false;
					}
				}
			}
		}else if(f.type === "checkbox"){
			for(var i=1;i<30;i++){
				var d1=document.getElementById("search_liststatus_name"+i);
				if(d1){
					if(d1.value==="1"){
						d1.checked=true;
					}else{
						if(d1.checked){
							found=true;
							d1.checked=false;
						}
					}
				}else{
					break;
				}
			}
		}
		if(found){
			zShowModalStandard('/z/user/preference/register?modalpopforced=1&custommarketingmessage='+escape('Due to MLS Association Rules, you must register a free account to view inactive or sold listing data.  Use the form below to sign-up and view this data.')+'&reloadOnNewAccount=1', 640, 630);
				//alert('Only active listings can be displayed until you register a free account.');
		}
	}
}


function getMLSTemplate(obj,row){
	var arrR=new Array();
	arrR.push('<table><tr><td valign="top" wid'+'th="110" style="font-size:10px; font-style:italic;"><div class="listing-l-img"><a href="#URL#"><img src="#PHOTO1#" alt="#TITLE#" style="max-width:100%;" class="listing-d-im'+'g"></a></div>ID##MLS_ID#-#LISTING_ID#</td><td valign="top"><h2><a href="#URL#" style="text-decoration:none; ">#TITLE#</a></h2><span>#DESCRIPTION#</span><span class="listing-l-l'+'inks" style="padding-bottom:0px; "><a href="#URL#" class="zcontent-readmore-link">Read More</a><a href="/z/listing/inquiry/index?acti'+'on=form&mls_id=#MLS_ID#&listing_id=#LISTING_ID#" rel="nofollow">Send An Inquiry</a><a href="/z/listing/sl/index?save'+'Act=check&mls_id=#MLS_ID#&listing_id=#LISTING_ID#" rel="nofollow">Save Listing</a>');
	if(obj["VIRTUAL_TOUR"][row] !== ""){
		arrR.push('<a href="#VIRTUAL_TOUR#" target="_blank" rel="nofollow">View Virtual Tour</a>');
	}
	arrR.push('</span></td></tr><tr><td colspan="2" style="border-bottom:1px solid #999999;">&nbsp;</td></table><br />');
	return arrR.join("");
}


var zMLSMessageBgColor="0x990000";
var zMLSMessageTextColor="0xFFFFFF";
var zMLSMessageOutputId=0;
function zMLSShowFlashMessage(){
	var a=zGetElementsByClassName("zFlashDiagonalStatusMessage");
	for(var i=0;i<a.length;i++){
		var message=a[i].innerHTML;
		zMLSMessageOutputId++;
		message=zStringReplaceAll(message,"\r","");
		if(message!=="" && message.indexOf("<object ") === -1){
			//a[i].innerHTML=('<img src="/z/a/images/s.gif" width="100%" height="100%">');
		//}else{
			a[i].innerHTML=('<object zswf="off" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="221" height="161" id="zMLSMessage'+zMLSMessageOutputId+'"><param name="allowScriptAccess" value="sameDomain" /><param name="allowFullScreen" value="false" /><param name="movie" value="/z/a/listing/images/message.swf?messageText='+escape(message)+'&bgColor='+zMLSMessageBgColor+'&textColor='+zMLSMessageTextColor+'" /><param name="quality" value="high" /><param name="scale" value="noscale" /><param name="wmode" value="transparent" /><param name="salign" value="TL" /><param name="bgcolor" value="#ffffff" />	<embed src="/z/a/listing/images/message.swf?messageText='+escape(message)+'&bgColor='+zMLSMessageBgColor+'&textColor='+zMLSMessageTextColor+'" quality="high" scale="noscale" wmode="transparent" bgcolor="#ffffff" width="221" height="161" name="zMLSMessage'+zMLSMessageOutputId+'" style="pointer-events:none;" salign="TL" allowScriptAccess="sameDomain" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer" /></object>');	
		}
		a[i].style.display="block";
	}
}
zArrLoadFunctions.push({functionName:zMLSShowFlashMessage});



function zModalSaveSearch(searchId){
	var modalContent1='<iframe src="/z/listing/property/save-search/index?searchId='+searchId+'" width="100%" height="95%"  style="margin:0px;overflow:auto; border:none;" seamless="seamless"></iframe>';
	zShowModal(modalContent1,{'width':520,'height':410});
}
/*
function zToggleSortFormBox(){
	var d1=document.getElementById("search_remarks");
	var d2=document.getElementById("search_remarks_negative");
	var d3=document.getElementById("zSortFormBox");
	var d5=document.getElementById("zSortFormBox2");
	var d4=document.getElementById("search_sort");
	if(d1.value !="" || d2.value !== ""){
		d3.style.display="none";
		d4.selectedIndex=0;
		d5.style.display="block";
	}else{
		d3.style.display="block";
		d5.style.display="none";
	}
}
*/

function zShowInquiryPop(){
	var modalContent1='<iframe src="/z/listing/inquiry-pop/index" width="100%" height="95%" style="margin:0px;overflow:auto; border:none;" seamless="seamless"></iframe>';
	zShowModal(modalContent1,{'width':520,'height':438});
}





/*
function zListingDisplayHelpBox(){
	document.write('<a href="javascript:zToggleDisplay(\'zListingHelpDiv\');">Need help using search?</a><br />'+
	'<div id="zListingHelpDiv" style="display:none; border:1px solid #990000; padding:10px; padding-top:0px;">'+
	'<p style="font-size:14px; font-weight:bold;">Search Directions:</p>'+
	'<p>Click on one of the search options on the sidebar and use the text fields, sliders and check boxes to enter your search data.  After you are done, click "Show Results" and the results will load on the right. </p>'+
	'<p><strong>City Search:</strong> Start typing a city into the box and our system will automatically show you a list of matching cities.  Select each city you wish to include in the search by using the arrow keys up and down.  Please the enter key or left click with your mouse to confirm the selection.  To remove a city, click the "X" button to the left of the city name. Only cities matching the ones in our system may be selected.</p>'+
	'<p>After typing an entry, click "Update Results" to update your search. </p>'+
	'<p>You can select or type as many options as you want.</p>'+
	'<p>Your search will automatically show the # of matching listings as you update each search field.</p>'+
	'<p>After searching, only the available options will appear.  To reveal more options again, try unselecting or extending the range for your next search.</p>'+
	'</div>');
}*/

function zDisplayConversionCode(){

	var tempObj={};
	tempObj.method="post";
	tempObj.url='/z/misc/system/getConversionCode'; 
	tempObj.cache=false;
	tempObj.callback=function(r){
		$("body").append('<div>'+r+'</div>');
	};
	tempObj.ignoreOldRequests=true;
	zAjax(tempObj);
}

function ajaxSubmitListingInquiryCallback(r){
	var obj=eval('('+r+')'); 
	if(obj.success){
		$(".listingInquiryErrorDiv").hide();
		$(".listingInquirySuccessDiv").html(obj.message).fadeIn('fast');
		zJumpToId("listingInquirySuccessDiv");

		zTrackPageview('/z/misc/thank-you/index');
		zDisplayConversionCode();
	}else{
		$(".listingInquirySuccessDiv").hide();
		$(".listingInquiryErrorDiv").html(obj.errorMessage).fadeIn('fast');
		zJumpToId("listingInquiryErrorDiv");
	}
}
function zSubmitListingInquiry(){ 
	var postObj=zGetFormDataByFormId("listingInquiryForm");
	var tempObj={};
	tempObj.method="post";
	tempObj.url='/z/listing/inquiry/send';
	tempObj.postObj=postObj;
	tempObj.cache=false;
	tempObj.callback=ajaxSubmitListingInquiryCallback;
	tempObj.ignoreOldRequests=true;
	zAjax(tempObj);

	return false;
}

/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/listing-image-functions.js */

function zlsEnableImageEnlarger(){
	var a=zGetElementsByClassName("zlsListingImage");	
	for(var i=0;i<a.length;i++){
		var id=a[i].id.substr(0,a[i].id.length-4);
		var d=document.getElementById(id+"_mlstempimagepaths");
		if(d !== null){
			zIArrMLink[id]="";
			zIArrM[id]=d.value.split("@");
			zIArrM2[id]=[];
			zIArrM3[id]=false;
			zImageMouseMove(id, false, true);
		}
	}
}
zArrLoadFunctions.push({functionName:zlsEnableImageEnlarger});


 var zIArrMLink=new Array();
var zIArrM=new Array();
var zIArrM2=new Array();
var zIArrM3=new Array();
  var zIArrMST=new Array();
  var zIArrOriginal=new Array();
function zImageMouseReset(id,mev){
	var d2=document.getElementById(id);
	if(d2===null) return;
	var dpos=zGetAbsPosition(d2);
	var dimg=document.getElementById(id+"_img");
	if(
		(zMousePosition.x > dpos.x)                &&
		(zMousePosition.x < (dpos.x + dpos.width))  &&
		(zMousePosition.y > dpos.y)                &&
		(zMousePosition.y < (dpos.y + dpos.height))){
		return;
	}
	if(typeof zIImageClickLoad!=="undefined" && zIImageClickLoad){
		var b1=document.getElementById('zlistingnextimagebutton');
		var b2=document.getElementById('zlistingprevimagebutton');
		b1.style.display="none";
		b2.style.display="none";	
		return;
	}
	zIArrMST[id]=false;
	zIArrM5[id]=-1;
	zIArrM2[id]=new Array();
	dimg.style.display="block";
	zImageForceCloseEnlarger();
	if(typeof zIArrOriginal[id] !== "undefined"){
		document.getElementById('zListingImageEnlargeImageParent').innerHTML='<img id="zListingImageEnlargeImage" alt="Image" src="'+zIArrOriginal[id]+'" onerror="zImageOnError(this);" />';
	}
}
function zImageOnError(o){
	o.onmousemove=null;
	o.onmouseout=null;
	o.src='/z/a/listing/images/image-not-available.gif';
}
var zIArrMOffset=new Array();
  var zIArrMSize=new Array();
  var zIArrM5=new Array();
  var zIImageMaxWidth=540;
  var zIImageMaxHeight=420;
  var zICurrentImageIndex=0;
  var zICurrentImageXYPos=[0,0];
  //var zIImageClickLoad=false;
  var zILastLoaded="";
function zImageMouseMove(id,mev,forceResize){

	zLoadImageEnlargerDiv();

	var d=document.getElementById(id);
	if(d===null) return;
	var dpos=zGetAbsPosition(d);
	
	var dimg=document.getElementById(id+"_img");
	if(dimg === null) return;
	var imageURL=dimg.getAttribute("data-imageurl");
	var b='/z/a/listing/images/image-not-available.gif';
	if(typeof dimg.src !== "undefined"){
		imageURL=dimg.src;
		if(dimg.src.substr(dimg.src.length-b.length, b.length) === b){
			return false;
		}
	}else if(imageURL !== ""){
		if(imageURL.indexOf(b) !== -1){
			return false;
		}
	}
	if(zILastLoaded === id){
		return;	
	}
	zIArrOriginal[id]=imageURL;
	if(typeof zIImageClickLoad !== "undefined" && zIImageClickLoad && typeof mev !== "boolean"){
		zILastLoaded=id;
		// show the prev/next buttons
		var b1=document.getElementById('zlistingnextimagebutton');
		var b2=document.getElementById('zlistingprevimagebutton');
		if(b1 !== null){
			if(zIArrM[id].length<=1){
				b1.style.display="none";
				b2.style.display="none";	
			}else{
				b1.style.display="block";
				b2.style.display="block";
				b1.style.paddingBottom=(dpos.height-19-45)+"px";
				b2.style.paddingBottom=(dpos.height-19)+"px";
			}
			if(zICurrentImageXYPos[0] === dpos.x && zICurrentImageXYPos[1] === dpos.y){
				return;
			}
			if(typeof zIArrMOffset[id] === "undefined"){
				zIArrMOffset[id]=0;
			}
			var b1pos=zGetAbsPosition(b1);
			zICurrentImageIndex=0;
			zICurrentImageXYPos[0]=dpos.x;
			zICurrentImageXYPos[1]=dpos.y;
			b1.ondblclick=function(){zClearSelection(); return false;};
			b2.ondblclick=function(){zClearSelection(); return false;};
			b1.onselectstart=function(){ zClearSelection(); return false;};
			b2.onselectstart=function(){ zClearSelection(); return false;};
			b2.style.top=((dpos.y)+10)+"px";//-dpos.height
			b2.style.left=dpos.x+"px";
			b1.style.top=((dpos.y)+10)+"px";//-dpos.height
			b1.style.left=((dpos.x+dpos.width)-b1pos.width)+"px";
			//b1.style.paddingTop=(dpos.height-b1pos.height)+"px";
			//b2.style.paddingTop=(dpos.height-b1pos.height)+"px";
			b1.curId=id;
			b1.curImageDiv=dimg;
			b2.curId=id;
			b2.curImageDiv=dimg;
			b1.unselectable=true;
			b2.unselectable=true;
			b1.onclick=function(){
				// next image
				//alert('next');
				var c=zIArrM[this.curId].length;
				var c2=zIArrMOffset[this.curId];
				c2++;
				if(c2 >=c){
					c2=0;	
				}
				this.curImageDiv.src=zIArrM[this.curId][c2];
				zIArrMOffset[this.curId]=c2;
				return false;
			};
			b2.onclick=function(){
				// prev image
				//alert('prev');	
				var c=zIArrM[this.curId].length;
				var c2=zIArrMOffset[this.curId];
				c2--;
				if(c2 <0){
					c2=c-1;	
				}
				this.curImageDiv.src=zIArrM[this.curId][c2];
				zIArrMOffset[this.curId]=c2;

				return false;
			};
		}
		dimg.onload=function(){
			var v1=zGetAbsPosition(this.parentNode); 
			if(v1.width === 0){
				var v1=zGetAbsPosition(this.parentNode.parentNode); 
			}
			//alert(this.parentNode.parentNode+":"+this.parentNode.parentNode.id+":"+v1.width+":"+this.width+":"+v1.height+":"+this.height);
			this.style.marginLeft=Math.max(0,Math.floor((v1.width-this.width)/2))+"px";
			//this.style.paddingRight=Math.max(0,Math.floor((v1.width-nw)/2))+"px";
			this.style.marginTop=Math.max(0,Math.floor((v1.height-this.height)/2))+"px";
			//this.style.paddingBottom=Math.max(0,Math.floor((v1.height-nh)/2))+"px";
		};
		return;	
	}
	if(forceResize!==true){
	  var offsetX =mev.clientX-dpos.x;
	  p=(offsetX/dpos.width);
	}else{
		p=0;	
	}
	if(typeof zIArrM === "undefined" || zIArrM === null || typeof zIArrM[id] === "undefined" || zIArrM[id] === null){
	  return;  
	}
	o=Math.min(Math.max(0,Math.floor(zIArrM[id].length*p)),zIArrM[id].length-1);
	if(zIArrM5[id]===o || zIArrM[id].length===0){
		if(typeof mev !== "boolean"){ 
			zImageShowEnlarger(id,dimg,dpos,zIArrM[id][o]);
		}
		return;
	}
  zIArrM5[id]=o;
  var lbl=zIArrM[id][o];
  if(zIArrM[id].length!==0 && o<zIArrM[id].length){
	  if(zIArrM3[id]===false){
		  for(var n=0;n<zIArrM[id].length;n++){
			  if(typeof mev !== "boolean" || n===0){
				zIArrMSize[zIArrM[id][n]]=[0,0];//nm.width,nm.height];
			  }
		  }
	  }
	if(zIArrM2[id][o]!==1){
		dimg.o222=dimg;
		dimg.o333=id;
		dimg.onload=function(){
			return;
		};
	}else{
		dimg.onload=null;
	}
		dimg.style.display="block";
	if(zIArrM[id][o] !== imageURL){
		if(typeof mev !== "boolean"){ 
			zImageShowEnlarger(id,dimg,dpos,zIArrM[id][o]);
		}
	}
  }
}
function zImageForceCloseEnlarger(){
	zLoadImageEnlargerDiv();
	var d99=document.getElementById('zListingImageEnlargeDiv');
	if(d99 !== null){
		d99.style.display="none";
	}
}


var zImageEnlargerLoaded=false;
function zLoadImageEnlargerDiv(){
	if(zImageEnlargerLoaded){
		return;
	}
	zImageEnlargerLoaded=true;

	$(document.body).append('<div id="zListingImageEnlargeDiv" style="position:absolute; cursor:pointer;pointer-events:none; display:none; left:0px; top:0px; width:540px;background-color:#FFF; max-width:100%; z-index:1002;  color:##999;  padding-top:0px; font-size:10px; line-height:11px; text-align:center;"><div style="width:98%; float:left;clear:both;background-color:#FFF;padding:1%;">ROLL YOUR MOUSE LEFT AND RIGHT TO VIEW ALL PHOTOS. <strong>CLICK TO READ MORE.</strong></div><br style="clear:both;" /><div id="zListingImageEnlargeImageParent" style="width:100%;text-align:center;float:left;"><img src="/z/a/images/s.gif" id="zListingImageEnlargeImage" style="max-width:100%;max-height:100%;display:inline-block;" alt="Enlarged Image" /></div></div>');
}


function zImageShowEnlarger(id,dimg,dpos,src){
	var d=document.getElementById(id);
	if(d===null) return;
	zSetScrollPosition();
	//if(typeof zIArrMDead[id] === "undefined"){
		var ws=getWindowSize();
		zLoadImageEnlargerDiv();
		var d99=document.getElementById('zListingImageEnlargeDiv');
		if(d99 !== null){
			if(d99.style.display==="none" || zCurEnlargeImageId !== id){
				zCurEnlargeImageId=id; 
				// detect which side of listing image has more room
				
				var newLeft=0;
				var newTop=0;
				if(dpos.x + (dpos.width/2) > ws.width / 2 || ws.width < 580 ){
					// left bigger
					
					newLeft=Math.max(20, dpos.x-580); 
				}else{
					newLeft=Math.min(dpos.x+dpos.width+20, (ws.width-580)-zPositionObjSubtractPos[0]);
				}
				if(dpos.y + (dpos.height/2) > ws.height / 2 || ws.height < 470){
					// top bigger
					newTop=Math.max(dpos.y-470,zScrollPosition.top+20); 
				}else{
					newTop=Math.min(dpos.y+dpos.height+20, zScrollPosition.top+(ws.height-470));
				}
				
				d99.style.left=newLeft+"px"; 
				d99.style.top=newTop+"px"; 
			}
			d92=document.getElementById('zListingImageEnlargeImage'); 
			/*d92.onload=function(){
				
				var d99=document.getElementById('zListingImageEnlargeDiv'); 
				if(typeof zIArrMSize[this.src] === "undefined"){
					return;
				} 
				zIArrMSize[this.src]=[this.width,this.height];
				if(zIArrMSize[this.src][0]<=zIImageMaxWidth && zIArrMSize[this.src][1]<=zIImageMaxHeight-20){
					if(zIArrMSize[this.src][0] !== 0){
						this.width=zIArrMSize[this.src][0];
						this.height=zIArrMSize[this.src][1];
					}
				}else{
					if(zIArrMSize[this.src][0]>zIImageMaxWidth){
						var r1=zIImageMaxWidth/zIArrMSize[this.src][0];
						var nw=zIImageMaxWidth;
						var nh=r1*zIArrMSize[this.src][1]; 
					}else{
						var nw=0;
						var nh=zIImageMaxHeight; // force the height calculation below.
					}
					if(nh>zIImageMaxHeight-20){
						var r1=(zIImageMaxHeight-20)/zIArrMSize[this.src][1];
						var nw=Math.round(r1*zIArrMSize[this.src][0]);
						var nh=zIImageMaxHeight-20;
					} 
					if(nw===0){
						if(zIImageMaxWidth !== 0){
							this.width=zIImageMaxWidth;
							this.height=zIImageMaxHeight-20;
						}
					}else{
						if(Math.floor(nw) !== 0){
							this.width=Math.floor(nw);
							this.height=Math.floor(nh);
						}
					}
				} 
				this.style.cssFloat="left";
				this.style.marginLeft=Math.max(0,Math.floor((zIImageMaxWidth-this.width)/2))+"px";
				this.style.marginTop=Math.max(0,Math.floor((zIImageMaxHeight-this.height)/2))+"px"; 
			}; */
			if(d92.src === '/z/a/images/s.gif' || d92.src !== src){ 
				d99.style.display="block";
				document.getElementById('zListingImageEnlargeImageParent').innerHTML='<img id="zListingImageEnlargeImage" alt="Image" src="'+src+'" style="display:inline-block; max-width:100%;max-height:100%;" onerror="zImageOnError(this);" />'; 
			}else{
				d99.style.display="block";
			}
		}
	//}
}

function zImageMouseLoadDelayed(id){
	var d=document.getElementById(id);	
	d.onload();
}
function zImageStoreLoaded(obj,id){
	obj.style.display="block";
	for(i=0;i<zIArrM[id].length;i++){
		if(zIArrM[id][i] === obj.src){
			zIArrM2[id][i]=1;
			return;
		}
	}
}
if(arrM===null){
	var arrM=[];
	var arrM2=[];
	var arrM3=[];
}

function zlsFixImageHeight(obj, width, height){
	if(typeof obj.naturalHeight !== "undefined" && obj.naturalHeight !== 0){
		if(obj.naturalHeight > height){
			obj.style.width="auto";
			obj.style.height=height+"px";
		}else if(obj.naturalHeight < height && obj.naturalHeight < width){
			obj.style.width=obj.naturalWidth+"px";
			obj.style.height=obj.naturalHeight+"px";
		}
	}else{
		var pos=zGetAbsPosition(obj);
		if(pos.height > height){
			obj.style.width="auto";
			obj.style.height=height+"px";
		}
	}
}



/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/listing-map-functions.js */

var pixelXLongOffset=0;
var pixelYLatOffset=0;
var mapLoadFunction=function(){};
var mapObj=false;
var mapProps=new Object();
//var arrMarkers=new Array();
var streetView=false;
var mapFullscreen=false;
var zGMapAbsPos=null;
var zHideMapControl=false;
var zOneLatitude=false;
var zOneLongitude=false;
var zMapOverlayDivObj=null;
var zMapOverlayDivObjAbsPos=null;
var zMapOverlayDivObjAbsPos2=null;
var zMapIgnoreMoveEnd=false;
var zMapCurrentListingLink=null;
//var mapProps.zArrMapTotalLat=[];
//var mapProps.zArrMapTotalLong=[];
//var mapProps.zArrMapText=[];
//var mapProps.mapCount=0;
var zBingAddress="";
function createMarker(point, htmlText) {
	var marker = new GMarker(point);
	google.maps.event.addListener(marker, "click", function() {
	  marker.openInfoWindowHtml(htmlText);
	});
	//arrMarkers.push(marker);
	
	return marker;
}
function zlsOpenResultsMap(formName){
	if(typeof formName == "undefined"){
		formName="zMLSSearchForm";
	}
	var arrQ=[];
	var d3=document.getElementById("resultCountAbsolute");
	if(d3 && d3.innerHTML.substr(0,1) === 0){
		alert('There are no matching listings, please revise your search before clicking to view the map');
		return;	
	}
	var obj=zFormSubmit(formName, false, true,false, true);
	for(var i in obj){
		if(typeof zlsSearchCriteriaMap[i] !== "undefined" && obj[i] !== ""){
			arrQ.push(zlsSearchCriteriaMap[i]+"="+obj[i]);
		}
	}
	//zlsSearchCriteriaMap[i];
	var d1=arrQ.join("&");
	if(d1.length >= 1950){
		alert("You've selected too many criteria. Please reduce the number of selections for the most accurate search results.");
	}
	var newLink="/z/listing/map-fullscreen/index?"+d1.substr(0,1950);
	//console.log(newLink);
	window.open(newLink);
}
var zMapFirstZoomChange=true;
var widthPerPixel=0.000011257672119140625;
var heightPerPixel=0.000010531174841353967;
var widthPerPixel=0.000021457672119140625;
var heightPerPixel=0.000018731174841353967;
var zMapCurrentZoom=0;
var zMapTimeoutUpdate=0;

if(typeof zMapFullscreen === "undefined"){
	zMapFullscreen=false;
}
function zlsGotoMapLink(url){
	if(zMapFullscreen){
		window.open(url);
	}else{
		window.top.location.href=url;
	}
}

function onGMAPLoad(force) {
	if(typeof zDisableOnGmapLoad !== "undefined" && zDisableOnGmapLoad) return;
	if((typeof force === "undefined" || !force) && (!zFunctionLoadStarted || typeof google === "undefined" || typeof google.maps === "undefined" || typeof google.maps.LatLng === "undefined")){// || typeof zMapGaLoaded === "undefined" || !zMapGaLoaded){
		return;
	}
	var arrC=zGetElementsByClassName("zMapLoadInputVarsClass");
	if(arrC.length === 0 || typeof arrC[0].value === "undefined" || arrC[0].value ===""){
		return;
	}
	var myObj=eval('('+arrC[0].value+')');
	mapProps=myObj;
	if(typeof google.maps.OverlayView === "undefined") return;
	if(zIsTouchscreen() && window.location.href.indexOf("/listing/search-form") !== -1){
		document.getElementById('map489273').style.display='none';
		return;
	}
	zLatLngControl.prototype = new google.maps.OverlayView();
	zLatLngControl.prototype.draw = function() {};
	zLatLngControl.prototype.createHtmlNode_ = function() {
		var divNode = document.createElement('div');
		divNode.id = 'latlng-control';
		divNode.index = 100;
		return divNode;
	};
	zLatLngControl.prototype.visible_changed = function() {
		this.node_.style.display = this.get('visible') ? '' : 'none';
	};
	zLatLngControl.prototype.updatePosition = function(latLng) {
		var projection = this.getProjection();
		var point = projection.fromLatLngToContainerPixel(latLng);
		zCurMapPixelV3=point;
	};
	zWindowSize=getWindowSize();
	if(typeof mapProps.stageWidth === "string" && mapProps.stageWidth.substr(mapProps.stageWidth.length-1) === "%"){
		mapProps.curStageWidth=zWindowSize.width+zScrollbarWidth;
	}else{
		mapProps.curStageWidth=parseInt(mapProps.stageWidth);
	}
	if(typeof mapProps.stageWidth === "string" && mapProps.stageHeight.substr(mapProps.stageHeight.length-1) === "%"){
		mapProps.curStageHeight=zWindowSize.height;
	}else{
		mapProps.curStageHeight=parseInt(mapProps.stageHeight);
	}
	mapProps.longBlockWidth=84;
	mapProps.latBlockWidth=91;
	mapProps.latBlocks=Math.ceil(mapProps.curStageHeight/mapProps.longBlockWidth);
	mapProps.longBlocks=Math.ceil(mapProps.curStageWidth/mapProps.latBlockWidth);
	zMapOverlayDivObjAbsPos=zGetAbsPosition(zMapOverlayDivObj);
	//setTimeout("loadBingMap();",200);
	mapLoadFunction();
	
	if(mapProps.avgLat===0 || mapProps.avgLong===0){
		var d383=document.getElementById("zMapAllDiv");
		d383.style.display="none";
		return;
	}
	// width/height per pixel at zoom 1
	minLat=0;
	maxLat=0;
	minLong=0;
	maxLong=0;
	if(mapProps.mapCount!==0 && typeof mapProps.zArrMapTotalLat !=="undefined" && mapProps.zArrMapTotalLat.length !== 0){
		minLat=mapProps.zArrMapTotalLat[0];
		maxLat=mapProps.zArrMapTotalLat[0];
		minLong=mapProps.zArrMapTotalLong[0];
		maxLong=mapProps.zArrMapTotalLong[0];
		for(i=0;i<mapProps.mapCount;i++){
			if(mapProps.zArrMapTotalLat[i]<minLat){
				minLat=mapProps.zArrMapTotalLat[i];
			}
			if(mapProps.zArrMapTotalLat[i]>maxLat){
				maxLat=mapProps.zArrMapTotalLat[i];
			}
			if(mapProps.zArrMapTotalLong[i]<minLong){
				minLong=mapProps.zArrMapTotalLong[i];
			}
			if(mapProps.zArrMapTotalLong[i]>maxLong){
				maxLong=mapProps.zArrMapTotalLong[i];
			}
		}
		avgLat=(maxLat+minLat)/2;
		avgLong=(maxLong+minLong)/2;
	}else{
		avgLat=mapProps.avgLat;
		avgLong=mapProps.avgLong;
	}
	margin=50;
	if(minLat===0){
		minLat=avgLat;
		maxLat=avgLat;	
		minLong=avgLong;
		maxLong=avgLong;	
	}
	mapProps.minLat=minLat;
	mapProps.maxLat=maxLat;
	mapProps.minLong=minLong;
	mapProps.maxLong=maxLong;
	/*minLat=Math.max(19.66328,minLat);
	maxLat=Math.min(34.22697,maxLat);
	minLong=Math.max(-83.803711,minLong);
	maxLong=Math.min(-76.641602,maxLong);*/
	avgLat=(maxLat+minLat)/2;
	avgLong=(maxLong+minLong)/2;
	// latitude = y   longitude = x
	// get the zoom level
	propHeight=Math.max(heightPerPixel*50,Math.abs(maxLat-minLat));
	propWidth=Math.max(widthPerPixel*50,Math.abs(maxLong-minLong));
	twp=widthPerPixel;
	thp=heightPerPixel;
	for(zoom=1;zoom<=20;zoom++){
		if(zoom !== 1){
			twp*=2;
			thp*=2;
		}
		maxWidth=mapProps.curStageWidth*twp;
		maxHeight=mapProps.curStageHeight*thp;
		// all properties must fit within zoom level
		if(maxWidth>propWidth+(twp*margin) && maxHeight>propHeight+(thp*margin)){
			break;
		}
	}
	if(!document.getElementById('search_within_map_name1') || document.getElementById('search_within_map_name1').checked===false){
		zoom++;	
	}
	// set zoom and center
	mapProps.avgLong=avgLong;
	mapProps.avgLat=avgLat;
	if(mapProps.forceZoom !== 0){
		mapProps.zoom=mapProps.forceZoom;
	}else{
		if(Math.abs(maxLat-minLat)===0){
			mapProps.zoom=20-zoom;
		}else{
			mapProps.zoom=18-zoom;
		}
	}
	streetView=false;
	
	onGMAPLoadV3();
}
zArrLoadFunctions.push({functionName:onGMAPLoad});
var zAjaxNearAddressMarker=false;
var zMapMarkerIdOff=0;

function toggleMapFullscreen(){
	var mapDiv=document.getElementById("myGoogleMap");
	var mapFloater=document.getElementById("mapFloater");
	
	if(mapFullscreen){
		mapFullscreen=false;
		mapProps.stageWidth=mapProps.curStageWidth;
		mapProps.stageHeight=mapProps.curStageHeight;
		mapDiv.style.width=mapProps.curStageWidth+'px';
		mapDiv.style.height=mapProps.curStageHeight+'px';
		mapFloater.style.marginLeft='10px'; 
		mapFloater.style.marginBottom='10px';
	}else{
		mapFullscreen=true;
		mapFloater.style.marginLeft='0px'; 
		mapFloater.style.marginBottom='10px';
		// find size of full screen and copy functionality from tiny mce or other source
		alert('not implemented');
		return;
	}
	onLoad();
}
function searchWithinMap(forceSubmit){
	var bounds =new Object();
	bounds.minY=mapObjV3.getBounds().getSouthWest().lat();
	bounds.minX=mapObjV3.getBounds().getSouthWest().lng();
	bounds.maxY=mapObjV3.getBounds().getNorthEast().lat();
	bounds.maxX=mapObjV3.getBounds().getNorthEast().lng();
	document.mapSearchForm.search_map_coordinates_list.value=bounds.minX+","+bounds.maxX+","+bounds.minY+","+bounds.maxY;
	document.mapSearchForm.submit();
}
/*
  var BingMap = null;
  var pinLocation = "";
  var bingid=null;
  var VEMap=null;
	function loadBingMap(){
	if(document.getElementById("zGStreetView")==null)return;
	var url = "http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2&mkt=en-us";
	var e = document.createElement("script");
	e.src = url;
	e.type="text/javascript";
	document.getElementsByTagName("head")[0].appendChild(e);
	bingid=setInterval("GetBingMap()",1000);
	}
var zBingCheckId=null;
	
function GetBingMap() {
	return;
	if(typeof VEMap=="function" && bingid!=null){
		clearInterval(bingid);
		bingid=null;
		//setTimeout("GetBingMap()",3000);
		//return;
	} else if(bingid!=null) {
		return;
	}

	BingMap = new VEMap('myBingMap');
	BingMap.LoadMap(new VELatLong(zOneLatitude, zOneLongitude),17);
	BingMap.AddPushpin(new VELatLong(zOneLatitude, zOneLongitude));
	zBingCheckId=setTimeout("zBingHideMap();",500);
	BingMap.AttachEvent("onobliqueenter", OnObliqueEnterHandler);
	
}   
function zBingHideMap(){
	return;
	document.getElementById("myBingMapC").style.display="none";
	clearTimeout(zBingCheckId);
	zBingCheckId=null;
}

function OnObliqueEnterHandler() {
	if(BingMap.IsBirdseyeAvailable()) {
		clearTimeout(zBingCheckId);
		zBingCheckId=null;
		document.getElementById("myBingMapC").style.display="block";
		var TopOfProperty = new VELatLong(zOneLatitude, zOneLongitude); 
		BingMap.SetBirdseyeScene(TopOfProperty);
	}
}
*/

var myPano;	
if(typeof GClientGeocoder!=="undefined"){
	var geocoder = new GClientGeocoder();
}
var streetviewlatlong=0;
if(typeof GStreetviewClient!=="undefined"){
	var panoClient = new GStreetviewClient(); 
}
function gmsvShowAddress() { 
	if(document.getElementById("zGStreetView")===null)return;
	if(zOneLatitude !== ""){ 
		gmsvLoadGoogleMaps({y:zOneLatitude,x:zOneLongitude}); 
	}else if(zBingAddress !== ""){
		geocoder.getLatLng( zBingAddress   ,    function(point) {      if (!point) {    if(zOneLatitude !== ""){ gmsvLoadGoogleMaps({y:zOneLatitude,x:zOneLongitude}); }else{ handleGMSVErr(0); }    } else {  gmsvLoadGoogleMaps(point); }    }  );
	}else{ handleGMSVErr(0);}
}
var mapLoadFunction=gmsvShowAddress;
function gmsvLoadGoogleMaps(point){
	streetviewlatlong = new google.maps.LatLng(point.y,point.x);
	var panoramaOptions = { latlng:streetviewlatlong };
	myPano = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoramaOptions);
      google.maps.event.addListener(myPano, "error", handleGMSVErr);
      // must be changed to: getPanoramaByLocation() instead of: panoClient.getNearestPanorama(streetviewlatlong, showPanoData);
}
function handleGMSVErr(errorCode) { //alert("errorCode:"+errorCode);
var d1=document.getElementById("zGStreetView");d1.style.display="none"; }  

function showPanoData(panoData) {
  if (panoData.code !== 200) {
   // GLog.write('showPanoData: Server rejected with code: ' + panoData.code);
   handleGMSVErr(0);
	return;
  }
  var d1=document.getElementById("zGStreetView");
  d1.style.display="block";
  var angle = computeAngle(streetviewlatlong, panoData.location.latlng);
  myPano.setLocationAndPOV(panoData.location.latlng, {yaw: angle});
}

function computeAngle(endLatLng, startLatLng) {
  var DEGREE_PER_RADIAN = 57.2957795;
  var RADIAN_PER_DEGREE = 0.017453;

  var dlat = endLatLng.lat() - startLatLng.lat();
  var dlng = endLatLng.lng() - startLatLng.lng();
  var yaw = Math.atan2(dlng * Math.cos(endLatLng.lat() * RADIAN_PER_DEGREE), dlat)
		 * DEGREE_PER_RADIAN;
  return wrapAngle(yaw);
}

function wrapAngle(angle) {
if (angle >= 360) {
  angle -= 360;
} else if (angle < 0) {
 angle += 360;
}
return angle;
}
function zSetNearAddress(v){
	if(v !== ""){
		zSetWithinMap(1);
		zSetWithinMap2(1);
	}else{
		zSetWithinMap(0);
		zSetWithinMap2(0);
	}
}

function zSetWithinMap(b){
	b=parseInt(b);
	var d1=document.getElementById("setWithinMapRadio1");
	if(d1===null) return;
	var d2=document.getElementById("setWithinMapRadio2");
	if(b===1){
		d2.checked=false;
		d1.checked=true;
	}else{	
		d2.checked=true;
		d1.checked=false;
	}
	getMLSCount('zMLSSearchForm');
}
function zSetWithinMap2(b){
	b=parseInt(b);
	var d1=document.getElementById("setWithinMapRadio1");
	var d4=document.getElementById("setWithinMapRadio2");
	if(d1===null) return;
	var d2=document.getElementById("search_within_map");
	if(b===1){
		d1.checked=true; 
		d4.checked=false;
		d2.value=1;
	}else{
		d1.checked=false;
		d4.checked=true;
		d2.value=0;
	} 
	$(d2).trigger("change");
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}
function zGetMapDistance(lat1, lon1, lat2, lon2){
	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;	
	return d;
}
function zGeocodeAddress() {
	if(arrAddress.length <= curIndex) return;
	if(debugajaxgeocoder) f1.value+="run geocode: "+arrAddress[curIndex]+" for listing_id="+arrListingId[curIndex]+"\n";
		geocoder.geocode( { 'address': arrAddress[curIndex]+" "+arrAddressZip[curIndex]}, function(results, status) {
		var r="";
		if (status == google.maps.GeocoderStatus.OK) {
			var a1=new Array();
			for(var i=0;i<results.length;i++){
				var a2=new Array();
				a2[0]=results[i].types.join(",");
				if(a2[0]=="street_address"){// && arrAddressZipLat[curIndex] != 0 && arrAddressZipLong[curIndex] != 0){
					a2[1]=results[i].formatted_address;
					a2[2]=results[i].geometry.location.lat()
					a2[3]=results[i].geometry.location.lng();
					a2[4]=results[i].geometry.location_type;
					var a3=a2.join("\t");
					/*var k=zGetMapDistance(arrAddressZipLat[curIndex], arrAddressZipLong[curIndex], a2[2], a2[3]);
					if(k >= 50){
						// the distance is beyond reasonable - this one is invalid
					}else{*/
						a1.push(a3);  
					//}
					break;	
				}
			}
			r=a1.join("\n");
			if(debugajaxgeocoder) f1.value+="Result:"+r+"\n";
		} else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT || status == google.maps.GeocoderStatus.REQUEST_DENIED){
			// serious error condition
			stopGeocoding=true; 
		}
		var curStatus="";
		if(status == google.maps.GeocoderStatus.OK){
			curStatus="OK";
		}else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
			curStatus="OVER_QUERY_LIMIT";
		}else if(status == google.maps.GeocoderStatus.REQUEST_DENIED){
			curStatus="REQUEST_DENIED";
		}else if(status == google.maps.GeocoderStatus.ZERO_RESULTS){
			curStatus="ZERO_RESULTS";
		}else if(status == google.maps.GeocoderStatus.INVALID_REQUEST){
			curStatus="INVALID_REQUEST";
		}else if(status == 'ERROR'){
			stopGeocoding=true;
			// This is an undocumented problem with google's API. We must stop geocoding and wait for a new user with a fresh copy of google's API downloaded that hopefully works.
			return;
		}else{
			curStatus=status;
		}
		if(debugajaxgeocoder) f1.value+='geocode done for listing_id='+arrListingId[curIndex]+" with status="+curStatus+"\n";
		var debugurlstring="";
		if(debugajaxgeocoder){
			debugurlstring="&debugajaxgeocoder=1";
		}
		$.ajax({
			type: "post",
			url: "/z/listing/ajax-geocoder/save?"+debugurlstring,
			data:{ results: r, listing_id: arrListingId[curIndex], address: arrAddress[curIndex], zip: arrAddressZip[curIndex], status: curStatus },
			dataType:"text",
			success: function(data){
				if(debugajaxgeocoder) f1.value+="Data saved with status="+data+"\n";
			}
		}); 
		curIndex++;
		if(curIndex<arrAddress.length && !stopGeocoding){
			setTimeout('zTimeoutGeocode();',1500);
		}
	});
}
function zTimeoutGeocode(){
	if(stopGeocoding) return;
	zGeocodeAddress();
}


var mapObjV3=false;
var zGMapAbsPosV3=0;
var arrMapMarkersV3=new Array();
var debugTextarea;
var zMapOverlaysV3=new Array();
var zMapOverlaysIdsV3=new Array();
var zArrPermanentMarkerV3=new Array();
var zHighestMapCountV3=0;
var zMarkerMapCounterV3=0;
var zMapOverlayDivObjV3=0;
var zMapOverlayDivObjAbsPosV3=0;
var zCurrentMarkerMapCounterV3=0;
var zMapCurrentListingLinkV3="";
var zMapOverlayDivObjAbsPos2V3=0;
var zCurMapPixelV3;
var zCoorUpdateIntervalIdV3;
var zMarkerMapTypeTrack=new Array();
var zLatLngControlInstance;
//zMapMarkerV3.prototype = new google.maps.OverlayView();

var zLatLngControl=function(map) {
	if(typeof google === "undefined" || typeof google.maps === "undefined" || typeof google.maps.LatLng === "undefined"){
		return;
	}
	this.ANCHOR_OFFSET_ = new google.maps.Point(8, 8);
	this.node_ = this.createHtmlNode_();
	map.controls[google.maps.ControlPosition.TOP].push(this.node_);
	this.setMap(map);
	this.set('visible', false);
};
function gmapV3ClearMarkers() {   return;
	/*if (zMapOverlaysV3) {
		for (var i in zMapOverlaysV3) {
			zMapOverlaysV3[i].setMap(null);
		}
		//zMapOverlaysV3.length = 0;
	}*/
}

function zAddPermanentMarkerV3(pm){
	for(var i=0;i<zArrPermanentMarkerV3.length;i++){
		if(zArrPermanentMarkerV3[i].title === pm.title){
			zArrPermanentMarkerV3[i].point=pm.point;
			zArrPermanentMarkerV3[i].title=pm.title;
			zArrPermanentMarkerV3[i].htmlText=pm.htmlText;
			zArrPermanentMarkerV3[i].marker=zCreatePermanentMarkerV3(zArrPermanentMarkerV3[i]);
			return zArrPermanentMarkerV3[i].marker;
		}
	}
	
	zArrPermanentMarkerV3.push(pm);
	zArrPermanentMarkerV3[zArrPermanentMarkerV3.length-1].marker=zCreatePermanentMarkerV3(zArrPermanentMarkerV3[zArrPermanentMarkerV3.length-1]);
	return zArrPermanentMarkerV3[zArrPermanentMarkerV3.length-1].marker;
}
function zRemovePermanentMarkers(){
	for(var i=0;i<zArrPermanentMarkerV3.length;i++){
		zArrPermanentMarkerV3[i].marker.setMap(null);
	}
	zArrPermanentMarkerV3=[];
}
function zCreatePermanentMarkersV3(offset){
	for(var i=0;i<zArrPermanentMarkerV3.length;i++){
		zArrPermanentMarkerV3[i].marker=zCreatePermanentMarkerV3(zArrPermanentMarkerV3[i]);
	}
}
function zCreatePermanentMarkerV3(pm){
	var title="";
	if(pm.marker){
		pm.marker.setMap(null);
		pm.marker=false;
	}
	
	var infowindow = new google.maps.InfoWindow({
		content: pm.htmlText
	});
	var marker = new google.maps.Marker({
		position: pm.point,
		map: mapObjV3,
		title: pm.title
	});
	google.maps.event.addListener(marker, 'click', function() {
	  infowindow.open(mapObjV3,marker);
	});
	return marker;
}
zMapArrLoadFunctions=[];
function zlsUpdateMapSize(){
	var mid3=document.getElementById("myGoogleMapV3");
	mapProps.curStageWidth=zWindowSize.width+zScrollbarWidth;
	mapProps.curStageHeight=zWindowSize.height;
	mapProps.latBlocks=Math.ceil(mapProps.curStageHeight/mapProps.longBlockWidth);
	mapProps.longBlocks=Math.ceil(mapProps.curStageWidth/mapProps.latBlockWidth);
	myGoogleMapV3.style.width=mapProps.curStageWidth+"px";
	myGoogleMapV3.style.height=mapProps.curStageHeight+"px";
}
function onGMAPLoadV3(){
	zMapOverlayDivObjV3=document.getElementById("zMapOverlayDivV3");
	zMapOverlayDivObjAbsPosV3=zGetAbsPosition(zMapOverlayDivObjV3);
	var mid3=document.getElementById("myGoogleMapV3");
	if(mid3===null){
		return;
	}
	myGoogleMapV3.style.width=mapProps.curStageWidth+"px";
	myGoogleMapV3.style.height=mapProps.curStageHeight+"px";
	var myLatlng = new google.maps.LatLng(mapProps.avgLat,mapProps.avgLong);
	var myOptions = {
		streetViewControl: false,
		panControl:true, 
	  zoom: mapProps.zoom,
	  center: myLatlng,
	  mapTypeId: google.maps.MapTypeId.HYBRID
	};
	mapObjV3 = new google.maps.Map(mid3, myOptions);
	google.maps.event.addListener(mapObjV3, "click", function(){zMapMarkerRollOutV3(true); }); 
	
	
	
	zLatLngControlInstance = new zLatLngControl(mapObjV3);
 	zGMapAbsPosV3=zGetAbsPosition(mid3);
	//debugTextArea=document.getElementById('cojunasd83');
	
	 //debugTextArea.value="";
	 
	for(var n=0;n<zMapOverlaysIdsV3.length;n++){
		zMapOverlaysV3[n].setMap(null);
	}
	zMapOverlaysIdsGroupV3=[];
	zMapOverlaysIdsV3=[];
	zMapOverlaysV3=[];
	zRemovePermanentMarkers();
	 
	google.maps.event.addListener(mapObjV3, 'mouseover', function(mEvent) {
	  zLatLngControlInstance.set('visible', true);
	});
	google.maps.event.addListener(mapObjV3, 'mouseout', function(mEvent) {
	  zLatLngControlInstance.set('visible', false);
	});
	google.maps.event.addListener(mapObjV3, 'mousemove', function(mEvent) {
	  zLatLngControlInstance.updatePosition(mEvent.latLng); zMapMarkerMouseMoveV3(mEvent,this);
	});
	
	 
	 
		
	google.maps.event.addListener(mapObjV3, 'zoom_changed', function(){var oldZoom=-99;var newZoom = mapObjV3.getZoom();
	//debugTextArea.value+="zoom:"+newZoom+"\n";
	
	zMapOverlayDivObjV3.style.display="none"; zMapCurrentZoom=newZoom; if(oldZoom !== newZoom && !zMapFirstZoomChange){ gmapV3ClearMarkers();zCreatePermanentMarkersV3(); } zMapOverlaysIds=[];zMapOverlays=[]; zMapFirstZoomChange=false; clearTimeout(zMapTimeoutUpdate); /*zMapTimeoutUpdate=setTimeout('zMapCoorUpdateV3(true,zMLSSearchFormName);',10); */ if(newZoom>oldZoom){ streetView=false;}  });
	
	google.maps.event.addListener(mapObjV3, "bounds_changed", zMapBoundsChange);
	//google.maps.event.addListener(mapObjV3, "dragend", function(){/*debugTextArea.value+="dragend\n";*/zMapOverlayDivObjV3.style.display="none";if(!zMapIgnoreMoveEnd){ clearInterval(zMapTimeoutUpdate); zMapTimeoutUpdate=setTimeout('zMapCoorUpdateV3(true,zMLSSearchFormName);',10);} zMapIgnoreMoveEnd=false; });
	google.maps.event.addListener(mapObjV3,  "dragstart", function(){/*debugTextArea.value+="dragstart\n";*/zMapOverlayDivObjV3.style.display="none"; });
	
	google.maps.event.addListener(mapObjV3, "drag", function(){/*debugTextArea.value+="dragging\n";*/zMapOverlayDivObjV3.style.display="none";  });
	 
	google.maps.event.addListener(mapObjV3, "dragend", function(){ });
	for(var i=0;i<mapProps.mapCount;i++){
		if(mapProps.zArrMapText[i] !== false){
			var pm=new Object();
			pm.point=new google.maps.LatLng(mapProps.zArrMapTotalLat[i],mapProps.zArrMapTotalLong[i]);
			pm.title="zNearAddressMarker";
			pm.htmlText='<table width="150"><tr><td>'+mapProps.zArrMapText[i]+'</td></tr></table>';
			var marker=zAddPermanentMarkerV3(pm);
			zMapOverlaysV3.push(marker);
		}
	}
	if(zAjaxNearAddressMarker){
		var d2=document.getElementById("search_near_address");
		arrAd=d2.value.split(",");
		var ad1=arrAd.shift()+"<br>"+arrAd.join(",");
		//debugTextArea.value+="ad1:"+ad1+"\n";
		
		var pm=new Object();
		pm.point=new google.maps.LatLng(zAjaxNearAddressMarker[0], zAjaxNearAddressMarker[1]);
		pm.title="zNearAddressMarker";
		pm.htmlText='<table width="150"><tr><td>Location:<br>'+ad1+'</td></tr></table>';
		var marker=zAddPermanentMarker(pm);
		google.maps.event.trigger(marker,'click');
		zMapOverlaysV3.push(marker);
	}
	setTimeout("zMapTryUpdateV3();",1000);
	//zCoorUpdateIntervalIdV3=setInterval('zMapCoorUpdateV3(true,zMLSSearchFormName)',50);
	
}
function zMapBoundsChange(){/*debugTextArea.value+="dragend\n";*/if(typeof zMapOverlayDivObjV3.style !== "undefined") {zMapOverlayDivObjV3.style.display="none";}if(!zMapIgnoreMoveEnd){ clearInterval(zMapTimeoutUpdate); zMapTimeoutUpdate=setTimeout(zMapMapTimeoutUpdate,100);} zMapIgnoreMoveEnd=false; 
}
function zMapMapTimeoutUpdate(){
	zMapCoorUpdateV3(true,zMLSSearchFormName);
}
function zMapTryUpdateV3(){
	if(zMarkerMapTypeTrack.length===0){
		google.maps.event.trigger(mapObjV3,'zoom_changed');
	}
	for(var i=0;i<zMapArrLoadFunctions.length;i++){
		zMapArrLoadFunctions[i]();	
	}
}
			

function zMapCoorUpdateV3(fireAjax, formName) {
	var bounds =new Object(); 
	if(!mapObjV3.getBounds || typeof mapObjV3.getBounds() !== "object"){
		return; 
	}
	bounds.minY=mapObjV3.getBounds().getSouthWest().lat();
	bounds.minX=mapObjV3.getBounds().getSouthWest().lng();
	bounds.maxY=mapObjV3.getBounds().getNorthEast().lat();
	bounds.maxX=mapObjV3.getBounds().getNorthEast().lng();
	var fd=document.getElementById(formName);
	
	if(fd !==null && $("#search_map_coordinates_list").length) {
		$("#search_map_coordinates_list").val(bounds.minX+","+bounds.maxX+","+bounds.minY+","+bounds.maxY);
		//alert(fd.search_map_coordinates_list.value);
		//debugTextArea.value+="coor:"+fd.search_map_coordinates_list.value+"\n";
		$("#search_map_long_blocks").val(mapProps.longBlocks);
		$("#search_map_lat_blocks").val(mapProps.latBlocks);
		if(fireAjax) {
			if(typeof zFormData === "undefined" || typeof zFormData[formName] === "undefined"){
				zArrDeferredFunctions.push(function(){zFormData[formName].onChangeCallback(formName);});
			}else{
				zFormData[formName].onChangeCallback(formName);
			}
		}
	}
}
var zMapOverlaysIdsGroupV3=[];	
zUpdateMapMarkersV3First=true;	
function zUpdateMapMarkersV3(obj){
	if(typeof google === "undefined" || typeof google.maps === "undefined" || typeof google.maps.LatLng === "undefined"){
		return;
	}
	if(zArrPermanentMarker.length !== 0 || zArrPermanentMarkerV3.length !== 0) return;
	var arrOverlays=new Array();
	var arrOverlaysTemp=new Array();
	var arrOverlaysGroupTemp=new Array();
	var arrSkip=new Array();
	var found=false; 
	if(typeof obj.listing_id !== "undefined" && obj.listing_latitude !== ""){
		for(var n=0;n<zMapOverlaysIdsGroupV3.length;n++){
			if(zMapOverlaysIdsGroupV3[n] === true){
				//	console.log("group clear n2:"+n);
				zMapOverlaysV3[n].setMap(null);
			}
		}
		zHighestMapCountV3=0;
		if(zUpdateMapMarkersV3First && typeof obj.allMinLat !== "undefined" && window.location.href.indexOf("map-fullscreen") !== -1){
			var markerBounds = new google.maps.LatLngBounds(); 
			markerBounds.extend(new google.maps.LatLng(obj.allMinLat,obj.allMinLong)); 
			markerBounds.extend(new google.maps.LatLng(obj.allMinLat,obj.allMaxLong)); 
			markerBounds.extend(new google.maps.LatLng(obj.allMaxLat,obj.allMaxLong)); 
			markerBounds.extend(new google.maps.LatLng(obj.allMaxLat,obj.allMinLong)); 
			mapObjV3.fitBounds(markerBounds);
			zUpdateMapMarkersV3First=false;
		}
		for(var i2=0;i2<obj.listing_id.length;i2++){
			if(obj.listing_id[i2] === "0"){
				zHighestMapCountV3=Math.max(zHighestMapCountV3,obj.arrCount[i2]);
			}
		}
		
		for(var i2=0;i2<obj.arrColor.length;i2++){
			found=-1;
			if(obj.listing_id[i2] !== "0" && obj.listing_id[i2] !== ""){
				for(var n=0;n < zMapOverlaysIdsV3.length;n++){
					if(zMapOverlaysIdsV3[n]===obj.listing_id[i2]){
						found=zMapOverlaysIdsV3[n];	
						marker=zMapOverlaysV3[n];
						marker.setIcon("/z/a/listing/images/icon-home"+obj.arrColor[i2]+".jpg");
						if(typeof mapObjV3 === "object" && mapObjV3 !== null){
							marker.setMap(mapObjV3);
						}
						marker.myForceEasyClick=true;
						arrSkip.push(found);
						break;
					}
				}
				if(found===-1){
					var myLatlng = new google.maps.LatLng(obj.listing_latitude[i2],obj.listing_longitude[i2]);
					var marker=createMarkerListingAjaxV3(myLatlng, obj.listing_id[i2], obj.arrColor[i2]); 
					marker.listing_id = obj.listing_id[i2];
				}
				arrOverlaysGroupTemp.push(false);
			}else{
				//console.log("group"+(arrOverlaysTemp.length)+":"+obj.minLat[i2]+":"+obj.minLong[i2]);
				var myLatlng = new google.maps.LatLng(obj.minLat[i2],obj.minLong[i2]);
				var marker=createMarkerGroupBgAjaxV3(myLatlng, obj, i2, obj.arrColor[i2]); 
				//var marker=createMarkerGroupBgAjaxV3(myLatlng, obj, i2, obj.arrColor[i2]); 
				marker.listing_id = "0"+obj.minLat[i2]+":"+obj.minLong[i2];
				//console.log("marker"+obj.minLat[i2]+":"+obj.minLong[i2]+":"+obj.arrCount[i2]+":"+obj.avgPrice[i2]);
				arrOverlaysGroupTemp.push(true);
			}
			arrOverlaysTemp.push(obj.listing_id[i2]+":"+obj.minLat[i2]+":"+obj.minLong[i2]);
			arrOverlays.push(marker);
		}
	}
	var arrDelete=new Array();
	for(var n=0;n<zMapOverlaysIdsV3.length;n++){
		found=false;
		if(zMapOverlaysIdsGroupV3[n] === false){
			for(var i=0;i<arrSkip.length;i++){
				if(arrSkip[i]===zMapOverlaysIdsV3[n]){
					found=true;
					break;
				}
			}
			if(found===false){
				//	console.log("group clear n:"+n);
				zMapOverlaysV3[n].setMap(null);
			}
		}
	}
	zMapOverlaysIdsGroupV3=arrOverlaysGroupTemp;
	zMapOverlaysIdsV3=arrOverlaysTemp;
	zMapOverlaysV3=arrOverlays;
}
function zSetupCustomMarkerV3(marker){
	marker.zMarkerMapCounterV3=zMarkerMapCounterV3;
	marker.myRolloverCallbackObj=new Object();
	marker.myRolloverCallback=false;
	marker.myRolloverHTML=""; 
	if(typeof google === "undefined"){
		return;
	}
	google.maps.event.addListener(marker, "mouseover", function(o){zMapMarkerMouseOverV3(o,this); }); 
	google.maps.event.addListener(marker, "click", function(o){zMapMarkerMouseOverV3(o,this); }); 
	google.maps.event.addListener(marker, "mouseout", function(o){zMapMarkerRollOutV3Delay(); }); 
	
}
var zMapMarkerRollOutV3TimeoutId=0;
function zMapMarkerRollOutV3Delay(){
	clearTimeout(zMapMarkerRollOutV3TimeoutId);
	zMapMarkerRollOutV3TimeoutId=setTimeout(function(){zMapMarkerRollOutV3();}, 100);

}

function zMapLoadListingV3(obj){
	 zMapOverlayDivObjV3.style.width="300px";
	zMapOverlayDivObjV3.style.height="120px";
	//	document.getElementById("testdebug").value+="set to 100 height\n";
	 
//	 zMapOverlayDivObj.style.height="110px";
	var tempObj={};
	tempObj.id="zMapListing";
	tempObj.url="/z/listing/search-form/ajaxMapListing?listing_id="+obj.id;
	if(zDebugMLSAjax){
		tempObj.debug=true;
	}
	tempObj.cache=true;
	tempObj.callback=zMapShowListingV3;
	tempObj.ignoreOldRequests=true;
	zAjax(tempObj);	
}
function zMapShowListingV3(r){
	var myObj=eval('('+r+')');
	zMapCurrentListingLinkV3=myObj.link;
	zMapOverlayDivObjV3.innerHTML=myObj.html;
}
function createMarkerListingAjaxV3(point, id, iconcolor) {
	zMarkerMapCounterV3++;
	var marker = new google.maps.Marker({
		position: point,
		icon:"/z/a/listing/images/icon-home"+iconcolor+".jpg",
		map: mapObjV3,
		title: "zMapMarkerImage"+zMarkerMapCounterV3
	});
	marker.myForceEasyClick=true;
	zMarkerMapTypeTrack[zMarkerMapCounterV3]="marker";
	zSetupCustomMarkerV3(marker);
	var obj=new Object();
	obj.id=id;
	marker.myRolloverCallback=zMapLoadListingV3;
	marker.myRolloverCallbackObj=obj;
	// only for the home icon...
	google.maps.event.addListener(marker, "dblclick", function(o){
	  if(zMapCurrentListingLinkV3 !== null && zMapCurrentListingLinkV3 !== ""){
		 mapObjV3=null;
		window.top.location.href=zMapCurrentListingLinkV3;  
	  }
  });
	return marker; 
} 
function createMarkerGroupBgAjaxV3(point, obj, index, iconcolor) {
	if(obj.arrCountAtAddress[index]===1){
		point = new google.maps.LatLng(obj.listing_latitude[index],obj.listing_longitude[index]);
		
		zMarkerMapCounterV3++;
		var marker = new google.maps.Marker({
			position: point,
			icon:"/z/a/listing/images/icon-home"+iconcolor+".jpg",
			map: mapObjV3,
			title: "zSeeThroughMarkerId"+zMarkerMapCounterV3
		});
		zMarkerMapTypeTrack[zMarkerMapCounterV3]="seeThrough";
		marker.zMarkerMapCounterV3=zMarkerMapCounterV3;
		zSetupCustomMarkerV3(marker);
		
		marker.myForceEasyClick=true;
		marker.myRolloverHTML='<strong>'+obj.arrCount[index]+' listings at this address</strong><br />Average list price: '+obj.avgPrice[index]+'</span><br /><a href="##" onclick="zlsGotoMultiunitResults(\''+obj.listing_longitude[index]+","+obj.listing_longitude[index]+","+obj.listing_latitude[index]+","+obj.listing_latitude[index]+'\'); return false;">Click here to view all listings</a>';
		
		return marker;
	}else{
		var scale=obj.arrCount[index]/zHighestMapCountV3;
		var width= (32*scale)+24;
		var height= (25*scale)+20;
		//debugTextArea.value+="id:"+(index+1)+" | scale:"+scale+" | width:"+width+" | height:"+height+" | high:"+zHighestMapCountV3+"| count:"+obj.arrCount[index]+"\n";
		//width=42.40620155038759;
		//height=34.37984496124031;
		//var newAnchor=new google.maps.Point(Math.round(100-(58-(width/2))),Math.round(90-(45-(height/2))));//59, 62);
		var newAnchor=new google.maps.Point(Math.round(90-(58-(width/2))),Math.round(80-(45-(height/2))));//59, 62);
		var image2=new google.maps.MarkerImage('/z/a/listing/images/icon-multi'+iconcolor+'.png', new google.maps.Size(Math.round(width),Math.round(height)),new google.maps.Point(0, 0), newAnchor, new google.maps.Size(Math.round(width),Math.round(height)));
		/*if(index==2 || index === 1){
		//	console.log("index:"+index+" width:"+width+" height:"+height+" newAnchor:"+newAnchor+" point:"+point+" zMarkerMapCounterV3:"+zMarkerMapCounterV3);	
		//	console.log(image2);
		}*/
		zMarkerMapCounterV3++;
		//console.log(point);
		var marker = new google.maps.Marker({
			position: point,
			map: mapObjV3,
			icon: image2,
			title: "zSeeThroughMarkerId"+zMarkerMapCounterV3
		});
		//console.log(image2);
		zMarkerMapTypeTrack[zMarkerMapCounterV3]="seeThrough";
		zSetupCustomMarkerV3(marker);
		marker.myRolloverHTML='<strong>'+obj.arrCount[index]+' matching listings here</strong><br />Average list price: '+obj.avgPrice[index]+'</span><br />Double click to zoom in.';
		return marker;
		//alert(zHighestMapCountV3);
		/*
		var marker = new zMapMarkerV3(point,{"width":mapProps.longBlockWidth,"height":mapProps.latBlockWidth,"scale":scale,"iconcolor":iconcolor});
		marker.mySetRolloverHTML('<strong>'+obj.arrCount[index]+' matching listings here</strong><br />Average list price: '+obj.avgPrice[index]+'</span><br />Double click the red icon to zoom in.');
		*/
	}
	//arrMarkers.push(marker);
	//return marker;
}

function zMapMarkerMouseMoveV3(o){
	if(zCurrentMarkerMapCounterV3!==0 && typeof zMarkerMapTypeTrack[zCurrentMarkerMapCounterV3] !== "undefined"){
		if(zMarkerMapTypeTrack[zCurrentMarkerMapCounterV3]==="seeThrough"){
			var backupDiv=zMapOverlayDivObjV3;
			var tempPos={x:0,y:0};
			var tmpObj=false;
			if(window.parent !== null && window.parent.document.getElementById('zMapOverlayDivV3') !== null){
				zMapOverlayDivObjV3=window.parent.document.getElementById('zMapOverlayDivV3');
				tmpObj=zMapOverlayDivObjV3;
				tempPos=zGetAbsPosition(window.parent.document.getElementById('embeddedmapiframe'));
			}
			zMapOverlayDivObjV3.style.width="215px";
			zMapOverlayDivObjV3.style.height="65px";
	
			//alert(zGMapAbsPosV3.width+":"+px+":"+py+":"+zGMapAbsPosV3.x+"+"+tempPos.x+":"+zPositionObjSubtractPos[0]);
			//var projection=mapObjV3.getProjection();
			var pos=zCurMapPixelV3;//projection.fromLatLngToContainerPixel(obj.getPosition());
			if(tmpObj!== false){
				var pos={x:zMousePosition.x,y:zMousePosition.y};
				pos.x+=	tempPos.x;
				pos.y+=tempPos.y;
				zMapOverlayDivObjV3.style.top=(((zMousePosition.y+tempPos.y)-zPositionObjSubtractPos[1])+20)+"px";
				zMapOverlayDivObjV3.style.left=(((zMousePosition.x+tempPos.x)-zPositionObjSubtractPos[0])+20)+"px";
			}else{
				//debugTextArea.value='mousemove:'+zMousePosition.x+":"+zMousePosition.y+"\n";
				zMapOverlayDivObjV3.style.top=((zMousePosition.y-zPositionObjSubtractPos[1])+20)+"px";
				zMapOverlayDivObjV3.style.left=((zMousePosition.x-zPositionObjSubtractPos[0])+20)+"px";
			}
		
		}
	}
}


function goToStreetV3(lat,long2){
	streetView=true;
	zMapIgnoreMoveEnd=true;
	//mapObjV3.setZoom(mapProps.zoom);
	mapObjV3.setCenter(new google.maps.LatLng(lat, long2));
	zMapOverlayDivObjV3.style.left=(zGMapAbsPosV3.x+(zGMapAbsPosV3.width/2)+9)+"px";
	zMapOverlayDivObjV3.style.top=(zGMapAbsPosV3.y+(zGMapAbsPosV3.height/2)-9)+"px";
	//if(mapObj.getCurrentMapType() !== G_MAP_TYPE){
	if(mapObjV3.getMapTypeId() !== google.maps.MapTypeId.ROADMAP){
		mapObjV3.setZoom(21);
	}else{
		mapObjV3.setZoom(19);
	}
}

function zMapMarkerMouseOverV3(o,obj){
	//debugTextArea.value+='mouseover:'+obj.getTitle()+"\n";
	//return;
	var backupDiv=zMapOverlayDivObjV3;
	var tempPos={x:0,y:0};
	var tmpObj=false;
	if(window.parent !== null && window.parent.document.getElementById('zMapOverlayDivV3') !== null){
		zMapOverlayDivObjV3=window.parent.document.getElementById('zMapOverlayDivV3');
		tmpObj=zMapOverlayDivObjV3;
		tempPos=zGetAbsPosition(window.parent.document.getElementById('embeddedmapiframe'));
	}
	zMapOverlayDivObjV3.style.width="215px";
	zMapOverlayDivObjV3.style.height="65px";
	
	
	var p=30;
	/*if(zCurrentMarkerMapCounterV3!=0 && zCurrentMarkerMapCounterV3 !== obj.zMarkerMapCounterV3){
		//zMapMarkerRollOutV3(true);
	}*/
	
	var px=(zMousePosition.x-zGMapAbsPosV3.x);
	var py=zMousePosition.y-zGMapAbsPosV3.y;
	//alert(zGMapAbsPosV3.width+":"+px+":"+py+":"+zGMapAbsPosV3.x+"+"+tempPos.x+":"+zPositionObjSubtractPos[0]);
	//var projection=mapObjV3.getProjection();
	var pos=zCurMapPixelV3;//projection.fromLatLngToContainerPixel(obj.getPosition());
	if(tmpObj!== false){
		var pos={x:zMousePosition.x,y:zMousePosition.y};
		pos.x+=	tempPos.x;
		pos.y+=tempPos.y;
	}else{
		pos.x+=zGMapAbsPosV3.x;
		pos.y+=zGMapAbsPosV3.y;
	}
	
	pos.width=20;
	pos.height=17;
	//debugTextArea.value="divpoint:"+pos.x+":"+pos.y+" | subtractpos:"+zPositionObjSubtractPos[0]+":"+zPositionObjSubtractPos[1]+"\n";
	zMapOverlayDivObjAbsPos2V3=pos;
	zCurrentMarkerMapCounterV3=obj.zMarkerMapCounterV3;
	zMapOverlayDivObjV3.innerHTML=obj.myRolloverHTML;
	if(obj.myRolloverCallback!==false){
		obj.myRolloverCallback(obj.myRolloverCallbackObj);
	}
	
	if(zIsTouchscreen() && zTouchPosition.count){
		px=zTouchPosition.x[0];//-zGMapAbsPosV3.x;
		py=zTouchPosition.y[0];//-zGMapAbsPosV3.y;
		pos.x=zTouchPosition.x[0];
		pos.y=zTouchPosition.y[0];
		if(tmpObj!== false){
			pos.x+=tempPos.x;
			pos.y+=tempPos.y;
		}else{
			pos.x+=zGMapAbsPosV3.x;
			pos.y+=zGMapAbsPosV3.y;
		}
	}
	if(1===0){//obj.image_ === false){
		//alert('try fixmapmarkerdiv');
		return;
		//setTimeout("zFixMapMarkerDiv();",10);
		
	}else{
		
		//debugTextArea.value+="mappos:"+(zGMapAbsPosV3.width+":"+zGMapAbsPosV3.height+" | objpos:"+pos.x+":"+pos.y+"\n");
		if(px>zGMapAbsPosV3.width/2){
			if(typeof obj.myForceEasyClick !== "undefined"){
				zMapOverlayDivObjV3.style.left=(pos.x-zPositionObjSubtractPos[0])+"px";
			}else{
				zMapOverlayDivObjV3.style.left=((pos.x-zPositionObjSubtractPos[0])-(parseInt(zMapOverlayDivObjV3.style.width))+(10))+"px";//
			}
			//debugTextArea.value+="left1:"+((pos.x-zPositionObjSubtractPos[0])-(parseInt(zMapOverlayDivObjV3.style.width)+(9)))+":"+pos.x+":"+zPositionObjSubtractPos[0]+":"+parseInt(zMapOverlayDivObjV3.style.width)+"\n";
			if(py<zGMapAbsPosV3.height/2){ 
				zMapOverlayDivObjV3.style.top=((pos.y-zPositionObjSubtractPos[1])-25)+"px";
				//debugTextArea.value+="top1:"+(pos.y-zPositionObjSubtractPos[1])+":"+pos.y+":"+zPositionObjSubtractPos[1]+"\n";
			}else{
				//alert('t2');
				zMapOverlayDivObjV3.style.top=((pos.y+pos.height-zPositionObjSubtractPos[1])-(parseInt(zMapOverlayDivObjV3.style.height)+15))+"px";
				//debugTextArea.value+="top2:"+((pos.y+pos.height-zPositionObjSubtractPos[1])-(parseInt(zMapOverlayDivObjV3.style.height)+9))+":"+pos.y+":"+zMapOverlayDivObjV3.style.height+":"+parseInt(zMapOverlayDivObjV3.style.height)+"\n";
			}
		}else{
			//alert(pos.x+":"+(pos.x+pos.width));
			if(typeof obj.myForceEasyClick !== "undefined"){
				zMapOverlayDivObjV3.style.left=(pos.x-zPositionObjSubtractPos[0])+"px";
			}else{
				zMapOverlayDivObjV3.style.left=((pos.x+pos.width)-zPositionObjSubtractPos[0])+"px";//
			}
			//debugTextArea.value+="left2:"+(pos.x+pos.width-zPositionObjSubtractPos[0])+":"+pos.x+":"+pos.width+":"+zPositionObjSubtractPos[0]+"\n";
			if(py<zGMapAbsPosV3.height/2){
				zMapOverlayDivObjV3.style.top=((pos.y-zPositionObjSubtractPos[1])-25)+"px";
				//debugTextArea.value+="top3:"+(pos.y-zPositionObjSubtractPos[1])+":"+pos.y+":"+zPositionObjSubtractPos[1]+"\n";
			}else{
				zMapOverlayDivObjV3.style.top=((pos.y+pos.height-zPositionObjSubtractPos[1])-(parseInt(zMapOverlayDivObjV3.style.height)+15))+"px";
				//debugTextArea.value+="top4:"+((pos.y+pos.height-zPositionObjSubtractPos[1])-(parseInt(zMapOverlayDivObjV3.style.height)+9))+":"+pos.y+":"+zMapOverlayDivObjV3.style.height+":"+parseInt(zMapOverlayDivObjV3.style.height)+"\n";
			}
		} 
		zMapOverlayDivObjAbsPosV3={"x":parseInt(zMapOverlayDivObjV3.style.left)-tempPos.x,"y":parseInt(zMapOverlayDivObjV3.style.top)-tempPos.y,"width":parseInt(zMapOverlayDivObjV3.style.width),"height":parseInt(zMapOverlayDivObjV3.style.height)}; 
	}
			//alert(zMapOverlayDivObjV3.style.left+":"+zMapOverlayDivObjV3.style.top);
	
	/*
	var d2=document.getElementById("zSeeThroughMarkerId"+obj.zMarkerMapCounterV3);
	if(d2!=null){
		d2.style.opacity=0.5; d2.style.filter='alpha(opacity=50)';
	}*/
	
	zMapOverlayDivObjV3.style.display="block";
	/*if(tmpObj!== false){
		//tmpObj=zMapOverlayDivObjV3;	
	}*/
}
  
function zMapMarkerRollOutV3(force){
	//return;
	//alert('out'); 
	//debugTextArea.value="curMarker:"+zMousePosition.x+":"+zMousePosition.y+" | "+zMapOverlayDivObjAbsPosV3.x+":"+zMapOverlayDivObjAbsPosV3.y+":"+zMapOverlayDivObjAbsPosV3.width+":"+zMapOverlayDivObjAbsPosV3.height+"\n";
	var p=30; 
	if(zMapOverlayDivObjV3!==null && zCurrentMarkerMapCounterV3!==0){
		var image=false;
		if(typeof zMarkerMapTypeTrack[zCurrentMarkerMapCounterV3] !== "undefined"){
			if(zMarkerMapTypeTrack[zCurrentMarkerMapCounterV3]==="marker"){
				image=true;
			}
	  		if(!force && (zMousePosition.x-zPositionObjSubtractPos[0]>=zMapOverlayDivObjAbsPosV3.x-p && zMousePosition.x-zPositionObjSubtractPos[0]<=zMapOverlayDivObjAbsPosV3.x+zMapOverlayDivObjAbsPosV3.width+p && zMousePosition.y-zPositionObjSubtractPos[1]>=zMapOverlayDivObjAbsPosV3.y-p && zMousePosition.y-zPositionObjSubtractPos[1]<=zMapOverlayDivObjAbsPosV3.y+zMapOverlayDivObjAbsPosV3.height+p)){
				// in overlay tooltip
			}else if(!force && zMousePosition.x>=zMapOverlayDivObjAbsPos2V3.x-p && zMousePosition.x<=zMapOverlayDivObjAbsPos2V3.x+zMapOverlayDivObjAbsPos2V3.width+p && zMousePosition.y>=zMapOverlayDivObjAbsPos2V3.y-p && zMousePosition.y<=zMapOverlayDivObjAbsPos2V3.y+zMapOverlayDivObjAbsPos2V3.height+p){
				// in overlay
				//debugTextArea.value+="in overlay";
			}else if(!image){
				//debugTextArea.value+="out";
				//d2.style.opacity=0; d2.style.filter='alpha(opacity=0)';
				zCurrentMarkerMapCounterV3=0;
				zMapOverlayDivObjV3.innerHTML="";
				zMapOverlayDivObjV3.style.display="none"; 
			}else{
				zCurrentMarkerMapCounterV3=0;
				zMapOverlayDivObjV3.innerHTML="";
				zMapOverlayDivObjV3.style.display="none"; 
			}
		}
	}
}

function zAjaxMapRadiusChange(){
	var d3=document.getElementById("search_near_radius");
	if(d3.value !== ""){
		zAjaxSetNearAddress();
	}
}
function zAjaxFailNearAddress(){
	alert('There was a problem setting the address. Try again');
}
function zAjaxSetNearAddress(){
	var d1=document.getElementById("searchNearAddress");
	var d2=document.getElementById("search_near_radius");
	var d3="/z/listing/search-form/nearAddress?search_near_address="+escape(d1.value)+"&search_near_radius="+escape(d2.value);
	
	var tempObj={};
	tempObj.id="zMapNearAddress";
	tempObj.url=d3;
	tempObj.callback=zAjaxReturnNearAddress;
	tempObj.errorCallback=zAjaxFailNearAddress;
	tempObj.cache=false;
	tempObj.ignoreOldRequests=true;
	zAjax(tempObj);
}
function zAjaxCancelNearAddress(){
	var d1=document.getElementById("searchNearAddress");
	var d2=document.getElementById("search_near_radius");
	var d3=document.getElementById("zNearAddressDiv");
	d3.style.display="none";
	d1.value='';
	d2.value='0.1';
}
function zNearAddressChange(o){
	var d1=document.getElementById("zNearAddressDiv");
	var d3=document.getElementById("search_near_address");
	if(o.value === ""){
		d1.style.display="none";
		d3.value="";
	}else{
		d1.style.display="block";
	}
}

var zArrPermanentMarker=new Array();
function zAjaxReturnNearAddress(r,skipParse){
	// throws an error when debugging is enabled.
	//r='{"success":true,"errorMsg":"","search_map_coordinates_list":"-81.1391101437,-81.1376618563,29.2753658556,29.2768141444"}';
	if(zDebugMLSAjax){
		document.write(r);	
		return;
	}
	var myObj=eval('('+r+')');
	if(!myObj.success){
		alert(myObj.errorMessage);
		return;
	}
	//alert("set:"+myObj.success);
	// set map coordinates
	var arrLatLong=myObj.search_map_coordinates_list.split(",");
	var minLat=parseFloat(arrLatLong[2]);
	var maxLat=parseFloat(arrLatLong[3]);
	var minLong=parseFloat(arrLatLong[0]);
	var maxLong=parseFloat(arrLatLong[1]);
	var avgLat=(minLat+maxLat)/2;
	var avgLong=(minLong+maxLong)/2;
	var zoom=0;
	var propHeight=Math.max(heightPerPixel*50,Math.abs(maxLat-minLat));
	var propWidth=Math.max(widthPerPixel*50,Math.abs(maxLong-minLong));
	var twp=widthPerPixel;
	var thp=heightPerPixel;
	margin=50;
	for(zoom=1;zoom<=20;zoom++){
		if(zoom !== 1){
			twp*=2;
			thp*=2;
		}
		maxWidth=mapProps.curStageWidth*twp;
		maxHeight=mapProps.curStageHeight*thp;
		// all properties must fit within zoom level
		if(maxWidth>propWidth+(twp*margin) && maxHeight>propHeight+(thp*margin)){
			break;
		}
	}
	// set zoom and center
	mapProps.avgLong=avgLong;
	mapProps.avgLat=avgLat;
	if(Math.abs(maxLat-minLat)===0){
		mapProps.zoom=20-zoom;
	}else{
		mapProps.zoom=18-zoom;
	}
	streetView=false;
	var d1=document.getElementById("searchNearAddress");
	var d2=document.getElementById("search_near_address");
	d2.value=d1.value;
	var d3=document.getElementById("zNearAddressDiv");
	d3.style.display="none";

	if(typeof mapObj === "undefined"){
		return;
	}
	mapObjV3.closeInfoWindow();
	mapObjV3.setCenter(new google.maps.LatLng(mapProps.avgLat, mapProps.avgLong), mapProps.zoom);
	
	zSetNearAddress(1);
	var pm=new Object();
	pm.point=new google.maps.LatLng(mapProps.avgLat, mapProps.avgLong);
	pm.title="zNearAddressMarker";
	arrAd=d2.value.split(",");
	var ad1=arrAd.shift()+"<br>"+arrAd.join(",");
	pm.htmlText='<table width="150"><tr><td>Location:<br>'+ad1+'</td></tr></table>';
	var marker=zAddPermanentMarker(pm);
	google.maps.event.trigger(marker,"click");
}

/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/listing-search-functions.js */
var zlsSearchCriteriaMap={
search_bathrooms_low:"a",
search_bathrooms_high:"b",
search_bedrooms_low:"c",
search_bedrooms_high:"d",
search_city_id:"e",
search_exact_match:"f",
search_map_coordinates_list:"g",
search_listing_type_id:"h",
search_listing_sub_type_id:"i",
search_condoname:"j",  
search_address:"k",  
search_zip:"l",  
search_rate_low:"m",  
search_rate_high:"n",  
search_sqfoot_high:"o",
search_result_limit:"p",
search_agent_always:"q",
search_sort_agent_first:"r",
search_office_always:"s",
search_sort_office_first:"t",
search_sqfoot_low:"u",
search_year_built_low:"v",
search_year_built_high:"w",
search_county:"x",
search_frontage:"y",
search_view:"z",
search_remarks:"aa",
search_style:"bb",
search_mls_number_list:"cc",
search_sort:"dd",
search_listdate:"ee",
search_near_address:"ff",
search_near_radius:"gg",
//search_sortppsqft:"",
//search_new_first:"",
search_remarks_negative:"hh",
//search_mls_number_list:"ii",
search_acreage_low:"jj",
search_acreage_high:"kk",
search_status:"ll",
search_surrounding_cities:'mm',
search_within_map:"nn",
search_with_photos:"oo",  
search_with_pool:"pp",   
search_agent_only:"qq",
search_office_only:"rr",
search_agent:"ss",
search_office:"tt",
search_subdivision:"uu",
search_result_layout:"vv",
//search_result_limit:"ww",
search_group_by:"xx",
search_region:"yy",
search_parking:"zz",
search_condition:"a1",
search_tenure:"b1",
search_liststatus:"c1"
};

var zSearchFormTimeoutId=0;
var zSearchFormCountTimeoutId=0;
var zSearchFormFloaterAbsoluteFix=false;
var zSearchFormFloaterDisplayed=false;


function zInputPutIntoForm(linkSelected, valueSelected, formName, valueId, enableOnEnter){
	var arrP=linkSelected.split(", ");
	var arrCity=new Array();
	for(i=0;i<arrP.length;i++){
		if(i+1!==arrP.length){
			arrCity.push(arrP[i]);
		}
	}
	//alert(valueId+":"+formName+":"+linkSelected+":"+valueSelected+":"+document.getElementById(formName));
	var v1=document.getElementById(valueId);
	document.getElementById(formName).value = linkSelected;
	v1.value=valueSelected;
	//alert(document.getElementById(formName).id+":"+v1.id+":"+valueSelected);
	
	if(enableOnEnter){
		//zInputSetSelectedOptions(true,#zOffset#,'#arguments.ss.name#',null,#arguments.ss.allowAnyText#,#arguments.ss.onlyOneSelection#);document.getElementById('#arguments.ss.name#_zmanual').value='';
		zFormOnEnter(null,document.getElementById(formName),document.getElementById(formName));
	}
	return;
	/*v1.value="";
	document.getElementById(formName).value ="";
	selIndex=0;
	zCurrentCityLookupLabel='';*/
}
function zInputLinkBuildBox(obj, obj2,arrResults){
	selIndex=0;
	//alert(obj.name);
	var arrP=zFindPosition(obj);
	var b=document.getElementById("zTOB");
	b.style.position="absolute";
	b.style.left=(arrP[0]-zPositionObjSubtractPos[0])+"px";
	b.style.top=(arrP[1]+arrP[3]-zPositionObjSubtractPos[1])+"px";
	
	formName = obj2.id;
	var v="";
	var doc = document.getElementById("zTOB");
	doc.style.height=(60+(Math.min(10,arrResults.length)*23))+"px";
	class1='class="zTOB-selected" ';
	arrNewLink=[];
	v=v+'<div class="top">Click a city below or use the keyboard up and down arrow keys and press enter to select the city.</div>';
	for (j=0; j < arrResults.length; j++){
		var arrJ=arrResults[j].split("\t");
	v=v+'<a id="lid'+j+'" '+class1+' href="javascript:void(0);" onclick="zInputPutIntoForm(\''+arrJ[0]+'\',\''+arrJ[1]+'\',\''+obj.id+'\', \''+formName+'\',true); zInputHideDiv(\''+formName+'\');" >'+arrJ[0]+'</a>';
		class1='class="zTOB-link" ';	
		arrNewLink.push(j);
	}
	document.getElementById("zTOB").style.display="block";
	document.getElementById("zTOB").innerHTML=v;
	document.getElementById("zTOB").scrollTop="0px";
}


function zMlsCheckCityLookup(e, obj, obj2, type){
var keynum;
	if(e===null) return;
	if(window.event){
	keynum = e.keyCode;
	}else{
	keynum = e.which;	
	}
	if(obj.value.length > 2){
		if(keynum !==13 && keynum !==40 && keynum!==38){
		zMlsCallCityLookup(obj,obj2,type);
		}	
	}else{
		zInputHideDiv();
	}
}

var zArrCityLookup=[];
var arrNewLink=[];
var zCurrentCityLookupLabel="";
function zMlsCallCityLookup(obj,obj2,type){	
	var strValue="";
	arrNewLink=[];
	var suggCount=0;
	strValue=obj.value;
	strValue = zFixText(strValue);	
	if(strValue.length >= 3){
		var arrNew=[];
		var arrNew2=[];
		arrNewLink=[];
		var firstIndex=-1;
		var resetSelect=false;
		var m=zGetCityLookupObj();
		var d1=strValue.substr(0,1);
		var d2=strValue.substr(1,1);
		var d3=strValue.substr(2,1);
		var m2=false;
		try{
			var m2=eval("(m."+d1+"."+d2+"."+d3+")");
		}catch(e){
			zInputHideDiv();
			return;	
		}
		if(m2===null || m2===false){
			zInputHideDiv();
			return;	
		}
		zArrCityLookup=m2;
			zInputLinkBuildBox(obj, obj2,m2); 
			aN=[];
			var fb=null;
			var fbi=-1;
			var fixB=false;
			var foundB=false;
			zCurrentCityLookupLabel="";
			for(var i=0;i<m2.length;i++){
				var cb=document.getElementById('lid'+i);
				if(cb.innerHTML.substr(0, strValue.length).toLowerCase() !== strValue || strValue.length>cb.innerHTML.length){
					if(fb===null){
						fb=cb;
						fbi=i;
					}
					cb.style.display="none";
					if(cb.className==="zTOB-selected"){
						fixB=true;
						cb.className="box-link";
					}
				}else if(cb.className==="zTOB-selected"){
					var arrJ=m2[i].split("\t");
					obj2.value=arrJ[1];
					zCurrentCityLookupLabel=arrJ[0];
					foundB=true;
				}
			}
			if(fixB && fb!==null){
				fb.className="zTOB-selected";
				selIndex=fbi;
			}
			if(!foundB && m2.length>0){
				var cb=document.getElementById('lid0');
				cb.className="zTOB-selected";
				selIndex=0;
				
				
			}
		var ajaxArrCleanResults=zFormatTheArray(m2);	
		
		for(i=0;i<ajaxArrCleanResults.length;i++){
			var aib=document.getElementById("lid"+i);
			if(ajaxArrCleanResults[i].substr(0, strValue.length) === strValue){
				arrNew.push(m2[i]);
				arrNew2.push(i);
				if(aib!==null){
					arrNewLink.push(i);
					if(aib.className==="zTOB-selected"){
						selIndex=arrNewLink.length-1;
					}
					aib.style.display="block";
					if(firstIndex===-1){
						firstIndex=arrNewLink.length-1;
					}
				}
			}else{
				if(aib!==null){
					if(aib.className==="zTOB-selected"){
						resetSelect=true;
						aib.className="box-link";
					}
					aib.style.display="none";
				}
			}
		}
		if(resetSelect && firstIndex!==-1){
			selIndex=arrNew2[0];
			document.getElementById("lid"+arrNewLink[firstIndex]).className="zTOB-selected";
		}
		if(arrNew.length > 0){
			if(arrNewLink.length === 0){
				zInputLinkBuildBox(obj,obj2, arrNew);
			}else if(document.getElementById("zTOB").style.display==="none"){
				document.getElementById("zTOB").style.display="block";
				for(i=0;i<arrNewLink.length;i++){
					if(i===0){
						selIndex=arrNewLink[i];
						document.getElementById("lid"+arrNewLink[i]).className="zTOB-selected";
					}else{
						document.getElementById("lid"+arrNewLink[i]).className="box-link";
					}
				}
			}
		}else{
			zInputHideDiv();
		}
	}	
} 

var zExpArrMenuBox=new Array();
var zExpMenuBoxChecked=new Array();
var zExpMenuBoxData=new Array();
function zExpMenuToggleCheckBox(k,n,r,m,v){
	var o=document.getElementById("zExpMenuOption"+k+"_"+n);
	var o2=document.getElementById("zExpMenuOptionLink"+k+"_"+n);
	var i=0;
	var checkBoolean=true;
	if(m===1){
		checkBoolean=false;
	}
	n2=zExpArrMenuBox[zExpMenuLastIgnoreClick];
	for(var i=0;i<zExpArrMenuBox.length;i++){
		f=zExpArrMenuBox[i];
		if(f !== n2){
			var g1=document.getElementById(f+"_expmenu1");
			var g2=document.getElementById(f+"_expmenu2");
			var g4=document.getElementById(f+"_expmenu4");
			if(g4!==null){
				g2.style.display="none";
				g4.innerHTML="More Options &gt;&gt;";
				g4.className="zExpMenuOption";
			}
		}
	}
	if(r==='radio'){
		for(var i=0;i<zExpMenuBoxChecked[k].length;i++){
			var o=document.getElementById("zExpMenuOption"+k+"_"+zExpMenuBoxChecked[k][i]);
			var o2=document.getElementById("zExpMenuOptionLink"+k+"_"+zExpMenuBoxChecked[k][i]);
			o.checked=false;
			o2.className="zExpMenuOption";
		}
		var o=document.getElementById("zExpMenuOption"+k+"_"+n);
		var o2=document.getElementById("zExpMenuOptionLink"+k+"_"+n);
		var o_2=document.getElementById("zExpMenuOption"+k+"_"+n+"_2");
		var o2_2=document.getElementById("zExpMenuOptionLink"+k+"_"+n+"_2");
		o.checked=true;
		o2.className="zExpMenuOptionOver";
		zExpMenuBoxChecked[k]=new Array();
		zExpMenuBoxChecked[k][0]=n;
		if(o_2 !== null){
			o_2.checked=true;
			o2_2.className="zExpMenuOptionOver";
			zExpMenuBoxChecked[k][1]=n+"_2";
		}
	}else{
		var checkedNow=false;
		if(v===1){
			var o_2=document.getElementById("zExpMenuOption"+k+"_"+n+"_2");
			var o2_2=document.getElementById("zExpMenuOptionLink"+k+"_"+n+"_2");
			if(o_2.checked === checkBoolean){
				o.checked=false;
				o2.className="zExpMenuOption";
				o_2.checked=false;
				o2_2.className="zExpMenuOption";
			}else{
				checkedNow=true;
				o.checked=true;
				o2.className="zExpMenuOptionOver";
				o_2.checked=true;
				o2_2.className="zExpMenuOptionOver";
			}
		}else{
			var o_2=document.getElementById("zExpMenuOption"+k+"_"+n+"_2");
			var o2_2=document.getElementById("zExpMenuOptionLink"+k+"_"+n+"_2");
			if(o.checked === checkBoolean){
				o.checked=false;
				o2.className="zExpMenuOption";
				if(o_2 !== null){
					o_2.checked=false;
					o2_2.className="zExpMenuOption";
				}
			}else{
				checkedNow=true;
				o.checked=true;
				o2.className="zExpMenuOptionOver";
				if(o_2 !== null){
					o_2.checked=true;
					o2_2.className="zExpMenuOptionOver";
				}
			}
		}
		var arrC=new Array();
		for(var i=0;i<zExpMenuBoxChecked[k].length;i++){
			if(checkedNow || (!checkedNow && i!==n)){
				arrC.push(zExpMenuBoxChecked[k][i]);
			}
		}
		zExpMenuBoxChecked[k]=arrC;
	}
	if(o.onchange!==null){
		o.onchange();
	}
}
function zExpMenuSetPos(obj,left,top){
	obj.style.left=left+"px";
	obj.style.top=top+"px";
}
function zExpMenuToggleMenu(n){
	if(n!==null){
		var m1=document.getElementById(n+"_expmenu1");
		var m2=document.getElementById(n+"_expmenu2");
		var m4=document.getElementById(n+"_expmenu4");
		if(m1===null) return;
		if(m2.style.display==="block"){
			m2.style.display="none";
			m4.innerHTML="More Options &gt;&gt;";
			m4.className="zExpMenuOption";
		}else{
			m4.innerHTML="&lt;&lt; Hide Options";
			m4.className="zExpMenuOptionOver";
			m2.style.display="block";
			var arrPos=zFindPosition(m1);
			zExpMenuSetPos(m2,(arrPos[0]+arrPos[2]),arrPos[1]);
		}
	}
	for(var i=0;i<zExpArrMenuBox.length;i++){
		f=zExpArrMenuBox[i];
		if(f !== n){
			var g1=document.getElementById(f+"_expmenu1");
			var g2=document.getElementById(f+"_expmenu2");
			var g4=document.getElementById(f+"_expmenu4");
			if(g4===null) return;
			g2.style.display="none";
			g4.innerHTML="More Options &gt;&gt;";
			g4.className="zExpMenuOption";
		}
	}
}
var zExpMenuIgnoreClick=-1;
var zExpMenuLastIgnoreClick=-1;
function zExpMenuOnClick(){
	if(zExpMenuIgnoreClick!==-1){
		zExpMenuLastIgnoreClick=zExpMenuIgnoreClick;
		zExpMenuIgnoreClick=-1;
	}else{
		zExpMenuToggleMenu();
	}
	return true;
}
if(typeof document.onclick ==="function"){
	var zExpMenuOnClickBackup=document.onclick;
}else{
	var zExpMenuOnClickBackup=function(){};
}
$(document).bind("click", function(){
	zExpMenuOnClickBackup();
	zExpMenuOnClick();
});

function zExpShowUpdateBar(v, s){
	var d1=document.getElementById("zExpUpdateBar"+v);
	if(d1){
		d1.style.display=s;
	}
}





var zSearchFormObj=new Object();
zSearchFormObj.colCount=-1;
zSearchFormObj.delayedResizeFunction2=function(){
	var d1=document.getElementById('formDiv99');
	var nh=$(window).height();
	var nw=Math.min(965,$(window).width())-5;
	//d1.style.height=nh+"px";
	//d1.style.width=nw+"px";
	if(typeof zSearchFormObj.colmain1 === "undefined" || zSearchFormObj.colmain1===null) return;
	if(nw>800){
		zSearchFormObj.colmain1.style.width=Math.floor((nw/2)-55)+"px";//"48%";
		zSearchFormObj.colmain2.style.width=Math.floor((nw/2)-60)+"px";//"48%";
		if(zSearchFormObj.colCount === 4) return;
		zSearchFormObj.colCount=4;
		zSearchFormObj.col1.style.width="45%";
		zSearchFormObj.col2.style.width="45%";
		zSearchFormObj.col3.style.width="45%";
		zSearchFormObj.col4.style.width="45%";
		zSearchFormObj.colr1.style.width="45%";
		zSearchFormObj.colr2.style.width="45%";
		zSearchFormObj.colr3.style.width="45%";
		zSearchFormObj.colr4.style.width="45%";
		zSearchFormObj.col1.style.paddingRight="5%";
		zSearchFormObj.colr1.style.paddingRight="5%";
		zSearchFormObj.col2.style.paddingRight="5%";
		zSearchFormObj.colr2.style.paddingRight="5%";
		zSearchFormObj.col3.style.paddingRight="5%";
		zSearchFormObj.colr3.style.paddingRight="5%";
		zSearchFormObj.col4.style.paddingRight="0%";
		zSearchFormObj.colr4.style.paddingRight="0%";
		
		$(zSearchFormObj.col6).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr1).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr2).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col7).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col5).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.col3).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.col4).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.colr3).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.colr4).appendTo(zSearchFormObj.colmain2);
	}else if(nw<=800 && nw >= 660){
		zSearchFormObj.colmain1.style.width=(Math.floor((nw/3)*2)-50)+"px";//"63%";
		zSearchFormObj.colmain2.style.width=Math.floor((nw/3)-50)+"px";//"30%";
		if(zSearchFormObj.colCount === 3) return;
		$(zSearchFormObj.col5).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.col3).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.col4).appendTo(zSearchFormObj.colmain2);
		$(zSearchFormObj.col6).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr1).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr2).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col7).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr3).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr4).appendTo(zSearchFormObj.colmain1);
		zSearchFormObj.colCount=3;
		zSearchFormObj.col1.style.width="45%";
		zSearchFormObj.col2.style.width="45%";
		zSearchFormObj.col3.style.width="95%";
		zSearchFormObj.col4.style.width="95%";
		zSearchFormObj.colr1.style.width="45%";
		zSearchFormObj.colr2.style.width="45%";
		zSearchFormObj.colr3.style.width="45%";
		zSearchFormObj.colr4.style.width="45%";
		zSearchFormObj.col3.style.paddingRight="0%";
		zSearchFormObj.colr3.style.paddingRight="5%";
		zSearchFormObj.col4.style.paddingRight="0%";
		zSearchFormObj.colr4.style.paddingRight="5%";
		
	}else if(nw<=659 && nw >= 410){
		if(zSearchFormObj.colCount === 2) return;
		$(zSearchFormObj.col5).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col3).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col4).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col6).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr1).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr2).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col7).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr3).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr4).appendTo(zSearchFormObj.colmain1);
		zSearchFormObj.colCount=2;
		zSearchFormObj.col1.style.width="45%";
		zSearchFormObj.col2.style.width="45%";
		zSearchFormObj.col3.style.width="45%";
		zSearchFormObj.col4.style.width="45%";
		zSearchFormObj.colr1.style.width="45%";
		zSearchFormObj.colr2.style.width="45%";
		zSearchFormObj.colr3.style.width="45%";
		zSearchFormObj.colr4.style.width="45%";
		zSearchFormObj.col1.style.paddingRight="5%";
		zSearchFormObj.colr1.style.paddingRight="5%";
		zSearchFormObj.col2.style.paddingRight="5%";
		zSearchFormObj.colr2.style.paddingRight="5%";
		zSearchFormObj.col3.style.paddingRight="5%";
		zSearchFormObj.colr3.style.paddingRight="5%";
		zSearchFormObj.col4.style.paddingRight="5%";
		zSearchFormObj.colr4.style.paddingRight="5%";
		
		zSearchFormObj.colmain1.style.width="100%";
		zSearchFormObj.colmain2.style.width="100%";
	}else if(nw<=409){
		if(zSearchFormObj.colCount === 1) return;
		$(zSearchFormObj.col5).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col3).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col4).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col6).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr1).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr2).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.col7).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr3).appendTo(zSearchFormObj.colmain1);
		$(zSearchFormObj.colr4).appendTo(zSearchFormObj.colmain1);
		zSearchFormObj.colCount=1;
		zSearchFormObj.col1.style.width="95%";
		zSearchFormObj.col2.style.width="95%";
		zSearchFormObj.col3.style.width="100%";
		zSearchFormObj.col4.style.width="100%";
		zSearchFormObj.colr1.style.width="95%";
		zSearchFormObj.colr2.style.width="95%";
		zSearchFormObj.colr3.style.width="100%";
		zSearchFormObj.colr4.style.width="100%";
		zSearchFormObj.col1.style.paddingRight="5%";
		zSearchFormObj.colr1.style.paddingRight="5%";
		zSearchFormObj.col2.style.paddingRight="5%";
		zSearchFormObj.colr2.style.paddingRight="5%";
		zSearchFormObj.col3.style.paddingRight="0%";
		zSearchFormObj.colr3.style.paddingRight="0%";
		zSearchFormObj.col4.style.paddingRight="0%";
		zSearchFormObj.colr4.style.paddingRight="0%";
		
		zSearchFormObj.colmain1.style.width="100%";
		zSearchFormObj.colmain2.style.width="100%";
		
	}
	
	if ($.browser.msie  && parseInt($.browser.version, 10) === 7) {
		if(zSearchFormObj.col1.style.paddingRight!=="0%") zSearchFormObj.col1.style.paddingRight="1%";
		if(zSearchFormObj.colr1.style.paddingRight!=="0%") zSearchFormObj.colr1.style.paddingRight="1%";
		if(zSearchFormObj.col2.style.paddingRight!=="0%") zSearchFormObj.col2.style.paddingRight="1%";
		if(zSearchFormObj.colr2.style.paddingRight!=="0%") zSearchFormObj.colr2.style.paddingRight="1%";
		if(zSearchFormObj.col3.style.paddingRight!=="0%") zSearchFormObj.col3.style.paddingRight="1%";
		if(zSearchFormObj.colr3.style.paddingRight!=="0%") zSearchFormObj.colr3.style.paddingRight="1%";
		if(zSearchFormObj.col4.style.paddingRight!=="0%") zSearchFormObj.col4.style.paddingRight="1%";
		if(zSearchFormObj.colr4.style.paddingRight!=="0%") zSearchFormObj.colr4.style.paddingRight="1%";
	}
};
zSearchFormObj.loadForm=function(){
	if(document.getElementById('zMLSSearchFormLayout3') === null){
		return;
	}
	zSetFullScreenMobileApp();
	$('script').remove();
	zSearchFormObj.col1=document.getElementById('zMLSSearchFormLayout3');
	zSearchFormObj.col2=document.getElementById('zMLSSearchFormLayout9');
	zSearchFormObj.col3=document.getElementById('zMLSSearchFormLayout8');
	zSearchFormObj.col4=document.getElementById('zMLSSearchFormLayout10');	
	
	zSearchFormObj.colr1=document.getElementById('zMLSSearchFormLayout15');
	zSearchFormObj.colr2=document.getElementById('zMLSSearchFormLayout4');
	zSearchFormObj.colr3=document.getElementById('zMLSSearchFormLayout12');
	zSearchFormObj.colr4=document.getElementById('zMLSSearchFormLayout13');	
	zSearchFormObj.colmain1=document.getElementById('zMLSSearchFormLayout2');	
	zSearchFormObj.colmain2=document.getElementById('zMLSSearchFormLayout5');	
	zSearchFormObj.col5=document.getElementById('zMLSSearchFormLayout6');	
	//zSearchFormObj.col8=document.getElementById('zMLSSearchFormLayout7');	
	zSearchFormObj.col6=document.getElementById('zMLSSearchFormLayout16');	
	zSearchFormObj.col7=document.getElementById('zMLSSearchFormLayout17');	
	//$(window).bind('scroll', scrollFunction);
	zSearchFormObj.delayedResizeFunction2();
	$(window).bind('resize', zSearchFormObj.delayedResizeFunction2);
	
};

zArrLoadFunctions.push({functionName:zSearchFormObj.loadForm});

function updateCountPosition(e,r2){ 
	zScrollPosition.left = (document.all ? document.scrollLeft : window.pageXOffset);
	zScrollPosition.top = (document.all ? document.scrollTop : window.pageYOffset);
	
	r111=zModalLockPosition(e);
	if(1===0 && typeof r2 === "undefined"){ 
		clearTimeout(zSearchFormTimeoutId);
		zSearchFormTimeoutId=setTimeout("updateCountPosition(null,true);",300);	
		return;
	} 
	var r9=document.getElementById("resultCountAbsolute");
	var r95=document.getElementById("searchFormTopDiv"); 
	if(r95===null || r9 === null){
		return; 
	}
	if(r9.innerHTML == ""){
		return;
	}
	var p2=zFindPosition(r95); 
	if(p2[0]==0 && p2[0]==0){
		r9.style.display="none";
	}else{
		r9.style.display="block";
	}
	var scrollP=$(window).scrollTop();
	scrollP=Math.max(scrollP,p2[1]);
	zSearchFormFloaterDisplayed=true;
		r9.style.top=(scrollP-zPositionObjSubtractPos[1])+"px";
		var r10=getWindowSize();
		r9.style.left=(p2[0]-zPositionObjSubtractPos[0])+'px';
	clearTimeout(zSearchFormTimeoutId);
	
	zSearchFormChanged=false;
	clearTimeout(zSearchFormCountTimeoutId);
	zSearchFormCountTimeoutId=setTimeout(updateCountPosition, 300);
	if(r111===false){
		return false;
	}else{
		return true;
	}
}
var GMap=false;
if(typeof zMLSSearchFormName==="undefined"){
	zMLSSearchFormName="zMLSSearchForm";
}
function zMLSUpdateResultLimit(n){
	var d=document.getElementById('search_result_limit');
	if(n === 2){
		var d2=[9,15,21,27,33,39,45,54];
	}else{
		var d2=[10,15,20,25,30,35,40,50];
	}
	for(var i=0;i<d.options.length;i++){
		d.options[i].value=d2[i];
		d.options[i].text=d2[i];
	}
}
var zDebugMLSAjax=false;
function loadMLSResults(r){
	if(zDebugMLSAjax){
		document.write(r);
		return;
	}
	var myObj=eval('('+r+')');
	var m=myObj;
	arrD=new Array();
	setMLSCount(m.COUNT);
	//alert(m.SS[0].LABEL[0]);
  //          for(var g=0;g<zExpArrMenuBox.length;g++){
//            	if(zExpArrMenuBox[g]==f.id){
	// NOW I KNOW WHAT THIS WAS FOR! redraw from ajax results
					//zExpMenuRedraw(0,m.SS[0].LABEL,m.SS[0].VALUE);
	// loop listings
	//m.DATA["URL"]=new Array();
	m.DATA["TITLE"]=new Array();
	for(i=0;i<m.COUNT;i++){
		m.DATA["TITLE"][i]="Test title";
		var t=getMLSTemplate(m.DATA,i);
		for(g in m.DATA){
			t=zStringReplaceAll(t,"#"+g+"#",m.DATA[g][i]);
		}
		arrD.push(t);
	}
	var r2=document.getElementById("mlsResults");
	r2.innerHTML="";
	r2.innerHTML+=arrD.join('<hr />');
}
function displayMLSCount2(r,skipParse){
	displayMLSCount(r,skipParse,true);
}
function displayMLSCount(r,skipParse,newForm){
	// throws an error when debugging is enabled.
	if(zDebugMLSAjax){
		document.write(r);	
		return;
	}
	var myObj=eval('('+r+')');
	if(myObj.success){
		if(typeof myObj.disableSetCount === "undefined"){
			if(typeof newForm !=="undefined" && newForm){
				setMLSCount2(myObj.COUNT);
			}else{
				setMLSCount(myObj.COUNT);
			}
		}
		if(zUpdateMapMarkersV3!==null){
			zUpdateMapMarkersV3(myObj);	
		}
	}else{
		alert(myObj.errorMessage);
	}
	
}
var zSearchFormChanged=false;
//var zDisableSearchFormSubmit=false;
var firstSetMLSCount=true;
var zDisableSearchCountBox=false;
function setMLSCount2(c){ 
	if(zDisableSearchCountBox) return;
	var r92=document.getElementById("resultCountAbsolute");
	var r93=document.getElementById("searchFormTopDiv");
	if(typeof r93==="undefined" || r93===null || r92===null) return;
	//r93.style.height="110px";
	r92.style.display="block";
	var theHTML=c+' Listings';
	if(r92!==null){
		r92.innerHTML=theHTML;
	}
	if(firstSetMLSCount){
		firstSetMLSCount=false;
		//updateCountPosition();
	}
	updateCountPosition();
}
function setMLSCount(c){
	if(zDisableSearchCountBox) return;
	var theHTML='<span style="font-size:21px;line-height:26px;">'+c+'</span><br /><span style="font-size:12px;">listings match your <br />search criteria<br />&nbsp;</span></span>';
	var r92=document.getElementById("resultCountAbsolute");
	var r93=document.getElementById("searchFormTopDiv");
	if(typeof r93==="undefined" || r93===null) return;
	r93.style.height="110px";
	r92.style.display="block";
	var theHTML='<span style="font-size:21px;line-height:26px;">'+c+'</span><br /><span style="font-size:12px;">matching listings';
	//if(zSearchFormChanged && (typeof zDisableSearchFormSubmit === "undefined" || zDisableSearchFormSubmit === false)){
		theHTML+='<br /><button onclick="document.zMLSSearchForm.submit();" class="zls-showResultsButton" style="font-size:13px; font-weight:normal; background-image:url(/z/a/listing/images/mlsbg1.jpg); background-repeat:repeat-x; background-color:none; border:1px solid #999; margin-top:7px; width:130px; padding:3px; text-decoration:none; cursor:pointer;" name="sfbut1">Show Results</button>';
	//}
	theHTML+='</span></span>';
	if(r92!==null){
		r92.innerHTML=theHTML;
	}
	if(firstSetMLSCount){
		
		firstSetMLSCount=false;
		//updateCountPosition();
	}
	updateCountPosition();
}

function zSetJsNewDivHeight(){
	var h=zWindowSize.height - 0;
	var d=document.getElementById("zSearchJsNewDiv");
	if(d!==null){
		zListingInfiniteScrollDiv=document.getElementById("zListingInfinitePlaceHolder");
		if(zListingInfiniteScrollDiv){
			var p=zGetAbsPosition(zListingInfiniteScrollDiv);
			var oldHeight=parseInt(zListingInfiniteScrollDiv.style.height);
			zListingInfiniteScrollDiv.style.height=h+"px";
		}else{
			var p=zGetAbsPosition(zListingSearchJSDivPHLoaded);
			var oldHeight=parseInt(zListingSearchJSDivPHLoaded.style.height);
			zListingSearchJSDivPHLoaded.style.height=h+"px";
		}
		d.style.left=p.x+"px";
		d.style.top=p.y+"px";
		d.style.width=p.width+"px";//"100%";
		d.style.height=h+"px";
		d=document.getElementById("zSearchJsNewDivIframe");
		d.style.height=h+"px";
	
	/*
		if(h > oldHeight){
			// load more listings!
			var b=zScrollApp.disableNextScrollEvent;
			zScrollApp.disableNextScrollEvent=false;
			zScrollApp.scrollFunction();
			zScrollApp.disableNextScrollEvent=b;
		}*/
	}
	
}
function zForceSearchJsScrollTop(){
	var d=document.getElementById("zSearchJsNewDiv");
	if(d !== null){
		var p=zGetAbsPosition(d);
		if (zIsTouchscreen()) {
			//$(parent).scrollTop(p.y);
			zScrollTop(false, p.y);
		}else{
			zScrollTop(false, p.y);
		}
	}
	if(!d){
		d=parent.document.getElementById("zSearchJsNewDiv");
		if(d !== null){
			var p=parent.zGetAbsPosition(d);
			if (zIsTouchscreen()) {
				//$(parent).scrollTop(p.y);
				parent.zScrollTop(false, p.y);
			}else{
				parent.zScrollTop(false, p.y);
			}
		}
	}
}
var zListingSearchJSDivFirstTime=true;
var zListingSearchJSDivLoaded=null;
var zListingSearchJSToolDivLoaded=null;
var zListingSearchJSActivated=false;
var zListingSearchJSToolDivDisabled=false;
var zlsInstantPlaceholderDiv=false;
var zListingSearchJSDivPHLoaded=null;
function zListingSearchJsToolHide(){
	zListingSearchJSToolDivDisabled=true;
	if(zListingSearchJSToolDivLoaded){
		zListingSearchJSToolDivLoaded.style.display="none";
		zlsInstantPlaceholder.style.display="none";
	}
}
function zListingSearchJsToolPos(){
	if(typeof zlsInstantPlaceholder ==='boolean' || zListingSearchJSToolDivDisabled || !zListingSearchJSToolDivLoaded) return;
	var u=window.location.href;
	var p=u.indexOf("#");
	if(p !== -1){
		u=u.substr(p+1);
	}
	if(u.indexOf("/z/listing/search-form/index") !== -1 || u.indexOf("/z/listing/instant-search/index") !== -1){
		zListingSearchJSToolDivLoaded.style.display="none";
		zlsInstantPlaceholder.style.display="none";
	}else{
		zListingSearchJSToolDivLoaded.style.display="block";
		zlsInstantPlaceholder.style.display="block";
		var w=$("#zContentTransitionContentDiv").width();
		var p=$("#zContentTransitionContentDiv").position();
		var p2=$(zlsInstantPlaceholder).position();
		zListingSearchJSToolDivLoaded.style.top=Math.max(p2.top,$(window).scrollTop())+"px";
		zListingSearchJSToolDivLoaded.style.left=p.left+"px";
		zListingSearchJSToolDivLoaded.style.width=w+"px";
	}
}
function zListingShowSearchJsToolDiv(){
	var d22=document.getElementById('zListingSearchBarEnabledDiv');
	//console.log("tried:"+d22+":"+zListingSearchJSToolDivDisabled);
	if(!zListingSearchJSActivated && (!d22 ||  zListingSearchJSToolDivDisabled || (window.parent.location.href !== window.location.href && typeof window.parent !== "undefined" && typeof window.parent.zCloseModal !== "undefined"))){ return;}
	//console.log("got in");
	if(zListingSearchJSToolDivLoaded){
		if(zListingSearchJSActivated){
			zlsInstantPlaceholderDiv.style.display="block";
		}
		zListingSearchJSToolDivLoaded.style.display="block";
	}else{
		var w=$("#zContentTransitionContentDiv").width();
		var p=$("#zContentTransitionContentDiv").position();
		var c="window.location.href='/z/listing/search-form/index?showLastSearch=1'; return false;";
		if(zListingSearchJSActivated){
			c="zListingHideSearchJsToolDiv(); zContentTransition.gotoURL('/z/listing/instant-search/index'); return false;";
		}
		$("#zContentTransitionContentDiv").before('<div id="zlsInstantPlaceholder"></div><div id="zSearchJsToolNewDiv" class="zls-instantsearchtoolbar" style=" width:'+w+'px;z-index:1000; "><a href="/z/listing/instant-search/index" onclick="'+c+'" class="zNoContentTransition">&laquo; Back To Search Results</a></div>');
		zListingSearchJSToolDivLoaded=document.getElementById("zSearchJsToolNewDiv");
		zlsInstantPlaceholderDiv=document.getElementById("zlsInstantPlaceholder");
		zListingSearchJsToolPos();
		zArrResizeFunctions.push({functionName:zListingSearchJsToolPos});
		zArrScrollFunctions.push({functionName:zListingSearchJsToolPos});
		zArrLoadFunctions.push({functionName:zListingSearchJsToolPos});
	}
}

var zListingLastSearchJsURL="/z/listing/search-js/index";
function zListingShowSearchJsDiv(){
	zListingInfiniteScrollDiv=document.getElementById("zListingInfinitePlaceHolder");
	if(zListingInfiniteScrollDiv){
		var p=zGetAbsPosition(zListingInfiniteScrollDiv);
	}else{
		var p=zGetAbsPosition(document.getElementById("zContentTransitionContentDiv"));
	}
	var dut2=zGetCookie("zls-lsurl");
	var u=window.location.href;	var p=u.indexOf("#");	if(p !== -1){		u=u.substr(p+1);	}
	if(dut2 !== "" && u.indexOf("/z/listing/instant-search/index") !== -1){
		var du=dut2;
		
	}else{
		var d22=document.getElementById("zListingSearchJsURLHidden");
		if(d22){
			var du=d22.value;
			zListingLastSearchJsURL=d22.value;
			zSetCookie({key:"zls-lsurl",value:zListingLastSearchJsURL,futureSeconds:3600,enableSubdomains:false}); 
		}else{
			var du=zListingLastSearchJsURL;
		}
	}
	if(zListingSearchJSDivLoaded){
		var i=document.getElementById("zSearchJsNewDivIframe");
		if(i && i.src.substr(i.src.length-du.length) !== du){
			i.src=du;
		}
		//zListingSearchJSDivLoaded.style.display="block";
	}else{
		var h=$(window).height() - 0;
		$("#zContentTransitionContentDiv").before('<div id="zSearchJsNewDivPlaceholder" style="width:100%; float:left; height:'+Math.max(100,h)+'px;"></div><div id="zSearchJsNewDiv" style="overflow:auto;position:absolute; left:'+p.x+'px; top:'+p.y+'px; height:'+Math.max(100,h)+'px; width:'+p.width+'px;"><iframe id="zSearchJsNewDivIframe" frameborder="0" scrolling="auto" src="'+du+'" width="100%" height="'+h+'" /></div>');
		zListingSearchJSDivLoaded=document.getElementById("zSearchJsNewDiv");
		zListingSearchJSDivPHLoaded=document.getElementById("zSearchJsNewDivPlaceholder");
		zArrResizeFunctions.push({functionName:zSetJsNewDivHeight});
		zArrScrollFunctions.push({functionName:zSetJsNewDivHeight});
		zSetJsNewDivHeight();
	}
	$(zListingSearchJSDivLoaded).hide().fadeIn(200,function(){});
	if(zListingInfiniteScrollDiv){
		if(zListingSearchJSDivPHLoaded){
			zListingSearchJSDivPHLoaded.style.display="none";
		}
	}else{
		if(zListingSearchJSDivPHLoaded){
			zListingSearchJSDivPHLoaded.style.display="block";
		}
	}
}
function zListingHideSearchJsToolDiv(){
	if(zListingSearchJSToolDivLoaded){
		zListingSearchJSToolDivLoaded.style.display="none";
		zlsInstantPlaceholderDiv.style.display="none";
	}
}
function zListingHideSearchJsDiv(){
	if(zListingSearchJSDivPHLoaded){
		zListingSearchJSDivPHLoaded.style.display="none";	
	}
	if(zListingSearchJSDivLoaded){
		zListingSearchJSDivLoaded.style.display="none";
	}
}
var zListingInfiniteScrollDiv=false;
function zListingLoadSearchJsDiv(){
	var u=window.location.href;
	var p=u.indexOf("#");
	if(p !== -1){
		u=u.substr(p+1);
	}
	var c=u;
	zListingInfiniteScrollDiv=document.getElementById("zListingInfinitePlaceHolder");
	if(c.indexOf("/z/listing/search-js/index") !== -1) return;
	var d=document.getElementById("zListingEnableInstantSearch");
	if((d && d.value === "1") && (c.indexOf("/z/listing/instant-search/index") !== -1 || zListingInfiniteScrollDiv)){
		if(!zListingSearchJSDivFirstTime) return;
		zListingSearchJSDivFirstTime=false;
		zListingSearchJSActivated=true;
		zListingShowSearchJsDiv();
		zContentTransition.bind(function(newUrl){
			if(newUrl.indexOf("/z/listing/instant-search/index") !== -1){
				zContentTransition.disableNextAnimation=true;
				zListingShowSearchJsDiv();
				zListingHideSearchJsToolDiv();
				setTimeout(function(){zForceSearchJsScrollTop();
				if(window.parent.document.getElementById("zSearchJsNewDivPlaceholder")){
					window.parent.zScrollTop('html, body', $(window.parent.document.getElementById("zSearchJsNewDivPlaceholder")).position().top);
				}else if(document.getElementById("zSearchJsNewDivPlaceholder")){
					window.zScrollTop('html, body', $(document.getElementById("zSearchJsNewDivPlaceholder")).position().top);
				}
				},50);
			}else{
				zListingHideSearchJsDiv();
				zListingShowSearchJsToolDiv();
				setTimeout(zListingSearchJsToolPos,50);
			}
			zContentTransition.manuallyProcessTransition();
		});
	}else{
		zListingShowSearchJsToolDiv();
	}
}

zArrLoadFunctions.push({functionName:zListingLoadSearchJsDiv});

//var zMapCoorUpdateV3=null;
function getMLSCount2(formName){
	getMLSCount(formName, true);
}
function getMLSCount(formName,newForm){
	zSearchFormChanged=true; 
	//clearInterval(zCoorUpdateIntervalIdV3);
	//zCoorUpdateIntervalIdV3=0;
	var v1=document.getElementById("search_map_lat_blocks");
	/*if(zIsTouchscreen() === false && typeof zMapCoorUpdateV3 !== "undefined" && v1 && v1.value==""){ 
		 return "0";
	} */
	var ab=zFormData[formName].action;
	var cb=zFormData[formName].onLoadCallback;
	var aj=zFormData[formName].ajax;
	zFormData[formName].ajax=true;
	zFormData[formName].ignoreOldRequests=true;
	if(typeof newForm !== "undefined" && newForm){
		zFormData[formName].onLoadCallback=displayMLSCount2;
	}else{
		zFormData[formName].onLoadCallback=displayMLSCount;
	}
	zFormData[formName].successMessage=false;
	
	zFormData[formName].action='/z/listing/search-form/ajaxCount';
	if(zDisableSearchFilter===1){
		zFormData[formName].action+="&zDisableSearchFilter=1";
	}
	zFormSubmit(formName,false,true);
	zFormData[formName].ajax=aj;
	zFormData[formName].action=ab;
	zFormData[formName].onLoadCallback=cb;
	return "1";
}
function zlsGotoMultiunitResults(coordinateList){
	var arrQ=[];
	var obj=zFormSubmit(zMLSSearchFormName, false, true,false, true);
	obj.search_map_coordinates_list=coordinateList;
	obj.search_within_map=1;
	for(var i in obj){
		if(typeof zlsSearchCriteriaMap[i] !== "undefined" && obj[i] !== ""){
			arrQ.push(zlsSearchCriteriaMap[i]+"="+obj[i]);
		}
	}
	var d1=arrQ.join("&");
	if(d1.length >= 1950){
		alert("You've selected too many criteria. Please reduce the number of selections for the most accurate search results.");
	}
	if(window.location.href.indexOf("superiorpropertieshawaii.com") !== -1){
		window.open('/search-compare.cfc?method=index&'+d1.substr(0,1950));
	}else{
		window.open('/z/listing/search-form/index?searchaction=search&'+d1.substr(0,1950));
	}
}

/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/walkscore-functions.js */

function zAjaxWalkscore(obj){
	var tempObj={};
	tempObj.id="zAjaxWalkScore";
	tempObj.url="/z/misc/walkscore/index?latitude="+obj.latitude+"&longitude="+obj.longitude;
	tempObj.cache=false;
	tempObj.callback=zAjaxWalkscoreCallback;
	tempObj.ignoreOldRequests=false;
	zAjax(tempObj);	
}
var zWalkscoreIndex=0;
function zAjaxWalkscoreCallback(r){
	var d1=document.getElementById("walkscore-div");
	var json=eval('(' + r + ')');
	//if we got a score
	if (json && json.status === 41) {
		d1.innerHTML='Walkscore not available';
		return;
	}else if (json && json.status === 1) {
		var htmlStr = 'Walk Score&#8482;: ' + json.walkscore + " Description: "+json.description;//'<a target="_blank" href="' + json.ws_link + '">Walk Score</a>&#8482;: ' + json.walkscore + " Description: "+json.description;
	}
	//if no score was available
	else if (json && json.status === 2) {
		var htmlStr = '';//'<a target="_blank" href="http://www.wal'+'kscore.com" rel="nofollow">Walk Score</a>&#8482;: <a target="_blank" href="' + json.ws_link + '">Get Score</a>';
	}else{
		d1=false;	
	}
	zWalkscoreIndex++;
	//make sure we have a place to put it:
	if (d1) { //if you want to wrap P tags around the html, can do that here before inserting into page element
		htmlStr = htmlStr + getWalkScoreInfoHtml(zWalkscoreIndex);
		d1.innerHTML = htmlStr;
	}
}
//show/hide the walkscore info window
function toggleWalkScoreInfo(index) {
	var infoElem = document.getElementById("walkscore-api-info" + index);
	if (infoElem && infoElem.style.display === "block")
		infoElem.style.display = "none";
	else if (infoElem)
		infoElem.style.display = "block";
}
function getWalkScoreInfoHtml(index) {
	return '<span id="walkscore-api-info' + index + '" class="walkscore-api-info" style="font-size:12px; padding-top:10px; display:block; float:left; clear:both;">Walk Score measures how walkable an address is based on the distance to nearby amenities. A score of 100 represents the most walkable area compared to other areas.<hr /></span></span>';// <a href="http://www.walkscore.com" target="_blank">Learn more</a>. <hr /></span></span>';
}

/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/zScrollApp.js */

var zScrollApp=new Object();
zScrollApp.forceSmallHeight=50000;
zScrollApp.newCount=0;
zScrollApp.maxItems=1000;
zScrollApp.firstNewBox=0;
zScrollApp.boxCount2=0;
zScrollApp.colCount=-1;
	//var rowHeight=100;
zScrollApp.itemMarginRight=30;
zScrollApp.itemMarginBottom=30;
zScrollApp.itemWidth=160;
zScrollApp.itemHeight=170;
zScrollApp.arrVisibleBoxes=new Array();
zScrollApp.bottomRowLoaded=0;
zScrollApp.scrollAreaDiv=false;
zScrollApp.scrollAreaPos=false;
zScrollApp.scrollAreaMapDiv=false;
zScrollApp.appDisabled=false;

zScrollApp.bottomRowLoadedBackup=0;
zScrollApp.resizeTimeoutId=false;
zScrollApp.scrollTimeoutId=false;

zScrollApp.lastScrollPosition=-1;
zScrollApp.totalListingCount=0;
zScrollApp.googleMapClass=false;
zScrollApp.loadedMapMarkers=new Array();
zScrollApp.scrollAreaWidth=0;
zScrollApp.veryFirstSearchLoad=true;
zScrollApp.curListingCount=0;
zScrollApp.curListingLoadedCount=0;
zScrollApp.bottomRowLimit=5;
zScrollApp.arrListingId=new Array();
zScrollApp.templateCache={};
zScrollApp.offset=0;
zScrollApp.firstAjaxRequest=true;
zScrollApp.disableNextScrollEvent=false;
zScrollApp.lastScreenWidth=0;

zScrollApp.drawVisibleRows=function(startRow, endRow){
	var arrH=new Array();
	var firstNew=true;
	var boxOffset=startRow*zScrollApp.colCount;
	tempEndRow=Math.min(zScrollApp.bottomRowLimit, endRow);
	for(var row=startRow;row<tempEndRow;row++){
		var tempItemMarginRight=zScrollApp.itemMarginRight;
		var itemTop=((row*zScrollApp.itemHeight)+(row*zScrollApp.itemMarginBottom))+50;
		for(var col=0;col<zScrollApp.colCount;col++){
			var itemLeft=((col*zScrollApp.itemWidth)+(col*zScrollApp.itemMarginRight))+10;
				tempCSS="";
				zScrollApp.boxCount2++;
				var d9=document.getElementById('row'+boxOffset);
				if(d9!==null){
					
				}else{
					if(firstNew){
						firstNew=false;
						zScrollApp.firstNewBox=boxOffset;
					}
					zScrollApp.arrVisibleBoxes["row"+boxOffset]=new Object();
					zScrollApp.arrVisibleBoxes["row"+boxOffset].offset=boxOffset;
					zScrollApp.arrVisibleBoxes["row"+boxOffset].visible=true;
					zScrollApp.newCount++;
					var tempTop=itemTop;
					var tempLeft=itemLeft;
					arrH.push('<div id="row'+boxOffset+'" style="position:absolute; background-color:#FFF; left:'+tempLeft+'px; top:'+tempTop+'px; width:'+zScrollApp.itemWidth+'px; height:'+zScrollApp.itemHeight+'px;  '+tempCSS+' "><\/div>');// margin-bottom:'+zScrollApp.itemMarginBottom+'px; margin-right:'+tempItemMarginRight+'px;
				}
				boxOffset++;
		}
		zScrollApp.bottomRowLoaded=row;
	}
	zScrollApp.scrollAreaDiv.append(arrH.join(""));
};
zScrollApp.hideRows=function(lessThen, greaterThen){
	var activated=0;
	var boxOffset=0;
	for(var i10 in zScrollApp.arrVisibleBoxes){
		var i=zScrollApp.arrVisibleBoxes[i10].offset;
		var i2=Math.floor(i/zScrollApp.colCount);
		var i22=i;
		var i3=zScrollApp.arrVisibleBoxes[i10].visible;
		if(i2 < lessThen || i2 >= greaterThen){
			if(i3){
				// hide it
				zScrollApp.arrVisibleBoxes[i10].visible=false;
				var itemTop=((i2*zScrollApp.itemHeight)+(i2*zScrollApp.itemMarginBottom));
				for(var col=0;col<zScrollApp.colCount;col++){
					var itemLeft=((col*zScrollApp.itemWidth)+(col*zScrollApp.itemMarginRight));
					$('#row'+(i22)).html("");
				}
			}
		}else{
			if(!i3){
				zScrollApp.arrVisibleBoxes[i10].visible=true;
				activated++;
				var itemTop=((i2*zScrollApp.itemHeight)+(i2*zScrollApp.itemMarginBottom));
				for(var col=0;col<zScrollApp.colCount;col++){
					var itemLeft=((col*zScrollApp.itemWidth)+(col*zScrollApp.itemMarginRight));
					if('row'+(i22) in zScrollApp.templateCache){
						$('#row'+(i22)).html(zScrollApp.templateCache['row'+(i22)]);
					}
				}
			}
		}
	}
};


zScrollApp.delayedResizeFunction=function(d){
	if(zlsHoverBox.panel && zlsHoverBox.panel.style.display==="block"){
		return;
	}
	if(zlsHoverBoxNew.panel && zlsHoverBoxNew.panel.style.display==="block"){
		return;
	}
	if(zScrollApp.resizeTimeoutId !==false){
		clearTimeout(zScrollApp.resizeTimeoutId);
	}
	zScrollApp.resizeTimeoutId=setTimeout('zScrollApp.resizeFunction();',50);
};
zScrollApp.resizeFunction=function(){
	var s=$(window).width();
	if(zScrollApp.lastScreenWidth !== s){
		zListingResetSearch();
	}
};
zScrollApp.lastScrollTop=0;

zScrollApp.delayedScrollFunction=function(){
	var docViewTop=$(window).scrollTop();
	zScrollApp.lastScrollTop=docViewTop;
	/*if(zIsTouchscreen()){
		if(zlsHoverBox.panel.style.display=="block"){
			zlsHoverBox.box.style.top="0px";	
		}else{
			if(zIsAppleIOS()){
				zlsHoverBox.box.style.top=docViewTop+"px";	
			}else{
				zlsHoverBox.box.style.top="0px";	
			}
		}
	}*/
	if(zlsHoverBox.panel && zlsHoverBox.panel.style.display==="block"){
		return;
	}
	if(zlsHoverBoxNew.panel && zlsHoverBoxNew.panel.style.display==="block"){
		return;
	}
	if(zScrollApp.scrollTimeoutId !==false){
		clearTimeout(zScrollApp.scrollTimeoutId);
	}
	zScrollApp.scrollTimeoutId=setTimeout('zScrollApp.scrollFunction();',100);
};
zScrollApp.scrollFunction=function(){
	if(zScrollApp.disableFirstAjaxLoad){ return;}
	if(zScrollApp.disableNextScrollEvent){
		zScrollApp.disableNextScrollEvent=false;
		return;
	}
	//console.log("storing:"+$(window.frames["zSearchJsNewDivIframe"]).scrollTop()+":"+$(window.parent.frames["zSearchJsNewDivIframe"]).scrollTop());
	//zSetCookie({key:"zls-lsos",value:$(window.parent.frames["zSearchJsNewDivIframe"]).scrollTop(),futureSeconds:3600,enableSubdomains:false}); 
	if(zScrollApp.appDisabled) return;
	//alert('scroll');
	var docViewTop=$(window).scrollTop();
	
	/*if(zIsTouchscreen()){
		if(zlsHoverBox.panel.style.display=="block"){
			zlsHoverBox.box.style.top="0px";	
		}else{
			if(zIsAppleIOS()){
				zlsHoverBox.box.style.top=docViewTop+"px";	
			}else{
				zlsHoverBox.box.style.top="0px";	
			}
		}
	}*/
	if(zScrollApp.lastScrollPosition-docViewTop > $(window).height()){
		if(window.stop !== "undefined"){
			 window.stop();
		}else if(document.execCommand !== "undefined"){
			 document.execCommand("Stop", false);
		}
	}
	if(zScrollApp.lastScrollPosition !== -1 && zScrollApp.lastScrollPosition >=5 && Math.abs(zScrollApp.lastScrollPosition-docViewTop) <= zScrollApp.itemHeight/2){
	//alert('wha:'+zScrollApp.lastScrollPosition+":"+zScrollApp.disableNextScrollEvent);
		//return;
	}
	//alert('scroll'+docViewTop);
	clearTimeout(zScrollApp.scrollTimeoutId);
	clearTimeout(zScrollApp.resizeTimeoutId);
	zScrollApp.scrollTimeoutId=false;
	zScrollApp.resizeTimeoutId=false;
	zScrollApp.setBoxSizes();
	backupColCount=zScrollApp.colCount;
	zScrollApp.colCount=Math.floor((zScrollApp.scrollAreaWidth)/(zScrollApp.itemWidth+zScrollApp.itemMarginRight));
	var oldTop=Math.floor(docViewTop / (zScrollApp.itemHeight+zScrollApp.itemMarginBottom));
	var newTop=Math.floor(((oldTop * backupColCount ) / zScrollApp.colCount) * (zScrollApp.itemHeight+zScrollApp.itemMarginBottom));
	if(backupColCount !== zScrollApp.colCount){
		zScrollApp.bottomRowLimit=Math.max(5,Math.round(zScrollApp.totalListingCount/zScrollApp.colCount));
		zScrollApp.scrollAreaDiv.css("width",zScrollApp.colCount*(zScrollApp.itemWidth+zScrollApp.itemMarginRight)+"px");
		zScrollApp.scrollAreaDiv.css("height",Math.round(zScrollApp.totalListingCount/zScrollApp.colCount)*(zScrollApp.itemHeight+zScrollApp.itemMarginBottom)+"px"); 
		if(docViewTop !== newTop){
			//alert("old:"+docViewTop+" new:"+newTop);
			window.scrollTo(0, newTop);
			zScrollApp.lastScrollPosition=-1;
			zScrollApp.scrollTimeoutId=setTimeout('zScrollApp.scrollFunction();',100);
			//return;
			//return;
			backupColCount=zScrollApp.colCount;
			return;
		}
	}
	if(zScrollApp.lastScrollPosition !== -1 && backupColCount !== -1 && backupColCount !== zScrollApp.colCount){
		// set the scrollTop based on the top row last displayed.
		if(zScrollApp.scrollTimeoutId !==false){
			clearTimeout(zScrollApp.scrollTimeoutId);
		}
		zScrollApp.scrollTimeoutId=setTimeout('zScrollApp.scrollFunction();',100);
	//alert('fail'+docViewTop);
		return;
	}else{
		tempForceRowRedraw=false;
	}
	zScrollApp.lastScrollPosition=docViewTop;
	var docViewBottom = docViewTop + ($(window).height()-40);
	var offset=100;
	docViewTop-=offset;
	docViewBottom+=offset;
	
	var topPos=docViewTop-zScrollApp.scrollAreaPos.top;
	zScrollApp.topRow=Math.floor((topPos+offset)/(zScrollApp.itemHeight+zScrollApp.itemMarginBottom))-1;
	var footerSize=0;
	zScrollApp.bottomRow=Math.floor(((docViewBottom+offset+footerSize)-zScrollApp.scrollAreaPos.top)/(zScrollApp.itemHeight+zScrollApp.itemMarginBottom))+1;
		
	zScrollApp.newCount=0;
	zScrollApp.bottomRowLoadedBackup=zScrollApp.bottomRowLoaded;
	/*var allLoaded=false;
	if((1+zScrollApp.bottomRowLoadedBackup)*zScrollApp.colCount >= zScrollApp.maxItems){
		allLoaded=true;
	}
	if(!allLoaded){*/
		var tempStartRow=Math.floor(Math.min(0,zScrollApp.boxCount2)/zScrollApp.colCount);
		zScrollApp.drawVisibleRows(Math.max(0,zScrollApp.topRow), Math.max(1,zScrollApp.bottomRow));
	//}
	//alert('beforedoajax'+zScrollApp.newCount);
	if(zScrollApp.newCount !== 0){
		zScrollApp.offset=zScrollApp.firstNewBox;
		zScrollApp.doAjax(zScrollApp.newCount);
	}
	zScrollApp.hideRows(zScrollApp.topRow, zScrollApp.bottomRow);
};
zScrollApp.disableFirstAjaxLoad=false;
zScrollApp.loadSearchMap=function() {
	return;
	/*
    var myLatlng = new google.maps.LatLng(25.363882,-91.044922);
    var myOptions = {
      zoom: 12,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    zScrollApp.googleMapClass = new google.maps.Map(document.getElementById("zMapCanvas2"), myOptions);
    myLatlng = new google.maps.LatLng(25.363882,-91.044922);
    myOptions = {
      zoom: 18,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.HYBRID
    }
    zScrollApp.googleMapClass2 = new google.maps.Map(document.getElementById("zMapCanvas4"), myOptions);
	*/
};
zScrollApp.addListingMarker=function(d,n){
	if(d.latitude[n] ==="0" || d.longitude[n] ==="0" || d.latitude[n] ==="" || d.longitude[n] ===""){
		return;	
	}
    var myLatlng = new google.maps.LatLng(d.latitude[n],d.longitude[n]);
    var marker = new google.maps.Marker({
        position: myLatlng, 
        map: zScrollApp.googleMapClass,
        title:d.listing_id[n]
    }); 
    var marker2 = new google.maps.Marker({
        position: myLatlng, 
        map: zScrollApp.googleMapClass2,
        title:d.listing_id[n]
    }); 
	zScrollApp.loadedMapMarkers[d.listing_id[n]]=[marker,marker2];
	zScrollApp.googleMapClass.setCenter(myLatlng);
	zScrollApp.googleMapClass2.setCenter(myLatlng);
		
};
zScrollApp.removeListingMarker=function(d){
	if(typeof google === "undefined" || typeof google.maps === "undefined" || typeof google.maps.LatLng === "undefined"){
		return;
	}
	if(typeof zScrollApp.loadedMapMarkers[d] !== "undefined"){
		zScrollApp.loadedMapMarkers[d][0].setMap(null);	
		zScrollApp.loadedMapMarkers[d][1].setMap(null);	
		delete zScrollApp.loadedMapMarkers[d];
	}
};
zScrollApp.setBoxSizes=function(){
	var d3=$(window).width();
	var mapWidth=Math.max(300,Math.round(d3*.25));
	var mapX=d3-mapWidth;
	var hideMap=false;
	if(mapX<200){
		mapX=d3;
		hideMap=true;	
		if(zScrollApp.scrollAreaMapDiv2 && zScrollApp.scrollAreaMapDiv2.style.display==="block"){
			zScrollApp.scrollAreaMapDiv2.style.display="none";
			zScrollApp.scrollAreaMapDiv4.style.display="none";
		}
	}else{
		if(zScrollApp.scrollAreaMapDiv2.style.display==="none"){
			zScrollApp.scrollAreaMapDiv2.style.display="block";
			zScrollApp.scrollAreaMapDiv4.style.display="block";
		}
	}
	if(zScrollApp.scrollAreaWidth===mapX) return;
	zScrollApp.scrollAreaWidth=mapX;
	if(zScrollApp.scrollAreaMapDiv2){
		zScrollApp.scrollAreaDiv2.style.width=mapX+"px";
		zScrollApp.scrollAreaMapDiv2.style.backgroundColor="#900";
		zScrollApp.scrollAreaMapDiv2.style.width=mapWidth+"px";
		zScrollApp.scrollAreaMapDiv2.style.height=Math.round(($(window).height()-40)/2)+"px";
		zScrollApp.scrollAreaMapDiv2.style.left=mapX+"px";
		zScrollApp.scrollAreaMapDiv3.style.height=Math.round(($(window).height()-40)/2)+"px";
		zScrollApp.scrollAreaMapDiv4.style.backgroundColor="#009";
		zScrollApp.scrollAreaMapDiv4.style.left=mapX+"px";
		zScrollApp.scrollAreaMapDiv4.style.width=mapWidth+"px";
		zScrollApp.scrollAreaMapDiv4.style.top=Math.round((($(window).height()-40)/2)+40)+"px";
		zScrollApp.scrollAreaMapDiv4.style.height=Math.round(($(window).height()-40)/2)+"px";
		zScrollApp.scrollAreaMapDiv5.style.height=Math.round(($(window).height()-40)/2)+"px";
	}
};

zScrollApp.startYTouch = 0;
zScrollApp.startXTouch = 0;
zScrollApp.startTouchCount = 0;
zScrollApp.listingSearchLoad=function() {
	var u=window.location.href;
	var p=u.indexOf("#");
	if(p !== -1){
		u=u.substr(p+1);
	}
	if(u.indexOf("/z/listing/instant-search/index") !== -1){
		zForceSearchJsScrollTop();
	}
	zScrollApp.lastScreenWidth=$(window).width();
	zScrollApp.itemWidth=Math.round((zScrollApp.lastScreenWidth-110)/3);
	zScrollApp.itemNegativeHeight=90;
	zScrollApp.itemHeight=Math.round((zScrollApp.itemWidth*0.68)+zScrollApp.itemNegativeHeight);
				/*setTimeout(function(){
					var h3 = parent.document.getElementById("zSearchJsNewDivIframe");
					h3.contentWindow
					$(h3).scrollTop(200);
				},1000);*/
				//return;
	if(zIsTouchscreen()){
		//zForceSearchJsScrollTop();
		setTimeout(function () {
			var b = document.body;
			b.addEventListener('touchstart', function (event) {
				zScrollApp.startYTouch = event.targetTouches[0].pageY;
				zScrollApp.startXTouch = event.targetTouches[0].pageX;
				zScrollApp.startTouchCount=event.targetTouches.length;
			});
			b.addEventListener('touchmove', function (event) {
				if(zScrollApp.startTouchCount !== 1 || event.targetTouches.length !== 1){ return true;}
				event.preventDefault();
				
				var posy = event.targetTouches[0].pageY;
				var h = parent.document.getElementById("zSearchJsNewDiv");
				var h3 = parent.document.getElementById("zSearchJsNewDivIframe");
				var sty = $(h3).contents().scrollTop();
				$(h3).contents().scrollTop(sty-(posy - zScrollApp.startYTouch));
			});
		}, 500);
	}
	//window.scrollTo(0,1);
	setTimeout(function(){ 
		var s=$(window).scrollTop();
		if(s !== zScrollApp.lastScrollTop){
			zScrollApp.lastScrollTop=s;
			zScrollApp.delayedScrollFunction();
		}
	}, 100);
	
	
	
	$(window).bind('scroll', zScrollApp.delayedScrollFunction);
	$(window).bind('resize', zScrollApp.delayedResizeFunction);
	/*$(document.body).bind('touchmove', zScrollApp.delayedScrollFunction);
	$(document.body).bind('touchend', function(){zScrollApp.disableNextScrollEvent=false;zScrollApp.lastScrollPosition=1;zScrollApp.scrollFunction();});
	$(document.body).bind('touchstart', zScrollApp.delayedScrollFunction);
	$(window).bind('orientationchange', zScrollApp.delayedResizeFunction);*/
	zScrollApp.scrollAreaDiv=$("#zScrollArea");
	zScrollApp.scrollAreaMapDiv=$("#zMapCanvas");
	zScrollApp.scrollAreaMapDiv2=$("#zMapCanvas3");
	zScrollApp.scrollAreaDiv2=document.getElementById("zScrollArea");
	zScrollApp.scrollAreaMapDiv2=document.getElementById("zMapCanvas");
	zScrollApp.scrollAreaMapDiv3=document.getElementById("zMapCanvas2");
	zScrollApp.scrollAreaMapDiv4=document.getElementById("zMapCanvas3");
	zScrollApp.scrollAreaMapDiv5=document.getElementById("zMapCanvas4");
	zScrollApp.scrollAreaPos=zScrollApp.scrollAreaDiv.position();
	zScrollApp.loadSearchMap();
	
	
	
};
function zListingResetSearch(){
	var s=$(window).width();
	zScrollApp.lastScreenWidth=s;
	/*if($(window).scrollTop() > 5){
		//alert('scroll to 1');
		window.scrollTo(0,1);
		setTimeout("zListingResetSearch();",100);
		return;
	}*/
	var scrollFunctionBackup=zScrollApp.scrollFunction;
	var delayedResizeFunctionBackup=zScrollApp.delayedResizeFunction;
	zScrollApp.templateCache=[];
	zScrollApp.scrollFunction=function(){};
	zScrollApp.delayedResizeFunction=function(){};
	zScrollApp.scrollAreaDiv.html("");
	zScrollApp.forceSmallHeight=50000;
	zScrollApp.newCount=0;
	zScrollApp.maxItems=1000;
	zScrollApp.firstNewBox=0;
	zScrollApp.boxCount2=0;
	//zScrollApp.colCount=-1;
	zScrollApp.itemMarginRight=30;
	zScrollApp.itemMarginBottom=30;
	//zScrollApp.itemWidth=160;
	//zScrollApp.itemHeight=170;
	zScrollApp.itemWidth=Math.round((zScrollApp.lastScreenWidth-110)/3);
	zScrollApp.itemNegativeHeight=90;
	zScrollApp.itemHeight=Math.round((zScrollApp.itemWidth*0.68)+zScrollApp.itemNegativeHeight);
	//zScrollApp.lastScrollPosition=-1;
	zScrollApp.arrVisibleBoxes=new Array();
	zScrollApp.disableNextScrollEvent=false;
	zScrollApp.bottomRowLoaded=0;
	if(zScrollApp.firstAjaxRequest){
		window.scrollTo(0,1);
		zScrollApp.lastScrollPosition=-1;
		zScrollApp.colCount=-1;
	}
	/*
	zScrollApp.scrollAreaDiv=false;
	zScrollApp.scrollAreaPos=false;
	zScrollApp.scrollAreaMapDiv=false;
	*/
	zScrollApp.scrollFunction=scrollFunctionBackup;
	zScrollApp.delayedResizeFunction=delayedResizeFunctionBackup;
	zScrollApp.veryFirstSearchLoad=true;
	//zScrollApp.listingSearchLoad();
	zScrollApp.scrollFunction();
}
zScrollApp.ajaxProcessError=function(r){
	//alert("Failed to search listings. Please try again later.");
};
zScrollApp.showDebugger=function(m){
	document.getElementById("debugInfo").style.display="block";
	document.getElementById("debugInfoTextArea").value+=m;
	
};
zScrollApp.processAjax=function(r){
	//zScrollApp.showDebugger(r);
	var r=eval('(' + r + ')');
	var i2=0;
	if(r.offset>0){
		i2=(r.offset);
	}
	
	//document.getElementById("debugDivDiv").innerHTML="query:"+r.query+"\n\n";
	var itemTop=((i2*zScrollApp.itemHeight)+(i2*zScrollApp.itemMarginBottom));
	if(zScrollApp.firstAjaxRequest){
		setMLSCount2(r.count);
		zScrollApp.totalListingCount=Math.min(zScrollApp.maxItems, r.count);
		zScrollApp.bottomRowLimit=(Math.round(zScrollApp.totalListingCount/zScrollApp.colCount));
		zScrollApp.scrollAreaDiv.css("width",zScrollApp.colCount*(zScrollApp.itemWidth+zScrollApp.itemMarginRight)+"px");
		zScrollApp.scrollAreaDiv.css("height",Math.round(zScrollApp.totalListingCount/zScrollApp.colCount)*(zScrollApp.itemHeight+zScrollApp.itemMarginBottom)+"px");
		zScrollApp.curListingCount=r.count;
		zScrollApp.firstAjaxRequest=false;
		for(var i=0;i<zScrollApp.boxCount2;i++){
			if(i<r.count){
				if(typeof zScrollApp.arrVisibleBoxes["row"+i] === "object"){
					zScrollApp.arrVisibleBoxes["row"+i].visible=true;
				}
				if(document.getElementById("row"+i)){
					document.getElementById("row"+i).style.display="block";
				}
			}else{
				if(typeof zScrollApp.arrVisibleBoxes["row"+i] === "object"){
					zScrollApp.arrVisibleBoxes["row"+i].visible=false;
				}
				if(document.getElementById("row"+i)){
					document.getElementById("row"+i).style.display="none";
				}
			}
		}
	}
	
	var g=document.getElementById('zlsGrid');
	var d="";
	var f=0;
	for(var i=0;i<r.url.length;i++){
		if(r.url[i] === ""){
			 continue;
		}
		if(f>=zScrollApp.colCount){
			f=0;	
			i2++;
			itemTop=((i2*zScrollApp.itemHeight)+(i2*zScrollApp.itemMarginBottom));
		}
		var itemLeft=((f*zScrollApp.itemWidth)+(f*zScrollApp.itemMarginRight));
		var cc=(r.offset)+i;
		if('row'+cc in zScrollApp.templateCache){
			d=zScrollApp.templateCache['row'+cc];	
		}else{
			d=zScrollApp.buildTemplate(r, i);	
			zScrollApp.templateCache['row'+cc]=d;
		}
		//zScrollApp.addListingMarker(r,i);
		zScrollApp.arrListingId[cc]=r.listing_id[i];
		$('#row'+cc).html(d);
		
		var cc1=document.getElementById("row"+cc);
		if(cc1){
			cc1.listing_id=r.listing_id[i];
			cc1.zlsData=r;
			cc1.zlsIndex=i;
			cc1.boxOffset=cc;
		}
		$('#row'+cc).bind('mouseover', function(obj){ 
			//this.style.backgroundColor="#EEE";
			//zScrollApp.scrollAreaMapDiv2.style.display="block";
			//zScrollApp.scrollAreaMapDiv4.style.display="block";
			//zScrollApp.setBoxSizes();
			
			// map temp removed
			//zScrollApp.addListingMarker(this.zlsData,this.zlsIndex);
		});
	
		$('#row'+cc).bind('mouseout', function(obj){ 
			//this.style.backgroundColor="#FFF";
			// map temp removed
			//zScrollApp.removeListingMarker(this.zlsData.listing_id[this.zlsIndex]);
			
			// not used
			//zScrollApp.scrollAreaMapDiv2.style.display="none";
			//zScrollApp.scrollAreaMapDiv4.style.display="none";
		});
		f++;
	}
	var u=window.parent.location.href;	var p=u.indexOf("#");	if(p !== -1){		u=u.substr(p+1);	}
	if(u.indexOf("/z/listing/instant-search/index") !== -1){
		if("/z/listing/search-js/index?"+r.qs === zGetCookie("zls-lsurl")){
			if(zScrollApp.veryFirstSearchLoad){
				var offset=zGetCookie("zls-lsos");
				if(offset !== ""){
					//console.log("trying to move to:"+offset);
					$(window).scrollTop(parseInt(offset));
				}
			}else{
				var offset=$(window).scrollTop();	
				//console.log("unable to move - already loaded:"+offset);
			}
			zSetCookie({key:"zls-lsos",value:offset,futureSeconds:3600,enableSubdomains:false}); 
		}else{
			zSetCookie({key:"zls-lsos",value:0,futureSeconds:3600,enableSubdomains:false}); 
		}
	}else{
		var offset=$(window).scrollTop();
		zSetCookie({key:"zls-lsos",value:offset,futureSeconds:3600,enableSubdomains:false}); 
	}
	zSetCookie({key:"zls-lsurl",value:"/z/listing/search-js/index?"+r.qs,futureSeconds:3600,enableSubdomains:false}); 
	if(zScrollApp.veryFirstSearchLoad){
		zScrollApp.veryFirstSearchLoad=false;
		/*if(zIsTouchscreen()){
			setTimeout(function(){
			window.scrollTo(0,1);
			},500);
			zScrollApp.disableNextScrollEvent=true;
		}*/
	}
};
zScrollApp.imageWidth=0;
zScrollApp.imageHeight=0;
zScrollApp.doAjax=function(perpage, customCallback){
	zSearchFormChanged=true;
	var formName="zMLSSearchForm"; 
	var v1=document.getElementById("search_map_lat_blocks");
	/*if(typeof zMapCoorUpdateV3 !== "undefined"){// && v1 && v1.value==""){ 
		 return "0";
	} */
	if(typeof zFormData[formName] === "undefined") return;
	zFormData[formName].ajax=true;
	zFormData[formName].ignoreOldRequests=false;
	if(typeof customCallback !== "undefined"){
		zFormData[formName].onLoadCallback=customCallback;
	}else{
		zFormData[formName].onLoadCallback=zScrollApp.processAjax;
	}
	zFormData[formName].onErrorCallback=zScrollApp.ajaxProcessError;
	zFormData[formName].successMessage=false;
	
	var v="/z/listing/search/g?of="+zScrollApp.offset+"&perpage="+(perpage)+"&debugSearchForm=1&pw="+zScrollApp.itemWidth+"&ph="+(zScrollApp.itemHeight-zScrollApp.itemNegativeHeight)+"&pa=1&x_ajax_id="+zScrollApp.offset+"_"+Math.random();
	var v2=v;
	if(zScrollApp.firstAjaxRequest){
		v+="&first=1";	
	}
	zFormData[formName].action=v;
	zScrollApp.offset+=perpage;
	zFormSubmit(formName,false,true);
	zFormData[formName].action=v2;
	return false;
};
zScrollApp.buildTemplate=function(d, n){
	var t=[];
	t.push('<div class="zls-grid-1" style="width:'+zScrollApp.itemWidth+'px; height:'+(zScrollApp.itemHeight)+'px;"><div class="zls-grid-2">');
	if(d.photo1[n] !== ''){
		t.push('<img src="'+d.photo1[n]+'" onerror="zImageOnError(this);" width="'+zScrollApp.itemWidth+'" height="'+(zScrollApp.itemHeight-zScrollApp.itemNegativeHeight)+'" alt="Image1" />');
	}else{
		t.push('&nbsp;');	
	}
	t.push('<\/div><div class="zls-grid-3">');
	t.push('<div class="zls-buttonlink" style="float:right; position:relative; margin-top:-38px;"><a href="#" onclick="parent.zContentTransition.gotoURL(\''+d.url[n]+'\');">View</a></div>');
	if(d.price[n] !== "0"){
		t.push('<strong>'+d.price[n]+'<\/strong><br />');
	}
	var bset=false;
	if(d.bedrooms[n] !== "0" && d.bedrooms[n] !== ""){
		bset=true;
		t.push(d.bedrooms[n]+" bed");
	}
	if(d.bedrooms[n] !== "0" && d.bedrooms[n] !== ""){
		if(bset){
			t.push(", ");	
		}
		bset=true;
		t.push(d.bathrooms[n]+" bath");
	}
	if(bset){
		t.push('<br />');
	}else if(d.square_footage[n] !== "" && d.square_footage[n] !== "0"){
		t.push(d.square_footage[n]+' sqft<br />');	
	}
	if(d.type[n] !== ""){
		t.push(d.type[n]+'<br />');	
	}
	if(d.city[n] !== ""){
		t.push(d.city[n]+'<br />');	
	}
	return t.join("");
};


/* /var/jetendo-server/jetendo/public/javascript/jetendo-listing/zlsHoverBox.js */

var zlsHoverBox={
	box: false,
	boxPosition:false,
	panelPosition:false,
	button:{},
	displayType:"detail",
	firstLoad:true,
	changeDisplayType: function(g, g2){
		if(zlsHoverBox.button.grid.id===g.target.id){
			zlsHoverBox.displayType="grid";
			zlsHoverBox.button.grid.className=g.target.id+"-selected";
			zlsHoverBox.button.map.className="";
			zlsHoverBox.button.detail.className="";
			zlsHoverBox.button.list.className="";
			if(!zFunctionLoadStarted){
				document.getElementById('search_result_layout').selectedIndex=2;
				document.zMLSSearchForm.submit();
			}
		}else if(zlsHoverBox.button.list.id===g.target.id){
			zlsHoverBox.displayType="list";
			zlsHoverBox.button.list.className=g.target.id+"-selected";
			zlsHoverBox.button.map.className="";
			zlsHoverBox.button.detail.className="";
			zlsHoverBox.button.grid.className="";
			if(!zFunctionLoadStarted){
				document.getElementById('search_result_layout').selectedIndex=1;
				document.zMLSSearchForm.submit();
			}
		}else if(zlsHoverBox.button.map.id===g.target.id){
			zlsHoverBox.displayType="map";
			zlsHoverBox.button.map.className=g.target.id+"-selected";
			zlsHoverBox.button.detail.className="";
			zlsHoverBox.button.grid.className="";
			zlsHoverBox.button.list.className="";
		}else if(zlsHoverBox.button.detail.id===g.target.id){
			zlsHoverBox.displayType="detail";
			zlsHoverBox.button.map.className="";
			zlsHoverBox.button.detail.className=g.target.id+"-selected";
			zlsHoverBox.button.grid.className="";
			zlsHoverBox.button.list.className="";
			if(!zFunctionLoadStarted){
				document.getElementById('search_result_layout').selectedIndex=0;
				document.zMLSSearchForm.submit();
			}
		}
		//zSetCookie({key:"zlsHoverBoxDisplayType",value:zlsHoverBox.displayType,futureSeconds:60*60*7});
		//zlsHoverBox.showListings();
		return false;
	},
	showListings: function(){
		zScrollApp.appDisabled=false;
		zListingResetSearch();
		zlsHoverBox.closePanel();
		//zlsHoverBox.button.refine.innerText="Refine Search";
	}
};
zlsHoverBox.load=function(){
	var d=document.getElementById('zlsHoverBoxDisplayType');
	if(d === null){ return;}
	zlsHoverBox.displayType=d.value;
	zlsHoverBox.loaded=true;
	zlsHoverBox.debugInput=document.getElementById('dt21');
	zlsHoverBox.box=document.getElementById("zls-hover-box");
	zlsHoverBox.panel=document.getElementById("zls-hover-box-panel");
	zlsHoverBox.panelInner=document.getElementById("zls-hover-box-panel-inner");
	//zlsHoverBox.button.refine=document.getElementById("zls-hover-box-refine-button");
	zlsHoverBox.button.grid=document.getElementById("zls-hover-box-grid-button");
	zlsHoverBox.button.list=document.getElementById("zls-hover-box-list-button");
	zlsHoverBox.button.detail=document.getElementById("zls-hover-box-detail-button");
	zlsHoverBox.button.map=document.getElementById("zls-hover-box-map-button");
	//zlsHoverBox.button.refine.onclick=zlsHoverBox.togglePanel;
	zlsHoverBox.button.grid.onclick=function(){zlsHoverBox.changeDisplayType({target:zlsHoverBox.button.grid}); return false;};
	zlsHoverBox.button.list.onclick=function(){zlsHoverBox.changeDisplayType({target:zlsHoverBox.button.list}); return false;};
	zlsHoverBox.button.detail.onclick=function(){zlsHoverBox.changeDisplayType({target:zlsHoverBox.button.detail}); return false;};
	zlsHoverBox.button.map.onclick=function(){zlsHoverBox.changeDisplayType({target:zlsHoverBox.button.map}); return false;};
	zlsHoverBox.changeDisplayType({target:zlsHoverBox.button[zlsHoverBox.displayType]});
};
zArrLoadFunctions.push({functionName:zlsHoverBox.load});





var zlsHoverBoxNew={
	box: false,
	boxPosition:false,
	panelPosition:false,
	button:{},
	displayType:"grid",
	changeDisplayType: function(g, g2){
		if(zlsHoverBoxNew.button.grid.id===g.target.id){
			zlsHoverBoxNew.displayType="grid";
			zlsHoverBoxNew.button.grid.className=g.target.id+"-selected";
			//zlsHoverBoxNew.button.map.className="";
			//zlsHoverBoxNew.button.list.className="";
		}else if(zlsHoverBoxNew.button.list.id===g.target.id){
			zlsHoverBoxNew.displayType="list";
			//zlsHoverBoxNew.button.list.className=g.target.id+"-selected";
			//zlsHoverBoxNew.button.map.className="";
			zlsHoverBoxNew.button.grid.className="";
		}else if(zlsHoverBoxNew.button.map.id===g.target.id){
			zlsHoverBoxNew.displayType="map";
			//zlsHoverBoxNew.button.map.className=g.target.id+"-selected";
			zlsHoverBoxNew.button.grid.className="";
			//zlsHoverBoxNew.button.list.className="";
		}
		var futureSeconds=3600*7;
		zSetCookie({key:"zlsHoverBoxNewDisplayType",value:zlsHoverBoxNew.displayType,futureSeconds:futureSeconds});
		if(!zScrollApp.disableFirstAjaxLoad){
			zlsHoverBoxNew.showListings();
		}
		return false;
	},
	loaded:false,
	debugInput:false,
	load:function(){
		if(zlsHoverBoxNew.loaded) return;
		zlsHoverBoxNew.loaded=true;
		zlsHoverBoxNew.debugInput=document.getElementById('dt21');
		zlsHoverBoxNew.box=document.getElementById("zls-hover-box");
		zlsHoverBoxNew.panel=document.getElementById("zls-hover-box-panel");
		zlsHoverBoxNew.panelInner=document.getElementById("zls-hover-box-panel-inner");
		zlsHoverBoxNew.button.refine=document.getElementById("zls-hover-box-refine-button");
		zlsHoverBoxNew.button.grid=document.getElementById("zls-hover-box-grid-button");
		//zlsHoverBoxNew.button.list=document.getElementById("zls-hover-box-list-button");
		//zlsHoverBoxNew.button.map=document.getElementById("zls-hover-box-map-button");
		zlsHoverBoxNew.button.refine.onclick=zlsHoverBoxNew.togglePanel;
		//zlsHoverBoxNew.button.grid.onclick=zlsHoverBoxNew.changeDisplayType;
		//zlsHoverBoxNew.button.list.onclick=zlsHoverBoxNew.changeDisplayType;
		//zlsHoverBoxNew.button.map.onclick=zlsHoverBoxNew.changeDisplayType;
		var t=zGetCookie("zlsHoverBoxNewDisplayType");
		if(t !== ""){
		zlsHoverBoxNew.displayType=t;
		}
		zlsHoverBoxNew.debugInput.value="";
		//zlsHoverBoxNew.debugInput.value+="CookieDisplayType:"+zGetCookie("zlsHoverBoxNewDisplayType")+"\n";
		zlsHoverBoxNew.changeDisplayType({target:zlsHoverBoxNew.button[zlsHoverBoxNew.displayType]});
	},
	showListings: function(){
		zScrollApp.firstAjaxRequest=true;
		zScrollApp.appDisabled=false;
		zlsHoverBoxNew.closePanel();
		zlsHoverBoxNew.button.refine.innerHTML="Refine Search";
		zListingResetSearch();
	},
	closePanel: function(){
		if(zlsHoverBoxNew.panel.style.display==="block"){
			//zScrollApp.forceSmallHeight=50000;
			//drawVisibleRows(0,0);
			zScrollApp.scrollAreaDiv2.style.display="block";
			document.getElementById('zMapCanvas').style.display="block";
			document.getElementById('zMapCanvas3').style.display="block";
			var tempObj={'margin-top':-(zlsHoverBoxNew.panelPosition.height)+zlsHoverBoxNew.boxPosition.height};
			$(zlsHoverBoxNew.panel).animate(tempObj,'fast','easeInExpo', function(){zlsHoverBoxNew.panel.style.display="none"; });
		}
	},
	togglePanel: function(){
		if(zlsHoverBoxNew.panel.style.display==="block" && !zScrollApp.disableFirstAjaxLoad){
			zlsHoverBoxNew.showListings();
		}else{
			if(zIsTouchscreen()){
				zlsHoverBoxNew.box.style.top="0px";	
			}
			zlsHoverBoxNew.button.refine.innerHTML="Show Listings";
			zlsHoverBoxNew.panel.style.display="block";
			zlsHoverBoxNew.resizePanel();
			
			// disable the listing display
			zScrollApp.appDisabled=true;
			zScrollApp.scrollAreaDiv2.style.display="none";
			document.getElementById('zMapCanvas').style.display="none";
			document.getElementById('zMapCanvas3').style.display="none";
			
			//zScrollApp.forceSmallHeight=zWindowSize.height-zlsHoverBoxNew.boxPosition.height-30;
			//drawVisibleRows(0,0);
			
			if(zIsTouchscreen() || zScrollApp.disableFirstAjaxLoad){
				zlsHoverBoxNew.panel.style.marginTop=zlsHoverBoxNew.boxPosition.height+"px";
				window.scrollTo(0,1);
			}else{
				zlsHoverBoxNew.panel.style.marginTop=(-(zlsHoverBoxNew.panelPosition.height)+zlsHoverBoxNew.boxPosition.height)+"px";
				$(zlsHoverBoxNew.panel).animate({"margin-top":zlsHoverBoxNew.boxPosition.height},'fast','easeInExpo');
			}
		}
		return false;
	},
	lastBoxHeight:0,
	resizePanel: function(){
		if(!zlsHoverBoxNew.loaded) zlsHoverBoxNew.load();
		var nw=zWindowSize.width-10;
		var w=Math.min(1100,nw);
		var newLeft=Math.round((nw-w)/2);
		if(w>=1100){
			zlsHoverBoxNew.box.style.width=w+"px";
			zlsHoverBoxNew.box.style.marginLeft="-"+Math.floor(w/2)+"px";
		}else{
			zlsHoverBoxNew.box.style.width="97%";
			zlsHoverBoxNew.box.style.marginLeft="-49%";
		}
		//zlsHoverBoxNew.box.style.width=w+"px";
		zlsHoverBoxNew.box.style.display="block";
		zlsHoverBoxNew.boxPosition=zGetAbsPosition(zlsHoverBoxNew.box);
		if(zlsHoverBoxNew.panel.style.display==="block"){
			var nw=zWindowSize.width-10;
			var w=Math.min(1100,nw);
			var newLeft=Math.round((nw-w)/2);
			if(w>=1100){
				if(zlsHoverBoxNew.panel.style.width !== "1100px"){
					zlsHoverBoxNew.panel.style.width=w+"px";
					zlsHoverBoxNew.panel.style.marginLeft="-"+Math.floor(w/2)+"px";
				}
			}else{
				zlsHoverBoxNew.panel.style.width="97%";
				zlsHoverBoxNew.panel.style.marginLeft="-49%";
			}
			zlsHoverBoxNew.panelPosition=zGetAbsPosition(zlsHoverBoxNew.panel);
			//zlsHoverBoxNew.panelInnerPosition=zGetAbsPosition(zlsHoverBoxNew.panel);
			//var h=Math.min(zlsHoverBoxNew.panelInnerPosition.height,zWindowSize.height-zlsHoverBoxNew.boxPosition.height-30);
			if(zIsTouchscreen()){
				if(zIsAppleIOS()){
					zlsHoverBoxNew.box.style.position="absolute";
				}
				zlsHoverBoxNew.panel.style.position="absolute";
				zlsHoverBoxNew.panel.style.height="auto";
			}else{
				zlsHoverBoxNew.panel.style.height="90%";//h+"px";
			}
			if(zlsHoverBoxNew.lastBoxHeight !== 0 && zlsHoverBoxNew.lastBoxHeight !== zlsHoverBoxNew.boxPosition.height){
				zlsHoverBoxNew.panel.style.marginTop=(zlsHoverBoxNew.boxPosition.height)+"px";
			}
			zlsHoverBoxNew.lastBoxHeight=zlsHoverBoxNew.boxPosition.height;
				
			//alert(zlsHoverBoxNew.panelPosition.height+":"+zlsHoverBoxNew.boxPosition.height+":"+zlsHoverBoxNew.panel.style.marginTop);
		}
	}
};