/*

   Copyright 2020-2024 Nernar (github.com/nernar)
   Copyright 2015 MxGoldo (twitter.com/MxGoldo)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

const ENTITY_IDENTIFIER_RANGE = [10, 127];
const ENTITY_HOSTILE = [32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43,
	44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 57, 58, 59, 104, 105,
	110, 114, 116, 120, 123, 124, 127];
const ENTITY_PASSIVE = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
	21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 36, 74, 75, 102, 108,
	109, 111, 112, 113, 115, 118, 121, 122, 125, 126];
const ENTITY_UNACCEPTABLE = [61, 63, 64, 65, 66, 67, 68, 69, 70,
	71, 72, 73, 76, 77, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
	90, 91, 93, 94, 95, 96, 97, 98, 100, 101, 103, 117];

const isOutdated = (function() {
	try {
		ConfigureMultiplayer({
			isClientOnly: true
		});
	} catch (e) {
		return true;
	}
	return false;
})();

const REVISION = parseFloat(__mod__.getInfoProperty("version"));

IMPORT("Retention");

const InnerCorePackage = isHorizon ? Packages.com.zhekasmirnov.innercore : Packages.zhekasmirnov.launcher;

let buttonSize = (function() {
	if (__config__.get("initialization.button_size") == null || __config__.getNumber("initialization.button_size") <= 0) {
		__config__.set("initialization.button_size", 40);
		__config__.save();
	}
	return __config__.getNumber("initialization.button_size");
})();

buttonSize <= 0 && (buttonSize = 40);

let legacyEntities = (function() {
	if (__config__.get("initialization.use_legacy_entities") == null) {
		__config__.set("initialization.use_legacy_entities", false);
		__config__.save();
	}
	return __config__.getBool("initialization.use_legacy_entities");
})();

let bmpSrc,
	bmpSrcCopy,
	minZoom,
	absZoom,
	poolTick,
	runnableUpdateMap,
	scheduledFutureUpdateMap,
	bmpBorder,
	pathBorder;

let canvasBmpSrc = new android.graphics.Canvas(),
	canvasBmpSrcCopy = new android.graphics.Canvas(),
	matrixMap = new android.graphics.Matrix(),
	matrixPointer = new android.graphics.Matrix(),
	mapRefreshingLock = new java.util.concurrent.Semaphore(1, true),
	bmpSrcLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArrLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArr = [];

const reflectPaintSetColor = (function() {
	let clazz = android.graphics.Paint.__javaObject__;
	let method = clazz.getMethod("setColor", java.lang.Integer.TYPE);
	return function(paint, color) {
		method.invoke(paint, java.lang.Integer.valueOf(color));
	};
})();

const reflectNewLinearGradient = (function() {
	let clazz = android.graphics.LinearGradient.__javaObject__;
	let reflect = clazz.getConstructor(java.lang.Float.TYPE, java.lang.Float.TYPE, java.lang.Float.TYPE,
		java.lang.Float.TYPE, java.lang.Integer.TYPE, java.lang.Integer.TYPE, android.graphics.Shader.TileMode);
	return function(x0, y0, x1, y1, color0, color1, tile) {
		return reflect.newInstance(java.lang.Float.valueOf(x0), java.lang.Float.valueOf(y0), java.lang.Float.valueOf(x1),
			java.lang.Float.valueOf(y1), java.lang.Integer.valueOf(color0), java.lang.Integer.valueOf(color1), tile);
	};
})();

const reflectColorRgb = (function() {
	let clazz = android.graphics.Color.__javaObject__;
	let method = clazz.getMethod("rgb", java.lang.Integer.TYPE, java.lang.Integer.TYPE, java.lang.Integer.TYPE);
	return function(r, g, b) {
		return method.invoke(null, java.lang.Integer.valueOf(r), java.lang.Integer.valueOf(g), java.lang.Integer.valueOf(b));
	};
})();

let source = null;

if (isOutdated == false) {
	Callback.addCallback("LocalPlayerChangedDimension", function(actorUid, currentId, lastId) {
		if (!Network.inRemoteWorld()) {
			if ((source = BlockSource.getDefaultForActor(actorUid)) != null) {
				return;
			}
		}
		source = BlockSource.getCurrentClientRegion();
	});
}

const isChunkLoaded = function(x, z) {
	if (isHorizon) {
		return World.isChunkLoaded(x, z);
	}
	return World.isChunkLoadedAt(x * 16, 0, z * 16);
};

const getBiomeTemperatureAt = function(x, y, z) {
	if (source != null) {
		return source.getBiomeTemperatureAt(x, y, z);
	}
	if (isHorizon) {
		return World.getTemperature(x, y, z);
	}
	return 0.5;
};

const getBiomeDownfallAt = function(x, y, z) {
	if (source != null) {
		return source.getBiomeDownfallAt(x, y, z);
	}
	return 0.5;
};

const Block_AdaptedScript = ModAPI.requireGlobal("Block");

const getMapColor = function(id, data) {
	try {
		if (Block_AdaptedScript === undefined) {
			return Block.getMapColor(id);
		}
		return Block_AdaptedScript.getMapColor(id);
	} catch (e) {
		return colormap[id] ? (colormap[id][data] || colormap[id][0] || 0) : -1;
	}
};

const GenerationUtils_AdaptedScript = ModAPI.requireGlobal("GenerationUtils");

const findSurface = function(x, y, z) {
	let delta = 8;
	do {
		let block = World.getBlockID(x, y, z);
		if (block != 0) {
			if (delta == 8) {
				delta = 1;
				y += 8;
			} else {
				if (!settings.mapSmoothing || smoothingDot[settings.mapSmoothing](block)) {
					return y;
				}
			}
		}
	} while ((y -= delta) > 0);
	return 0;
};

const findSurfaceUnderSky = function(x, y, z) {
	let low = 0;
	while (low <= y) {
		let mid = Math.floor((low + y) / 2);
		if (World.canSeeSky(x, mid, z)) {
			if (mid === 0 || !World.canSeeSky(x, mid - 1, z)) {
				return mid !== 0 ? mid - 1 : 256;
			} else {
				y = mid - 1;
			}
		} else {
			low = mid + 1;
		}
	}
	return 0;
};

let actorUid = 0;

if (isOutdated == false) {
	Callback.addCallback("LocalPlayerLoaded", function(playerUid) {
		actorUid = playerUid;
	});
}

const Entity_AdaptedScript = ModAPI.requireGlobal("Entity");

const getEntityPosition = function(entity) {
	if (Entity_AdaptedScript === undefined) {
		let position = Entity.getPosition(entity);
		return [position.x, position.y, position.z];
	}
	return Entity_AdaptedScript.getPosition(entity);
};

const getEntityYaw = function(entity) {
	if (Entity_AdaptedScript === undefined) {
		return Entity.getLookAngle(entity).yaw * 180 / Math.PI;
	}
	return Entity_AdaptedScript.getYaw(entity);
};

const getEntityDimension = function(entity) {
	if (isHorizon) {
		if (Entity_AdaptedScript === undefined) {
			return Entity.getDimension(entity);
		}
		return Entity_AdaptedScript.getDimension(entity);
	}
	return dimensionNew != null ? dimensionNew : Player.getDimension();
};

const getEntityType = function(entity) {
	if (Entity.hasOwnProperty("getTypeAddon")) {
		let name = Entity.getTypeAddon(entity);
		if (!(name == null || name.startsWith("minecraft:"))) {
			return name;
		}
	}
	if (Entity_AdaptedScript === undefined) {
		return Entity.getType(entity);
	}
	return Entity_AdaptedScript.getEntityTypeId(entity);
};

const getPlayerPosition = function() {
	if (actorUid != 0) {
		return getEntityPosition(actorUid);
	}
	return getEntityPosition(Player.get());
};

const getPlayerYaw = function() {
	if (actorUid != 0) {
		return getEntityYaw(actorUid);
	}
	return getEntityYaw(Player.get());
};
