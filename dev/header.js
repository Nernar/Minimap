/*
	 __  __ _	   _ __  __			 
	|  \/  (_)	 (_)  \/  |			
	| \  / |_ _ __  _| \  / | __ _ _ __  
	| |\/| | | '_ \| | |\/| |/ _` | '_ \ 
	| |  | | | | | | | |  | | (_| | |_) |
	|_|  |_|_|_| |_|_|_|  |_|\__,_| .__/ 
								  | |	
								  |_|	
   
   Copyright 2015 MxGoldo (twitter.com/MxGoldo)
   Copyright 2020 Nernar (github.com/nernar)

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

let curVersion = 1;

try {
	curVersion = parseFloat(__mod__.getInfoProperty("version"));
} catch(e) {
	Logger.Log("Can't read mod version: " + e.message, "Warning")
}

// interface consts
const context = UI.getContext(),
	density = context.getResources().getDisplayMetrics().density,
	displayHeight = (context.getResources().getDisplayMetrics().widthPixels < context.getResources().getDisplayMetrics().heightPixels) ? context.getResources().getDisplayMetrics().widthPixels : context.getResources().getDisplayMetrics().heightPixels;

// draw variables
let bmpSrc,
	bmpSrcCopy,
	minZoom,
	absZoom,
	poolTick,
	runnableUpdateMap,
	scheduledFutureUpdateMap,
	bmpBorder,
	pathBorder;

// draw fields
let canvasBmpSrc = new android.graphics.Canvas(),
	canvasBmpSrcCopy = new android.graphics.Canvas(),
	matrixMap = new android.graphics.Matrix(),
	matrixPointer = new android.graphics.Matrix(),
	bmpSrcLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArrLock = new java.util.concurrent.Semaphore(1, true),
	delayChunksArr = new Array();
