let scheduledMutableChunks = {};
let scheduledMutableChunkLock = new java.util.concurrent.Semaphore(1, true);

Minimap.scheduleChunkWhenRedraw = function(x, z, delay) {
	scheduledMutableChunkLock.acquire();
	if (!scheduledMutableChunks.hasOwnProperty(x + ":" + z)) {
		scheduledMutableChunks[x + ":" + z] = [x, z, delay || 0];
	}
	scheduledMutableChunkLock.release();
};

Callback.addCallback("DestroyBlock", function(coords, block, actorUid) {
	if (actorUid === undefined || getEntityDimension(actorUid) == DIMENSION) {
		Minimap.scheduleChunkWhenRedraw(Math.floor(coords.x / 16) * 16, Math.floor(coords.z / 16) * 16, 0);
	}
});

if (isOutdated == false) {
	Callback.addCallback("BlockChanged", function(coords, block1, block2, state1, state2, region) {
		Minimap.scheduleChunkWhenRedraw(Math.floor(coords.x / 16) * 16, Math.floor(coords.z / 16) * 16, 0);
	});
	Callback.addCallback("BuildBlock", function(coords, block, actorUid) {
		if (getEntityDimension(actorUid) == DIMENSION) {
			Minimap.scheduleChunkWhenRedraw(Math.floor(coords.x / 16) * 16, Math.floor(coords.z / 16) * 16, 0);
		}
	});
	Callback.addCallback("ItemUseLocal", function(coords, item, block, actorUid) {
		if (getEntityDimension(actorUid) == DIMENSION) {
			Minimap.scheduleChunkWhenRedraw(Math.floor(coords.x / 16) * 16, Math.floor(coords.z / 16) * 16, 1);
		}
	});
} else {
	Callback.addCallback("ItemUse", function(coords) {
		Minimap.scheduleChunkWhenRedraw(Math.floor(coords.x / 16) * 16, Math.floor(coords.z / 16) * 16, 0);
	});
}

Callback.addCallback(isHorizon ? "LocalTick" : "tick", function() {
	if (Updatable.getSyncTime() % 10 == 0) {
		scheduledMutableChunkLock.acquire();
		let updatedChunkCount = 0;
		for (let element in scheduledMutableChunks) {
			Minimap.scheduleChunk(scheduledMutableChunks[element][0],
				scheduledMutableChunks[element][1],
				scheduledMutableChunks[element][2]);
			delete scheduledMutableChunks[element];
			if ((++updatedChunkCount) > 2) {
				break;
			}
		}
		scheduledMutableChunkLock.release();
	}
});
