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

var currentMovedObject = null;
var currentMovedObjectId = null;

var currentCableMenuLabel = null;
var currentCableObject = null;
var currentCableConnObj = undefined;

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
function cancelCableConnection()
{
	if(currentCableMenuLabel != null)
		currentCableMenuLabel.classList.remove("oo-current");
	currentCableMenuLabel = null;
	currentCableObject = null;
	currentCableConnObj = undefined;
}

function drawCable(ctx, cable) {
	var obj0 = currentMap.objects[cable.ends[0]];
	var obj1 = currentMap.objects[cable.ends[1]];
	ctx.strokeStyle = cable.display.color;
	if(cable.display.cableStyle == "dashed")
	  ctx.setLineDash([4]);
	else
	  ctx.setLineDash([]);
	  
	ctx.beginPath();
	ctx.moveTo(obj0.pos[0] + 25, obj0.pos[1] + 125);
	ctx.lineTo(obj1.pos[0] + 25, obj1.pos[1] + 125);
	ctx.stroke();
}

function redraw() {
  var canvas = document.getElementById("draw-place");
	var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var object of currentMap.objects) {
    if(object.type == "cable") {
      drawCable(ctx, object);
    }
  }
}

function addMenuDeviceListener(entryObject, category, menuEntryN, catObj) {
	var me =  catObj.entries[menuEntryN];
	var sub = me.subObjects;
	if(sub == undefined) {
		//add additional menu hiding when clicked
		entryObject.addEventListener("click", function() {
			if(objectData.menu[category] != undefined)
				hideSubMenu();
		});
		
		//add drag & drop
		if(me.create != undefined) {
			entryObject.addEventListener("mousedown", function(event) {
				cancelCableConnection();
				this.classList.add("om-moving");
			});
			entryObject.addEventListener("mouseup", function() {
				this.classList.remove("om-moving");
			});
			entryObject.addEventListener("mousemove", function() {
				if(this.classList.contains("om-moving")) {
					var newObj = createObjectDiv(me, [event.clientX, event.clientY]);
					var entryInDefs = JSON.parse(JSON.stringify(objectData.objectDefs[me.create[0].name]));
					entryInDefs.pos = [event.clientX, event.clientY - 100];
				  redraw();
					entryInDefs.idx = currentMap.objects.length;
					if(me.create[0].type != undefined && entryInDefs.types[me.create[0].type] != undefined)
					{
						entryInDefs = Object.assign(entryInDefs, entryInDefs.types[me.create[0].type]);
					}
					newObj.idx = entryInDefs.idx;
					
					// create object on map
					currentMap.objects.push(entryInDefs);
					
					if(newObj != null) {
						newObj.addEventListener("mousedown", function(event) {
							startMovingObject(this, entryInDefs.idx);
						});
						newObj.addEventListener("mouseup", function(event) {
							stopMovingObject();
						});
						newObj.addEventListener("mousemove", function(event) {
							if(currentMovedObject != null) {
								cancelCableConnection();
								redraw();
							}
						});
						newObj.addEventListener("click", function() {
							// try connect by cable
							if(currentCableObject != null) {
								if(currentCableConnObj == undefined) {
									// check if interface valid
									currentCableConnObj = this.idx;
								} else {
									// check if not connecting to self
									if(currentCableConnObj == this.idx) {
										alert("Couldn't make connection - cannot connect to self");
										cancelCableConnection();
										return;
									}
									// check if interface valid
									var cableEntryDefs = JSON.parse(JSON.stringify(objectData.objectDefs[currentCableObject.id]));
									cableEntryDefs.ends = [currentCableConnObj, this.idx];
									
									// update connection count for each object
									var obj0 = currentMap.objects[cableEntryDefs.ends[0]];
									var obj0iface = obj0.interfaces[cableEntryDefs.interfaces[0]];
									if(obj0iface == undefined) obj0iface = obj0.interfaces["*"];
									var obj1 = currentMap.objects[cableEntryDefs.ends[1]];
									var obj1iface = obj1.interfaces[cableEntryDefs.interfaces[1]];
									if(obj1iface == undefined) obj1iface = obj1.interfaces["*"];
									
									// abort connecting if interfaces not found
									if(obj0iface == undefined || 
									obj1iface == undefined) {
										alert("Couldn't make connection - not matching interfaces");
										cancelCableConnection();
										return;
									}
									
									// check port count in interfaces
									if(obj0iface.count + 1 > obj0iface.ios) {
										alert("Couldn't make connection - too few ports in interface (max=" + obj0iface.ios + ", iface=" + obj0iface.type + ")");
										cancelCableConnection();
										return;
									}
									if(obj1iface.count + 1 > obj1iface.ios) {
										alert("Couldn't make connection - too few ports in interface (max=" + obj1iface.ios + ", iface=" + obj1iface.type + ")");
										cancelCableConnection();
										return;
									}
									
									// change count
									if(obj0iface.count == undefined)
										obj0iface.count = 1;
									else
										obj0iface.count++;
									
									if(obj1iface.count == undefined)
										obj1iface.count = 1;
									else 
										obj1iface.count++;
									
									// add cable
									currentMap.objects.push(cableEntryDefs);
									redraw();
									currentCableConnObj = undefined; //not cancelling fully to enable connecting a few devices without clicking cable icon every time
								}
							}
						});
						startMovingObject(newObj, entryInDefs.idx);
						document.getElementById("edit-place").appendChild(newObj);
					}
				}
				this.classList.remove("om-moving");
			});
		}
	} else {
		//add display additional menu
		entryObject.addEventListener("click", function() {
			cancelCableConnection();
			var curr = document.getElementById("oms-" + menuEntryN);
			if(currentSubObjectMenu == curr) {
				hideSubMenu();
			} else {
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
	var me =  catObj.entries[menuEntryN];
	entryObject.addEventListener("click", function() {
		if(currentCableMenuLabel == this) {
			cancelCableConnection();
			return;
		}
		cancelCableConnection();
		currentCableMenuLabel = this;
		currentCableMenuLabel.classList.add("oo-current");
		currentCableObject = objectData.objectDefs[me.create[0].name];
	});
}
function startMovingObject(obj, id) {
	obj.classList.add("oo-moving");
	currentMovedObject = obj;
	currentMovedObjectId = id;
}
function stopMovingObject() {
	if(currentMovedObject != null) {
		currentMovedObject.classList.remove("oo-moving");
		currentMovedObject = null;
		currentMovedObjectId = null;
	}
}
function createObjectDiv(objectMenuEntry, position) {
	if(objectMenuEntry.create == undefined)
		return null;
	var objid = objectMenuEntry.create[0].name;
	var pos = objectMenuEntry.create[0].pos;
	var type = objectMenuEntry.create[0].type;
	
	var entryInDefs = objectData.objectDefs[objid];
	
	var texture = entryInDefs.texture;
	
	var objTypes = entryInDefs.types;
	if(objTypes != undefined) {
		var ot = objTypes[type];
		if(ot != undefined) {
			var p1 = objTypes[type].texture; if(p1 != undefined) texture = p1;
		}
	}
	
	var div = document.createElement("div");
	div.classList = ["ov-obj"];
	div.unselectable = "on";
	div.style.left = (pos[0] + position[0] - 25) + "px";
	div.style.top = (pos[1] + position[1] - 125) + "px";
	div.innerHTML += '<img draggable="false" width="100%" height="100%" src="img/' + texture + '.png"></img>';
	return div;
}
function addMenuEntryToMenu(menuId, entryImage, label) {
	if(label == undefined)
		label = " ";
	label = label.substring(0, 1).toUpperCase() + label.substring(1);
	label = label.replace(/_/g, " ");
	var obj = document.getElementById(menuId);
	var menuEntryObj = document.createElement("div");
	menuEntryObj.classList = ["menu-entry"];
	menuEntryObj.innerHTML += '<img draggable="false" width="100%" height="100%" src="img/' + entryImage + '" title="' + label + '"></img>';
	menuEntryObj.unselectable = "on";
	if(obj != undefined)
		obj.appendChild(menuEntryObj);
	return menuEntryObj;
}
function addMenuEntry(menu, entry, prefix="options-") {
	return addMenuEntryToMenu(prefix + menu, 'menu/' + menu + "/" + entry + '.png', entry);
}

//objectMenu - menu to be displayed, objectLabel - menu entry to be highlighted
function showMenu(objectMenu, objectLabel) {
	objectMenu.style.display = "block";
	objectMenu.classList.add("om-current");
	objectLabel.classList.add("oo-current");
}
function hideMenu(objectMenu, objectLabel) {
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

function addEvents() {
	// Register drag&drop event to editor
	document.getElementById("editor").addEventListener("mousemove", function(event) {
		if(currentMovedObject != null && currentMovedObject.classList.contains("oo-moving")) {
			currentMovedObject.style.left = (event.clientX - 25) + "px";
			currentMovedObject.style.top = (event.clientY - 125) + "px";
			
			// update map position
			var obj = currentMap.objects[currentMovedObjectId];
			obj.pos = [event.clientX - 25, event.clientY - 125];
		}
	});
	document.getElementById("editor").addEventListener("mouseup", function(event) {
		stopMovingObject();
	});
	
	// Update canvas size
	var drawPlace = document.getElementById("draw-place");
	drawPlace.width = window.innerWidth;
	drawPlace.height = window.innerHeight;
	
	document.body.onresize = function(event) {
		drawPlace.width = event.target.innerWidth;
		drawPlace.height = event.target.innerHeight;
		redraw();
	};
}

load();
addMenuEntries();
updateUI();
addEvents();

