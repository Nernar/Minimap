const ConfigDescriptor = [__mod__.getInfoProperty("name"), "Leave",
	["keyValue", "multipleChoice", "Type", "mapType", ["Monochromatic", "Surface", "Underground"]],
	["keyValue", "multipleChoice", "Heightmap", "mapSurface", ["Nearest surface", "Optimum", "Procedural", "Closest to sky"]],
	["keyValue", "multipleChoice", "Smoothing", "mapSmoothing", ["Disabled", "At most", "Transparency", "Fauna"]],
	["sectionDivider", "Rendering"],
		["keyValue", "slider", "Distance", "radius", 1, 96, 1, " chunks"],
		["subScreen", "Icons / Indicators", ["Icons / Indicators", "Apply",
			["keyValue", "multipleChoice", "Pointer", "stylesheetLocalPointer", ["Crosshair", "Arrow", "Map", "Head"]],
			["checkBox", "indicatorLocal", "Yourself"],
			["sectionDivider", "Entities"],
				["keyValue", "multipleChoice", "Pointer", "stylesheetPointer", ["Crosshair", "Arrow", "Map", "Head"]],
				["checkBox", "indicatorPassive", "Passive / Friendly"],
				["checkBox", "indicatorHostile", "Hostile"],
				["checkBox", "indicatorOnlySurface", "Hide below sea level"],
			["sectionDivider", "Marks"],
				["checkBox", "indicatorPlayer", "Show players"],
				["checkBox", "indicatorTile", "Containers"],
				["checkBox", "indicatorWaypoint", "Waypoints"]]],
		["subScreen", "Advanced", ["Advanced", "Apply",
			["keyValue", "multipleChoice", "Thread optimization", "priority", ["Background", "Foreground", "Disabled"]],
			["keyValue", "slider", "Max frequency", "delay", 1, 40, 1, " fps"],
			["keyValue", "slider", "Number of threads", "thread", 1, 12, 1, ""],
			["checkBox", "debug", "Debug various processes"]]],
		["checkBox", "mapRotation", "Turn behind yourself"],
	["sectionDivider", "Stylesheet"],
		["keyValue", "multipleChoice", "Border", "stylesheetBorder", ["Disabled", "Simple", "Colourful"]],
		["keyValue", "multipleChoice", "Shape", "stylesheetShape", ["Square", "Circle"]],
	["sectionDivider", "Window"],
		["keyValue", "multipleChoice", "Location", "locationRawPosition", ["<-", "<+", "+>", "<*", "*>"], "locationGravity", [51, 51, 53, 83, 85], "locationOffset", [0, 40 * getDisplayDensity(), 40 * getDisplayDensity(), 0, 0]],
		// ["keyValue", "text", "Location", "", "changeLocation"],
		["keyValue", "slider", "Scale", "locationRawSize", 20, 100, 5, "%%"],
		["keyValue", "slider", "Opacity", "mapAlpha", 20, 100, 1, "%%"],
		["keyValue", "slider", "Zoom", "mapZoom", 10, 100, 1, "%%"],
		["checkBox", "mapLocation", "Show coordinates"],
	["sectionDivider", "Other"],
		["keyValue", "text", "Refresh canvas", "", "forceRefresh"],
		["subScreen", "Reset to defaults", ["Reset to defaults", "I don't like this",
			["keyValue", "text", "You are about to RESET minimap, all memories and user information will be erased.", ""],
			["keyValue", "text", "Waypoints are stored in worlds and will not be affected.", ""],
			["keyValue", "text", "<br/>Yes, I really want to <b><font color=\"red\">RESET</font></b><br/>", "", "resetConfig"]]],
		["subScreen", "About Minimap", ["Minimap " + __mod__.getInfoProperty("version"), "Understood",
			["keyValue", "text", "Revision ", REVISION.toFixed(1)],
			["keyValue", "text", "Developed by ", "Nernar"],
			["keyValue", "text", "Inspired by ", "MxGoldo"],
			["keyValue", "text", "Located in ", new java.io.File(__dir__).getName() + "/"],
			["keyValue", "text", "<a href=https://t.me/ntInsideChat>t.me</a> development channel", ""]]]];

(function() {
	let dialog;
	Minimap.showConfigDialog = function() {
		if (!dialog) {
			dialog = createConfigDialog(ConfigDescriptor);
		}
		dialog.show();
	};
	Minimap.dismissConfigDialog = function() {
		dialog.dismiss();
		dialog = undefined;
	};
})();

let bmpPaint = new android.graphics.Paint();
bmpPaint.setAntiAlias(false);
bmpPaint.setFilterBitmap(false);
bmpPaint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.SRC));

let mapView = (function() {
	let layout = new android.widget.RelativeLayout(getContext());
	let popup = new android.widget.PopupWindow(layout,
		android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	let texture = new android.view.TextureView(getContext());
	texture.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
	texture.setId(1);
	
	getContext().runOnUiThread(function() {
		try {
			let mScaleFactor = settings.mapZoom / 10;
			let mRequiredStandartAction = true;
			let mScaleGestureDetector = new android.view.ScaleGestureDetector(getContext(), new JavaAdapter(android.view.ScaleGestureDetector.SimpleOnScaleGestureListener, android.view.ScaleGestureDetector.OnScaleGestureListener, {
				onScale: function(scaleGestureDetector) {
					mScaleFactor *= scaleGestureDetector.getScaleFactor();
					mScaleFactor = Math.max(1.0, Math.min(mScaleFactor, 10.0));
					let mPrescaledZoom = Math.round(mScaleFactor * 10);
					if (mPrescaledZoom != settings.mapZoom) {
						settings.mapZoom = mPrescaledZoom;
						settingsChanged("mapZoom");
						mRequiredStandartAction = false;
					}
					return true;
				}
			}));
			let mIgnoredByDoubleTap = false;
			let mGestureDetector = new android.view.GestureDetector(getContext(), new JavaAdapter(android.view.GestureDetector.SimpleOnGestureListener, android.view.GestureDetector.OnGestureListener, android.view.GestureDetector.OnDoubleTapListener, {
				onDown: function(event) {
					if (!mIgnoredByDoubleTap) {
						mRequiredStandartAction = true;
					}
					mIgnoredByDoubleTap = false;
				},
				onDoubleTap: function(event) {
					mRequiredStandartAction = false;
					mIgnoredByDoubleTap = true;
				},
				onSingleTapConfirmed: function(event) {
					if (mRequiredStandartAction) {
						changeMapState();
					}
					return mRequiredStandartAction;
				},
				onLongPress: function(event) {
					if (mRequiredStandartAction) {
						Minimap.showConfigDialog();
					}
					return mRequiredStandartAction;
				}
			}));
			texture.setOnTouchListener(function(mView, event) {
				mScaleGestureDetector.onTouchEvent(event);
				mGestureDetector.onTouchEvent(event);
				return true;
			});
		} catch (e) {
			texture.setOnClickListener(function(v) {
				changeMapState();
			});
			texture.setOnLongClickListener(function(v) {
				Minimap.showConfigDialog();
				return true;
			});
			reportError(e);
		}
	});
	
	let button = new android.widget.Button(getContext());
	button.setBackgroundResource(android.R.drawable.ic_menu_mylocation);
	button.setLayoutParams(new android.widget.LinearLayout.LayoutParams(buttonSize * getDisplayDensity(), buttonSize * getDisplayDensity()));
	button.setOnClickListener(function(v) {
		changeMapState();
	});
	button.setOnLongClickListener(function(v) {
		Minimap.showConfigDialog();
		return true;
	});
	
	let location = new android.widget.TextView(getContext());
	location.setGravity(android.view.Gravity.CENTER);
	location.setTextSize(14);
	location.setPadding(0, 6 * getDisplayDensity(), 0, 0);
	location.setTextColor(Colors.WHITE);
	location.setShadowLayer(1, 4, 4, Colors.BLACK);
	location.setId(2);
	try {
		location.setTypeface(InnerCorePackage.utils.FileTools.getMcTypeface());
	} catch (e) {
		Logger.Log("Minimap: unable to set embedded in Inner Core font, default will be used otherwise", "WARNING");
	}
	
	layout.addView(button);
	let textureParams = new android.widget.RelativeLayout.LayoutParams
		(settings.locationSize, settings.locationSize);
	textureParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
	layout.addView(texture, textureParams);
	let locationParams = new android.widget.RelativeLayout.LayoutParams
		(android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	locationParams.addRule(android.widget.RelativeLayout.BELOW, 1);
	locationParams.addRule(android.widget.RelativeLayout.ALIGN_LEFT, 1);
	locationParams.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, 1);
	layout.addView(location, locationParams);
	
	Minimap.onChangeOpacity = function() {
		layout.setAlpha(settings.mapAlpha / 100);
	};
	Minimap.onChangeOpacity();
	Minimap.resetVisibility = function() {
		getContext().runOnUiThread(function() {
			if (mapState) {
				button.setVisibility(android.view.View.GONE);
				texture.setVisibility(android.view.View.VISIBLE);
				location.setVisibility(settings.mapLocation ?
					android.view.View.VISIBLE : android.view.View.GONE);
			} else {
				button.setVisibility(android.view.View.VISIBLE);
				texture.setVisibility(android.view.View.GONE);
				location.setVisibility(android.view.View.GONE);
			}
		});
	};
	Minimap.resetVisibility();
	let manager = getContext().getSystemService(android.content.Context.WINDOW_SERVICE);
	Minimap.showInternal = function() {
		popup.showAtLocation(getDecorView(), settings.locationGravity, 0, settings.locationOffset);
		let container = popup.getContentView().getRootView();
		let params = container.getLayoutParams();
		params.flags |= android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED;
		manager.updateViewLayout(container, params);
	};
	Minimap.show = function() {
		getContext().runOnUiThread(function() {
			Minimap.showInternal();
		});
	};
	Minimap.dismissInternal = function() {
		popup.dismiss();
	};
	Minimap.dismiss = function() {
		getContext().runOnUiThread(function() {
			Minimap.dismissInternal();
		});
	};
	Minimap.updateLocation = function(position) {
		if (position === undefined || position === null) {
			position = Player.getPosition();
		}
		handle(function() {
			location.setText(Math.floor(position.x) + ", " + Math.floor(position.y - 2) + ", " + Math.floor(position.z));
		});
	};
	return texture;
})();

let startMapControl = true;

Callback.addCallback("LevelLeft", function() {
	Minimap.dismiss();
	if (mapState) {
		changeMapState();
	}
	pool.shutdownNow();
	startMapControl = true;
	X = undefined;
	while (entities.length > 0) {
		entities.pop();
	}
});

let mapState = false;

const changeMapState = function() {
	mapState = !mapState;
	Minimap.resetVisibility();
	if (mapState) {
		delayChunksArrLock.acquire();
		while (delayChunksArr.length > 0) {
			let chunk = delayChunksArr.shift();
			scheduleChunk(chunk[0], chunk[1], 0);
		}
		delayChunksArrLock.release();
		scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
		scheduleChunk(Math.floor(X / 16) * 16, Math.floor(Z / 16) * 16, 0);
	} else {
		scheduledFutureUpdateMap.cancel(false);
	}
};

Callback.addCallback("NativeGuiChanged", function(screenName) {
	if (screenName == "toast_screen") {
		return;
	}
	if (isHorizon) {
		if (screenName != "in_game_play_screen") {
			Minimap.dismiss();
			return;
		}
	} else {
		if (screenName != "hud_screen") {
			Minimap.dismiss();
			return;
		}
	}
	Minimap.show();
});

Callback.addCallback(isHorizon ? "LevelDisplayed" : "LevelLoaded", function() {
	if (startMapControl) {
		startMapControl = false;
		createPool();
	}
});
