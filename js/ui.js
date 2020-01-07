var optionsMenu = {
	"file": [
		{"name": "new_file", "type": "trigger"},
		{"name": "open_file", "type": "trigger"},
		{"name": "save_file", "type": "trigger"}
	],
	"objects": [
		{"name": "devices", "default": "true", "type": "switch"},
		{"name": "cables", "type": "switch"},
	],
	"program": [
		{"name": "settings", "type": "trigger"},
		{"name": "about", "type": "link"},
		{"name": "help", "type": "link"}
	]
};

function addMenuEntry(menu, entry) {
	var obj = document.getElementById("options-" + menu);
	obj.innerHTML += '<div class="menu-entry"><img width="100%" height="100%" src="img/menu/' + menu + "/" + entry + '.png"></img></div>';
}

function addMenuEntries() {
	for(var key in optionsMenu) {
		var val = optionsMenu[key];
		for(var key2 in val) {
			var val2 = val[key2];
			addMenuEntry(key, val2.name);
		}
	}
}

addMenuEntries();
