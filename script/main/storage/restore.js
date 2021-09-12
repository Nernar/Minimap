const restoreSettings = function() {
	settings = {
		mapType: protoConfig.getNumber("runtime.type"),
		mapZoom: protoConfig.getNumber("runtime.zoom"),
		mapAlpha: protoConfig.getNumber("runtime.translucent"),
		mapRotation: protoConfig.getBool("runtime.rotation"),
		indicatorPassive: protoConfig.getBool("indicator.passive"),
		indicatorHostile: protoConfig.getBool("indicator.hostile"),
		indicatorLocal: protoConfig.getBool("indicator.local"),
		indicatorPlayer: protoConfig.getBool("indicator.player"),
		indicatorTile: protoConfig.getBool("indicator.tile"),
		indicatorOnlySurface: protoConfig.getBool("indicator.only_surface"),
		locationRawSize: protoConfig.getNumber("location.raw_size"),
		locationRawPosition: protoConfig.getNumber("location.raw_position"),
		locationGravity: protoConfig.getNumber("location.gravity"),
		locationOffset: protoConfig.getNumber("location.offset"),
		stylesheetBorder: protoConfig.getNumber("stylesheet.border"),
		stylesheetPointer: protoConfig.getNumber("stylesheet.pointer"),
		stylesheetShape: protoConfig.getNumber("stylesheet.shape"),
		mapLocation: protoConfig.getBool("development.location"),
		mapZoomButton: protoConfig.getBool("development.zoom_button"),
		developmentVisualize: protoConfig.getBool("development.show_process"),
		checkNewestVersion: protoConfig.getBool("development.check_newest_version"),
		radius: protoConfig.getNumber("performance.radius"),
		priority: protoConfig.getNumber("performance.priority"),
		delay: protoConfig.getNumber("performance.delay"),
		thread: protoConfig.getNumber("performance.thread")
	};
	settings.locationSize = settings.locationRawSize / 100 * displayHeight;
	if (protoConfig.get("development.update_version") != null) {
		settings.updateVersion = protoConfig.getNumber("development.update_version");
	}
	if (protoConfig.get("development.update_changelog") != null) {
		settings.updateChangelog = protoConfig.getString("development.update_changelog");
	}
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
			offset: 40 * density
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
	restoreSettings();
})();
