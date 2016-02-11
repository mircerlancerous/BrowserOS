<?php
class BrowserOS{
	private $config;
	private $configPath = "BrowserOSConfig.dat";
	
	public function BrowserOS(){
		if(!$this->LoadPersonalConfig()){
			$this->config = new BrowserOSConfig();
		}
	}
	
	public function Close(){
		$this->savePersonalConfig();
	}
	
	private function savePersonalConfig(){
		file_put_contents($this->configPath,serialize($this->config));
	}
	
	private function LoadPersonalConfig(){
		if(!file_exists($this->configPath)){
			return FALSE;
		}
		$this->config = unserialize(file_get_contents($this->configPath));
		return TRUE;
	}
	
	public function getPageTitle(){
		return $this->config->pageTitle;
	}
	
	public function getThemeFile(){
		return $this->config->themeFile;
	}
	
	public function getBodyPropertyString(){
		//style
		echo ' style="';
			if($this->config->allowScrolling){
				
			}
			if($this->config->backGroundImage){
				
			}
		echo '"';
		//javascript
		if($this->config->allowScrolling){
			echo ' onscroll=""';
		}
	}
	
	public function getMenuItemString(){
		if(!$this->config->menuItems){
			return "";
		}
		foreach($this->config->menuItems as $i => $miObj){
			echo "<div id=\"mi$i\" oncontextmenu=\"openContextMenu(event,this);\" onclick=\"menuBtnClick('".$miObj->url."');\">".$miObj->label."</div>";
		}
	}
	
	public function processAction($action){
		switch($action){
			case 'addMenuItem':
				$this->addMenuItem($_REQUEST['url'],$_REQUEST['label']);
				break;
			case 'removeMenuItem':
				$this->removeMenuItem($_REQUEST['url'],$_REQUEST['label']);
				break;
			case 'editMenuItem':
				$this->editMenuItem($_REQUEST['url'],$_REQUEST['label'],$_REQUEST['newurl'],$_REQUEST['newlabel']);
				break;
			default:echo "false";break;
		}
		$this->Close();
		exit;
	}
	
	public function addMenuItem($url,$label){
		//check if item already exists first
		$idx = $this->MenuItemIndexOf($url,$label);
		if($idx !== FALSE){
			return FALSE;
		}
		$this->config->menuItems[] = new BrowserOSMenuItem($url,$label);
		return TRUE;
	}
	
	public function removeMenuItem($url,$label){
		$idx = $this->MenuItemIndexOf($url,$label);
		if($idx !== FALSE){
			unset($this->config->menuItems[$idx]);
			$this->config->menuItems = array_values($this->config->menuItems);
			return TRUE;
		}
		return FALSE;
	}
	
	public function editMenuItem($url,$label,$newurl,$newlabel){
		$idx = $this->MenuItemIndexOf($url,$label);
		if($idx === FALSE){
			return FALSE;
		}
		$this->config->menuItems[$idx] = new BrowserOSMenuItem($newurl,$newlabel);
		return TRUE;
	}
	
	private function MenuItemIndexOf($url,$label){
		if($this->config->menuItems){
			foreach($this->config->menuItems as $i => $miObj){
				if($miObj->label == $label && $miObj->url == $url){
					return $i;
				}
			}
		}
		return FALSE;
	}
}

class BrowserOSConfig extends BrowserOS{
	protected $pageTitle = "BrowserOS";
	protected $backGroundImage = "";
	protected $allowScrolling = TRUE;
	protected $themeFile = "BrowserOS.css";
	protected $menuItems = array();
	
	public function BrowserGUIConfig(){
		$this->menuItems[] = new BrowserOSMenuItem("TestFile.htm","Open TestFile");
	}
}

class BrowserOSMenuItem extends BrowserOS{
	protected $label = "";
	protected $url = "";
	public function BrowserOSMenuItem($url,$label){
		$this->url = $url;
		$this->label = $label;
	}
}
?>
