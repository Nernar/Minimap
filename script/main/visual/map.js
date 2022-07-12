Minimap.ConfigDescriptor = [__mod__.getInfoProperty("name"), "Leave",
	["keyValue", "multipleChoice", "Type", "mapType", ["Monochromatic", "Surface", "Underground"]],
	["keyValue", "multipleChoice", "Heightmap", "mapSurface", ["Nearest surface", "Optimum", "Procedural", "Closest to sky"]],
	["keyValue", "multipleChoice", "Smoothing", "mapSmoothing", ["Disabled", "At most", "Transparency", "Fauna"]],
	["sectionDivider", "Rendering"],
		["keyValue", "slider", "Distance", "radius", 1, 64, 1, " chunks"],
		["subScreen", "Icons / Indicators", ["Icons / Indicators", "Apply",
			["keyValue", "multipleChoice", "Pointer", "stylesheetLocalPointer", ["Crosshair", "Arrow", "Map", "Head"]],
			["checkBox", "indicatorLocal", "Yourself"],
			["sectionDivider", "Entities"],
				["keyValue", "multipleChoice", "Pointer", "stylesheetPointer", ["Crosshair", "Arrow", "Map", "Head"]],
				["checkBox", "indicatorPassive", "Passive / Friendly"],
				["checkBox", "indicatorHostile", "Hostile"],
				["checkBox", "indicatorOnlySurface", "Hide below sea level"],
			["sectionDivider", "Marks"],
				// ["checkBox", "indicatorTile", "Containers"],
				// ["checkBox", "indicatorWaypoint", "Waypoints"],
				["checkBox", "indicatorPlayer", "Show players"]]],
		["subScreen", "Advanced", ["Advanced", "Apply",
			["keyValue", "multipleChoice", "Thread optimization", "priority", ["Background", "Foreground", "Disabled"]],
			["keyValue", "slider", "Max frequency", "delay", 1, 40, 1, " fps"],
			["keyValue", "slider", "Number of threads", "thread", 1, 12, 1, ""],
			["keyValue", "slider", "Pixel density to export", "exportDensity", 1, 16, 0.5, "px"],
			["checkBox", "debug", "Debug various processes"]]],
		["checkBox", "mapRotation", "Turn behind yourself"],
	["sectionDivider", "Stylesheet"],
		["keyValue", "multipleChoice", "Border", "stylesheetBorder", ["Disabled", "Simple", "Colourful"]],
		["keyValue", "multipleChoice", "Shape", "stylesheetShape", ["Square", "Circle"]],
		// ["keyValue", "multipleChoice", "Where am I", "stylesheetExplore", ["Disabled", "Tip", "Actionbar", "Title"]],
	["sectionDivider", "Window"],
		["keyValue", "slider", "Offset X", "locationX", 0, 100, 1, "%%"],
		["keyValue", "slider", "Offset Y", "locationY", 0, 100, 1, "%%"],
		["keyValue", "slider", "Scale", "locationSize", 0, 75, 1, "%%"],
		["keyValue", "multipleChoice", "Gravity", "locationGravity", ["Left", "Center", "Right"]],
		["keyValue", "slider", "Opacity", "mapAlpha", 20, 100, 1, "%%"],
		["keyValue", "slider", "Zoom", "mapZoom", 10, 100, 1, "%%"],
		["checkBox", "mapLocation", "Show coordinates"],
	["sectionDivider", "Other"],
		["keyValue", "text", "Export terrain to file", "", "exportTerrain"],
		["keyValue", "text", "Refresh canvas", "", "forceRefresh"],
		["subScreen", "Reset to defaults", ["Reset to defaults", "I don't like this",
			["keyValue", "text", "You are about to RESET minimap, all memories and user information will be erased.", ""],
			// ["keyValue", "text", "Waypoints are stored in worlds and will not be affected.", ""],
			["keyValue", "text", "<br/>Yes, I really want to <b><font color=\"red\">RESET</font></b><br/>", "", "resetConfig"]]],
		["subScreen", "About Minimap", ["Minimap " + __mod__.getInfoProperty("version"), "Understood",
			["keyValue", "text", "Revision ", REVISION.toFixed(1)],
			["keyValue", "text", "Developed by ", "Nernar"],
			["keyValue", "text", "Inspired by ", "MxGoldo"],
			["keyValue", "text", "Located in ", new java.io.File(__dir__).getName() + "/"],
			["keyValue", "text", "<a href=https://t.me/ntInsideChat>t.me</a> development channel", ""],
			["sectionDivider", "Also I would like to thank"],
				["keyValue", "text", "Interpreter<br/><i>Ukrainian</i>", "FOLDIK UA"]]]];

(function() {
	let dialog;
	Minimap.showConfigDialog = function() {
		if (!dialog) {
			dialog = Minimap.createConfigDialog(Minimap.ConfigDescriptor);
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
Minimap.onChangeStylesheet();
bmpSrc = android.graphics.Bitmap.createBitmap(((settings.radius + 1) * 2 + 1) * 16, ((settings.radius + 1) * 2 + 1) * 16, android.graphics.Bitmap.Config.ARGB_8888);
bmpSrcCopy = android.graphics.Bitmap.createBitmap(bmpSrc.getWidth(), bmpSrc.getHeight(), android.graphics.Bitmap.Config.ARGB_8888);
canvasBmpSrc.setBitmap(bmpSrc);
canvasBmpSrcCopy.setBitmap(bmpSrcCopy);
minZoom = settings.locationRawSize / (settings.radius * 2 * 16);
Minimap.onChangeZoom();

let mapView = (function() {
	let layout = new android.widget.RelativeLayout(getContext());
	let popup = new android.widget.PopupWindow(layout,
		android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	let texture = new android.view.TextureView(getContext());
	texture.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
	texture.setId(1);
	
	getContext().runOnUiThread(function() {
		try {
			let mScaleFactor = settings.mapZoom / 10.;
			let mRequiredStandartAction = true;
			let mScaleGestureDetector = new android.view.ScaleGestureDetector(getContext(), new JavaAdapter(android.view.ScaleGestureDetector.SimpleOnScaleGestureListener, android.view.ScaleGestureDetector.OnScaleGestureListener, {
				onScale: function(scaleGestureDetector) {
					mScaleFactor *= scaleGestureDetector.getScaleFactor();
					mScaleFactor = Math.max(1., Math.min(mScaleFactor, 10.));
					let mPrescaledZoom = Math.round(mScaleFactor * 10.);
					if (mPrescaledZoom != settings.mapZoom) {
						mRequiredStandartAction = false;
						settings.mapZoom = mPrescaledZoom;
						Minimap.onChangeZoom();
					}
					return true;
				},
				onScaleEnd: function(scaleGestureDetector) {
					if (!mRequiredStandartAction) {
						Minimap.saveConfig();
					}
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
						Minimap.showResearchInternal();
						Minimap.dismissInternal();
					}
					return mRequiredStandartAction;
				},
				onLongPress: function(event) {
					if (mRequiredStandartAction) {
						Minimap.showConfigDialog();
					}
					return mRequiredStandartAction;
				},
				onFling: function(event1, event2, velocityX, velocityY) {
					if (mRequiredStandartAction) {
						if (velocityX > toComplexUnitDip(32)) {
							Minimap.changeState();
							return false;
						}
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
				Minimap.showResearchInternal();
				Minimap.dismissInternal();
			});
			texture.setOnLongClickListener(function(v) {
				Minimap.showConfigDialog();
				return true;
			});
			reportError(e);
		}
	});
	
	let button = new android.widget.Button(getContext());
	button.setBackgroundResource(android.R.drawable.ic_menu_mapmode);
	button.setLayoutParams(new android.widget.LinearLayout.LayoutParams
		(toComplexUnitDip(buttonSize), toComplexUnitDip(buttonSize)));
	button.setOnClickListener(function(v) {
		Minimap.changeState();
	});
	button.setOnLongClickListener(function(v) {
		Minimap.showConfigDialog();
		return true;
	});
	
	let location = new android.widget.TextView(getContext());
	location.setGravity(android.view.Gravity.CENTER);
	location.setTextSize(toComplexUnitSp(9));
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
		(settings.locationRawSize, settings.locationRawSize);
	textureParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
	layout.addView(texture, textureParams);
	let locationParams = new android.widget.RelativeLayout.LayoutParams
		(android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	locationParams.addRule(android.widget.RelativeLayout.ALIGN_LEFT, 1);
	locationParams.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, 1);
	locationParams.addRule(android.widget.RelativeLayout.BELOW, 1);
	locationParams.setMargins(0, toComplexUnitDip(4), 0, 0);
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
	Minimap.onChangeOffset = function() {
		popup.update(getDisplayPercentWidth(settings.locationX), getDisplayPercentHeight(settings.locationY));
	};
	Minimap.acquireHardwareAccelerate = function() {
		let container = popup.getContentView().getRootView();
		let params = container.getLayoutParams();
		params.flags |= android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED;
		manager.updateViewLayout(container, params);
	};
	Minimap.showInternal = function() {
		popup.showAtLocation(getDecorView(), Minimap.getGravity(settings.locationGravity),
			getDisplayPercentWidth(settings.locationX), getDisplayPercentHeight(settings.locationY));
		Minimap.acquireHardwareAccelerate();
		redraw = true;
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
			position = getPlayerPosition();
		}
		handle(function() {
			location.setText(Math.floor(position[0]) + ", " + Math.floor(position[1] - 2) + ", " + Math.floor(position[2]));
		});
	};
	return texture;
})();

let researchView = (function() {
	let layout = new android.widget.RelativeLayout(getContext());
	let researchParams = new android.view.WindowManager.LayoutParams
		(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.MATCH_PARENT, 0, 0, 1000, 256, -3);
	let research = new android.widget.ImageView(getContext());
	let drawable = new android.graphics.drawable.BitmapDrawable(bmpSrc);
	drawable.setFilterBitmap(false);
	drawable.setAntiAlias(false);
	research.setImageDrawable(drawable);
	
	getContext().runOnUiThread(function() {
		try {
			let mScaleFactor = 1.;
			let mRequiredStandartAction = true;
			let mScaleGestureDetector = new android.view.ScaleGestureDetector(getContext(), new JavaAdapter(android.view.ScaleGestureDetector.SimpleOnScaleGestureListener, android.view.ScaleGestureDetector.OnScaleGestureListener, {
				onScale: function(scaleGestureDetector) {
					mScaleFactor *= scaleGestureDetector.getScaleFactor();
					mScaleFactor = Math.max(1., Math.min(mScaleFactor, 20.));
					research.setScaleX(mScaleFactor);
					research.setScaleY(mScaleFactor);
					mRequiredStandartAction = false;
					return true;
				}
			}));
			let mIgnoredByDoubleTap = false;
			let mGestureDetector = new android.view.GestureDetector(getContext(), new JavaAdapter(android.view.GestureDetector.SimpleOnGestureListener, android.view.GestureDetector.OnGestureListener, android.view.GestureDetector.OnDoubleTapListener, {
				onDown: function(event) {
					if (!mIgnoredByDoubleTap) {
						mRequiredStandartAction = true;
					}
					mScaleFactor = research.getScaleX();
					mIgnoredByDoubleTap = false;
				},
				onDoubleTap: function(event) {
					mRequiredStandartAction = false;
					mIgnoredByDoubleTap = true;
				},
				onSingleTapConfirmed: function(event) {
					if (mRequiredStandartAction) {
						Minimap.showInternal();
						Minimap.dismissResearchInternal();
					}
					return mRequiredStandartAction;
				},
				// onLongPress: function(event) {
					// if (mRequiredStandartAction) {
						// TODO: Required chunk allocation action
					// }
					// return mRequiredStandartAction;
				// },
				onScroll: function(event1, event2, distanceX, distanceY) {
					if (mRequiredStandartAction) {
						research.animate().
							x(research.getX() - distanceX).
							y(research.getY() - distanceY).
							setDuration(0).start();
					}
					return mRequiredStandartAction;
				}
			}));
			layout.setOnTouchListener(function(mView, event) {
				mScaleGestureDetector.onTouchEvent(event);
				mGestureDetector.onTouchEvent(event);
				return true;
			});
		} catch (e) {
			layout.setOnClickListener(function(v) {
				Minimap.showInternal();
				Minimap.dismissResearchInternal();
			});
			reportError(e);
		}
	});
	
	// let location = new android.widget.TextView(getContext());
	// location.setGravity(android.view.Gravity.CENTER);
	// location.setTextSize(toComplexUnitSp(9));
	// location.setTextColor(Colors.WHITE);
	// location.setShadowLayer(1, 4, 4, Colors.BLACK);
	// location.setId(2);
	// try {
		// location.setTypeface(InnerCorePackage.utils.FileTools.getMcTypeface());
	// } catch (e) {
		// Logger.Log("Minimap: unable to set embedded in Inner Core font, default will be used otherwise", "WARNING");
	// }
	
	layout.addView(research, new android.widget.RelativeLayout.LayoutParams
		(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.MATCH_PARENT));
	// let locationParams = new android.widget.RelativeLayout.LayoutParams
		// (android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	// locationParams.setMargins(toComplexUnitDip(12), 0, 0, toComplexUnitDip(12));
	// locationParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
	// locationParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
	// layout.addView(location, locationParams);
	
	let manager = getContext().getSystemService(android.content.Context.WINDOW_SERVICE);
	Minimap.resetResearchLocation = function() {
		drawable.setBitmap(bmpSrc);
		research.setX(0);
		research.setY(0);
		let modifier = getDisplayWidth() / getDisplayHeight();
		research.setScaleX(modifier);
		research.setScaleY(modifier);
	};
	let mResearchWindowAttached = false;
	Minimap.showResearchInternal = function() {
		Minimap.resetResearchLocation();
		if (!mResearchWindowAttached) {
			mResearchWindowAttached = true;
			manager.addView(layout, researchParams);
		}
	};
	Minimap.showResearch = function() {
		getContext().runOnUiThread(function() {
			Minimap.showResearchInternal();
		});
	};
	Minimap.dismissResearchInternal = function() {
		if (mResearchWindowAttached) {
			mResearchWindowAttached = false;
			manager.removeView(layout);
		}
	};
	Minimap.dismissResearch = function() {
		getContext().runOnUiThread(function() {
			Minimap.dismissResearchInternal();
		});
	};
	return research;
})();

let startMapControl = true;

Callback.addCallback("LevelLeft", function() {
	Minimap.dismiss();
	if (mapState) {
		Minimap.changeState();
	}
	pool.shutdownNow();
	startMapControl = true;
	X = Y = YAW = undefined;
	while (entities.length > 0) {
		entities.pop();
	}
});

let mapState = false;

Minimap.changeState = function() {
	mapState = !mapState;
	Minimap.resetVisibility();
	if (mapState) {
		delayChunksArrLock.acquire();
		while (delayChunksArr.length > 0) {
			let chunk = delayChunksArr.shift();
			Minimap.scheduleChunk(chunk[0], chunk[1], 0);
		}
		delayChunksArrLock.release();
		scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
		Minimap.scheduleChunk(Math.floor(X / 16) * 16, Math.floor(Z / 16) * 16, 0);
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
			if (mapState) {
				Minimap.dismissResearch();
				Minimap.changeState();
			}
			return;
		}
	} else {
		if (screenName != "hud_screen") {
			Minimap.dismiss();
			if (mapState) {
				Minimap.dismissResearch();
				Minimap.changeState();
			}
			return;
		}
	}
	if (!mapState) {
		Minimap.changeState();
		Minimap.show();
	}
});

Callback.addCallback(isHorizon ? "LevelDisplayed" : "LevelLoaded", function() {
	if (startMapControl) {
		startMapControl = false;
		Minimap.shutdownAndSchedulePool();
		if (!mapState) {
			Minimap.changeState();
		}
		Minimap.show();
	}
});


