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

let policyShowMultiplayerPlayer = true;

const isAcceptableEntity = function(ent) {
	let type = Entity.getType(ent);
	if (type == 1) {
		return policyShowMultiplayerPlayer;
	}
	if (type < ENTITY_IDENTIFIER_RANGE[0] || type > ENTITY_IDENTIFIER_RANGE[1]) {
		return false;
	}
	if (ENTITY_UNACCEPTABLE.indexOf(type) >= 0) {
		return false;
	}
	return true;
};

const NAME = String(__mod__.getInfoProperty("name"));

let curVersion = parseFloat(__mod__.getInfoProperty("version"));

IMPORT("Retention");

const buttonSize = tryout(function() {
	if (__config__.get("initialization.button_size") == null) {
		__config__.set("initialization.button_size", 40);
		__config__.save();
	}
	return __config__.getNumber("initialization.button_size");
}, 40);
const legacyEntities = tryout(function() {
	return __config__.getBool("initialization.use_legacy_entities");
}, false);

let bmpSrc,
	bmpSrcCopy,
	minZoom,
	absZoom,
	poolTick,
	runnableUpdateMap,
	scheduledFutureUpdateMap,
	bmpBorder,
	pathBorder,
	protoConfig;

let canvasBmpSrc = new android.graphics.Canvas(),
	canvasBmpSrcCopy = new android.graphics.Canvas(),
	matrixMap = new android.graphics.Matrix(),
	matrixPointer = new android.graphics.Matrix(),
	bmpSrcLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArrLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArr = [];

const reflectPaintSetColor = function(paint, color) {
	let clazz = getClass(paint).__javaObject__;
	let method = clazz.getMethod("setColor", java.lang.Integer.TYPE);
	method.invoke(paint, java.lang.Integer.valueOf(color));
};
