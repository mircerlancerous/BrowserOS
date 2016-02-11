<?php

include_once("BrowserOS.class.php");
$BrowserOS = new BrowserOS();

if(array_key_exists("action",$_REQUEST)){
	$BrowserOS->processAction($_REQUEST['action']);
}
$BrowserOS->Close();

?><!DOCTYPE>
<html>
<head>
	<title><?php echo $BrowserOS->getPageTitle();?></title>
	<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
	<meta content="utf-8" http-equiv="encoding">
	<script type="text/javascript" src="BrowserOS.js"></script>
	<link rel="stylesheet" type="text/css" href="<?php echo $BrowserOS->getThemeFile();?>"/>
</head>
<body<?php $BrowserOS->getBodyPropertyString()?>>
	<div id="menubar" oncontextmenu="openContextMenu(event,this);"><?php $BrowserOS->getMenuItemString();?></div>
	<div id="debug"></div>
	<div id="contextmenu" style="display: none;"></div>
	<div id="marker" class="marker">&nbsp;</div>
	<div id="minholder"></div>
	<div id="popupshade"></div>
	<div id="popupholder"></div>
</body>
</html>
