function scheduleChunk(xChunk, zChunk, delay) {
	pool.schedule(new java.lang.Runnable(function() {
		tryout(function() {
			if (settings.priority == 0) {
				android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
			} else if (settings.priority == 1) {
				android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
			}
			if (Math.abs(Math.floor((Z - zChunk) / 16)) > settings.radius || Math.abs(Math.floor((X - xChunk) / 16)) > settings.radius) {
				return;
			}
			let ix = 16,
				iz = 16,
				x = xChunk + 16,
				z = zChunk - 1,
				mapDotArray = new Array(),
				type = settings.mapType;
			if (!World.isChunkLoaded((x - 16) / 16, (z + 16) / 16)) {
				if (map_state) {
					scheduleChunk(xChunk, zChunk, 10);
				} else {
					delayChunksArrLock.acquire();
					delayChunksArr[delayChunksArr.length] = [xChunk, zChunk];
					delayChunksArrLock.release();
				}
				return;
			}
			if (settings.developmentVisualize) {
				Game.tipMessage("processing " + (xChunk / 16) + ", " + (zChunk / 16) + " [" + delay + "]");
			}
			do {
				do {
					mapDotArray[mapDotArray.length] = mapDot[type](x - ix, z + iz);
				} while (iz -= 1);
				iz = 16;
			} while (ix -= 1);
			if (java.lang.Thread.interrupted()) { return; }
			try {
				bmpSrcLock.acquire();
				bmpSrc.setPixels(mapDotArray, 0, 16, ((Math.floor(Z / 16) + settings.radius + 1) * 16) - zChunk, xChunk - ((Math.floor(X / 16) - settings.radius - 1) * 16), 16, 16)
			} finally {
				bmpSrcLock.release();
			}
			redraw = true;
		});
	}), delay, java.util.concurrent.TimeUnit.SECONDS);
}
