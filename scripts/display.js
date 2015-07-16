/*
	display.js
	
	Javascripts for comp previewer
	
	latest changes:
	16 dec 10
		scroll window to top when image changes.
			this requires among other things knowing the image height.
		fixes to bring Internet Explorer into line.
		cease depending on fault tolerance in the image preloader.
	15 dec 10
		added the ability to link to a specific comp in the list.
		added the ability to use distinct background-color or background-image values per image.
		fixed a minor bug where the background(-image,-color) value in the cuesheet is missing.
		updated to jQuery 1.4.4.
		changed the jQuery SRC to the official jquery.com CDN to avoid a potential mixed-security browser alert.
	25 feb 10
		prevent $('title') manipulation from occurring in IE because it's not handled gracefully
		edited index.html to load jQuery from Google's code repository (which they allow)
*/

// requires jQuery.
$.get("cuesheet.txt",function (data){
	data = jQuery.trim(data);
	var cuesheet = data.split(/\n/);
	cues = []; var b = 0; var piclist = []; var indexlist = [];
	for(var a=0;a<cuesheet.length;a++) {
		if (cuesheet[a]) {
			if (cuesheet[a].match('title:')) {
				var titlebit = cuesheet[a].substr(6)
				$('#title').text(cuesheet[a].substr(6));
			} else {
				var thiscue = cuesheet[a].split(/\t/);
				cues[b] = [];
				cues[b]['img'] = thiscue[0];
				cues[b]['bg'] = thiscue[1];
				piclist.push(thiscue[0]);
				piclist.push(thiscue[1]);
				b++;
			}
		}
	}
	if (window.location.hash) {
		var urlmatches = window.location.hash.match(/\#image(\d+)/);
		var cuestart = urlmatches[1] - 1;
		if (cuestart<0) { cuestart = cues.length - 1; } // now there's an obiwan when using arrow keys. hmmm
		$('#next').attr('seq',cuestart);
	} else {
		// not sure if this is necessary or if it always equals 0 on an unhashed URL. investigate later.
		var cuestart = $('#next').attr('seq');
	}
	if (!isIE()) { // putzing with the title fails in most flavors of IE for some reason.
		var textlet = $('title').text();
		$('title').text(textlet+' '+titlebit);
	}
	if (cues[cuestart]['bg']) {
		if (cues[cuestart]['bg'].match('#')===0) {
			$('body').css('background-image',"none");
			$('body').css('background-color',cues[cuestart]['bg']);
		} else {
			$('body').css('background-image',"url('images/"+cues[cuestart]['bg']+"')");
		}
	} else {
		$('body').css('background-image',"none");
	}
	$('#pic').attr('src','images/'+cues[cuestart]['img']);
	$('#prev').mouseup(function() {
		var b = $(this).attr('seq');
		b = parseInt(b)
		if (b==0) { var c = cues.length - 1; } else { var c = b - 1; }
		flipper(c);
	});
	$('#next').mouseup(function() {
		var b = $(this).attr('seq');
		b = parseInt(b)
		if (b==cues.length - 1) { var c = 0; } else { var c = b + 1; }
		flipper(c);
	});
	var imagelist = '';
	var indexclassname = '';
	for (var a=0;a<cues.length;a++) {
		if (a==cuestart) {
			indexclassname = ' thispage';
		} else {
			indexclassname = '';
		}
		var b = a + 1; // picket fence!(see .pagelink mouseup below)
		imagelist = imagelist+'<span id="page'+a+'" class="pagelink'+indexclassname+' pseudolink" src="images/'+cues[a]['img']+'">'+b+'</span>';
	}
	$('#index').html(imagelist);
	$('.pagelink').mouseup(function() {
		var c = $(this).text();
		c = parseInt(c);
		c = c - 1; // picket fence!
		flipper(c);
	});
	// save this for last
	extraPreloader(piclist);
	$(document).keyup(function(event){
//alert(event.keyCode);
		var k = event.keyCode;
		var b = $('#next').attr('seq');
		b = parseInt(b);
		switch (k) {
			case 39: // right arrow
//			case 13: // return key // causes an unwanted forward when pasting in an URL in FF
				if (b==cues.length - 1) { var c = 0; } else { var c = b + 1; }
				flipper(c);
				break;
			case 37: // left arrow
				if (b==0) { var c = cues.length - 1; } else { var c = b - 1; }
				flipper(c);
				break;
		}
		if (k>=48&&k<=57) { // numeric keypress. '0' will be used to mean '10'
			var c = k - 49;
			if (c<0) { c = 9; } // picket fence, yo
			if (c<=cues.length) {
				flipper(c);
			}
		}
		return false;
	});
});
function flipper(c) {
	if (cues[c]['bg']) {
		if (cues[c]['bg'].match('#')===0) {
			$('body').css('background-image',"none");
			$('body').css('background-color',cues[c]['bg']);
		} else {
			$('body').css('background-image',"url('images/"+cues[c]['bg']+"')");
		}
	} else {
		$('body').css('background-image',"none");
	}
	// any faster than 500ms and the window bounces downward again. bizarre.
	// the window.scroll command is an attempt to keep the window pinned to the top.
	if (isIE()) {
		$("html,body").animate({"scrollTop":0},1000,'swing');
		window.scroll(0,0);
	} else {
		$("html,body").animate({"scrollTop":0},500,'swing');
		window.scroll(0,0);
	}
	if (isIE()) {
		$('#pic').attr('src','images/'+cues[c]['img']);
	} else {
		// this can probably be made to work in IE, but right now it's throwing blocks in my way.
		for (var a=0;a<picPre.length;a++) {
			// firefox is having a problem with the 5th and onward images in the queue.
			if (picPre[a] && picPre[a].src.match(cues[c]['img'])) {
				if (isIE()) {
					var cueHeight = picPre[a].height;
					var cueWidth = picPre[a].width;
				} else {
					var cueHeight = picPre[a].naturalHeight;
					var cueWidth = picPre[a].naturalWidth;
				}
				break;
			}
		}
		$('#pic').attr('height',cueHeight).attr('width',cueWidth).attr('src','images/'+cues[c]['img']);
	}
	$('#prev,#next').attr('seq',c);
	$('.pagelink').removeClass('thispage');
	$('#page'+c).addClass('thispage');
	var hashnum = c+1;
	window.location.hash = 'image'+hashnum;
	return;
}

/*
Correctly handle PNG transparency in Win IE 5.5 & 6.
http://homepage.ntlworld.com/bobosola. Updated 18-Jan-2006.
*/
function pngFix(){var arVersion=navigator.appVersion.split("MSIE");var version=parseFloat(arVersion[1]);if((version>=5.5) && (document.body.filters)){for(var i=0;i<document.images.length;i++){var img=document.images[i];var imgName=img.src.toUpperCase();if(imgName.substring(imgName.length-3, imgName.length)=="PNG"){var imgID=(img.id) ? "id='"+img.id+"' " : "";var imgClass=(img.className) ? "class='"+img.className+"' " : "";var imgTitle=(img.title) ? "title='"+img.title+"' " : "title='"+img.alt+"' ";var imgStyle="display:inline-block;"+img.style.cssText;if(img.align=="left"){imgStyle="float:left;"+imgStyle;}if(img.align=="right"){imgStyle="float:right;"+imgStyle;}if(img.parentElement.href){imgStyle="cursor:hand;"+imgStyle;}var strNewHTML="<span "+imgID+imgClass+imgTitle +" style=\""+"width:"+img.width+"px;height:"+img.height+"px;"+imgStyle+";" +"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader" +"(src=\'"+img.src+"\', sizingMethod='scale');\"></span>";img.outerHTML=strNewHTML;i=i-1;}}}return;}

// Tests for MSIE version. Returns version whole number
function isIE() {/*@cc_on
if(@_jscript_version < 5.6){return 5;}if(@_jscript_version < 5.7){return 6;}if(@_jscript_version < 5.8){return 7;}if(@_jscript_version < 5.9){return 8;}
@*/ return 0;}

// preload random images needed by various things.
function extraPreloader (piclist) {
	picPre = new Array();
	imgPath = 'images/';
	for (var a=0;a<piclist.length;a++) {
//alert(piclist[a]);
		if ((piclist[a]!=='undefined') || !piclist[a].match('#')) {
			picPre[a] = new Image();
			picPre[a].src = imgPath + piclist[a];
		}
	}
	return;
}

function launchAll() {
//	initRollovers();
	if (!document.getElementById('controlbar')) { return; }
	if (isIE() && isIE()<7) {
		pngFix();
	}
//	imgPicker();
}
window.onload = launchAll;

/* EOF */
