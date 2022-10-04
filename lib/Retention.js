/*
BUILD INFO:
  dir: Retention
  target: Retention.js
  files: 2
*/



// file: header.js

/*

   Copyright 2017-2022 Nernar (github.com/nernar)

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

LIBRARY({
	name: "Retention",
	version: 1,
	api: "AdaptedScript",
	shared: true
});




// file: integration.js

launchTime = Date.now();
EXPORT("launchTime", launchTime);

isHorizon = (function() {
	let version = MCSystem.getInnerCoreVersion();
	return parseInt(version.toString()[0]) >= 2;
})();
EXPORT("isHorizon", isHorizon);

EXPORT("minecraftVersion", (function() {
	let version = MCSystem.getMinecraftVersion();
	return parseInt(version.toString().split(".")[1]);
})());

getContext = function() {
	return UI.getContext();
};

EXPORT("getContext", getContext);

/**
 * Error display window, possibly in particular,
 * useful for visualizing and debugging problems.
 * @param {Object} error fallback exception
 */
reportError = (function(what) {
	EXPORT("registerReportAction", function(when) {
		what = when;
	});
	return function(error) {
		if (what) {
			what(error);
		}
	};
})(function(error) {
	try {
		if (isHorizon) {
			Packages.com.zhekasmirnov.innercore.api.log.ICLog.i("WARNING", Packages.com.zhekasmirnov.innercore.api.log.ICLog.getStackTrace(error));
		} else {
			Packages.zhekasmirnov.launcher.api.log.ICLog.i("WARNING", Packages.zhekasmirnov.launcher.api.log.ICLog.getStackTrace(error));
		}
	} catch (shit) {
		try {
			Logger.Log(typeof error == "object" ? error.name + ": " + error.message + "\n" + error.stack : "" + error, "WARNING");
		} catch (sad) {
			Logger.Log("" + error, "WARNING");
		}
	}
});

EXPORT("reportError", reportError);

/**
 * Displays a log window for user whether it is
 * needed or not. On latest versions, number of such
 * windows on screen is limited for performance reasons.
 * @param {string} message additional information
 * @param {string} title e.g. mod name
 * @param {function} [fallback] when too much dialogs
 */
EXPORT("showReportDialog", function(message, title, fallback) {
	if (isHorizon) {
		try {
			Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title, fallback || null);
		} catch (e) {
			Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title);
		}
	} else {
		Packages.zhekasmirnov.launcher.api.log.DialogHelper.openFormattedDialog("" + message, "" + title);
	}
});

/**
 * invoke(what, when => (th)): any
 * invokeRuntime(what, when => (th)): any
 * invokeRhino(what, when => (th)): any
 */
EXPORT("resolveThrowable", (function() {
	let decodeBase64 = function(base64) {
		if (android.os.Build.VERSION.SDK_INT >= 26) {
			return java.util.Base64.getDecoder().decode(java.lang.String(base64).getBytes());
		}
		return android.util.Base64.decode(java.lang.String(base64).getBytes(), android.util.Base64.NO_WRAP);
	};
	let bytes = decodeBase64("ZGV4CjAzNQA7yC65zIj/irByxZUNv+ejN5SKUkKw3cq4CgAAcAAAAHhWNBIAAAAAAAAAAAwKAAAoAAAAcAAAABQAAAAQAQAADAAAAGABAAABAAAA8AEAABMAAAD4AQAAAQAAAJACAAAICAAAsAIAALACAAC6AgAAwgIAAMUCAADJAgAAzgIAANQCAADbAgAAAAMAABMDAAA3AwAAWwMAAH0DAACgAwAAtAMAANIDAADmAwAA/QMAACgEAABXBAAAcwQAAJUEAAC4BAAA4QQAAAYFAAAeBQAAIQUAACUFAAA5BQAATgUAAG0FAABzBQAApwUAALAFAAC8BQAAxwUAANcFAADfBQAA7AUAAPsFAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAAFAAAABUAAAAWAAAAFwAAABkAAAAbAAAAHAAAAAMAAAABAAAAOAYAAAQAAAAGAAAAZAYAAAYAAAAGAAAAWAYAAAQAAAAGAAAASAYAAAUAAAAGAAAALAYAAAIAAAAIAAAAAAAAAAQAAAAMAAAAQAYAAAIAAAANAAAAAAAAAAIAAAAQAAAAAAAAABkAAAARAAAAAAAAABoAAAARAAAAOAYAABoAAAARAAAAUAYAAAAADAAdAAAAAAAJAAAAAAAAAAkAAQAAAAAABwAdAAAAAAADACQAAAAAAAQAJAAAAAAAAwAlAAAAAAAEACUAAAAAAAMAJgAAAAAABAAmAAAAAQAAACAAAAABAAYAIgAAAAQACgABAAAABgAJAAEAAAAJAAUAIQAAAAoACwABAAAADAABACQAAAAOAAIAHgAAAA4ACAAjAAAAEAAIACMAAAAAAAAAAQAAAAYAAAAAAAAAGAAAAAAAAADcCQAAAAAAAAg8Y2xpbml0PgAGPGluaXQ+AAFMAAJMTAADTExMAARMTExMAAVMTExMTAAjTGlvL25lcm5hci9yaGluby9UaHJvd2FibGVSZXNvbHZlcjsAEUxqYXZhL2xhbmcvQ2xhc3M7ACJMamF2YS9sYW5nL0NsYXNzTm90Rm91bmRFeGNlcHRpb247ACJMamF2YS9sYW5nL0lsbGVnYWxBY2Nlc3NFeGNlcHRpb247ACBMamF2YS9sYW5nL05vQ2xhc3NEZWZGb3VuZEVycm9yOwAhTGphdmEvbGFuZy9Ob1N1Y2hNZXRob2RFeGNlcHRpb247ABJMamF2YS9sYW5nL09iamVjdDsAHExqYXZhL2xhbmcvUnVudGltZUV4Y2VwdGlvbjsAEkxqYXZhL2xhbmcvU3RyaW5nOwAVTGphdmEvbGFuZy9UaHJvd2FibGU7AClMamF2YS9sYW5nL1Vuc3VwcG9ydGVkT3BlcmF0aW9uRXhjZXB0aW9uOwAtTGphdmEvbGFuZy9yZWZsZWN0L0ludm9jYXRpb25UYXJnZXRFeGNlcHRpb247ABpMamF2YS9sYW5nL3JlZmxlY3QvTWV0aG9kOwAgTG9yZy9tb3ppbGxhL2phdmFzY3JpcHQvQ29udGV4dDsAIUxvcmcvbW96aWxsYS9qYXZhc2NyaXB0L0Z1bmN0aW9uOwAnTG9yZy9tb3ppbGxhL2phdmFzY3JpcHQvUmhpbm9FeGNlcHRpb247ACNMb3JnL21vemlsbGEvamF2YXNjcmlwdC9TY3JpcHRhYmxlOwAWVGhyb3dhYmxlUmVzb2x2ZXIuamF2YQABVgACVkwAEltMamF2YS9sYW5nL0NsYXNzOwATW0xqYXZhL2xhbmcvT2JqZWN0OwAdYXNzdXJlQ29udGV4dEZvckN1cnJlbnRUaHJlYWQABGNhbGwAMmNvbS56aGVrYXNtaXJub3YuaW5uZXJjb3JlLm1vZC5leGVjdXRhYmxlLkNvbXBpbGVyAAdmb3JOYW1lAApnZXRNZXNzYWdlAAlnZXRNZXRob2QADmdldFBhcmVudFNjb3BlAAZpbnZva2UAC2ludm9rZVJoaW5vAA1pbnZva2VSdW50aW1lAC16aGVrYXNtaXJub3YubGF1bmNoZXIubW9kLmV4ZWN1dGFibGUuQ29tcGlsZXIAAAADAAAAEAAOAA4AAAABAAAACAAAAAIAAAAIABIAAgAAAA4ADgABAAAACQAAAAQAAAANABAAEAATAAIAAAAGABMAAAAAABAABw4BERcCdx3FadN6AntoAEcABw4AHwAHDgEQEGYALgIAAAcOACcDAAAABywBERAbagBGAgAABw4APwMAAAAHLAEREBtqADoCAAAHDgAzAwAAAAcsAREQG2oAAwAAAAMAAwBwBgAAQAAAABoAHwBxEAkAAAAMABoBHQASAiMiEgBuMAoAEAIMAGkAAAAOAA0AIgEEAG4QDQAAAAwAcCALAAEAJwENABoAJwBxEAkAAAAMABoBHQASAiMiEgBuMAoAEAIMAGkAAAAo4g0AIgEKAHAgDgABACcBDQAiAQoAcCAOAAEAJwENACjyAAAAAAUAAQAGAAAAFwAIAB4AAAARAA0AAwMCEgQdBTcCBB0FNwICMAU+AAABAAEAAQAAAIIGAAAEAAAAcBAMAAAADgADAAAAAwABAIcGAAAYAAAAYgEAABIAHwAGABICIyITAG4wDwABAgwAHwANABEADQAiAQoAcCAOAAEAJwENACj5AAAAAA4AAQABAgsWAw8AAAMAAgADAAAAkAYAAAkAAAByEBEAAQAMAHEwBAAQAgwAEQAAAAgAAwAFAAEAlwYAADIAAAASARIEcQACAAAADAI4BQ4AchASAAUADAASAyMzEwByUxAAJlAMABEAEgAfABAAKPUNAAcCcQACAAAADAM4BRAAchASAAUADAASESMREwBNAgEEclEQADdQDAAo5gcQHwAQACjzAgAAABUAAQABAQkYAwACAAMAAACkBgAACQAAAHIQEQABAAwAcTAEABACDAARAAAACAADAAUAAQCrBgAAMgAAABIBEgRxAAIAAAAMAjgFDgByEBIABQAMABIDIzMTAHJTEAAmUAwAEQASAB8AEAAo9Q0ABwJxAAIAAAAMAzgFEAByEBIABQAMABIRIxETAE0CAQRyURAAN1AMACjmBxAfABAAKPMCAAAAFQABAAEBDxgDAAIAAwAAALgGAAAJAAAAchARAAEADABxMAQAEAIMABEAAAAIAAMABQABAL8GAAAyAAAAEgESBHEAAgAAAAwCOAUOAHIQEgAFAAwAEgMjMxMAclMQACZQDAARABIAHwAQACj1DQAHAnEAAgAAAAwDOAUQAHIQEgAFAAwAEhEjERMATQIBBHJREAA3UAwAKOYHEB8AEAAo8wIAAAAVAAEAAQEHGAEACQAAGgCYgATMDQGBgASIDwEKoA8BCfAPAQmUEAEJlBEBCbgRAQm4EgEJ3BIAAA4AAAAAAAAAAQAAAAAAAAABAAAAKAAAAHAAAAACAAAAFAAAABABAAADAAAADAAAAGABAAAEAAAAAQAAAPABAAAFAAAAEwAAAPgBAAAGAAAAAQAAAJACAAACIAAAKAAAALACAAABEAAABwAAACwGAAADEAAAAQAAAGwGAAADIAAACQAAAHAGAAABIAAACQAAAMwGAAAAIAAAAQAAANwJAAAAEAAAAQAAAAwKAAA=");
	return java.lang.Class.forName("io.nernar.rhino.ThrowableResolver", false, (function() {
		if (android.os.Build.VERSION.SDK_INT >= 26) {
			let buffer = java.nio.ByteBuffer.wrap(bytes);
			return new Packages.dalvik.system.InMemoryDexClassLoader(buffer, getContext().getClassLoader());
		}
		let dex = new java.io.File(__dir__ + ".dex/0");
		dex.getParentFile().mkdirs();
		dex.createNewFile();
		let stream = new java.io.FileOutputStream(dex);
		stream.write(bytes);
		stream.close();
		return new Packages.dalvik.system.PathClassLoader(dex.getPath(), getContext().getClassLoader());
	})()).newInstance();
})());

/**
 * Delays the action in the interface
 * thread for the required time.
 * @param {function} action action
 * @param {number} [time] expectation
 */
EXPORT("handle", function(action, time) {
	let self = this;
	getContext().runOnUiThread(function() {
		new android.os.Handler().postDelayed(function() {
			try {
				if (action) {
					action.call(self);
				}
			} catch (e) {
				reportError(e);
			}
		}, time >= 0 ? time : 0);
	});
});

/**
 * Delays the action in the interface and
 * async waiting it in current thread.
 * @param {function} action action
 * @param {any} [fallback] default value
 * @returns {any} action result or default
 */
EXPORT("acquire", function(action, fallback) {
	let self = this;
	let completed = false;
	getContext().runOnUiThread(function() {
		try {
			if (action) {
				let value = action.call(self);
				if (value !== undefined) {
					fallback = value;
				}
			}
		} catch (e) {
			reportError(e);
		}
		completed = true;
	});
	while (!completed) {
		java.lang.Thread.yield();
	}
	return fallback;
});

/**
 * Processes some action, that can be
 * completed in foreground or background.
 * @param {function} action action
 * @param {number} [priority] number between 1-10
 * @returns {java.lang.Thread} thread
 */
EXPORT("handleThread", (function() {
	let stack = [];
	EXPORT("interruptThreads", function() {
		while (stack.length > 0) {
			let thread = stack.shift();
			if (!thread.isInterrupted()) {
				thread.interrupt();
			}
		}
	});
	return function(action, priority) {
		let self = this;
		let thread = new java.lang.Thread(function() {
			try {
				if (action) {
					action.call(self);
				}
			} catch (e) {
				reportError(e);
			}
			let index = stack.indexOf(thread);
			if (index != -1) stack.splice(index, 1);
		});
		stack.push(thread);
		if (priority !== undefined) {
			thread.setPriority(priority);
		}
		thread.start();
		return thread;
	};
})());

/**
 * Generates a random number from minimum to
 * maximum value. If only the first is indicated,
 * generation will occur with a probability of
 * one less than a given number.
 * @param {number} min minimum number
 * @param {number} [max] maximum number
 * @returns {number} random number
 */
EXPORT("random", function(min, max) {
	max == undefined && (max = min - 1, min = 0);
	return Math.floor(Math.random() * (max - min + 1) + min);
});

/**
 * Returns the difference between the current time
 * and the start time of the library.
 */
EXPORT("getTime", function() {
	return Date.now() - launchTime;
});

/**
 * Translates exiting at launcher strokes,
 * replaces and formats [[%s]] arguments.
 * @param {string} str stroke to translate
 * @param {string|Array} [args] argument(s) to replace
 * @returns {string} translated stroke
 */
EXPORT("translateCounter", (function() {
	let translate = function(str, args) {
		try {
			str = Translation.translate(str);
			if (args !== undefined) {
				if (!Array.isArray(args)) {
					args = [args];
				}
				args = args.map(function(value) {
					return "" + value;
				});
				str = java.lang.String.format(str, args);
			}
			return "" + str;
		} catch (e) {
			return "" + str;
		}
	};
	EXPORT("translate", translate);
	let isNumeralVerb = function(count) {
		if (count < 0) count = Math.abs(count);
		return count % 10 == 1 && count % 100 != 11;
	};
	EXPORT("isNumeralVerb", isNumeralVerb);
	let isNumeralMany = function(count) {
		if (count < 0) count = Math.abs(count);
		return count % 10 == 0 || count % 10 >= 5 || count % 100 - count % 10 == 10;
	};
	EXPORT("isNumeralMany", isNumeralMany);
	return function(count, whenZero, whenVerb, whenLittle, whenMany, args) {
		try {
			if (args !== undefined) {
				if (!Array.isArray(args)) {
					args = [args];
				}
			} else args = [count];
			if (!(count == 0 || isNumeralMany(count))) {
				let stroke = "" + count;
				stroke = stroke.substring(0, stroke.length - 2);
				args = args.map(function(value) {
					if (value == count) {
						return stroke;
					}
					return value;
				});
			}
			return translate(count == 0 ? whenZero : isNumeralVerb(count) ? whenVerb :
				isNumeralMany(count) ? whenMany : whenLittle, args);
		} catch (e) {
			reportError(e);
		}
		return translate(whenZero, args);
	};
})());

EXPORT("getDecorView", function() {
	return getContext().getWindow().getDecorView();
});

(function() {
	let display = getContext().getWindowManager().getDefaultDisplay();
	let getDisplayWidth = function() {
		return Math.max(display.getWidth(), display.getHeight());
	};
	EXPORT("getDisplayWidth", getDisplayWidth);
	EXPORT("getDisplayPercentWidth", function(x) {
		return Math.round(getDisplayWidth() / 100 * x);
	});
	let getDisplayHeight = function() {
		return Math.min(display.getWidth(), display.getHeight());
	};
	EXPORT("getDisplayHeight", getDisplayHeight);
	EXPORT("getDisplayPercentHeight", function(y) {
		return Math.round(getDisplayHeight() / 100 * y);
	});
	let metrics = getContext().getResources().getDisplayMetrics();
	EXPORT("getDisplayDensity", function() {
		return metrics.density;
	});
	EXPORT("getRelativeDisplayPercentWidth", function(x) {
		return Math.round(getDisplayWidth() / 100 * x / metrics.density);
	});
	EXPORT("getRelativeDisplayPercentHeight", function(y) {
		return Math.round(getDisplayHeight() / 100 * y / metrics.density);
	});
	EXPORT("toComplexUnitDip", function(value) {
		return android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, value, metrics);
	});
	EXPORT("toComplexUnitSp", function(value) {
		return android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_SP, value, metrics);
	});
})();

/**
 * For caching, you must use the check amount
 * files and any other content, the so-called hashes.
 */
EXPORT("toDigestMd5", (function(){
	let digest = java.security.MessageDigest.getInstance("md5");
	return function(bytes) {
		digest.update(bytes);
		let byted = digest.digest()
		let sb = new java.lang.StringBuilder();
		for (let i = 0; i < byted.length; i++) {
			sb.append(java.lang.Integer.toHexString(0xFF & byted[i]));
		}
		return sb.toString();
	};
})());

/**
 * @requires Requires evaluation in interface thread.
 * Uses device vibrator service to make vibration.
 * @param {number} milliseconds to vibrate
 */
EXPORT("vibrate", (function() {
	let service = getContext().getSystemService(android.content.Context.VIBRATOR_SERVICE);
	return function(ms) {
		return service.vibrate(ms);
	};
})());




