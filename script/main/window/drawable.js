Minimap.decodeBase64Bitmap = function(string) {
	if (android.os.Build.VERSION.SDK_INT >= 26) {
		string = java.util.Base64.getDecoder().decode(new java.lang.String(string).getBytes());
	} else {
		string = android.util.Base64.decode(new java.lang.String(string).getBytes(), android.util.Base64.NO_WRAP);
	}
	return android.graphics.BitmapFactory.decodeByteArray(string, 0, string.length);
};

Minimap.drawBorderBitmap = function() {
	let bitmap = android.graphics.Bitmap.createBitmap(settings.locationRawSize,
			settings.locationRawSize, android.graphics.Bitmap.Config.ARGB_8888),
		canvas = new android.graphics.Canvas(bitmap),
		paint = new android.graphics.Paint();
	paint.setAntiAlias(false);
	paint.setFilterBitmap(false);
	paint.setMaskFilter(new android.graphics.EmbossMaskFilter([1, 1, 0.3], 0.7, 8, 3 * getDisplayDensity()));
	switch (settings.stylesheetBorder) {
		case 1:
			paint.setARGB(255, 153, 135, 108);
			break;
		case 2:
			paint.setShader(reflectNewLinearGradient(0, 0, settings.locationRawSize * 0.5, settings.locationRawSize,
				Colors.PRIMARY, Colors.ACCENT, android.graphics.Shader.TileMode.REPEAT));
			break;
		default:
			return null;
	}
	canvas.drawPath(Minimap.createHardcodedPath(true, true), paint);
	return bitmap;
};

Minimap.createHardcodedPath = function(outer, inner) {
	let path = new android.graphics.Path();
	path.setFillType(android.graphics.Path.FillType.EVEN_ODD);
	if (settings.stylesheetShape == 1) {
		if (inner) {
			path.addCircle(settings.locationRawSize / 2, settings.locationRawSize / 2,
				settings.locationRawSize / 2 - (7 * getDisplayDensity()), android.graphics.Path.Direction.CW);
		}
		if (outer) {
			path.addCircle(settings.locationRawSize / 2, settings.locationRawSize / 2,
				settings.locationRawSize / 2, android.graphics.Path.Direction.CW);
		}
		return path;
	}
	if (inner) {
		path.addRect(7 * getDisplayDensity(), 7 * getDisplayDensity(), settings.locationRawSize - (7 * getDisplayDensity()),
			settings.locationRawSize - (7 * getDisplayDensity()), android.graphics.Path.Direction.CW);
	}
	if (outer) {
		path.addRect(0, 0, settings.locationRawSize, settings.locationRawSize, android.graphics.Path.Direction.CW);
	}
	return path;
};
