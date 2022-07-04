const Minimap = {
	onChangeRadius: function() {
		let widthOld = bmpSrc.getWidth(),
			widthNew = ((settings.radius + 1) * 2 + 1) * 16,
			xChunk = Math.floor(X / 16) * 16,
			zChunk = Math.floor(Z / 16) * 16;
		try {
			bmpSrcLock.acquire();
			bmpSrcCopy = android.graphics.Bitmap.createBitmap(widthNew, widthNew, android.graphics.Bitmap.Config.ARGB_8888);
			canvasBmpSrcCopy.setBitmap(bmpSrcCopy);
			canvasBmpSrcCopy.drawBitmap(bmpSrc, (widthNew - widthOld) / 2, (widthNew - widthOld) / 2, null);
			bmpSrc = android.graphics.Bitmap.createBitmap(widthNew, widthNew, android.graphics.Bitmap.Config.ARGB_8888);
			canvasBmpSrc.setBitmap(bmpSrc);
			canvasBmpSrc.drawBitmap(bmpSrcCopy, 0, 0, null);
		} finally {
			bmpSrcLock.release();
		}
		minZoom = settings.locationSize / (settings.radius * 2 * 16);
		absZoom = (100 / settings.mapZoom) * minZoom;
		if (widthNew > widthOld) {
			for (let i = (widthOld - 16) / 2; i <= settings.radius * 16; i += 16) {
				for (let j = 0; j < i; j += 16) {
					if (map_state) {
						scheduleChunk(xChunk + j + 16, zChunk + i, 0);
						scheduleChunk(xChunk + j, zChunk - i, 0);
						scheduleChunk(xChunk - j, zChunk + i, 0);
						scheduleChunk(xChunk - j - 16, zChunk - i, 0);
						scheduleChunk(xChunk + i, zChunk + j, 0);
						scheduleChunk(xChunk + i, zChunk - j - 16, 0);
						scheduleChunk(xChunk - i, zChunk + j + 16, 0);
						scheduleChunk(xChunk - i, zChunk - j, 0);
					} else {
						delayChunksArrLock.acquire();
						delayChunksArr[delayChunksArr.length] = [xChunk + j + 16, zChunk + i];
						delayChunksArr[delayChunksArr.length] = [xChunk + j, zChunk - i];
						delayChunksArr[delayChunksArr.length] = [xChunk - j, zChunk + i];
						delayChunksArr[delayChunksArr.length] = [xChunk - j - 16, zChunk - i];
						delayChunksArr[delayChunksArr.length] = [xChunk + i, zChunk + j];
						delayChunksArr[delayChunksArr.length] = [xChunk + i, zChunk - j - 16];
						delayChunksArr[delayChunksArr.length] = [xChunk - i, zChunk + j + 16];
						delayChunksArr[delayChunksArr.length] = [xChunk - i, zChunk - j];
						delayChunksArrLock.release();
					}
				}
			}
		}
		redraw = true;
	},
	onChangeLocation: function() {
		settings.locationSize = settings.locationRawSize / 100 * getDisplayHeight();
		let params = mapView.getLayoutParams();
		params.height = settings.locationSize;
		params.width = settings.locationSize;
		mapView.setLayoutParams(params);
		bmpBorder = drawBorderBmp();
		if (settings.stylesheetBorder != 0) {
			pathBorder = createPath(false, true);
		} else {
			pathBorder = createPath(true, false);
		}
		redraw = true;
		minZoom = settings.locationSize / (settings.radius * 2 * 16);
		absZoom = (100 / settings.mapZoom) * minZoom;
	},
	onChangeStylesheet: function() {
		if (settings.stylesheetBorder != 0) {
			pathBorder = createPath(false, true);
		} else {
			pathBorder = createPath(true, false);
		}
		bmpBorder = drawBorderBmp();
		redraw = true;
	},
	onChangeRefreshDelay: function() {
		if (scheduledFutureUpdateMap) {
			scheduledFutureUpdateMap.cancel(false);
			scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
		}
	},
	onChangeRenderer: function() {
		if (pool.getActiveCount() > 0) {
			createPool();
		}
		X = undefined;
	},
	onChangeTranslucency: function() {
		mapWindow.getLayout().setAlpha(settings.mapAlpha / 100);
	},
	onChangeZoom: function() {
		absZoom = (100 / settings.mapZoom) * minZoom;
		redraw = true;
	},
	onChangePoolSize: function() {
		pool.setCorePoolSize(settings.thread);
	},
	restoreConfig: function() {
		if (setWindow) {
			setWindow.dismiss();
			setWindow = null;
		}
		restoreSettings(true);
	}
};

const settingsChanged = function(key) {
	switch (key) {
		case "radius":
		case "forceRefresh":
			Minimap.onChangeRadius();
			break;
		case "mapType":
		case "mapSurface":
		case "mapSmoothing":
			Minimap.onChangeRenderer();
			break;
		case "mapZoom":
			Minimap.onChangeZoom();
			break;
		case "mapAlpha":
			Minimap.onChangeTranslucency();
			break;
		case "locationRawSize":
			Minimap.onChangeLocation();
			break;
		case "locationRawPosition":
			mapWindow.hide();
			mapWindow.show();
			break;
		case "stylesheetShape":
		case "stylesheetBorder":
			Minimap.onChangeStylesheet();
			break;
		case "stylesheetPointer":
			redraw = true;
			break;
		case "mapLocation":
			mapWindow.resetVisibility();
			break;
		case "delay":
			Minimap.onChangeRefreshDelay();
			break;
		case "thread":
			Minimap.onChangePoolSize();
			break;
		case "resetConfig":
			Minimap.restoreConfig();
			break;
	}
};

const checkRenderDistance = function() {
	let options = load(android.os.Environment.getExternalStorageDirectory() + "/games/com.mojang/minecraftpe/", "options.txt");
	if (options != "") {
		options = options.split("\n");
		if (!options) {
			return;
		}
		for (let i = 0; i < options.length; i += 1) {
			options[i] = options[i].split(":");
			if (isHorizon) {
				if (options[i][0] == "gfx_viewdistance") {
					return Math.round(parseInt(options[i][1], 10) / 16);
				}
			} else {
				if (options[i][0] == "gfx_renderdistance_new") {
					return Math.round(parseInt(options[i][1], 10) / 16);
				}
			}
		}
	}
	return 6;
};
