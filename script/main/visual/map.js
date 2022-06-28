let bmpPaint = new android.graphics.Paint(),
	mapView = new android.view.TextureView(getContext()),
	setWindow;

bmpPaint.setAntiAlias(false);
bmpPaint.setFilterBitmap(false);

let map_state = false;
let windowManager = getContext().getSystemService(android.content.Context.WINDOW_SERVICE);

let mapWindow = (function() {
	let btnSet = new android.widget.Button(getContext()),
		btnZoomIn,
		btnZoomOut,
		textInfo = new android.widget.TextView(getContext()),
		mapLp = new android.widget.RelativeLayout.LayoutParams(settings.locationSize, settings.locationSize),
		btnZoomInLp = new android.widget.RelativeLayout.LayoutParams(buttonSize * getDisplayDensity(), buttonSize * getDisplayDensity()),
		btnZoomOutLp = new android.widget.RelativeLayout.LayoutParams(buttonSize * getDisplayDensity(), buttonSize * getDisplayDensity()),
		textInfoLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
		layout = new android.widget.RelativeLayout(getContext()),
		mapWin = new android.widget.PopupWindow(layout, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT),
		btnActions = {
			set: function() {
				if (!setWindow) {
					setWindow = settingsUI([NAME, "Leave",
						["sectionDivider", "Graphics"],
							["keyValue", "multipleChoice", "Type", "mapType", ["Basic surface (fast)", "Surface", "Cave"]],
							["keyValue", "slider", "Render distance", "radius", 1, 96, 1, " chunks"],
							["keyValue", "slider", "Zoom", "mapZoom", 10, 100, 1, "%"],
						["subScreen", "Icons and Indicators", ["Icons and Indicators", "Apply",
							["sectionDivider", "Entity"],
								["keyValue", "multipleChoice", "Pointer style", "stylesheetPointer", ["crosshairs", "arrow", "minecraft", "head"]],
								["checkBox", "indicatorOnlySurface", "Hide entities below sea level"],
								["checkBox", "indicatorLocal", "You"],
								["checkBox", "indicatorPlayer", "Other players"],
								["checkBox", "indicatorPassive", "Passive mobs"],
								["checkBox", "indicatorHostile", "Hostile mobs"],
							["sectionDivider", "Icon"],
								["checkBox", "indicatorTile", "Chests"]]],
						["sectionDivider", "View"],
							["keyValue", "multipleChoice", "Position", "locationRawPosition", ["Top left", "Top left (offset)", "Top right", "Bottom left", "Bottom right"], "locationGravity", [51, 51, 53, 83, 85], "locationOffset", [0, 40 * getDisplayDensity(), 40 * getDisplayDensity(), 0, 0]],
							["keyValue", "slider", "Size", "locationRawSize", 5, 100, 5, "%"],
							["keyValue", "slider", "Opacity", "mapAlpha", 20, 100, 1, "%"],
							["subScreen", "Controls", ["Controls", "Apply",
								["keyValue", "text", "Button size", buttonSize + "dp"],
								["checkBox", "mapLocation", "Coordinates visible"],
								["checkBox", "mapZoomButton", "Zoom buttons visible"]]],
							["checkBox", "mapRotation", "Spin with player"],
						["sectionDivider", "Style"],
							["keyValue", "multipleChoice", "Border style", "stylesheetBorder", ["None", "Simple", "Colourful"]],
							["keyValue", "multipleChoice", "Window shape", "stylesheetShape", ["Square", "Circle"]],
						["sectionDivider", "Other"],
							["checkBox", "checkNewestVersion", "Check for updates " + (settings.updateVersion > curVersion ? "(update available)" : "")],
						["subScreen", "Advanced", ["Advanced", "Apply",
							["keyValue", "multipleChoice", "Thread optimization", "priority", ["Background", "Foreground", "No optimization"]],
							["keyValue", "slider", "Max frequency", "delay", 1, 40, 1, " fps"],
							["keyValue", "slider", "Threads count", "thread", 1, 12, 1, ""],
							["checkBox", "developmentVisualize", "Debug pool process"]]],
						["subScreen", "About " + NAME,
							[NAME + " " + __mod__.getInfoProperty("version"), "Understood",
								["keyValue", "text", "Revision ", curVersion.toFixed(1)],
								["keyValue", "text", "Developed by ", "Nernar"],
								["keyValue", "text", "Inspired by ", "MxGoldo"],
								["keyValue", "text", "Location ", new java.io.File(__dir__).getName() + "/"],
								["keyValue", "text", "<a href=https://t.me/ntInsideChat>t.me</a> development channel", ""]]],
						["keyValue", "text", "Refresh canvas", "", "forceRefresh"]]).show();
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
	btnSet.setLayoutParams(new android.widget.LinearLayout.LayoutParams(buttonSize * getDisplayDensity(), buttonSize * getDisplayDensity()));
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
	textInfo.setPadding(3 * getDisplayDensity(), 0, 0, 0);
	textInfo.setBackgroundColor(Colors.GRAY);
	textInfo.setTextColor(Colors.WHITE);
	btnZoomOut = minecraftButton("-", buttonSize, buttonSize);
	btnZoomOut.setId(3);
	btnZoomOut.setVisibility(android.view.View.GONE);
	btnZoomOutLp.addRule(android.widget.RelativeLayout.BELOW, 2);
	btnZoomOut.setOnClickListener(function(v) {
		if (settings.mapZoom * 1.2 >= 100) {
			Game.tipMessage("minimum zoom reached");
			settings.mapZoom = 100;
		} else {
			settings.mapZoom = Math.round(settings.mapZoom * 1.2);
		}
		settingsChanged("mapZoom");
		saveSettings();
	});
	btnZoomIn = minecraftButton("+", buttonSize, buttonSize);
	btnZoomIn.setId(4);
	btnZoomIn.setVisibility(android.view.View.GONE);
	btnZoomInLp.addRule(android.widget.RelativeLayout.BELOW, 2);
	btnZoomInLp.addRule(android.widget.RelativeLayout.RIGHT_OF, 3);
	btnZoomIn.setOnClickListener(function(v) {
		if (settings.mapZoom * 0.8 <= 10) {
			Game.tipMessage("maximum zoom reached");
			settings.mapZoom = 10;
		} else {
			settings.mapZoom = Math.round(settings.mapZoom * 0.8);
		}
		settingsChanged("mapZoom");
		saveSettings();
	});
	layout.setAlpha((settings.mapAlpha / 100).toFixed(2));
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
			handle(function() {
				textInfo.setText(Math.floor(Player.getPosition().x) + ", " + Math.floor(Player.getPosition().y - 2) + ", " + Math.floor(Player.getPosition().z));
			});
		},
		resetVisibility: function() {
			handle(function() {
				let visible = android.view.View.VISIBLE, gone = android.view.View.GONE;
				if (map_state) {
					btnSet.setVisibility(gone);
					mapView.setVisibility(visible);
					btnZoomIn.setVisibility(settings.mapZoomButton ? visible : gone);
					btnZoomOut.setVisibility(settings.mapZoomButton ? visible : gone);
					textInfo.setVisibility(settings.mapLocation ? visible : gone);
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
			handle(function() {
				mapWin.showAtLocation(getDecorView(), settings.locationGravity, 0, settings.locationOffset);
				let container = mapWin.getContentView().getRootView();
				let params = container.getLayoutParams();
				params.flags |= android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED;
				windowManager.updateViewLayout(container, params);
			});
		},
		hide: function() {
			handle(function() {
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
	if (map_state && settings.mapRotation) {
		if (settings.stylesheetShape == 1) {
			handle(function() {
				if (YAW != undefined) {
					mapView.setRotation(YAW);
				}
			});
		} else {
			settings.stylesheetShape = 1;
			settingsChanged("stylesheetShape");
			saveSettings();
		}
	}
});

Callback.addCallback("LevelLeft", function() {
	tryout(function() {
		mapWindow.hide();
		if (map_state) {
			changeMapState();
		}
		pool.shutdownNow();
		startMapControl = true;
		X = undefined;
		entities = [];
		chests = [];
	});
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
