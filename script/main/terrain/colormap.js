const mergeColormapWith = function(who, what) {
	for (let i = 1; i < arguments.length; i++) {
		for (let element in arguments[i]) {
			if (!who.hasOwnProperty(element)) {
				who[element] = arguments[i][element];
				continue;
			}
			for (let c = 0; c < arguments[i][element].length; c++) {
				if (arguments[i][element][c] == null) {
					continue;
				}
				who[element][c] = arguments[i][element][c];
			}
		}
	}
};

let colormapRaw = (function() {
	let proto = JSON.parse(readFileText(__dir__ + "assets/colormap_innercore.json"));
	let vanilla = JSON.parse(readFileText(__dir__ + "assets/colormap_vanilla.json"));
	let chemistry = JSON.parse(readFileText(__dir__ + "assets/colormap_chemistry.json"));
	mergeColormapWith(proto, vanilla, chemistry);
	if (minecraftVersion >= 16) {
		let vanilla14 = JSON.parse(readFileText(__dir__ + "assets/colormap_vanilla_14.json"));
		let vanilla16 = JSON.parse(readFileText(__dir__ + "assets/colormap_vanilla_16.json"));
		mergeColormapWith(proto, vanilla14, vanilla16);
	}
	return proto;
})();

let colormap = (function(what) {
	if (isHorizon) {
		for (let element in VanillaBlockID) {
			if (colormapRaw.hasOwnProperty(element)) {
				what[VanillaBlockID[element]] = colormapRaw[element];
				continue;
			}
			Logger.Log("Minimap: not found color for vanilla block " + element, "INFO");
		}
	}
	return what;
})({});

Minimap.setColor = function(who, color) {
	if (typeof who == "string") {
		if (isHorizon) {
			if (VanillaBlockID.hasOwnProperty(who)) {
				who = VanillaBlockID[who];
			}
		}
		if (typeof who == "string") {
			if (BlockID.hasOwnProperty(who)) {
				who = BlockID[who];
			} else {
				Logger.Log("Minimap: not found block id " + who + ", default color will be used otherwise", "INFO");
				return;
			}
		}
	}
	if (!Array.isArray(color)) {
		color = [color];
	}
	colormap[who] = color.map(function(what, index) {
		let who = parseInt(what);
		if (who == NaN) {
			return (colormap[who] ? colormap[who][index] ?
				colormap[who][index] : colormap[who][0] : 0) || 0;
		}
		return who;
	});
};

Minimap.mergeColormap = function(what) {
	if (what == null || typeof what != "object") {
		return;
	}
	for (let element in colormap) {
		Minimap.setColor(element, colormap[element]);
	}
};

Callback.addCallback("BlocksDefined", function() {
	for (let element in BlockID) {
		if (colormapRaw.hasOwnProperty(element)) {
			colormap[BlockID[element]] = colormapRaw[element];
			continue;
		}
		Logger.Log("Minimap: not found color for block " + element, "DEBUG");
	}
});

const Colors = {
	BLACK: android.graphics.Color.BLACK,
	WHITE: android.graphics.Color.WHITE,
	GRAY: android.graphics.Color.GRAY,
	LTGRAY: android.graphics.Color.LTGRAY,
	PRIMARY: android.graphics.Color.parseColor("#4151b0"),
	ACCENT: android.graphics.Color.parseColor("#2895f0")
};
