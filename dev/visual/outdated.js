if (!settings.ignore_outdate && android.os.Build.VERSION.SDK_INT >= 24) {
	context.runOnUiThread(function() {
		settingsUI(["Minimap", "Accept",
			["keyValue", "text", "Sorry, your version of system is currently not supported. This doesn't mean that you cannot use mod, it just will most likely not work correctly.", ""],
			["keyValue", "text", "Your Android version", "" + (3 + android.os.Build.VERSION.SDK_INT)],
			["keyValue", "text", "Required Android version", "28 or smaller"],
			["checkBox", "ignore_outdate", "Ignore outdate"]]).show();
	});
}