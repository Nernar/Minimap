const save = function(path, filename, content) {
	tryout(function() {
		if (InnerCorePackage.utils.FileTools.assureDir(path)) {
			InnerCorePackage.utils.FileTools.writeFileText(path + filename, content);
		}
	});
};

const load = function(path, filename) {
	if (InnerCorePackage.utils.FileTools.exists(path + filename)) {
		return InnerCorePackage.utils.FileTools.readFileText(path + filename);
	}
	return "";
};

const readUrl = function(url) {
	return tryout(function() {
		return InnerCorePackage.api.mod.adaptedscript.PreferencesWindowAPI.Network.getURLContents(url);
	}, "");
};
