let pointerPaint = {
	RED: (function() {
		let paint = new android.graphics.Paint();
		paint.setColorFilter(new android.graphics.LightingColorFilter(android.graphics.Color.RED, 0));
		return paint;
	})(),
	GREEN: (function() {
		let paint = new android.graphics.Paint();
		paint.setColorFilter(new android.graphics.LightingColorFilter(android.graphics.Color.GREEN, 0));
		return paint;
	})()
};

const Pointer = function(bmp, matrix, rotate) {
	this.bmp = bmp;
	this.matrix = matrix;
	this.rotate = rotate;
};

const MatrixPointer = function(bmp, matrix, rotate) {
	Pointer.call(this, bmp, matrix(bmp), rotate);
};

MatrixPointer.prototype = new Pointer;

let pointer = [
	new Pointer(
		(function() {
			let paint = new android.graphics.Paint(),
				bmp = android.graphics.Bitmap.createBitmap(displayHeight * 0.1, displayHeight * 0.1, android.graphics.Bitmap.Config.ARGB_8888),
				canvas = new android.graphics.Canvas(bmp);
			paint.setColor(colors.black);
			canvas.drawLines([0, displayHeight * 0.05, displayHeight * 0.1, displayHeight * 0.05, displayHeight * 0.05, 0, displayHeight * 0.05, displayHeight * 0.1], paint);
			return bmp;
		})(),
		(function() {
			let matrix = new android.graphics.Matrix();
			matrix.setTranslate(-displayHeight * 0.05, -displayHeight * 0.05);
			return matrix;
		})(),
		false
	),
	new Pointer(
		(function() {
			let path = new android.graphics.Path(),
				paint = new android.graphics.Paint(),
				bmp = android.graphics.Bitmap.createBitmap(displayHeight * 0.025, displayHeight * 0.025, android.graphics.Bitmap.Config.ARGB_8888),
				canvas = new android.graphics.Canvas(bmp);
			path.moveTo(displayHeight * 0.0125, 0);
			path.lineTo(0, displayHeight * 0.025);
			path.lineTo(displayHeight * 0.0125, displayHeight * 0.015);
			path.lineTo(displayHeight * 0.025, displayHeight * 0.025);
			path.close();
			paint.setColor(colors.white);
			canvas.drawPath(path, paint);
			paint.setColor(colors.black);
			paint.setStyle(android.graphics.Paint.Style.STROKE);
			canvas.drawPath(path, paint);
			return bmp;
		})(),
		(function() {
			let matrix = new android.graphics.Matrix();
			matrix.setTranslate(-displayHeight * 0.0125, 0);
			return matrix;
		})(),
		true
	),
	new MatrixPointer(
		android.graphics.BitmapFactory.decodeFile(__dir__ + "resource/arrow.png"),
		function(bitmap) {
			let dx = bitmap.getWidth() / 5,
				dy = bitmap.getHeight() / 7,
				matrix = new android.graphics.Matrix();
			matrix.setTranslate(-2.5 * dx, -4.5 * dy);
			matrix.postScale(displayHeight * 0.005 / dx, displayHeight * 0.005 / dy);
			return matrix;
		},
		true
	),
	new MatrixPointer(
		android.graphics.BitmapFactory.decodeFile(__dir__ + "resource/chest.png"),
		function(bitmap) {
			let dx = bitmap.getWidth() / 16,
				dy = bitmap.getHeight() / 16,
				matrix = new android.graphics.Matrix();
			matrix.setTranslate(-8 * dx, -8 * dy);
			matrix.postScale(displayHeight * 0.0012 / dx, displayHeight * 0.0012 / dy);
			return matrix;
		},
		false
	)
];

let arrow = android.graphics.BitmapFactory.decodeFile(__dir__ + "resource/head.png");

const headArrow = function(string) {
	return createHeadInArrow(decodeBmp(string));
};

const createHeadInArrow = function(bitmap) {
	let dx = bitmap.getWidth() * 1.125,
		dy = bitmap.getHeight() * 1.4375,
		source = android.graphics.Bitmap.createBitmap(dx, dy, android.graphics.Bitmap.Config.ARGB_8888),
		scaled = android.graphics.Bitmap.createScaledBitmap(arrow, dx, dy, false),
		canvas = new android.graphics.Canvas(source);
	canvas.drawBitmap(scaled, 0, 0, null);
	canvas.drawBitmap(bitmap, 1 * (dx / 18), 6 * (dy / 23), null);
	return source;
};

const toSimpleIdentifier = function(name) {
	name = String(name);
	let pointer = name.lastIndexOf(".");
	return pointer >= 0 ? name.substring(0, pointer) : name;
};

let heads = (function() {
	let founded = {},
		directory = new java.io.File(__dir__ + "resource/" + (legacyEntities ? "entities-legacy" : "entities"));
	if (!directory.exists() || !directory.isDirectory()) {
		Logger.Log("Couldn't find entities indicators in " + directory.getName() + "/", "Minimap");
		return founded;
	}
	let entities = directory.listFiles();
	for (let i = 0; i < entities.length; i++) {
		let file = entities[i];
		if (!file.isFile()) continue;
		let bitmap = android.graphics.BitmapFactory.decodeFile(file.getPath());
		founded[toSimpleIdentifier(file.getName())] = createHeadInArrow(bitmap);
	}
	return founded;
})();

if (heads[0] === undefined || heads[0] === null) {
	heads[0] = headArrow("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggLFSgULUPHpQAAARlJREFUKM+dz7FrEwEcxfHP3eVyiVJTQZoOBfsf+A9IRxE6tnuHgA7+CdLORXFxcfEvsJQO7aAOGdz8FyykTRvUDCVQEsO1dxeHg9tzb/nB7/Helxc821xBVkAjCJHmGbIsRxiGiBsRFgsILalG2V0qWxR42Gqi0wyQi3AzTZEv8lqE8rx/s4ckbqLdeoT57BaiEJO/v3F48rUOIfiy/woPkgT/0hRRlGByO8HT7hqGl7+qwPIbyu7ttx+xs/UOva1B1f3prIvjHx9wdPC61obPvRform+gkazitN+v7N2XzzG6OsdgfFNrw/Q+x91ogOH1DCthXNnfvv/E+kYbgbgW4eLPGEVR4MnjTmWk93doJy1M53n1WZrwHwiMVs+tK7U4AAAAAElFTkSuQmCC");
}

const getIconMatrix = function(head) {
	if (!(head instanceof android.graphics.Bitmap)) {
		head = heads[head];
	}
	if (head === undefined || head === null) {
		return null;
	}
	let dx = head.getWidth() / 16,
		dy = head.getHeight() / 16,
		matrix = new android.graphics.Matrix();
	matrix.setTranslate(-9 * dx, -14 * dy);
	matrix.postScale(displayHeight * 0.0012 / dx, displayHeight * 0.0012 / dy);
	return matrix;
};

let iconMatrix = getIconMatrix(0);
