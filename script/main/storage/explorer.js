const writeFileText = function(path, text) {
	try {
		if (InnerCorePackage.utils.FileTools.assureFileDir(new java.io.File(path))) {
			InnerCorePackage.utils.FileTools.writeFileText(path, text);
		}
	} catch (e) {
		reportError(e);
	}
};

const readFileText = function(path) {
	try {
		if (InnerCorePackage.utils.FileTools.exists(path)) {
			return "" + InnerCorePackage.utils.FileTools.readFileText(path);
		}
	} catch (e) {
		reportError(e);
	}
	return "";
};

const writeFileBitmap = function(path, bitmap) {
	try {
		InnerCorePackage.utils.FileTools.writeBitmap(path, bitmap);
	} catch (e) {
		reportError(e);
	}
};

const readFileBitmap = function(path) {
	try {
		return InnerCorePackage.utils.FileTools.readFileAsBitmap(path);
	} catch (e) {
		reportError(e);
	}
	return null;
};

const getBitmapExportFolder = function() {
	let path = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_PICTURES);
	if (InnerCorePackage.utils.FileTools.assureDir(path)) {
		if (InnerCorePackage.utils.FileTools.assureDir(path + "/Horizon")) {
			return path + "/Horizon/";
		}
	}
	return getContext().getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES) + "/";
};

const formatTimestamp = function() {
	let date = new java.util.Date(java.lang.System.currentTimeMillis());
	return new java.text.SimpleDateFormat("YYYYMMdd-HHmmss").format(date);
};

const scanMediaFiles = function(pathes, when) {
	try {
		android.media.MediaScannerConnection.scanFile(getContext(), pathes, null, when || null);
	} catch (e) {
		if (World.isWorldLoaded()) {
			Game.message(translate("Failed to scan new media, but files could still be saved"));
		}
		reportError(e);
	}
};

const getBitmapByDescriptor = function(what) {
	if (what instanceof java.io.File) {
		what = android.graphics.BitmapFactory.decodeFile(what);
	}
	if (what == null) {
		return what;
	}
	if (!(what instanceof android.graphics.Bitmap)) {
		return Minimap.decodeBase64Bitmap(what);
	}
	return null;
}; 
