const pointerPaint = {
	RED: (function() {
		let paint = new android.graphics.Paint();
		paint.setColorFilter(new android.graphics.LightingColorFilter(android.graphics.Color.RED, 0));
		paint.setAntiAlias(false);
		paint.setFilterBitmap(false);
		return paint;
	})(),
	GREEN: (function() {
		let paint = new android.graphics.Paint();
		paint.setColorFilter(new android.graphics.LightingColorFilter(android.graphics.Color.GREEN, 0));
		paint.setAntiAlias(false);
		paint.setFilterBitmap(false);
		return paint;
	})()
};

Minimap.Pointer = function(bitmap, matrix, rotate) {
	this.bitmap = getBitmapByDescriptor(bitmap);
	this.matrix = matrix;
	this.rotate = rotate;
};

Minimap.MatrixPointer = function(bitmap, matrix, rotate) {
	bitmap = getBitmapByDescriptor(bitmap);
	Minimap.Pointer.call(this, bitmap, matrix(bitmap), rotate);
};

Minimap.MatrixPointer.prototype = new Minimap.Pointer;

const pointer = [
	new Minimap.Pointer(
		(function() {
			let paint = new android.graphics.Paint(),
				bitmap = android.graphics.Bitmap.createBitmap(getDisplayHeight() * 0.1, getDisplayHeight() * 0.1, android.graphics.Bitmap.Config.ARGB_8888),
				canvas = new android.graphics.Canvas(bitmap);
			paint.setAntiAlias(false);
			paint.setFilterBitmap(false);
			reflectPaintSetColor(paint, Colors.BLACK);
			canvas.drawLines([0, getDisplayHeight() * 0.05, getDisplayHeight() * 0.1, getDisplayHeight() * 0.05, getDisplayHeight() * 0.05, 0, getDisplayHeight() * 0.05, getDisplayHeight() * 0.1], paint);
			return bitmap;
		})(),
		(function() {
			let matrix = new android.graphics.Matrix();
			matrix.setTranslate(-getDisplayHeight() * 0.05, -getDisplayHeight() * 0.05);
			return matrix;
		})(),
		false
	),
	new Minimap.Pointer(
		(function() {
			let path = new android.graphics.Path(),
				paint = new android.graphics.Paint(),
				bitmap = android.graphics.Bitmap.createBitmap(getDisplayHeight() * 0.025, getDisplayHeight() * 0.025, android.graphics.Bitmap.Config.ARGB_8888),
				canvas = new android.graphics.Canvas(bitmap);
			paint.setAntiAlias(false);
			paint.setFilterBitmap(false);
			path.moveTo(getDisplayHeight() * 0.0125, 0);
			path.lineTo(0, getDisplayHeight() * 0.025);
			path.lineTo(getDisplayHeight() * 0.0125, getDisplayHeight() * 0.015);
			path.lineTo(getDisplayHeight() * 0.025, getDisplayHeight() * 0.025);
			path.close();
			reflectPaintSetColor(paint, Colors.WHITE);
			canvas.drawPath(path, paint);
			reflectPaintSetColor(paint, Colors.BLACK);
			paint.setStyle(android.graphics.Paint.Style.STROKE);
			canvas.drawPath(path, paint);
			return bitmap;
		})(),
		(function() {
			let matrix = new android.graphics.Matrix();
			matrix.setTranslate(-getDisplayHeight() * 0.0125, 0);
			return matrix;
		})(),
		true
	),
	new Minimap.MatrixPointer(
		android.graphics.BitmapFactory.decodeFile(__dir__ + "assets/arrow.png"),
		function(bitmap) {
			let dx = bitmap.getWidth() / 5,
				dy = bitmap.getHeight() / 7,
				matrix = new android.graphics.Matrix();
			matrix.setTranslate(-2.5 * dx, -4.5 * dy);
			matrix.postScale(getDisplayHeight() * 0.005 / dx, getDisplayHeight() * 0.005 / dy);
			return matrix;
		},
		true
	)
];

Minimap.registerPointer = function(self) {
	if (!(self instanceof Minimap.Pointer)) {
		Logger.Log("Minimap: Pointer must be instance of Minimap.Pointer", "ERROR");
		return -1;
	}
	let index = pointer.indexOf(self);
	if (index >= 0) {
		Logger.Log("Minimap: Pointer " + self + " was already registered in " + index, "INFO");
		return index;
	}
	return pointer.push(self) - 1;
};

const heads = (function(bitmapAssociation) {
	let directory = new java.io.File(__dir__ + "assets/" + (legacyEntities ? "entities-legacy" : "entities"));
	if (!directory.exists() || !directory.isDirectory()) {
		Logger.Log("Minimap: Not found entities in folder /assets/" + directory.getName() + "/", "WARNING");
		return bitmapAssociation;
	}
	let entities = directory.listFiles();
	for (let i = 0; i < entities.length; i++) {
		if (!entities[i].isFile()) continue;
		let bitmap = android.graphics.BitmapFactory.decodeFile(entities[i]);
		bitmapAssociation[entities[i].getName()] = bitmap;
	}
	return bitmapAssociation;
})({});

if (heads[0] === undefined || heads[0] === null) {
	heads[0] = Minimap.decodeBase64Bitmap("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggLFSgULUPHpQAAARlJREFUKM+dz7FrEwEcxfHP3eVyiVJTQZoOBfsf+A9IRxE6tnuHgA7+CdLORXFxcfEvsJQO7aAOGdz8FyykTRvUDCVQEsO1dxeHg9tzb/nB7/Helxc821xBVkAjCJHmGbIsRxiGiBsRFgsILalG2V0qWxR42Gqi0wyQi3AzTZEv8lqE8rx/s4ckbqLdeoT57BaiEJO/v3F48rUOIfiy/woPkgT/0hRRlGByO8HT7hqGl7+qwPIbyu7ttx+xs/UOva1B1f3prIvjHx9wdPC61obPvRform+gkazitN+v7N2XzzG6OsdgfFNrw/Q+x91ogOH1DCthXNnfvv/E+kYbgbgW4eLPGEVR4MnjTmWk93doJy1M53n1WZrwHwiMVs+tK7U4AAAAAElFTkSuQmCC");
}

Minimap.registerEntityBitmap = function(type, bitmap) {
	heads[type] = getBitmapByDescriptor(bitmap) || heads[0];
};

Minimap.registerEntity = function(type, bitmap, caste) {
	caste %= 2;
	let source = ENTITY_UNACCEPTABLE;
	switch (caste) {
		case Minimap.CASTE_PASSIVE:
			source = ENTITY_PASSIVE;
			break;
		case Minimap.CASTE_HOSTILE:
			source = ENTITY_HOSTILE;
			break;
	}
	if (source.indexOf(type) >= 0) {
		Logger.Log("Minimap: Entity " + type + " was already registered", "INFO");
		return;
	}
	Minimap.registerEntityBitmap(type, bitmap);
	source.push(type);
};

Minimap.CASTE_PASSIVE = 0;
Minimap.CASTE_HOSTILE = 1;

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
	matrix.setTranslate(-8 * dx, -8 * dy);
	matrix.postScale(getDisplayHeight() * 0.0015 / dx, getDisplayHeight() * 0.0015 / dy);
	return matrix;
};
