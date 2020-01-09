var optionsMenu = {
	"file": [
		{"name": "new_file", "type": "trigger"},
		{"name": "open_file", "type": "trigger"},
		{"name": "save_file", "type": "trigger"}
	],
	"objects": [
		{"name": "devices", "default": "true", "type": "switch"},
		{"name": "cables", "type": "switch", "eventType": "doubleplace"},
	],
	"program": [
		{"name": "settings", "type": "trigger"},
		{"name": "about", "type": "link", "href": "about.php"},
		{"name": "help", "type": "link", "href": "help.php"}
	]
};
var currentObjectMenu = null;
var currentSubObjectMenu = null;
var currentSubObjectLabel = null;

function hideSubMenu() {
	if(currentSubObjectMenu != null)
		hideMenu(currentSubObjectMenu, currentSubObjectLabel);
	document.getElementById("submenus").style.display = "none";
	currentSubObjectMenu = null;
	currentSubObjectLabel = null;
}
function addMenuSwitchListener(entryObject, menuName) {
	entryObject.addEventListener("click", function() {
		currentObjectMenu = menuName;
		displayCurrentObjectMenu();
		hideSubMenu();
	});
}
function addMenuTriggerListener(entryObject, trigger) {
	entryObject.addEventListener("click", trigger);
}
function addMenuDeviceListener(entryObject, category, menuEntryN, catObj) {
	var me =  catObj.entries[menuEntryN];
	var sub = me.subObjects;
	if(sub == undefined)
	{
		//add drag & drop
		entryObject.addEventListener("click", function() {
			if(objectData.menu[category] != undefined)
				hideSubMenu();
		});
	}
	else
	{
		//add display additional menu
		entryObject.addEventListener("click", function() {
			var curr = document.getElementById("oms-" + menuEntryN);
			if(currentSubObjectMenu == curr)
			{
				hideSubMenu();
			}
			else
			{
				if(currentSubObjectMenu != null)
					hideMenu(currentSubObjectMenu, currentSubObjectLabel);
				document.getElementById("submenus").style.display = "block";
				currentSubObjectMenu = curr;
				currentSubObjectLabel = this;
				showMenu(currentSubObjectMenu, currentSubObjectLabel);
			}
		});
	}
}
function addMenuCableListener(entryObject, category, menuEntryN, catObj) {
	//...
}
function addMenuEntryToMenu(menuId, entryImage, label) {
	if(label == undefined)
		label = " ";
	label = label.substring(0, 1).toUpperCase() + label.substring(1);
	label = label.replace(/_/g, " ");
	var obj = document.getElementById(menuId);
	var menuEntryObj = document.createElement("div");
	menuEntryObj.classList = ["menu-entry"];
	menuEntryObj.innerHTML += '<img width="100%" height="100%" src="img/' + entryImage + '" title="' + label + '"></img>';
	obj.appendChild(menuEntryObj);
	return menuEntryObj;
}
function addMenuEntry(menu, entry, prefix="options-") {
	return addMenuEntryToMenu(prefix + menu, 'menu/' + menu + "/" + entry + '.png', entry);
}

//objectMenu - menu to be displayed, objectLabel - menu entry to be highlighted
function showMenu(objectMenu, objectLabel)
{
	objectMenu.style.display = "block";
	objectMenu.classList.add("om-current");
	objectLabel.classList.add("oo-current");
}
function hideMenu(objectMenu, objectLabel)
{
	objectMenu.style.display = "none";
	objectMenu.classList.remove("om-current");
	objectLabel.classList.remove("oo-current");
}
function displayCurrentObjectMenu() {
	//highlight switch
	for(var menuId in optionsMenu.objects) {
		var menuName = optionsMenu.objects[menuId].name;
		var objectMenu = document.getElementById("om-" + menuName);
		var objectLabel = document.getElementById("options-objects").children[menuId];
		
		if(menuName == currentObjectMenu) {
			showMenu(objectMenu, objectLabel);
		}
		else {
			hideMenu(objectMenu, objectLabel);
		}
	}
}
function addObjectToMenu(category, devindex, devlist, catObj, prefix = "om-", classes = "", textureCategory=category) {
	var dldi = devlist[devindex];
	var debug = dldi.debug;
	var name = dldi.name;
	var texture = dldi.texture;
	var eventType = objectData.menu[textureCategory].eventType;
	
	if(texture == undefined) 
		texture = "objects/" + textureCategory + "/" + devindex;
		
	var obj = addMenuEntryToMenu(prefix + category, texture + ".png", name);
	if(debug)
		obj.classList.add("oo-debug");
	if(eventType == "dragdrop")
		addMenuDeviceListener(obj, category, devindex, catObj);
	else if(eventType == "doubleplace")
		addMenuCableListener(obj, category, devindex, catObj);
	
	var subObjects = dldi.subObjects;
	
	if(subObjects != undefined) {
		var objectMenu = document.getElementById("submenus");
		objectMenu.innerHTML += '<div class="obj-menu "' + classes + ' id="oms-' + name + '"></div>';
		for(var dev in subObjects.entries) {
			addObjectToMenu(devindex, dev, subObjects.entries, subObjects, "oms-", "om-submenu", textureCategory);
		}
	}
}
function addMenuEntries() {
//
	for(var key in optionsMenu) {
		var val = optionsMenu[key];
		
		for(var key2 in val) {
			var val2 = val[key2];
			var obj = addMenuEntry(key, val2.name);
			
			if(key == "objects") {
				addMenuSwitchListener(obj, val2.name);
				var objectMenu = document.getElementById("object-menu");
				objectMenu.innerHTML += '<div class="obj-menu" id="om-' + val2.name + '"></div>';
				
				if(val2.default) {
					currentObjectMenu = val2.name;
				}
			} else {
				addMenuTriggerListener(obj);
			}
		}
	}
	// Create object entries (drag & drop)
	for(var cat in objectData.menu) {
		var devlist = objectData.menu[cat].entries;
		var eventType = objectData.menu[cat].eventType;
		
		for(var dev in devlist) {
			addObjectToMenu(cat, dev, devlist, objectData.menu[cat]);
		}
	}
}

function updateUI() {
	displayCurrentObjectMenu();
	hideSubMenu();
}

load();
addMenuEntries();
updateUI();
