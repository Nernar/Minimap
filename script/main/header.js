/*

   Copyright 2020-2022 Nernar (github.com/nernar)
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

const buttonSize = (function() {
	if (__config__.get("initialization.button_size") == null) {
		__config__.set("initialization.button_size", 40);
		__config__.save();
	}
	return __config__.getNumber("initialization.button_size");
})();

const legacyEntities = (function() {
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
		source = BlockSource.getDefaultForActor(actorUid);
	});
}

const getBlockId = function(x, y, z) {
	if (source != null) {
		return source.getBlockId(x, y, z);
	}
	return World.getBlockID(x, y, z);
};

const getBlockData = function(x, y, z) {
	if (source != null) {
		return source.getBlockData(x, y, z);
	}
	return World.getBlockData(x, y, z);
};

const isChunkLoaded = function(x, z) {
	if (source != null) {
		return source.isChunkLoaded(x, z);
	}
	return World.isChunkLoaded(x, z);
};

const canSeeSky = function(x, y, z) {
	if (source != null) {
		return source.canSeeSky(x, y, z);
	}
	return World.canSeeSky(x, y, z);
};

const GenerationUtils_AdaptedScript = ModAPI.requireGlobal("GenerationUtils");

const findSurface = function(x, y, z) {
	if (GenerationUtils_AdaptedScript === undefined) {
		return GenerationUtils.findSurface(x, y, z).y;
	}
	return GenerationUtils_AdaptedScript.findSurface(x, y, z);
};

let actor = null;
let actorUid = 0;

if (isOutdated == false) {
	Callback.addCallback("LocalPlayerLoaded", function(__actorUid) {
		actor = new PlayerActor(__actorUid);
		actorUid = __actorUid;
	});
}

const getPlayerDimension = function() {
	if (actor != null) {
		return actor.getDimension();
	}
	return Player.getDimension();
};

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
	if (Entity_AdaptedScript === undefined) {
		return Entity.getDimension(entity);
	}
	return Entity_AdaptedScript.getDimension(entity);
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
