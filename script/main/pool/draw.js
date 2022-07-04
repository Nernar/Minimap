let redraw = false,
	X,
	Z,
	YAW,
	DIMENSION,
	pool;

const createPool = function() {
	if (pool != null) {
		pool.shutdownNow();
	}
	pool = java.util.concurrent.Executors.newScheduledThreadPool(settings.thread);
	pool.setKeepAliveTime(60, java.util.concurrent.TimeUnit.SECONDS);
	pool.allowCoreThreadTimeOut(true);
};

const drawMinimapWhenDirty = function() {
	try {
		if (settings.priority == 0) {
			android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
		} else if (settings.priority == 1) {
			android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
		}
		let xNew = Player.getPosition().x,
			zNew = Player.getPosition().z,
			yawNew = Entity.getLookAngle(Player.get()).yaw / Math.PI * 180 - 90,
			xChunkNew,
			zChunkNew,
			xChunkOld,
			zChunkOld,
			dimensionNew = Player.getDimension(),
			i,
			ix,
			radius = settings.radius * 16;
		if (xNew != X || zNew != Z || yawNew != YAW || redraw || dimensionNew != DIMENSION) {
			redraw = false;
			xChunkNew = Math.floor(xNew / 16) * 16;
			zChunkNew = Math.floor(zNew / 16) * 16;
			xChunkOld = Math.floor(X / 16) * 16;
			zChunkOld = Math.floor(Z / 16) * 16;
			if (xChunkNew != xChunkOld || zChunkNew != zChunkOld || dimensionNew != DIMENSION) {
				if (Math.abs(xChunkNew - xChunkOld) <= radius * 2 && Math.abs(zChunkNew - zChunkOld) <= radius * 2 && dimensionNew == DIMENSION) {
					try {
						bmpSrcLock.acquire();
						bmpSrcCopy.eraseColor(0);
						canvasBmpSrcCopy.drawBitmap(bmpSrc, zChunkNew - zChunkOld, xChunkOld - xChunkNew, null);
						bmpSrc.eraseColor(0);
						canvasBmpSrc.drawBitmap(bmpSrcCopy, 0, 0, null);
					} finally {
						X = xNew;
						Z = zNew;
						bmpSrcLock.release();
					}
					if (xChunkNew > xChunkOld) {
						for (i = radius + 16 - (xChunkNew - xChunkOld); i <= radius; i += 16) {
							scheduleChunk(xChunkNew + i, zChunkNew, 0);
							for (ix = 16; ix <= radius; ix += 16) {
								scheduleChunk(xChunkNew + i, zChunkNew + ix, 0);
								scheduleChunk(xChunkNew + i, zChunkNew - ix, 0);
							}
						}
					} else if (xChunkOld > xChunkNew) {
						for (i = radius + 16 - (xChunkOld - xChunkNew); i <= radius; i += 16) {
							scheduleChunk(xChunkNew - i, zChunkNew, 0);
							for (ix = 16; ix <= radius; ix += 16) {
								scheduleChunk(xChunkNew - i, zChunkNew + ix, 0);
								scheduleChunk(xChunkNew - i, zChunkNew - ix, 0);
							}
						}
					}
					if (zChunkNew > zChunkOld) {
						for (i = radius + 16 - (zChunkNew - zChunkOld); i <= radius; i += 16) {
							scheduleChunk(xChunkNew, zChunkNew + i, 0);
							for (ix = 16; ix <= radius; ix += 16) {
								scheduleChunk(xChunkNew + ix, zChunkNew + i, 0);
								scheduleChunk(xChunkNew - ix, zChunkNew + i, 0);
							}
						}
					} else if (zChunkOld > zChunkNew) {
						for (i = radius + 16 - (zChunkOld - zChunkNew); i <= radius; i += 16) {
							scheduleChunk(xChunkNew, zChunkNew - i, 0);
							for (ix = 16; ix <= radius; ix += 16) {
								scheduleChunk(xChunkNew + ix, zChunkNew - i, 0);
								scheduleChunk(xChunkNew - ix, zChunkNew - i, 0);
							}
						}
					}
				} else {
					X = xNew;
					Z = zNew;
					bmpSrc.eraseColor(0);
					scheduleChunk(xChunkNew, zChunkNew, 0);
					for (i = 16; i <= settings.radius * 16; i += 16) {
						for (ix = 0; ix < i; ix += 16) {
							scheduleChunk(xChunkNew + ix + 16, zChunkNew + i, 0);
							scheduleChunk(xChunkNew + ix, zChunkNew - i, 0);
							scheduleChunk(xChunkNew - ix, zChunkNew + i, 0);
							scheduleChunk(xChunkNew - ix - 16, zChunkNew - i, 0);
							scheduleChunk(xChunkNew + i, zChunkNew + ix, 0);
							scheduleChunk(xChunkNew + i, zChunkNew - ix - 16, 0);
							scheduleChunk(xChunkNew - i, zChunkNew + ix + 16, 0);
							scheduleChunk(xChunkNew - i, zChunkNew - ix, 0);
						}
					}
				}
			} else {
				X = xNew;
				Z = zNew;
			}
			YAW = yawNew;
			DIMENSION = dimensionNew;
			let zoom = absZoom,
				style_pointer = settings.stylesheetPointer,
				x0 = xNew - (settings.locationSize * 0.5 / zoom),
				z0 = zNew + (settings.locationSize * 0.5 / zoom);
			matrixMap.setTranslate(settings.locationSize * 0.5 - (bmpSrc.getWidth() * 0.5) - 8 + zNew - zChunkNew, settings.locationSize * 0.5 - (bmpSrc.getHeight() * 0.5) + 8 - xNew + xChunkNew);
			if (settings.mapRotation) {
				matrixMap.postRotate(YAW, settings.locationSize * 0.5, settings.locationSize * 0.5);
			}
			matrixMap.postScale(zoom, zoom, settings.locationSize * 0.5, settings.locationSize * 0.5);
			if (settings.mapLocation) {
				mapWindow.setInfo();
			}
			let canvas = mapView.lockCanvas();
			if (canvas == null) {
				redraw = true;
				return;
			}
			canvas.drawColor(0, android.graphics.PorterDuff.Mode.CLEAR);
			canvas.save(android.graphics.Canvas.CLIP_SAVE_FLAG);
			if (bmpBorder != null) {
				canvas.drawBitmap(bmpBorder, 0, 0, null);
			}
			if (android.os.Build.VERSION.SDK_INT >= 28) {
				canvas.clipPath(pathBorder);
			} else {
				canvas.clipPath(pathBorder, android.graphics.Region.Op.REPLACE);
			}
			canvas.drawBitmap(bmpSrc, matrixMap, bmpPaint);
			if (settings.indicatorPassive || settings.indicatorHostile || settings.indicatorPlayer) {
				redraw = true;
				i = entities.length;
				let id;
				while (i--) {
					if (!settings.indicatorOnlySurface || Entity.getPosition(entities[i]).y > 60) {
						id = Entity.getType(entities[i])
						let yaw = style_pointer == 3 ? settings.mapRotation ? YAW : 0 : Entity.getLookAngle(entities[i]).yaw / Math.PI * 180 - 90
						if (style_pointer != 3) {
							if (ENTITY_PASSIVE.indexOf(id) >= 0 && settings.indicatorPassive) {
								matrixPointer.reset();
								if (pointer[style_pointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - Entity.getPosition(entities[i]).z) * zoom, (Entity.getPosition(entities[i]).x - x0) * zoom);
								matrixPointer.preConcat(pointer[style_pointer].matrix);
								canvas.drawBitmap(pointer[style_pointer].bitmap, matrixPointer, pointerPaint.GREEN);
							} else if (ENTITY_HOSTILE.indexOf(id) >= 0 && settings.indicatorHostile) {
								matrixPointer.reset();
								if (pointer[style_pointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - Entity.getPosition(entities[i]).z) * zoom, (Entity.getPosition(entities[i]).x - x0) * zoom);
								matrixPointer.preConcat(pointer[style_pointer].matrix);
								canvas.drawBitmap(pointer[style_pointer].bitmap, matrixPointer, pointerPaint.RED);
							} else if (id == 1 && settings.indicatorPlayer) {
								matrixPointer.reset();
								if (pointer[style_pointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - Entity.getPosition(entities[i]).z) * zoom, (Entity.getPosition(entities[i]).x - x0) * zoom);
								matrixPointer.preConcat(pointer[style_pointer].matrix);
								canvas.drawBitmap(pointer[style_pointer].bitmap, matrixPointer, null);
							}
						} else if ((ENTITY_PASSIVE.indexOf(id) >= 0 && settings.indicatorPassive) || (ENTITY_HOSTILE.indexOf(id) >= 0 && settings.indicatorHostile) || (id == 1 && settings.indicatorPlayer)) {
							matrixPointer.reset();
							matrixPointer.postRotate(yaw);
							matrixPointer.postTranslate((z0 - Entity.getPosition(entities[i]).z) * zoom, (Entity.getPosition(entities[i]).x - x0) * zoom);
							matrixPointer.preConcat(getIconMatrix(id) || iconMatrix);
							canvas.drawBitmap(heads[id] || heads[0], matrixPointer, null);
						}
					}
				}
			}
			if (settings.indicatorLocal) {
				if (style_pointer != 3) {
					matrixPointer.reset();
					if (pointer[style_pointer].rotate) {
						matrixPointer.postRotate(yawNew);
					}
					matrixPointer.postTranslate(settings.locationSize * 0.5, settings.locationSize * 0.5);
					matrixPointer.preConcat(pointer[style_pointer].matrix);
					canvas.drawBitmap(pointer[style_pointer].bitmap, matrixPointer, null)
				} else {
					matrixPointer.reset();
					matrixPointer.postRotate(yawNew);
					matrixPointer.postTranslate(settings.locationSize * 0.5, settings.locationSize * 0.5);
					matrixPointer.preConcat(getIconMatrix(63) || getIconMatrix(1) || iconMatrix);
					canvas.drawBitmap(heads[63] || heads[1] || heads[0], matrixPointer, null)
				}
			}
			canvas.restore();
			mapView.unlockCanvasAndPost(canvas);
		}
	} catch (e) {
		reportError(e);
	}
};

(function() {
	bmpBorder = drawBorderBitmap();
	if (settings.stylesheetBorder != 0) {
		pathBorder = createPath(false, true);
	} else {
		pathBorder = createPath(true, false);
	}
	bmpSrc = android.graphics.Bitmap.createBitmap(((settings.radius + 1) * 2 + 1) * 16, ((settings.radius + 1) * 2 + 1) * 16, android.graphics.Bitmap.Config.ARGB_8888);
	bmpSrcCopy = android.graphics.Bitmap.createBitmap(bmpSrc.getWidth(), bmpSrc.getHeight(), android.graphics.Bitmap.Config.ARGB_8888);
	canvasBmpSrc.setBitmap(bmpSrc);
	canvasBmpSrcCopy.setBitmap(bmpSrcCopy);
	minZoom = settings.locationSize / (settings.radius * 2 * 16);
	absZoom = (100 / settings.mapZoom) * minZoom;
	poolTick = java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
	runnableUpdateMap = new java.lang.Runnable(drawMinimapWhenDirty);
}());
