new java.lang.Thread(function() {
	let date = Math.floor(new Date().getTime() / 1000);
	if (settings.priority == 0) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
	} else if (settings.priority == 1) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
	}
	if (settings.updateCheck) {
		var newVersion = loadTxtFromUrl("https://api.github.com/repos/maxfeed/minimap/releases/latest");
		try {
			eval("newVersion = " + newVersion);
		} catch(e) {} finally {
			if (newVersion instanceof Object) {
				settings.updateCheckTime = date;
				let code = parseFloat(newVersion.name);
				if (code > curVersion) {
					settings.updateVersion = new Number(code);
					if (newVersion.body) {
					    let hardcoded = newVersion.body.replace(/\r\n/g, "<br/>");
					    settings.updateChangelog = hardcoded;
					} else {
					    delete settings.updateChangelog;
					}
					saveSettings();
				} else {
					delete settings.updateVersion;
					saveSettings();
					return;
				}
			}
		}
		if (settings.updateVersion instanceof Number) {
			context.runOnUiThread(function() {
				settingsUI(["Minimap", "Close",
					["sectionDivider", "New version available!"],
						["keyValue", "text", "Your version", "" + curVersion.toFixed(1)],
						["keyValue", "text", "Latest version", "" + settings.updateVersion.toFixed(1)],
						["keyValue", "text", (settings.updateChangelog ? "Changes:<br/>" + settings.updateChangelog : "No changes."), "" + settings.updateVersion.toFixed(1)],
						["keyValue", "text", "Install from <a href=https://icmods.mineprogramming.org/mod?id=623>icmods.mineprogramming.org</a>" +
							"<br/>Clone an <a href=https://github.com/MaXFeeD/Minimap/releases/latest>github.com</a> open source code", ""],
						["checkBox", "updateCheck", "Check for updates"]]).show();
			});
		}
	}
}).start();
