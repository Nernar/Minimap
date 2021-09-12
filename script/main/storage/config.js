let settings = new Object();

function headerClicked(key) {
	switch (key) {
		case "forceRefresh":
			mapWindow.hide();
			refresh = true;
			mapWindow.show();
			break;
	}
}

function settingsChanged(key) {
	switch (key) {
		case "radius":
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
			settings.locationSize = settings.locationRawSize / 100 * displayHeight;
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
		case "mapZoomButton":
			mapWindow.resetVisibility();
			break;
		case "delay":
			scheduledFutureUpdateMap.cancel(false);
			scheduledFutureUpdateMap = poolTick.scheduleWithFixedDelay(runnableUpdateMap, 1000, Math.round(1000 / settings.delay), java.util.concurrent.TimeUnit.MILLISECONDS);
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
	}
}

function checkRenderDistance() {
	let options = load(android.os.Environment.getExternalStorageDirectory().getPath() + "/games/" + (getCoreAPILevel() > 8 ? "horizon" : "com.mojang") + "/minecraftpe/", "options.txt");
	if (options != "") {
		options = options.split("\n");
		if (!options) {
			return;
		}
		for (let i = 0; i < options.length; i += 1) {
			options[i] = options[i].split(":");
			if (getCoreAPILevel() > 8) {
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
}

function saveSettings() {
	let settingsString = "";
	for (let p in settings) {
		if (settings.hasOwnProperty(p)) {
			if (settingsString != "") {
				settingsString += "\n";
			}
			settingsString += p + ":" + settings[p];
		}
	}
	save(__dir__, "minimap.txt", settingsString);
}
