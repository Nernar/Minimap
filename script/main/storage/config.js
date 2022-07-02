let settings = {};

const settingsChanged = function(key) {
	switch (key) {
		case "radius":
		case "forceRefresh":
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
			break;
		case "mapType":
			if (pool.getActiveCount() > 0) {
				createPool();
			}
			X = undefined;
			break;
		case "mapZoom":
			absZoom = (100 / settings.mapZoom) * minZoom;
			redraw = true;
			break;
		case "mapAlpha":
			mapWindow.getLayout().setAlpha((settings.mapAlpha / 100).toFixed(2));
			break;
		case "locationRawSize":
			settings.locationSize = settings.locationRawSize / 100 * getDisplayHeight();
			let lp = mapView.getLayoutParams();
			lp.height = settings.locationSize;
			lp.width = settings.locationSize;
			mapView.setLayoutParams(lp);
			redraw = true;
			bmpBorder = drawBorderBmp();
			if (settings.stylesheetBorder != 0) {
				pathBorder = createPath(false, true);
			} else {
				pathBorder = createPath(true, false);
			}
			redraw = true;
			minZoom = settings.locationSize / (settings.radius * 2 * 16);
			absZoom = (100 / settings.mapZoom) * minZoom;
			break;
		case "locationRawPosition":
			mapWindow.hide();
			mapWindow.show();
			break;
		case "stylesheetShape":
		case "stylesheetBorder":
			if (settings.stylesheetBorder != 0) {
				pathBorder = createPath(false, true);
			} else {
				pathBorder = createPath(true, false);
			}
			bmpBorder = drawBorderBmp();
			redraw = true;
			break;
		case "stylesheetPointer":
			redraw = true;
			break;
		case "mapLocation":
			mapWindow.resetVisibility();
			break;
		case "delay":
			if (scheduledFutureUpdateMap) {
				scheduledFutureUpdateMap.cancel(false);
				scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
			}
			break;
		case "thread":
			pool.setCorePoolSize(settings.thread);
			break;
		case "mapRotation":
			if (!settings.mapRotation) {
				handle(function() {
					mapView.setRotation(0);
				});
			}
			break;
		case "resetConfig":
			if (setWindow) {
				setWindow.dismiss();
				setWindow = null;
			}
			restoreSettings(true);
			break;
		default:
			Logger.Log("Minimap: option " + key + " will be changed in future", "MOD");
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

const setConfigOptionIfNeeded = function(proto, name, value) {
	if (value === undefined || value === null) {
		return false;
	}
	let current = __config__.get(name);
	if (current != null || (current == null && value != proto.get(name))) {
		return __config__.set(name, value);
	}
	return false;
};

const saveSettings = function() {
	setConfigOptionIfNeeded(protoConfig, "runtime.type", settings.mapType);
	setConfigOptionIfNeeded(protoConfig, "runtime.zoom", settings.mapZoom);
	setConfigOptionIfNeeded(protoConfig, "runtime.translucent", settings.mapAlpha);
	setConfigOptionIfNeeded(protoConfig, "runtime.rotation", settings.mapRotation);
	setConfigOptionIfNeeded(protoConfig, "indicator.passive", settings.indicatorPassive);
	setConfigOptionIfNeeded(protoConfig, "indicator.hostile", settings.indicatorHostile);
	setConfigOptionIfNeeded(protoConfig, "indicator.local", settings.indicatorLocal);
	setConfigOptionIfNeeded(protoConfig, "indicator.player", settings.indicatorPlayer);
	setConfigOptionIfNeeded(protoConfig, "indicator.tile", settings.indicatorTile);
	setConfigOptionIfNeeded(protoConfig, "indicator.only_surface", settings.indicatorOnlySurface);
	setConfigOptionIfNeeded(protoConfig, "location.raw_size", settings.locationRawSize);
	setConfigOptionIfNeeded(protoConfig, "location.raw_position", settings.locationRawPosition);
	setConfigOptionIfNeeded(protoConfig, "location.gravity", settings.locationGravity);
	setConfigOptionIfNeeded(protoConfig, "location.offset", settings.locationOffset);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.border", settings.stylesheetBorder);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.pointer", settings.stylesheetPointer);
	setConfigOptionIfNeeded(protoConfig, "stylesheet.shape", settings.stylesheetShape);
	setConfigOptionIfNeeded(protoConfig, "development.location", settings.mapLocation);
	setConfigOptionIfNeeded(protoConfig, "development.show_process", settings.developmentVisualize);
	setConfigOptionIfNeeded(protoConfig, "performance.radius", settings.radius);
	setConfigOptionIfNeeded(protoConfig, "performance.priority", settings.priority);
	setConfigOptionIfNeeded(protoConfig, "performance.delay", settings.delay);
	setConfigOptionIfNeeded(protoConfig, "performance.thread", settings.thread);
	__config__.save();
};
