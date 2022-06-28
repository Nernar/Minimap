const getProtoString = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return source.getString(name);
	}
	return proto.getString(name);
};

const getProtoNumber = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return source.getNumber(name);
	}
	return proto.getNumber(name);
};

const getProtoBool = function(proto, source, name) {
	if (source && source.get(name) != null) {
		return source.getBool(name);
	}
	return proto.getBool(name);
};

const reloadSettings = function(source) {
	if (source === undefined) {
		source = __config__;
	}
	settings = {
		mapType: getProtoNumber(protoConfig, source, "runtime.type"),
		mapZoom: getProtoNumber(protoConfig, source, "runtime.zoom"),
		mapAlpha: getProtoNumber(protoConfig, source, "runtime.translucent"),
		mapRotation: getProtoBool(protoConfig, source, "runtime.rotation"),
		indicatorPassive: getProtoBool(protoConfig, source, "indicator.passive"),
		indicatorHostile: getProtoBool(protoConfig, source, "indicator.hostile"),
		indicatorLocal: getProtoBool(protoConfig, source, "indicator.local"),
		indicatorPlayer: getProtoBool(protoConfig, source, "indicator.player"),
		indicatorTile: getProtoBool(protoConfig, source, "indicator.tile"),
		indicatorOnlySurface: getProtoBool(protoConfig, source, "indicator.only_surface"),
		locationRawSize: getProtoNumber(protoConfig, source, "location.raw_size"),
		locationRawPosition: getProtoNumber(protoConfig, source, "location.raw_position"),
		locationGravity: getProtoNumber(protoConfig, source, "location.gravity"),
		locationOffset: getProtoNumber(protoConfig, source, "location.offset"),
		stylesheetBorder: getProtoNumber(protoConfig, source, "stylesheet.border"),
		stylesheetPointer: getProtoNumber(protoConfig, source, "stylesheet.pointer"),
		stylesheetShape: getProtoNumber(protoConfig, source, "stylesheet.shape"),
		mapLocation: getProtoBool(protoConfig, source, "development.location"),
		mapZoomButton: getProtoBool(protoConfig, source, "development.zoom_button"),
		developmentVisualize: getProtoBool(protoConfig, source, "development.show_process"),
		checkNewestVersion: getProtoBool(protoConfig, source, "development.check_newest_version"),
		radius: getProtoNumber(protoConfig, source, "performance.radius"),
		priority: getProtoNumber(protoConfig, source, "performance.priority"),
		delay: getProtoNumber(protoConfig, source, "performance.delay"),
		thread: getProtoNumber(protoConfig, source, "performance.thread")
	};
	settings.locationSize = settings.locationRawSize / 100 * getDisplayHeight();
};

(function() {
	protoConfig = new Config(__dir__ + "config.proto.json");
	if (protoConfig.getNumber("version") != curVersion) {
		let file = new java.io.File(__dir__ + "config.proto.json");
		if (file.exists()) {
			file.delete();
			protoConfig = new Config(file);
		}
		protoConfig.set("version", curVersion);
	}
	protoConfig.checkAndRestore(JSON.stringify({
		runtime: {
			type: 0,
			zoom: 85,
			translucent: 70,
			rotation: false
		},
		indicator: {
			passive: true,
			hostile: true,
			local: true,
			player: true,
			tile: false,
			only_surface: true
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
			shape: 1
		},
		performance: {
			radius: checkRenderDistance(),
			priority: 1,
			delay: 15,
			thread: 2
		},
		development: {
			location: false,
			zoom_button: false,
			show_process: false,
			check_newest_version: true
		}
	}));
	reloadSettings();
})();

const restoreSettings = function(notifyEverything) {
	reloadSettings(protoConfig);
	if (notifyEverything) {
		for (let element in settings) {
			settingsChanged(element);
		}
	}
	saveSettings();
};
