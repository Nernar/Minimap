new java.lang.Thread(function() {
	let date = Math.floor(new Date().getTime() / 1000);
	if (settings.priority == 0) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
	} else if (settings.priority == 1) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
	}
	if (settings.checkNewestVersion) {
		var newVersion = readUrl("https://api.github.com/repos/nernar/minimap/releases/latest");
		try {
			newVersion = JSON.parse(newVersion);
			// eval("newVersion = " + newVersion);
		} catch(e) {
			newVersion = Number.MAX_SAFE_INTEGER;
		} finally {
			if (typeof newVersion != "number") {
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
		if (typeof settings.updateVersion == "number") {
			handle(function() {
				settingsUI([NAME, "Maybe later",
					["sectionDivider", "New version availabled!"],
						["keyValue", "text", "Your version", "" + curVersion.toFixed(1)],
						["keyValue", "text", "Latest version", "" + settings.updateVersion.toFixed(1)],
						["keyValue", "text", (settings.updateChangelog ? settings.updateChangelog : "No changes."), "Changelog"],
					["sectionDivider", "Download update"],
						["keyValue", "text", "Install from <a href=https://icmods.mineprogramming.org/mod?id=623>icmods.mineprogramming.org</a>" +
							"<br/>Clone <a href=https://github.com/Nernar/Minimap/releases/latest>github.com</a> open source code", ""],
						["checkBox", "checkNewestVersion", "Check for updates"]]).show();
			});
		}
	}
}).start();
