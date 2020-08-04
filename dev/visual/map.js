let bmpPaint = new android.graphics.Paint(),
	mapView = new android.view.TextureView(context),
	setWindow;

let map_state = false;

let mapWindow = (function() {
	let btnSet = new android.widget.Button(context),
		btnZoomIn,
		btnZoomOut,
		textInfo = new android.widget.TextView(context),
		mapLp = new android.widget.RelativeLayout.LayoutParams(settings.window_size , settings.window_size ),
		btnZoomInLp = new android.widget.RelativeLayout.LayoutParams(settings.button_size * density, settings.button_size * density),
		btnZoomOutLp = new android.widget.RelativeLayout.LayoutParams(settings.button_size * density, settings.button_size * density),
		textInfoLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
		layout = new android.widget.RelativeLayout(context),
		mapWin = new android.widget.PopupWindow(layout, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT),
		btnActions = {
			set: function() {
				if (!setWindow) {
					setWindow = settingsUI(["Minimap Options", "OK",
						["sectionDivider", "Graphics"],
							["keyValue", "multipleChoice", "Minimap type", "map_type", ["Basic surface (fast)", "Surface", "Cave"]],
							["keyValue", "slider", "Minimap render distance", "radius", 1, checkRenderDistance() + 4, 1, " chunks"],
							["keyValue", "slider", "Zoom", "map_zoom", 10, 100, 1, "%"],
						["subScreen", "Icons and Indicators", ["Icons and Indicators", "OK",
							["sectionDivider", "Entity"],
								["keyValue", "multipleChoice", "Pointer style", "style_pointer", ["crosshairs", "arrow", "minecraft", "head"]],
								["checkBox", "hide_underground_mob", "Hide entities below sea level"],
								["checkBox", "show_player", "You"],
								["checkBox", "show_otherPlayer", "Other players"],
								["checkBox", "show_passive", "Passive mobs"],
								["checkBox", "show_hostile", "Hostile mobs"],
							["sectionDivider", "Icon"],
								["checkBox", "show_chest", "Chests"]]],
						["sectionDivider", "View"],
							["keyValue", "multipleChoice", "Position", "window_rawPosition", ["Top left", "Top left (offset)", "Top right", "Bottom left", "Bottom right"], "window_gravity", [51, 51, 53, 83, 85], "window_y", [0, 40 * density, 40 * density, 0, 0]],
							["keyValue", "slider", "Size", "window_rawSize", 5, 100, 5, "%"],
							["keyValue", "slider", "Opacity", "map_alpha", 20, 100, 1, "%"],
							["keyValue", "slider", "Button size", "button_size", 20, 60, 1, "dp"],
							["checkBox", "show_info", "Coordinates visible"],
							["checkBox", "show_zoomBtn", "Zoom Buttons visible"],
						["sectionDivider", "Style"],
							["keyValue", "multipleChoice", "Border style", "style_border", ["None", "Simple", "Colourful"]],
							["keyValue", "multipleChoice", "Window shape", "style_shape", ["Square", "Circle"]],
						["sectionDivider", "Other"],
							["checkBox", "updateCheck", "Check for updates " + (settings.updateVersion > curVersion ? "(update available)" : "")],
						["subScreen", "Advanced ", ["Advanced", "Ok",
							["keyValue", "multipleChoice", "Thread optimization", "priority", ["Background", "Foreground", "No optimization"]],
							["keyValue", "slider", "Minimap max frequency", "delay", 1, 40, 1, " fps"],
							["keyValue", "slider", "Threads count", "threadCount", 1, 12, 1, ""],
							["checkBox", "debugProcesses", "Debug pool process"]]],
						["subScreen", "Minimap Information",
							["Minimap Support", "OK",
								["keyValue", "text", "Version ", curVersion.toFixed(1)],
								["keyValue", "text", "Developed by", "Nernar"],
								["keyValue", "text", "Inspired by", "MxGoldo"],
								["keyValue", "text", "<a href=https://m.vk.com/nernar>vk.com</a> development group", ""]]]]).show();
				} else {
					setWindow.show();
				}
			}
		};
	bmpPaint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.SRC));
	mapView.setId(1);
	mapView.setVisibility(android.view.View.GONE);
	mapLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
	mapView.setOnClickListener(function(v) {
		changeMapState();
	});
	mapView.setOnLongClickListener(function(v) {
		btnActions.set();
		return true;
	});
	btnSet.setBackgroundResource(android.R.drawable.ic_menu_mylocation);
	btnSet.setVisibility(android.view.View.VISIBLE);
	btnSet.setLayoutParams(new android.widget.LinearLayout.LayoutParams(settings.button_size * density, settings.button_size * density));
	btnSet.setOnClickListener(function(v) {
		changeMapState();
	});
	btnSet.setOnLongClickListener(function(v) {
		btnActions.set();
		return true;
	});
	textInfo.setId(2);
	textInfo.setVisibility(android.view.View.GONE);
	textInfoLp.addRule(android.widget.RelativeLayout.BELOW, 1);
	textInfoLp.addRule(android.widget.RelativeLayout.ALIGN_LEFT, 1);
	textInfoLp.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, 1);
	textInfo.setTextSize(15);
	textInfo.setPadding(3 * density, 0, 0, 0);
	textInfo.setBackgroundColor(colors.gray);
	textInfo.setTextColor(colors.white);
	btnZoomOut = minecraftButton("-", settings.button_size, settings.button_size);
	btnZoomOut.setId(3);
	btnZoomOut.setVisibility(android.view.View.GONE);
	btnZoomOutLp.addRule(android.widget.RelativeLayout.BELOW, 2);
	btnZoomOut.setOnClickListener(function(v) {
		if (settings.map_zoom * 1.2 >= 100) {
			Game.tipMessage("minimum zoom reached");
			settings.map_zoom = 100;
		} else {
			settings.map_zoom = Math.round(settings.map_zoom * 1.2);
		}
		settingsChanged("map_zoom");
		saveSettings();
	});
	btnZoomIn = minecraftButton("+", settings.button_size, settings.button_size);
	btnZoomIn.setId(4);
	btnZoomIn.setVisibility(android.view.View.GONE);
	btnZoomInLp.addRule(android.widget.RelativeLayout.BELOW, 2);
	btnZoomInLp.addRule(android.widget.RelativeLayout.RIGHT_OF, 3);
	btnZoomIn.setOnClickListener(function(v) {
		if (settings.map_zoom * 0.8 <= 10) {
			Game.tipMessage("maximum zoom reached");
			settings.map_zoom = 10;
		} else {
			settings.map_zoom = Math.round(settings.map_zoom * 0.8);
		}
		settingsChanged("map_zoom");
		saveSettings();
	});
	layout.setAlpha((settings.map_alpha / 100).toFixed(2));
	layout.addView(btnSet);
	layout.addView(mapView, mapLp);
	layout.addView(btnZoomIn, btnZoomInLp);
	layout.addView(btnZoomOut, btnZoomOutLp);
	layout.addView(textInfo, textInfoLp);
	return {
		getLayout: function() {
			return layout;
		},
		setInfo: function() {
			context.runOnUiThread(function() {
				textInfo.setText(Math.floor(Player.getPosition().x) + ", " + Math.floor(Player.getPosition().y - 2) + ", " + Math.floor(Player.getPosition().z));
			});
		},
		resetVisibility: function() {
			context.runOnUiThread(function() {
				let visible = android.view.View.VISIBLE, gone = android.view.View.GONE;
				if (map_state) {
					btnSet.setVisibility(gone);
					mapView.setVisibility(visible);
					btnZoomIn.setVisibility(settings.show_zoomBtn ? visible : gone);
					btnZoomOut.setVisibility(settings.show_zoomBtn ? visible : gone);
					textInfo.setVisibility(settings.show_info ? visible : gone);
				} else {
					btnSet.setVisibility(visible);
					mapView.setVisibility(gone);
					btnZoomIn.setVisibility(gone);
					btnZoomOut.setVisibility(gone);
					textInfo.setVisibility(gone);
				}
			});
		},
		show: function() {
			context.runOnUiThread(function() {
				mapWin.showAtLocation(context.getWindow().getDecorView(), settings.window_gravity, 0, settings.window_y);
			});
		},
		hide: function() {
			context.runOnUiThread(function() {
				mapWin.dismiss();
			});
		}
	};
})();

let startMapControl = true;

Callback.addCallback("tick", function() {
	if (startMapControl) {
		startMapControl = false;
		mapWindow.show();
		createPool();
	}
});

Callback.addCallback("LevelLeft", function() {
	try {
		mapWindow.hide();
		if (map_state) {
			changeMapState();
		}
		pool.shutdownNow();
		startMapControl = true;
		X = undefined;
		entities = [];
		chests = [];
	} catch(e) {
		Logger.LogError(e);
	}
});

function changeMapState() {
	map_state = !map_state;
	mapWindow.resetVisibility();
	if (map_state) {
		delayChunksArrLock.acquire();
		let i = delayChunksArr.length;
		while (i--) {
			scheduleChunk(delayChunksArr[i][0], delayChunksArr[i][1], 0);
		}
		delayChunksArr = [];
		delayChunksArrLock.release();
		scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
		scheduleChunk(Math.floor(X / 16) * 16, Math.floor(Z / 16) * 16, 0);
	} else {
		scheduledFutureUpdateMap.cancel(false);
	}
}

Callback.addCallback("NativeGuiChanged", function(screenName) {
	if (getCoreAPILevel() > 8) {
		if (screenName != "in_game_play_screen") {
			mapWindow.hide();
			return;
		}
	} else {
		if (screenName != "hud_screen") {
			mapWindow.hide();
			return;
		}
	}
	mapWindow.show();
});
