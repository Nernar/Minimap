new java.lang.Thread(function() {
	let date = Math.floor(new Date().getTime() / 1000);
	if (settings.priority == 0) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
	} else if (settings.priority == 1) {
		android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_FOREGROUND);
	}
	if (Math.floor(settings.updateCheckTime / 86400) < Math.floor(date / 86400) && settings.updateCheck) {
		let newVersion = loadTxtFromUrl("https://api.github.com/repos/maxfeed/minimap/releases/latest");
		alert("newVersion: " + newVersion);
		try {
			newVersion = eval(newVersion);
		} catch(e) {
			return;
		} finally {
			if (!newVersion) {
				alert("not parsed");
				return;
			}
			settings.updateCheckTime = date;
			let code = parseFloat(newVersion.name)
			if (code > curVersion) {
				settings.updateVersion = code;
			} else {
				alert("current version updated");
				delete settings.updateVersion;
				return;
			}
			if (newVersion.body) {
				let hardcoded = newVersion.body.replace("\r\n", "<br/>");
				settings.updateChangelog = hardcoded;
			} else {
				delete settings.updateChangelog;
			}
			saveSettings();
		}
	}
	if (settings.updateVersion > curVersion && settings.updateCheck) {
		context.runOnUiThread(function() {
			settingsUI(["Minimap", "Close",
				["keyValue", "text", "New version available!<br/>Your version: " + curVersion.toFixed(1) + "<br/>Latest version: " + settings.updateVersion.toFixed(1) + "<br/>" +
					(settings.updateChangelog ? "<br/>Changes:<br/>" + settings.updateChangelog : "") + "Install from <a href=https://icmods.mineprogramming.org/mod?id=623>icmods.mineprogramming.org</a>" +
					"<br/>Clone <a href=https://github.com/MaXFeeD/Minimap/releases/latest>github.com</a> opensource", ""],
				["checkBox", "updateCheck", "Check for updates"]]).show();
		});
	}
	alert("finished");
}).start();