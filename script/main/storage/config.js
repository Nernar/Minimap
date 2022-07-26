const getProtoString = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return "" + source.getString(name);
	}
	return "" + proto.getString(name);
};

const getProtoNumber = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return source.getNumber(name) - 0;
	}
	return proto.getNumber(name) - 0;
};

const getProtoBool = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return !!source.getBool(name);
	}
	return !!proto.getBool(name);
};

const setConfigOptionIfNeeded = function(proto, name, value) {
	if (value === undefined || value === null) {
		return false;
	}
	let current = __config__.get(name);
	if (current != null || (current == null && value != proto.get(name))) {
		return !!__config__.set(name, value);
	}
	return false;
};

const protoConfig = (function() {
	let config = new Config(__dir__ + "config.proto.json");
	if (config.getNumber("version") < REVISION) {
		let file = new java.io.File(__dir__ + "config.proto.json");
		if (file.exists()) {
			file.delete();
			config = new Config(file);
		}
		config.set("version", REVISION);
	}
	config.checkAndRestore(JSON.stringify({
		runtime: {
			type: 1,
			surface: 1,
			smoothing: 3,
			zoom: 85,
			translucent: 80,
			rotation: false
		},
		indicator: {
			passive: true,
			hostile: true,
			local: true,
			player: true,
			tile: false,
			waypoint: false,
			only_surface: true
		},
		location: {
			x: 0,
			y: 5,
			size: 35,
			gravity: 2
		},
		stylesheet: {
			border: 0,
			pointer: 3,
			local_pointer: 2,
			shape: 1,
			explore: 0,
			vanilla_colormap: false
		},
		performance: {
			radius: checkRenderDistance(),
			priority: 0,
			delay: 20,
			thread: 1,
			export_density: 4
		},
		development: {
			location: false,
			show_process: false
		}
	}));
	return config;
})();

let settings = {};

Minimap.loadConfig = function(source) {
	if (source === undefined) {
		source = __config__;
	}
	settings = {
		mapType: getProtoNumber(protoConfig, source, "runtime.type"),
		mapSurface: getProtoNumber(protoConfig, source, "runtime.surface"),
		mapSmoothing: getProtoNumber(protoConfig, source, "runtime.smoothing"),
		mapZoom: getProtoNumber(protoConfig, source, "runtime.zoom"),
		mapAlpha: getProtoNumber(protoConfig, source, "runtime.translucent"),
		mapRotation: getProtoBool(protoConfig, source, "runtime.rotation"),
		indicatorPassive: getProtoBool(protoConfig, source, "indicator.passive"),
		indicatorHostile: getProtoBool(protoConfig, source, "indicator.hostile"),
		indicatorLocal: getProtoBool(protoConfig, source, "indicator.local"),
		indicatorPlayer: getProtoBool(protoConfig, source, "indicator.player"),
		indicatorTile: getProtoBool(protoConfig, source, "indicator.tile"),
		indicatorWaypoint: getProtoBool(protoConfig, source, "indicator.waypoint"),
		indicatorOnlySurface: getProtoBool(protoConfig, source, "indicator.only_surface"),
		locationX: getProtoNumber(protoConfig, source, "location.x"),
		locationY: getProtoNumber(protoConfig, source, "location.y"),
		locationSize: getProtoNumber(protoConfig, source, "location.size"),
		locationGravity: getProtoNumber(protoConfig, source, "location.gravity"),
		stylesheetBorder: getProtoNumber(protoConfig, source, "stylesheet.border"),
		stylesheetPointer: getProtoNumber(protoConfig, source, "stylesheet.pointer"),
		stylesheetLocalPointer: getProtoNumber(protoConfig, source, "stylesheet.local_pointer"),
		stylesheetShape: getProtoNumber(protoConfig, source, "stylesheet.shape"),
		stylesheetExplore: getProtoBool(protoConfig, source, "stylesheet.explore"),
		stylesheetVanillaColormap: getProtoBool(protoConfig, source, "stylesheet.vanilla_colormap"),
		mapLocation: getProtoBool(protoConfig, source, "development.location"),
		debug: getProtoBool(protoConfig, source, "development.show_process"),
		radius: getProtoNumber(protoConfig, source, "performance.radius"),
		priority: getProtoNumber(protoConfig, source, "performance.priority"),
		delay: getProtoNumber(protoConfig, source, "performance.delay"),
		thread: getProtoNumber(protoConfig, source, "performance.thread"),
		exportDensity: getProtoNumber(protoConfig, source, "performance.export_density")
	};
	settings.locationRawSize = getDisplayPercentHeight(settings.locationSize);
};

try {
	Minimap.loadConfig();
} catch (e) {
	reportError(e);
}

Minimap.saveConfig = function() {
	setConfigOptionIfNeeded(protoConfig, "runtime.type", settings.mapType);
	setConfigOptionIfNeeded(protoConfig, "runtime.surface", settings.mapSurface);
	setConfigOptionIfNeeded(protoConfig, "runtime.smoothing", settings.mapSmoothing);
	setConfigOptionIfNeeded(protoConfig, "runtime.zoom", settings.mapZoom);
	setConfigOptionIfNeeded(protoConfig, "runtime.translucent", settings.mapAlpha);
	setConfigOptionIfNeeded(protoConfig, "runtime.rotation", settings.mapRotation);
	setConfigOptionIfNeeded(protoConfig, "indicator.passive", settings.indicatorPassive);
	setConfigOptionIfNeeded(protoConfig, "indicator.hostile", settings.indicatorHostile);
	setConfigOptionIfNeeded(protoConfig, "indicator.local", settings.indicatorLocal);
	setConfigOptionIfNeeded(protoConfig, "indicator.player", settings.indicatorPlayer);
	setConfigOptionIfNeeded(protoConfig, "indicator.tile", settings.indicatorTile);
	setConfigOptionIfNeeded(protoConfig, "indicator.waypoint", settings.indicatorTile);
	setConfigOptionIfNeeded(protoConfig, "indicator.only_surface", settings.indicatorOnlySurface);
	setConfigOptionIfNeeded(protoConfig, "location.x", settings.locationX);
	setConfigOptionIfNeeded(protoConfig, "location.y", settings.locationY);
	setConfigOptionIfNeeded(protoConfig, "location.size", settings.locationSize);
	setConfigOptionIfNeeded(protoConfig, "location.gravity", settings.locationGravity);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.border", settings.stylesheetBorder);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.pointer", settings.stylesheetPointer);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.local_pointer", settings.stylesheetLocalPointer);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.shape", settings.stylesheetShape);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.explore", settings.stylesheetExplore);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.vanilla_colormap", settings.stylesheetVanillaColormap);
	setConfigOptionIfNeeded(protoConfig, "development.location", settings.mapLocation);
	setConfigOptionIfNeeded(protoConfig, "development.show_process", settings.debug);
	setConfigOptionIfNeeded(protoConfig, "performance.radius", settings.radius);
	setConfigOptionIfNeeded(protoConfig, "performance.priority", settings.priority);
	setConfigOptionIfNeeded(protoConfig, "performance.delay", settings.delay);
	setConfigOptionIfNeeded(protoConfig, "performance.thread", settings.thread);
	setConfigOptionIfNeeded(protoConfig, "performance.export_density", settings.exportDensity);
	__config__.save();
};

const restoreConfigDirectly = function(notifyEverything) {
	Minimap.loadConfig(protoConfig);
	if (notifyEverything) {
		for (let element in settings) {
			settingsChanged(element);
		}
	}
	Minimap.saveConfig();
};
