const Colors = (function(colors) {
	for (let element in colors) {
		colors[element] = java.lang.Integer.valueOf(colors[element]);
	}
	return colors;
})({
	BLACK: android.graphics.Color.BLACK,
	WHITE: android.graphics.Color.WHITE,
	GRAY: android.graphics.Color.GRAY,
	LTGRAY: android.graphics.Color.LTGRAY,
	PRIMARY: android.graphics.Color.parseColor("#4151b0"),
	ACCENT: android.graphics.Color.parseColor("#2895f0")
});
