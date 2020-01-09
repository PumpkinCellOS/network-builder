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

var objectData = null;

function load()
{
	var objectsFile = loadFileServer("data/objects.json");
	//document.getElementById("editor").innerHTML = objects;
	objectData = JSON.parse(objectsFile);
	var menu = objectData.menu;
}
