const save = function(path, filename, content) {
	try {
		if (InnerCorePackage.utils.FileTools.assureDir(path)) {
			InnerCorePackage.utils.FileTools.writeFileText(path + filename, content);
		}
	} catch (e) {
		reportError(e);
	}
};

const load = function(path, filename) {
	try {
		if (InnerCorePackage.utils.FileTools.exists(path + filename)) {
			return "" + InnerCorePackage.utils.FileTools.readFileText(path + filename);
		}
	} catch (e) {
		reportError(e);
	}
	return "";
};
