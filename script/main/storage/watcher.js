const Minimap = {
	REVISION: REVISION,
	getVersionCode: function() {
		return 2;
	},
	getGravity: function(what) {
		let gravity = android.view.Gravity.TOP;
		switch (what) {
			case 0:
				return gravity | android.view.Gravity.LEFT;
			case 2:
				return gravity | android.view.Gravity.RIGHT;
		}
		return gravity | android.view.Gravity.CENTER;
	},
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
		minZoom = settings.locationRawSize / (settings.radius * 2 * 16);
		absZoom = (100 / settings.mapZoom) * minZoom;
		if (widthNew > widthOld) {
			for (let i = (widthOld - 16) / 2; i <= settings.radius * 16; i += 16) {
				for (let j = 0; j < i; j += 16) {
					if (mapState) {
						Minimap.scheduleChunk(xChunk + j + 16, zChunk + i, 0);
						Minimap.scheduleChunk(xChunk + j, zChunk - i, 0);
						Minimap.scheduleChunk(xChunk - j, zChunk + i, 0);
						Minimap.scheduleChunk(xChunk - j - 16, zChunk - i, 0);
						Minimap.scheduleChunk(xChunk + i, zChunk + j, 0);
						Minimap.scheduleChunk(xChunk + i, zChunk - j - 16, 0);
						Minimap.scheduleChunk(xChunk - i, zChunk + j + 16, 0);
						Minimap.scheduleChunk(xChunk - i, zChunk - j, 0);
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
		Minimap.resetVisibility();
		redraw = true;
	},
	onChangeStylesheet: function() {
		if (settings.stylesheetBorder != 0) {
			pathBorder = Minimap.createHardcodedPath(false, true);
		} else {
			pathBorder = Minimap.createHardcodedPath(true, false);
		}
		bmpBorder = Minimap.drawBorderBitmap();
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
			Minimap.shutdownAndSchedulePool();
		}
		X = Y = undefined;
	},
	onChangeZoom: function() {
		absZoom = (100 / settings.mapZoom) * minZoom;
		redraw = true;
	},
	onChangePoolSize: function() {
		pool.setCorePoolSize(settings.thread);
	},
	restoreConfig: function() {
		Minimap.dismissConfigDialog();
		restoreConfigDirectly(true);
	},
	getTerrainUpscaledBitmap: function() {
		try {
			return android.graphics.Bitmap.createScaledBitmap(bmpSrc,
				bmpSrc.getWidth() * settings.exportDensity, bmpSrc.getWidth() * settings.exportDensity, false);
		} catch (e) {
			if (World.isWorldLoaded()) {
				Game.tipMessage(translate("Insufficient memory"));
			}
			reportError(e);
		}
		return bmpSrc;
	},
	saveTerrainBitmapLegacy: function(name, bitmap) {
		let path = getBitmapExportFolder() + name;
		writeFileBitmap(path, bitmap);
		scanMediaFiles([path], function(path, uri) {
			Logger.Log("Minimap: Minimap saved into " + uri, "DEBUG");
			Game.message(translate("Minimap saved as %s", name));
		});
	},
	saveTerrainBitmap: function(name, bitmap) {
		let resolver = getContext().getContentResolver();
		let contentValues = new android.content.ContentValues();
		contentValues.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, name);
		contentValues.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "image/png");
		contentValues.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_PICTURES + "/Horizon");
		let uri = resolver.insert(android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues);
		try {
			let stream = resolver.openOutputStream(uri);
			bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream);
			Logger.Log("Minimap: Minimap saved into " + uri, "DEBUG");
			Game.message(translate("Minimap saved as %s", name));
			stream.close();
		} catch (e) {
			reportError(e);
		}
	},
	exportTerrain: function() {
		let name = "Minimap_" + formatTimestamp() + ".png";
		let bitmap = Minimap.getTerrainUpscaledBitmap();
		if (android.os.Build.VERSION.SDK_INT >= 29) {
			Minimap.saveTerrainBitmap(name, bitmap);
		} else {
			Minimap.saveTerrainBitmapLegacy(name, bitmap);
		}
		if (bitmap != bmpSrc) {
			bitmap.recycle();
		}
	}
};

const notifyConfigChanged = function(key) {
	switch (key) {
		case "radius":
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
			Minimap.onChangeOpacity();
			break;
		// case "locationX":
		// case "locationY":
			// Minimap.onChangeOffset();
			// break;
		case "locationSize":
			Minimap.onChangeScale();
			break;
		case "forceRefresh":
			Minimap.acquireHardwareAccelerate();
		case "locationX":
		case "locationY":
		case "locationGravity":
			Minimap.dismissInternal();
			Minimap.dismissResearch();
			Minimap.showInternal();
			break;
		case "stylesheetShape":
		case "stylesheetBorder":
			Minimap.onChangeStylesheet();
			break;
		case "stylesheetPointer":
			redraw = true;
			break;
		case "mapLocation":
			Minimap.resetVisibility();
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
		case "exportTerrain":
			Minimap.exportTerrain();
			break;
	}
};

const checkRenderDistance = function() {
	let options = readFileText(android.os.Environment.getExternalStorageDirectory() + "/games/com.mojang/minecraftpe/options.txt");
	if (options != "") {
		options = options.split("\n");
		if (!options) {
			return 6;
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
