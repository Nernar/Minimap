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
			waypoint: true,
			only_surface: false
		},
		location: {
			raw_size: 40,
			raw_position: 2,
			gravity: 53,
			offset: 40 * getDisplayDensity()
		},
		stylesheet: {
			border: 0,
			pointer: 3,
			local_pointer: 2,
			shape: 1
		},
		performance: {
			radius: checkRenderDistance(),
			priority: 0,
			delay: 20,
			thread: 1
		},
		development: {
			location: false,
			show_process: false
		}
	}));
	return config;
})();

let settings = {};

const reloadSettings = function(source) {
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
		locationRawSize: getProtoNumber(protoConfig, source, "location.raw_size"),
		locationRawPosition: getProtoNumber(protoConfig, source, "location.raw_position"),
		locationGravity: getProtoNumber(protoConfig, source, "location.gravity"),
		locationOffset: getProtoNumber(protoConfig, source, "location.offset"),
		stylesheetBorder: getProtoNumber(protoConfig, source, "stylesheet.border"),
		stylesheetPointer: getProtoNumber(protoConfig, source, "stylesheet.pointer"),
		stylesheetLocalPointer: getProtoNumber(protoConfig, source, "stylesheet.local_pointer"),
		stylesheetShape: getProtoNumber(protoConfig, source, "stylesheet.shape"),
		mapLocation: getProtoBool(protoConfig, source, "development.location"),
		debug: getProtoBool(protoConfig, source, "development.show_process"),
		radius: getProtoNumber(protoConfig, source, "performance.radius"),
		priority: getProtoNumber(protoConfig, source, "performance.priority"),
		delay: getProtoNumber(protoConfig, source, "performance.delay"),
		thread: getProtoNumber(protoConfig, source, "performance.thread")
	};
	settings.locationSize = settings.locationRawSize / 100 * getDisplayHeight();
};


try {
	reloadSettings();
} catch (e) {
	reportError(e);
}

const saveSettings = function() {
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
	setConfigOptionIfNeeded(protoConfig, "location.raw_size", settings.locationRawSize);
	setConfigOptionIfNeeded(protoConfig, "location.raw_position", settings.locationRawPosition);
	setConfigOptionIfNeeded(protoConfig, "location.gravity", settings.locationGravity);
	setConfigOptionIfNeeded(protoConfig, "location.offset", settings.locationOffset);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.border", settings.stylesheetBorder);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.pointer", settings.stylesheetPointer);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.local_pointer", settings.stylesheetLocalPointer);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.shape", settings.stylesheetShape);
	setConfigOptionIfNeeded(protoConfig, "development.location", settings.mapLocation);
	setConfigOptionIfNeeded(protoConfig, "development.show_process", settings.debug);
	setConfigOptionIfNeeded(protoConfig, "performance.radius", settings.radius);
	setConfigOptionIfNeeded(protoConfig, "performance.priority", settings.priority);
	setConfigOptionIfNeeded(protoConfig, "performance.delay", settings.delay);
	setConfigOptionIfNeeded(protoConfig, "performance.thread", settings.thread);
	__config__.save();
};

const restoreSettings = function(notifyEverything) {
	reloadSettings(protoConfig);
	if (notifyEverything) {
		for (let element in settings) {
			settingsChanged(element);
		}
	}
	saveSettings();
};
