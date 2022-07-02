let bmpPaint = new android.graphics.Paint(),
	mapView = new android.view.TextureView(getContext()),
	setWindow;

bmpPaint.setAntiAlias(false);
bmpPaint.setFilterBitmap(false);

let map_state = false;
let windowManager = getContext().getSystemService(android.content.Context.WINDOW_SERVICE);

let mapWindow = (function() {
	let showConfigDialog = function() {
		if (!setWindow) {
			setWindow = settingsUI([NAME, "Leave",
				["sectionDivider", "Rendering"],
					["keyValue", "multipleChoice", "Type", "mapType", ["Monochromatic", "Surface", "Underground"]],
					["keyValue", "slider", "Render distance", "radius", 1, 96, 1, " chunks"],
					["keyValue", "slider", "Zoom", "mapZoom", 10, 100, 1, "%"],
				["subScreen", "Icons / Indicators", ["Icons / Indicators", "Apply",
					["sectionDivider", "Entity"],
						["keyValue", "multipleChoice", "Pointer style", "stylesheetPointer", ["Crosshair", "Arrow", "Map", "Head"]],
						["checkBox", "indicatorOnlySurface", "Hide entities below sea level"],
						["checkBox", "indicatorLocal", "Yourself"],
						["checkBox", "indicatorPlayer", "Multiplayer"],
						["checkBox", "indicatorPassive", "Passive / Friendly"],
						["checkBox", "indicatorHostile", "Hostile"],
					["sectionDivider", "Marks"],
						["checkBox", "indicatorTile", "Container"],
						["checkBox", "indicatorTile", "Waypoint"]]],
				["sectionDivider", "Window"],
					["keyValue", "multipleChoice", "Position", "locationRawPosition", ["Top left", "Top left (offset)", "Top right", "Bottom left", "Bottom right"], "locationGravity", [51, 51, 53, 83, 85], "locationOffset", [0, 40 * getDisplayDensity(), 40 * getDisplayDensity(), 0, 0]],
					["keyValue", "slider", "Size", "locationRawSize", 20, 100, 5, "%"],
					["keyValue", "slider", "Opacity", "mapAlpha", 20, 100, 1, "%"],
					["subScreen", "Controls", ["Controls", "Apply",
						["keyValue", "text", "Button size", buttonSize + "dp"],
						["checkBox", "mapLocation", "Coordinates visible"]]],
					["checkBox", "mapRotation", "Spin with player"],
				["sectionDivider", "Style"],
					["keyValue", "multipleChoice", "Border style", "stylesheetBorder", ["None", "Simple", "Colourful"]],
					["keyValue", "multipleChoice", "Window shape", "stylesheetShape", ["Square", "Circle"]],
				["sectionDivider", "Other"],
					["subScreen", "Advanced", ["Advanced", "Apply",
						["keyValue", "multipleChoice", "Thread optimization", "priority", ["Background", "Foreground", "No optimization"]],
						["keyValue", "slider", "Max frequency", "delay", 1, 40, 1, " fps"],
						["keyValue", "slider", "Threads count", "thread", 1, 12, 1, ""],
						["checkBox", "developmentVisualize", "Display background processes"]]],
					["keyValue", "text", "Refresh canvas", "", "forceRefresh"],
					["subScreen", "Reset to defaults", ["Reset to defaults", "I don't like this",
						["keyValue", "text", "You are about to RESET minimap, all memories and user information will be lost.", ""],
						["keyValue", "text", "Way points are stored in worlds and will not be affected.", ""],
						["keyValue", "text", "<br/>Yes, I really want to <b><font color=\"red\">RESET</font></b><br/>", "", "resetConfig"]]],
					["subScreen", "About " + NAME,
						[NAME + " " + __mod__.getInfoProperty("version"), "Understood",
							["keyValue", "text", "Revision ", REVISION.toFixed(1)],
							["keyValue", "text", "Developed by ", "Nernar"],
							["keyValue", "text", "Inspired by ", "MxGoldo"],
							["keyValue", "text", "Location ", new java.io.File(__dir__).getName() + "/"],
							["keyValue", "text", "<a href=https://t.me/ntInsideChat>t.me</a> development channel", ""]]]]).show();
		} else {
			setWindow.show();
		}
	};
	let layout = new android.widget.RelativeLayout(getContext());
	let mapWin = new android.widget.PopupWindow(layout, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
	bmpPaint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.SRC));
	mapView.setId(1);
	mapView.setVisibility(android.view.View.GONE);
	let mapLp = new android.widget.RelativeLayout.LayoutParams(settings.locationSize, settings.locationSize);
	mapLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
	handle(function() {
		let mScaleFactor = settings.mapZoom / 100;
		if (isNaN(mScaleFactor)) {
			mScaleFactor = 1.;
		}
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
		let mGestureDetector = new android.view.GestureDetector(getContext(), new JavaAdapter(android.view.GestureDetector.SimpleOnGestureListener, android.view.GestureDetector.OnGestureListener, android.view.GestureDetector.OnDoubleTapListener, {
			onDown: function(event) {
				mRequiredStandartAction = true;
			},
			onSingleTapConfirmed: function(event) {
				if (mRequiredStandartAction) {
					changeMapState();
				}
				return mRequiredStandartAction;
			},
			onLongPress: function(event) {
				if (mRequiredStandartAction) {
					showConfigDialog();
				}
				return mRequiredStandartAction;
			}
		}));
		mapView.setOnTouchListener(function(mView, event) {
			mScaleGestureDetector.onTouchEvent(event);
			mGestureDetector.onTouchEvent(event);
			return true;
		});
	}, function(e) {
		mapView.setOnClickListener(function(v) {
			changeMapState();
		});
		mapView.setOnLongClickListener(function(v) {
			showConfigDialog();
			return true;
		});
		reportError(e);
	});
	mapView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
	let btnSet = new android.widget.Button(getContext());
	btnSet.setBackgroundResource(android.R.drawable.ic_menu_mylocation);
	btnSet.setVisibility(android.view.View.VISIBLE);
	btnSet.setLayoutParams(new android.widget.LinearLayout.LayoutParams(buttonSize * getDisplayDensity(), buttonSize * getDisplayDensity()));
	btnSet.setOnClickListener(function(v) {
		changeMapState();
	});
	btnSet.setOnLongClickListener(function(v) {
		showConfigDialog();
		return true;
	});
	let textInfo = new android.widget.TextView(getContext());
	textInfo.setId(2);
	textInfo.setVisibility(android.view.View.GONE);
	textInfo.setGravity(android.view.Gravity.CENTER);
	let textInfoLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);
	textInfoLp.addRule(android.widget.RelativeLayout.BELOW, 1);
	textInfoLp.addRule(android.widget.RelativeLayout.ALIGN_LEFT, 1);
	textInfoLp.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, 1);
	textInfo.setTextSize(14);
	textInfo.setPadding(0, 6 * getDisplayDensity(), 0, 0);
	textInfo.setTextColor(Colors.WHITE);
	textInfo.setShadowLayer(1, 4, 4, Colors.BLACK);
	try {
		textInfo.setTypeface(InnerCorePackage.utils.FileTools.getMcTypeface());
	} catch (e) {
		Logger.Log("Minimap: unable to set embedded font in Inner Core, default will be used otherwise", "WARNING");
	}
	layout.setAlpha((settings.mapAlpha / 100).toFixed(2));
	layout.addView(btnSet);
	layout.addView(mapView, mapLp);
	layout.addView(textInfo, textInfoLp);
	return {
		getLayout: function() {
			return layout;
		},
		setInfo: function() {
			handle(function() {
				let position = Player.getPosition();
				textInfo.setText(Math.floor(position.x) + ", " + Math.floor(position.y - 2) + ", " + Math.floor(position.z));
			});
		},
		resetVisibility: function() {
			handle(function() {
				if (map_state) {
					btnSet.setVisibility(android.view.View.GONE);
					mapView.setVisibility(android.view.View.VISIBLE);
					textInfo.setVisibility(settings.mapLocation ?
						android.view.View.VISIBLE : android.view.View.GONE);
				} else {
					btnSet.setVisibility(android.view.View.VISIBLE);
					mapView.setVisibility(android.view.View.GONE);
					textInfo.setVisibility(android.view.View.GONE);
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
		createPool();
	}
	if (map_state && settings.mapRotation) {
		if (settings.stylesheetShape == 1) {
			handle(function() {
				if (YAW !== undefined) {
					mapView.setRotation(-YAW);
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
	mapWindow.hide();
	if (map_state) {
		changeMapState();
	}
	pool.shutdownNow();
	startMapControl = true;
	X = undefined;
	while (entities.length > 0) {
		entities.pop();
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
	if (isHorizon) {
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
