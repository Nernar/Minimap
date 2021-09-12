function drawBtnBack(width, height) {
	let bmp = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888),
		canvas = new android.graphics.Canvas(bmp),
		paint = new android.graphics.Paint();
	paint.setColor(colors.gray);
	paint.setMaskFilter(new android.graphics.EmbossMaskFilter([1, 1, 0.3], 0.7, 8, 4 * density));
	canvas.drawRect(0, 0, width, height, paint);
	return new android.graphics.drawable.BitmapDrawable(bmp);
}

function decodeBmp(string) {
	string = android.util.Base64.decode(string, 0);
	return android.graphics.BitmapFactory.decodeByteArray(string, 0, string.length);
}

function drawBorderBmp() {
	let bmp = android.graphics.Bitmap.createBitmap(settings.locationSize, settings.locationSize, android.graphics.Bitmap.Config.ARGB_8888),
		canvas = new android.graphics.Canvas(bmp),
		paint = new android.graphics.Paint();
	paint.setMaskFilter(new android.graphics.EmbossMaskFilter([1, 1, 0.3], 0.7, 8, 3 * density));
	switch (settings.stylesheetBorder) {
		case 1:
			paint.setARGB(255, 153, 135, 108);
			break;
		case 2:
			paint.setShader(new android.graphics.LinearGradient(0, 0, settings.locationSize * 0.5, settings.locationSize, colors.primary, colors.accent, android.graphics.Shader.TileMode.REPEAT));
			break;
		default:
			return null;
	}
	canvas.drawPath(createPath(true, true), paint);
	return bmp;
}

function createPath(outer, inner) {
	let path = new android.graphics.Path(),
		size = settings.locationSize;
	path.setFillType(android.graphics.Path.FillType.EVEN_ODD);
	if (settings.stylesheetShape == 1) {
		if (inner) {
			path.addCircle(size / 2, size / 2, size / 2 - (7 * density), android.graphics.Path.Direction.CW);
		}
		if (outer) {
			path.addCircle(size / 2, size / 2, size / 2, android.graphics.Path.Direction.CW);
		}
		return path;
	} else {
		if (inner) {
			path.addRect(7 * density, 7 * density, size - (7 * density), size - (7 * density), android.graphics.Path.Direction.CW);
		}
		if (outer) {
			path.addRect(0, 0, size, size, android.graphics.Path.Direction.CW);
		}
		return path;
	}
}
