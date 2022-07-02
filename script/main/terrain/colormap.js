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
	let proto = JSON.parse(load(__dir__ + "assets/", "colormap_innercore.json"));
	let vanilla = JSON.parse(load(__dir__ + "assets/", "colormap_vanilla.json"));
	let chemistry = JSON.parse(load(__dir__ + "assets/", "colormap_chemistry.json"));
	mergeColormapWith(proto, vanilla, chemistry);
	if (minecraftVersion >= 16) {
		let vanilla14 = JSON.parse(load(__dir__ + "assets/", "colormap_vanilla_14.json"));
		let vanilla16 = JSON.parse(load(__dir__ + "assets/", "colormap_vanilla_16.json"));
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

Callback.addCallback("BlocksDefined", function() {
	for (let element in BlockID) {
		if (colormapRaw.hasOwnProperty(element)) {
			colormap[BlockID[element]] = colormapRaw[element];
			continue;
		}
		Logger.Log("Minimap: not found color for block " + element, "DEBUG");
	}
});
