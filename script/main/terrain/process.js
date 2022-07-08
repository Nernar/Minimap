Minimap.processChunk = function(xChunk, zChunk, delay) {
	if (Math.abs(Math.floor((Z - zChunk) / 16)) > settings.radius || Math.abs(Math.floor((X - xChunk) / 16)) > settings.radius) {
		if (settings.debug) {
			Game.tipMessage(translate("Out of range (%s, %s, %sms)", [xChunk / 16, zChunk / 16, delay]));
		}
		return true;
	}
	
	let ix = 16;
	let iz = 16;
	let x = xChunk + 16;
	let z = zChunk - 1;
	if (!isChunkLoaded((x - 16) / 16, (z + 16) / 16)) {
		if (settings.debug) {
			Game.tipMessage(translate("Scheduled (%s, %s, %sms)", [xChunk / 16, zChunk / 16, delay]));
		}
		return false;
	}
	
	let mapDotArray = [];
	if (settings.debug) {
		Game.tipMessage(translate("Processing (%s, %s, %sms)", [xChunk / 16, zChunk / 16, delay]));
	}
	do {
		do {
			mapDotArray[mapDotArray.length] = java.lang.Integer.valueOf(mapDot[settings.mapType](x - ix, z + iz));
		} while (iz -= 1);
		iz = 16;
	} while (ix -= 1);
	
	if (java.lang.Thread.interrupted()) {
		return true;
	}
	try {
		bmpSrcLock.acquire();
		bmpSrc.setPixels(mapDotArray, 0, 16, ((Math.floor(Z / 16) + settings.radius + 1) * 16) - zChunk, xChunk - ((Math.floor(X / 16) - settings.radius - 1) * 16), 16, 16);
	} finally {
		bmpSrcLock.release();
	}
	return (redraw = true);
};

Minimap.scheduleChunk = function(xChunk, zChunk, delay) {
	pool.schedule(new java.lang.Runnable(function() {
		try {
			if (settings.priority == 0) {
				android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
			} else if (settings.priority == 1) {
				android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
			}
			if (!Minimap.processChunk(xChunk, zChunk, delay)) {
				if (mapState) {
					Minimap.scheduleChunk(xChunk, zChunk, 10);
				} else {
					delayChunksArrLock.acquire();
					delayChunksArr[delayChunksArr.length] = [xChunk, zChunk];
					delayChunksArrLock.release();
				}
			}
		} catch (e) {
			reportError(e);
		}
	}), delay, java.util.concurrent.TimeUnit.SECONDS);
};
