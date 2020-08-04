(function() {
	try {
		let settingsString = load(__dir__, "minimap.txt").split("\n");
		for (let i = 0; i < settingsString.length; i += 1) {
			settings[settingsString[i].split(":")[0]] = parseFloat(settingsString[i].split(":")[1]);
		}
	} catch(e) {
		Logger.LogError(e);
	}
	settings = Object.assign({
		radius: 4,
		map_type: 0,
		map_zoom: 85,
		map_alpha: 70,
		show_passive: 1,
		show_hostile: 1,
		show_player: 1,
		show_otherPlayer: 1,
		show_chest: 0,
		hide_underground_mob: 1,
		button_size: 40,
		window_rawSize: 40,
		window_size: displayHeight * 0.4,
		window_rawPosition: 2,
		window_gravity: 53,
		window_y: 40 * density,
		style_ignoreBackground: 1,
		style_border: 0,
		style_pointer: 3,
		style_shape: 1,
		show_info: 0,
		show_zoomBtn: 0,
		priority: 1,
		delay: 15,
		threadCount: 2,
		debugProcesses: 0,
		updateCheck: 1,
		updateCheckTime: 0,
		ignore_outdate: 0
	}, settings);
})();
