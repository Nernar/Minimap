let redraw = false,
	X,
	Z,
	YAW,
	DIMENSION,
	dimensionNew,
	pool;

Minimap.shutdownAndSchedulePool = function() {
	if (pool != null) {
		pool.shutdownNow();
	}
	pool = java.util.concurrent.Executors.newScheduledThreadPool(settings.thread);
	pool.setKeepAliveTime(60, java.util.concurrent.TimeUnit.SECONDS);
	pool.allowCoreThreadTimeOut(true);
};

let extendedMarkers = {};
let inScreenExtendedMarkers = {};
let extendedMarkerLock = new java.util.concurrent.Semaphore(1, true);

Minimap.registerExtendedMarker = function(who, pointerUid) {
	if (pointerUid >= pointer.length || pointerUid < 0) {
		Logger.Log("Minimap: registerExtendedMarker(*, pointerUid) must be already registered by registerPointer(self)", "ERROR");
		return;
	}
	extendedMarkers[who] = pointerUid;
};

Minimap.mark = function(who, x, z, force) {
	if (!inScreenExtendedMarkers.hasOwnProperty(who)) {
		if (!extendedMarkers.hasOwnProperty(who)) {
			Logger.Log("Minimap: not found marker " + who + ". Are you sure that registered it?", "WARNING");
			return;
		}
		inScreenExtendedMarkers[who] = [];
	}
	extendedMarkerLock.acquire();
	if (!force) {
		for (let i = 0, c = inScreenExtendedMarkers[who].length; i < c; i++) {
			if (inScreenExtendedMarkers[who][i][0] == x && inScreenExtendedMarkers[who][i][1] == z) {
				return;
			}
		}
	}
	inScreenExtendedMarkers[who].push([x, z]);
	redraw = true;
	extendedMarkerLock.release();
};

Minimap.unmark = function(who, x, z) {
	if (!inScreenExtendedMarkers.hasOwnProperty(who)) {
		return;
	}
	extendedMarkerLock.acquire();
	for (let i = 0, c = inScreenExtendedMarkers[who].length; i < c; i++) {
		if (inScreenExtendedMarkers[who][i][0] == x && inScreenExtendedMarkers[who][i][1] == z) {
			inScreenExtendedMarkers[who].splice(i, 1);
			redraw = true;
			break;
		}
	}
	if (inScreenExtendedMarkers[who].length == 0) {
		delete inScreenExtendedMarkers[who];
	}
	extendedMarkerLock.release();
};

Minimap.unmarkType = function(who) {
	if (!inScreenExtendedMarkers.hasOwnProperty(who)) {
		return;
	}
	extendedMarkerLock.acquire();
	if (delete inScreenExtendedMarkers[who]) {
		redraw = true;
	}
	extendedMarkerLock.release();
};

Minimap.drawMinimapWhenDirty = function() {
	try {
		if (settings.priority == 0) {
			android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
		} else if (settings.priority == 1) {
			android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
		}
		
		let position = getPlayerPosition(),
			yawNew = getPlayerYaw() - 90,
			radius = settings.radius * 16;
		if (yawNew == -90 && YAW !== undefined) {
			yawNew = YAW;
		}
		if (position[0] != X || position[2] != Z || yawNew != YAW || redraw || dimensionNew != DIMENSION) {
			redraw = false;
			
			let xChunkNew = Math.floor(position[0] / 16) * 16,
				zChunkNew = Math.floor(position[2] / 16) * 16,
				xChunkOld = Math.floor(X / 16) * 16,
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
						X = position[0];
						Z = position[2];
						bmpSrcLock.release();
					}
					if (xChunkNew > xChunkOld) {
						for (let i = radius + 16 - (xChunkNew - xChunkOld); i <= radius; i += 16) {
							Minimap.scheduleChunk(xChunkNew + i, zChunkNew, 0);
							for (let ix = 16; ix <= radius; ix += 16) {
								Minimap.scheduleChunk(xChunkNew + i, zChunkNew + ix, 0);
								Minimap.scheduleChunk(xChunkNew + i, zChunkNew - ix, 0);
							}
						}
					} else if (xChunkOld > xChunkNew) {
						for (let i = radius + 16 - (xChunkOld - xChunkNew); i <= radius; i += 16) {
							Minimap.scheduleChunk(xChunkNew - i, zChunkNew, 0);
							for (let ix = 16; ix <= radius; ix += 16) {
								Minimap.scheduleChunk(xChunkNew - i, zChunkNew + ix, 0);
								Minimap.scheduleChunk(xChunkNew - i, zChunkNew - ix, 0);
							}
						}
					}
					if (zChunkNew > zChunkOld) {
						for (let i = radius + 16 - (zChunkNew - zChunkOld); i <= radius; i += 16) {
							Minimap.scheduleChunk(xChunkNew, zChunkNew + i, 0);
							for (let ix = 16; ix <= radius; ix += 16) {
								Minimap.scheduleChunk(xChunkNew + ix, zChunkNew + i, 0);
								Minimap.scheduleChunk(xChunkNew - ix, zChunkNew + i, 0);
							}
						}
					} else if (zChunkOld > zChunkNew) {
						for (let i = radius + 16 - (zChunkOld - zChunkNew); i <= radius; i += 16) {
							Minimap.scheduleChunk(xChunkNew, zChunkNew - i, 0);
							for (let ix = 16; ix <= radius; ix += 16) {
								Minimap.scheduleChunk(xChunkNew + ix, zChunkNew - i, 0);
								Minimap.scheduleChunk(xChunkNew - ix, zChunkNew - i, 0);
							}
						}
					}
				} else {
					X = position[0];
					Z = position[2];
					bmpSrc.eraseColor(0);
					Minimap.scheduleChunk(xChunkNew, zChunkNew, 0);
					for (let i = 16; i <= settings.radius * 16; i += 16) {
						for (let ix = 0; ix < i; ix += 16) {
							Minimap.scheduleChunk(xChunkNew + ix + 16, zChunkNew + i, 0);
							Minimap.scheduleChunk(xChunkNew + ix, zChunkNew - i, 0);
							Minimap.scheduleChunk(xChunkNew - ix, zChunkNew + i, 0);
							Minimap.scheduleChunk(xChunkNew - ix - 16, zChunkNew - i, 0);
							Minimap.scheduleChunk(xChunkNew + i, zChunkNew + ix, 0);
							Minimap.scheduleChunk(xChunkNew + i, zChunkNew - ix - 16, 0);
							Minimap.scheduleChunk(xChunkNew - i, zChunkNew + ix + 16, 0);
							Minimap.scheduleChunk(xChunkNew - i, zChunkNew - ix, 0);
						}
					}
				}
			} else {
				X = position[0];
				Z = position[2];
			}
			
			YAW = yawNew;
			DIMENSION = dimensionNew;
			let x0 = position[0] - (settings.locationRawSize * 0.5 / absZoom),
				z0 = position[2] + (settings.locationRawSize * 0.5 / absZoom);
			matrixMap.setTranslate(settings.locationRawSize * 0.5 - (bmpSrc.getWidth() * 0.5) - 8 + position[2] - zChunkNew,
				settings.locationRawSize * 0.5 - (bmpSrc.getHeight() * 0.5) + 8 - position[0] + xChunkNew);
			if (settings.mapRotation) {
				matrixMap.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
			}
			matrixMap.postScale(absZoom, absZoom, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
			if (settings.mapLocation) {
				Minimap.updateLocation(position);
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
				for (let i = 0; i < entities.length; i++) {
					let position = getEntityPosition(entities[i]);
					if (!settings.indicatorOnlySurface || position[1] > 60) {
						let id = getEntityType(entities[i])
						let yaw = settings.stylesheetPointer == 3 ? 0 : getEntityYaw(entities[i]) - 90;
						if (settings.stylesheetPointer != 3) {
							if (ENTITY_PASSIVE.indexOf(id) >= 0 && settings.indicatorPassive) {
								matrixPointer.reset();
								if (pointer[settings.stylesheetPointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - position[2]) * absZoom, (position[0] - x0) * absZoom);
								if (settings.mapRotation) {
									matrixPointer.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
								}
								matrixPointer.preConcat(pointer[settings.stylesheetPointer].matrix);
								canvas.drawBitmap(pointer[settings.stylesheetPointer].bitmap, matrixPointer, pointerPaint.GREEN);
							} else if (ENTITY_HOSTILE.indexOf(id) >= 0 && settings.indicatorHostile) {
								matrixPointer.reset();
								if (pointer[settings.stylesheetPointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - position[2]) * absZoom, (position[0] - x0) * absZoom);
								if (settings.mapRotation) {
									matrixPointer.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
								}
								matrixPointer.preConcat(pointer[settings.stylesheetPointer].matrix);
								canvas.drawBitmap(pointer[settings.stylesheetPointer].bitmap, matrixPointer, pointerPaint.RED);
							} else if (id == 1 && settings.indicatorPlayer) {
								matrixPointer.reset();
								if (pointer[settings.stylesheetPointer].rotate) {
									matrixPointer.postRotate(yaw);
								}
								matrixPointer.postTranslate((z0 - position[2]) * absZoom, (position[0] - x0) * absZoom);
								if (settings.mapRotation) {
									matrixPointer.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
								}
								matrixPointer.preConcat(pointer[settings.stylesheetPointer].matrix);
								canvas.drawBitmap(pointer[settings.stylesheetPointer].bitmap, matrixPointer, null);
							}
						} else if ((ENTITY_PASSIVE.indexOf(id) >= 0 && settings.indicatorPassive) || (ENTITY_HOSTILE.indexOf(id) >= 0 && settings.indicatorHostile) || (id == 1 && settings.indicatorPlayer)) {
							matrixPointer.reset();
							if (!settings.mapRotation) {
								matrixPointer.postRotate(yaw);
							} else {
								matrixPointer.preRotate(YAW);
							}
							matrixPointer.postTranslate((z0 - position[2]) * absZoom, (position[0] - x0) * absZoom);
							if (settings.mapRotation) {
								matrixPointer.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
							}
							matrixPointer.preConcat(getIconMatrix(id) || getIconMatrix(0));
							canvas.drawBitmap(heads[id] || heads[0], matrixPointer, null);
						}
					}
				}
			}
			
			if (settings.indicatorLocal) {
				if (settings.stylesheetLocalPointer != 3) {
					matrixPointer.reset();
					if (!settings.mapRotation && pointer[settings.stylesheetLocalPointer].rotate) {
						matrixPointer.postRotate(yawNew);
					}
					matrixPointer.postTranslate(settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
					matrixPointer.preConcat(pointer[settings.stylesheetLocalPointer].matrix);
					canvas.drawBitmap(pointer[settings.stylesheetLocalPointer].bitmap, matrixPointer, null)
				} else {
					matrixPointer.reset();
					if (!settings.mapRotation) {
						matrixPointer.postRotate(yawNew);
					}
					matrixPointer.postTranslate(settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
					matrixPointer.preConcat(getIconMatrix(63) || getIconMatrix(1) || getIconMatrix(0));
					canvas.drawBitmap(heads[63] || heads[1] || heads[0], matrixPointer, null)
				}
			}
			
			extendedMarkerLock.acquire();
			for (let element in inScreenExtendedMarkers) {
				let stylesheet = extendedMarkers[element];
				for (let i = 0, c = inScreenExtendedMarkers[element].length; i < c; i++) {
					let matrix = inScreenExtendedMarkers[element][i];
					matrixPointer.reset();
					if (pointer[stylesheet].rotate) {
						matrixPointer.postRotate(yawNew);
					}
					matrixPointer.postTranslate((z0 - matrix[1]) * absZoom, (matrix[0] - x0) * absZoom);
					if (settings.mapRotation) {
						matrixPointer.postRotate(-YAW, settings.locationRawSize * 0.5, settings.locationRawSize * 0.5);
					}
					matrixPointer.preConcat(pointer[stylesheet].matrix);
				}
			}
			extendedMarkerLock.release();
			
			canvas.restore();
			mapView.unlockCanvasAndPost(canvas);
		}
	} catch (e) {
		reportError(e);
	}
};

poolTick = java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
runnableUpdateMap = new java.lang.Runnable(Minimap.drawMinimapWhenDirty);
