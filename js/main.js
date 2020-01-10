function loadFileServer(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if(xmlhttp.status == 200) {
		result = xmlhttp.responseText;
	}
	return result;
}

// Global object data loaded from objects.json.
var objectData = null;

// 'Root' map
var defaultMap = {"objects": []};

// Map that is currently displayed in editor
var currentMap = defaultMap;

function load() {
	var objectsFile = loadFileServer("data/objects.json");
	//document.getElementById("editor").innerHTML = objects;
	objectData = JSON.parse(objectsFile);
	var menu = objectData.menu;
}

document.body.onselectstart = function(e) { if (e.target.nodeName != "INPUT" && e.target.nodeName != "TEXTAREA") { e.preventDefault(); return false; } return true; }