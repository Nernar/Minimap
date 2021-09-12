/*
if (!settings.outdateIgnore && android.os.Build.VERSION.SDK_INT >= 29) {
	context.runOnUiThread(function() {
		settingsUI(["Minimap", "Accept",
			["keyValue", "text", "Sorry, your version of system is currently not supported. This doesn't mean that you cannot use mod, it just will most likely not work correctly.", ""],
			["keyValue", "text", "Your Android version", "" + android.os.Build.VERSION.SDK_INT],
			["keyValue", "text", "Required Android version", "28 or smaller"],
			["checkBox", "outdateIgnore", "Ignore outdate"]]).show();
	});
}
*/

context.runOnUiThread(function() {
	context.getWindow().setFlags(
		android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
		android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
});
