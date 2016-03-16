window.onload = function(){
	//	doDebug("loaded");
	};
window.onresize = function(){
		for(var i=0; i<winObjArr.length; i++){
			if(!winObjArr[i].maximized){
				continue;
			}
			winObjArr[i].sizeMaxWinHeight();
		}
	};
window.onmousemove = function(event){
		if(typeof(winmove) === 'undefined'){
			return;
		}
		if(winmove && !drawingmove){
			getmousepos(event);
			drawingmove = true;
			window.requestAnimationFrame(domovewin);
		}
		else if(resizing && !drawingresize){
			getmousepos(event);
			drawingresize = true;
			window.requestAnimationFrame(dosizewin);
		}
	};
window.onmouseup = function(){
		stopmovewin();
		stopsizewin();
	};
window.onclick = function(){
		document.getElementById('contextmenu').style.display = 'none';
	};
window.oncontextmenu = function(event){
		openContextMenu(event,document.body);
	};

function doaction(action,successFunction){
	var xmlhttp;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function(){
			if(this.readyState==4 && this.status==200){
				if(typeof(successFunction) == 'function'){
					successFunction(this.responseText);
				}
				else{
					doDebug("<p>"+action+":</p>"+this.responseText);
				}
			}
		};
	if(action != ""){
		action = "?action="+action;
	}
	xmlhttp.open("GET",action,true);
	xmlhttp.send();
}

var mousepos = null;

function openContextMenu(event,elm){
	event.preventDefault();
	event.stopPropagation();
	
	var html = "";
	var menu = document.getElementById('contextmenu');
	
	if(elm.id == 'menubar'){
		html = "<div class='label'>Actions</div>"+
			"<div onclick=\"addMenuBtn();\">New Menu Item</div>";
	}
	else if(elm.parentNode && elm.parentNode.id == 'menubar'){
		html = "<div class='label'>Actions</div>"+
			"<div onclick=\"addMenuBtn();\">New Menu Item</div>"+
			"<div class='separator'></div>"+
			"<div onclick=\"editMenuBtn('"+elm.id+"');\">Edit Menu Item</div>"+
			"<div onclick=\"removeMenuBtn('"+elm.id+"');\">Remove Menu Item</div>";
	}
	else{
		
	}
	
	if(html == ''){
		return;
	}
	getmousepos(event);
	if(!mousepos){
		return;
	}
	menu.style.display = "block";
	menu.style.top = mousepos.posY+"px";
	menu.style.left = mousepos.posX+"px";
	menu.innerHTML = html;
}

var contextUtil = null;
function menuBtnClick(action){
	if(typeof(contextUtil) !== 'function'){
		createWin(action);
	}
	else{
		return contextUtil(action);
	}
}

function addMenuBtn(){
	editMenuBtn();
}

function editMenuBtn(btnID,action){
	var elm = null;
	var url = "";
	var label = "";
	if(typeof(btnID) !== 'undefined'){
		elm = document.getElementById(btnID);
		if(typeof(action) === 'undefined'){
			contextUtil = function(raction){
					editMenuBtn(btnID,raction);
				};
			elm.onclick();
			return;
		}
		contextUtil = null;
		url = action;
		label = elm.innerHTML;
	}
	var newForm = document.createElement("div");
	newForm.innerHTML = "<p>URL</p>"+
		"<input type='text' style='width:300px;' name='url' value='"+url+"'/>"+
		"<p>Label</p>"+
		"<input type='text' style='width:120px;' name='label' value='"+label+"'/>"+
		"<p>&nbsp;</p>";
	var newBtn = document.createElement("input");
	newForm.appendChild(newBtn);
	newBtn.type = "button";
	newBtn.value = "save item";
	newBtn.name = "save";
	newBtn.onclick = function(){
			var inputs = newForm.getElementsByTagName("input");
			var linkurl = "";
			var linklabel = "";
			for(var i=0; i<inputs.length; i++){
				if(inputs[i].name == 'url'){
					linkurl = inputs[i].value;
				}
				else if(inputs[i].name == 'label'){
					linklabel = inputs[i].value;
				}
			}
			var menubar = document.getElementById('menubar');
			//create new button
			var newDiv = document.createElement("div");
			newDiv.innerHTML = linklabel;
			newDiv.onclick = function(){menuBtnClick(linkurl);};
			newDiv.oncontextmenu = function(event){openContextMenu(event,this);};
			//send new info to server for saving
			if(!elm){
				doaction("addMenuItem&url="+encodeURIComponent(linkurl)+"&label="+encodeURIComponent(linklabel),function(response){});
				//add new btn to menu at the end
				newDiv.id = "mi"+menubar.getElementsByTagName("div").length;
				menubar.appendChild(newDiv);
			}
			else{
				doaction("editMenuItem&url="+encodeURIComponent(url)+"&label="+encodeURIComponent(label)+"&newurl="+encodeURIComponent(linkurl)+"&newlabel="+encodeURIComponent(linklabel),
					function(response){
							if(response == 'false'){
								//todo - undo changes
							}
						});
				//add the new btn before the original
				newDiv.id = elm.id;
				menubar.insertBefore(newDiv,elm);
				//remove the original
				delete menubar.removeChild(elm);
			}
			hidePopUp();
		};
	showPopUp(newForm);
}

function removeMenuBtn(elmID){
	var elm = document.getElementById(elmID);
	contextUtil = function(linkurl){
			contextUtil = null;
			var linklabel = elm.innerHTML;
			doaction("removeMenuItem&url="+encodeURIComponent(linkurl)+"&label="+encodeURIComponent(linklabel),function(response){});
			var menubar = document.getElementById('menubar');
			//remove btn
			menubar.removeChild(elm);
			//realign btn ids
			var list = menubar.getElementsByTagName("div");
			for(var i=0; i<list.length; i++){
				list[i].id = "mi"+i;
			}
		};
	elm.onclick();
}

function getmousepos(e){
	mousepos = new Object();
	var ev=(!e)?window.event:e;//Moz:IE
	if (ev.pageX){mousepos.posX=ev.pageX;mousepos.posY=ev.pageY}//Mozilla or compatible
	else if(ev.clientX){mousepos.posX=ev.clientX;mousepos.posY=ev.clientY}//IE or compatible
	else{return false}//old browsers
	mousepos.posX += document.body.scrollLeft;
	mousepos.posY += document.body.scrollTop;
}

function doDebug(textval,appendtop){
	var debug = document.getElementById('debug');
	if(typeof(appendtop) === 'undefined' || !appendtop){
		debug.innerHTML = textval;
	}
	else{
		debug.innerHTML = textval+"<br/>"+debug.innerHTML;
	}
}

function showPopUp(msg,noclose){
	if(typeof(noclose) === 'undefined'){
		noclose = false;
	}
	var popshade = document.getElementById('popupshade');
	var pophldr = document.getElementById('popupholder');
	var newDiv = document.createElement("div");
	if(typeof(msg) === 'string'){
		newDiv.innerHTML = msg;
	}
	else{
		newDiv.appendChild(msg);
	}
	if(!noclose){
		var closeImg = document.createElement("img");
		closeImg.src = getImageSRC("close");
		closeImg.className = "closeeditbtn";
		closeImg.onclick = function(){
				hidePopUp();
			};
		newDiv.appendChild(closeImg);
	}
	pophldr.appendChild(newDiv);
	popshade.style.display = "block";
	pophldr.style.display = "block";
}

function hidePopUp(){
	var popshade = document.getElementById('popupshade');
	var pophldr = document.getElementById('popupholder');
	pophldr.innerHTML = "";
	popshade.style.display = "";
	pophldr.style.display = "";
}

function frameClick(frame){
	window.onclick();
	openMenu(null,frame,true);
}

var moveelm = null;
var winmove = false;
var drawingmove = false;
var offsetX = 0;
var offsetY = 0;
var zMax = 0;
var lastLeft = 10;
var lastTop = 45;
var defTopOffset = 31;

var winObjArr = new Array();

function createWin(action){
	var newWin = document.createElement("table");
	document.body.appendChild(newWin);
	newWin.style.left = lastLeft + "px";
	newWin.style.top = lastTop + "px";
	newWin.className = "win";
	zMax++;
	newWin.style.zIndex = zMax;
	newWin.onmousedown = function(){
			if(this.style.zIndex == zMax){
				return;
			}
			zMax++;
			this.style.zIndex = zMax;
		};
	
	var newRow = document.createElement("tr");
	newWin.appendChild(newRow);
	newRow.className = "ends top";
	newRow.innerHTML = "<td colspan='3'><div class='topleft'></div><div class='topright'></div></td>";
	newRow.onmousedown = function(event){
			startsizewin(event,this);
		};
	newRow.onmouseup = function(event){
			stopsizewin();
		};
	var list = newRow.getElementsByTagName("div");
	for(var i=0; i<list.length; i++){
		list[i].onmousedown = function(event){
				 startsizewin(event,this);
			};
		list[i].onmouseup = function(event){
				stopsizewin();
			};
	}
	
	newRow = document.createElement("tr");
	newWin.appendChild(newRow);
	var newCell = document.createElement("td");
	newRow.appendChild(newCell);
	newCell.className = "sides left";
	newCell.rowSpan = 2;
	newCell.onmousedown = function(event){
			startsizewin(event,this);
		};
	newCell.onmouseup = function(event){
			stopsizewin();
		};
	var header = document.createElement("td");
	newRow.appendChild(header);
	header.className = "header";
	header.innerHTML = "<img src='"+getImageSRC("menu")+"' title='menu' onclick=\"openMenu(event,this);\"/>"+
		"<div class='menu'>"+
			"<div onclick=\"reloadWin(this);\">Reload</div>"+
			"<div onclick=\"closeWin(event,this);\">Close</div>"+
		"</div>"+
		"<span class='title'>Loading...</span>"+
		"<span class='control'>"+
			"<img src='"+getImageSRC("min")+"' title='minimize' onclick=\"minWin(event,this);\"/>"+
			"<img src='"+getImageSRC("downsize")+"' title='downsize' style='display:none;' onclick=\"downsizeWin(event,this);\"/>"+
			"<img src='"+getImageSRC("max")+"' title='maximize' onclick=\"maxWin(event,this);\"/>"+
			"<img src='"+getImageSRC("close")+"' title='close' onclick=\"closeWin(event,this);\"/>"+
		"</span>";
	header.onmousedown = function(event){
			startmovewin(event,this);
		};
	header.onmouseup = function(){
			stopmovewin();
		};
	newCell = document.createElement("td");
	newRow.appendChild(newCell);
	newCell.className = "sides right";
	newCell.rowSpan = 2;
	newCell.onmousedown = function(event){
			startsizewin(event,this);
		};
	newCell.onmouseup = function(event){
			stopsizewin();
		};
	
	newRow = document.createElement("tr");
	newRow.className = "content";
	newWin.appendChild(newRow);
	newCell = document.createElement("td");
	newRow.appendChild(newCell);
	var newFrame = document.createElement("iframe");
	newCell.appendChild(newFrame);
	newFrame.src = action;
	newFrame.onload = function(){
			var titleElm = header.getElementsByClassName("title")[0];
			try{
				this.contentWindow.addEventListener("mousedown",function(){
						this.parent.frameClick(this.frameElement);
					},false);
			}
			catch(e){
				titleElm.innerHTML = action;
			//	showPopUp("There was an error loading the requested item.");
				return;
			}
			//set the title
			var title = this.contentDocument.getElementsByTagName("title");
			if(!title){
				titleElm.innerHTML = action;
			}
			else{
				titleElm.innerHTML = title[0].innerHTML;
			}
			titleElm.title = titleElm.innerHTML;
		};
	
	newRow = document.createElement("tr");
	newWin.appendChild(newRow);
	newRow.className = "ends bot";
	newRow.innerHTML = "<td colspan='3'><div class='botleft'></div><div class='botright'></div></td>";
	newRow.onmousedown = function(event){
			startsizewin(event,this);
		};
	newRow.onmouseup = function(event){
			stopsizewin();
		};
	list = newRow.getElementsByTagName("div");
	for(var i=0; i<list.length; i++){
		list[i].onmousedown = function(event){
				 startsizewin(event,this);
			};
		list[i].onmouseup = function(event){
				stopsizewin();
			};
	}
	
	winObjArr[winObjArr.length] = new windowObject(newWin,newFrame,action);
	var wObj = winObjArr[winObjArr.length - 1];
	wObj.posLeft = lastLeft;
	wObj.posTop = lastTop;
	/*
	wObj.sizeX = 500;
	wObj.sizeY = 500;
	*/
	lastLeft += 20;
	lastTop += 20;
}

function getWin(elm,getidx){
	while(!elm.classList.contains("win")){
		if(elm == document.body){
			return null;
		}
		elm = elm.parentNode;
	}
	for(var i=0; i<winObjArr.length; i++){
		if(winObjArr[i].winDiv == elm){
			if(typeof(getidx) !== 'undefined' && getidx){
				return i;
			}
			return winObjArr[i];
		}
	}
	return null;
}

function startmovewin(event,elm){
	event.stopPropagation();
	moveelm = getWin(elm).winDiv;
	if(moveelm.id == 'minholder'){
		return;
	}
	togglePointerEvents(false);
	getmousepos(event);
	offsetX = mousepos.posX - moveelm.offsetLeft;
	offsetY = mousepos.posY - moveelm.offsetTop;
	
	if(moveelm.style.zIndex < zMax){
		zMax++;
		moveelm.style.zIndex = zMax;
	}
	
	winmove = true;
}

function stopmovewin(){
	if(!winmove){
		return;
	}
	winmove = false;
	drawingmove = false;
	moveelm = null;
	resetMarker();
	togglePointerEvents(true);
}

function domovewin(){
	if(!winmove){
		return;
	}
	var left, top;

	left = mousepos.posX-offsetX;
	top = mousepos.posY-offsetY;
	
	if(mousepos.posX <= 0 || top <= 35){
		stopmovewin();
		return;
	}
	
	moveelm.style.left = left+"px";
	moveelm.style.top = top+"px";
	var wObj = getWin(moveelm);
	wObj.posLeft = left;
	wObj.posTop = top;
	
	drawingmove = false;
}

function togglePointerEvents(enable){
	if(typeof(enable) === 'undefined'){
		enable = false;
	}
	var list = document.getElementsByTagName("iframe");
	for(var i=0; i<list.length; i++){
		if(enable){
			list[i].classList.remove("nopointevent");
		}
		else{
			list[i].classList.add("nopointevent");
		}
	}
}

function resetMarker(zero){
	var left=0, top=0, temp;
	if(typeof(zero) === 'undefined' || !zero){
		//find the lowest and rightmost window element and move the marker to that position to maintain scroll positions
		var wins = document.getElementsByClassName('win');
		for(var i=0; i<wins.length; i++){
			temp = wins[i].offsetLeft + wins[i].offsetWidth;
			if(temp > left){
				left = temp;
			}
			temp = wins[i].offsetTop + wins[i].offsetHeight;
			if(temp > top){
				top = temp;
			}
		}
	}
	if(left>=0 && top>=0){
		temp = document.getElementById('marker');
		temp.style.left = left+"px";
		temp.style.top = top+"px";
	}
}

var resizeelm = null;
var resizing = false;
var drawingresize = false;
var lastX,lastY;
var leftmod = 0;
var topmod = 0;

function startsizewin(event,elm){
	event.stopPropagation();
	switch(elm.className){
		default:
			return;
		case 'sides left':
			leftmod = -1;
			topmod = 0;
			break;
		case 'sides right':
			leftmod = 1;
			topmod = 0;
			break;
		case 'ends top':
			leftmod = 0;
			topmod = -1;
			break;
		case 'ends bot':
			leftmod = 0;
			topmod = 1;
			break;
		case 'topleft':
			leftmod = -1;
			topmod = -1;
			break;
		case 'topright':
			leftmod = 1;
			topmod = -1;
			break;
		case 'botleft':
			leftmod = -1;
			topmod = 1;
			break;
		case 'botright':
			leftmod = 1;
			topmod = 1;
			break;
	}
	resizeelm = getWin(elm).winDiv;
	if(resizeelm.style.zIndex < zMax){
		zMax++;
		resizeelm.style.zIndex = zMax;
	}
	togglePointerEvents(false);
	getmousepos(event);
	
	lastX = mousepos.posX;
	lastY = mousepos.posY;
	resizing = true;
}

function stopsizewin(){
	if(!resizing){
		return;
	}
	resizing = false;
	drawingresize = false;
	resetMarker();
	resizeelm = null;
	togglePointerEvents(true);
}

function dosizewin(){
	if(resizeelm == null){
		return;
	}
	if(mousepos.posX <= 0 || mousepos.posY <= 35){
		stopsizewin();
		return;
	}
	var diffX = (mousepos.posX - lastX) * leftmod;
	if(leftmod < 0){
		resizeelm.style.left = resizeelm.offsetLeft - diffX + "px";
	}
	var diffY = (mousepos.posY - lastY) * topmod;
	if(topmod < 0){
		resizeelm.style.top = resizeelm.offsetTop - diffY + "px";
	}
	var sizeX = resizeelm.offsetWidth + diffX;
	var sizeY = resizeelm.offsetHeight + diffY;
	
	lastX = mousepos.posX;
	lastY = mousepos.posY;
	if(sizeX > 50){
		resizeelm.style.width = sizeX + "px";
	}
	if(sizeY > 30){
		resizeelm.style.height = sizeY + "px";
	}
	var wObj = getWin(resizeelm);
	wObj.sizeX = sizeX;
	wObj.sizeY = sizeY;
	drawingresize = false;
}

function openMenu(event,elm,outside){
	if(event){
		event.stopPropagation();
	}
	var win = getWin(elm).winDiv;
	if(win.style.zIndex < zMax){
		zMax++;
		win.style.zIndex = zMax;
	}
	if(typeof(outside) === 'undefined'){
		outside = false;
	}
	var menu = win.getElementsByClassName('menu')[0];
	if(!menu){
		doDebug("menu error - not found");
		return;
	}
	//if we need to show the menu
	if(!outside && (menu.style.display == "none" || menu.style.display == '')){
		menu.style.display = "block";
	}
	else{
		menu.style.display = "none";
	}
}

function reloadWin(elm){
	openMenu(null,elm);
	var frame = getWin(elm).frame;
	frame.contentDocument.location = frame.contentDocument.location;
}

function minWin(event,elm){
	if(event){
		event.stopPropagation();
	}
	var wObj = getWin(elm);
	wObj.maximized = false;
	wObj.minimized = true;
	showHideBorder(wObj);
	wObj.winDiv.style.position = "static";
	wObj.winDiv.style.width = "200px";
	wObj.winDiv.style.height = "auto";
	document.getElementById('minholder').appendChild(wObj.winDiv);
}

function downsizeWin(event,elm){
	if(event){
		event.stopPropagation();
	}
	var wObj = getWin(elm);
	if(wObj.winDiv.parentNode != document.body){
		document.body.appendChild(wObj.winDiv);
		wObj.winDiv.style.position = "";
	}
	wObj.winDiv.style.left = wObj.posLeft + "px";
	wObj.winDiv.style.top = wObj.posTop + "px";
	wObj.winDiv.style.width = wObj.sizeX + "px";
	wObj.winDiv.style.height = wObj.sizeY + "px";
	wObj.maximized = false;
	wObj.minimized = false;
	showHideBorder(wObj);
	resetMarker();
	for(var i=0; i<winObjArr.length; i++){
		if(winObjArr[i].maximized){
			return;
		}
	}
	document.body.style.overflow = "";
}

function maxWin(event,elm){
	if(event){
		event.stopPropagation();
	}
	var wObj = getWin(elm);
	if(wObj.winDiv.parentNode != document.body){
		document.body.appendChild(wObj.winDiv);
		wObj.winDiv.style.position = "";
	}
	document.body.style.overflow = "hidden";
	wObj.winDiv.style.left = "0px";
	wObj.winDiv.style.top = defTopOffset + "px";
	wObj.winDiv.style.width = "100%";
	wObj.maximized = true;
	wObj.minimized = false;
	wObj.sizeMaxWinHeight();
	showHideBorder(wObj);
	if(wObj.winDiv.style.zIndex < zMax){
		wObj.winDiv.style.zIndex = zMax;
		zMax++;
	}
	resetMarker(true);
}

function showHideBorder(wObj){
	var display = "none";
	var control = wObj.winDiv.getElementsByClassName('control')[0];
	//determine which control icons to show
	var list = control.getElementsByTagName('img');
	for(var i=0; i<list.length; i++){
		if(list[i].src.search(getImageSRC('downsize',true)) >= 0){
			if(wObj.minimized || wObj.maximized){
				list[i].style.display = "";
			}
			else{
				list[i].style.display = "none";
			}
		}
		else if(list[i].src.search(getImageSRC('max',true)) >= 0){
			if(!wObj.maximized){
				list[i].style.display = "";
			}
			else{
				list[i].style.display = "none";
			}
		}
		else if(list[i].src.search(getImageSRC('min',true)) >= 0){
			if(!wObj.minimized){
				list[i].style.display = "";
			}
			else{
				list[i].style.display = "none";
			}
		}
	}
	//adjust window styling
	if(!wObj.maximized && !wObj.minimized){
		display = "";
		wObj.winDiv.style['border-radius'] = "";
	}
	else{
		wObj.winDiv.style['border-radius'] = "0px";
	}
	list = wObj.winDiv.getElementsByClassName("content")[0];
	if(!wObj.minimized){
		list.style.display = "";
	}
	else{
		list.style.display = "none";
	}
	//hides sides, top, and bottom
	for(var i=0; i<2; i++){
		if(i == 0){
			list = wObj.winDiv.getElementsByClassName('ends');
		}
		else{
			list = wObj.winDiv.getElementsByClassName('sides');
		}
		for(var v=0; v<list.length; v++){
			list[v].style.display = display;
		}
	}
}

function getImageSRC(name,nopath){
	var imagepath = "images/";
	var file = "";
	switch(name){
		case 'close':file = "close_icon.png";break;
		case 'min':file = "min_icon.png";break;
		case 'menu':file = "menu.png";break;
		case 'downsize':file = "downsize_icon.png";break;
		case 'max':file = "max_icon.png";break;
		default:return "";
	}
	if(typeof(nopath) !== 'undefined' && nopath){
		return file;
	}
	return imagepath+file;
}

function closeWin(event,elm){
	if(event){
		event.stopPropagation();
	}
	var winidx = getWin(elm,true);
	var parent = winObjArr[winidx].winDiv.parentNode;
	delete parent.removeChild(winObjArr[winidx].winDiv);
	winObjArr.splice(winidx,1);
	resetMarker();
}

/******************************************************************/

function windowObject(newWin,newFrame,action){
	this.winDiv = null;
	this.frame = null;
	this.startURL = action;
	this.minimized = false;
	this.maximized = false;
	this.posLeft = 0;
	this.posTop = 0;
	this.sizeX = 500;
	this.sizeY = 500;
	
	this.winDiv = newWin;
	this.frame = newFrame;
	
	/********************/
	
	this.sizeMaxWinHeight = function(){
		this.winDiv.style.height = window.innerHeight - this.winDiv.offsetTop + "px";
	};
}
