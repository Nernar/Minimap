let colors = {};

function parseColor(hex) {
	return new java.lang.Integer(android.graphics.Color.parseColor(hex)).intValue();
}

colors.black = parseColor("#000000");
colors.white = parseColor("#ffffff");
colors.gray = parseColor("#444444");
colors.ltgray = parseColor("#cccccc");
colors.primary = parseColor("#4151b0");
colors.accent = parseColor("#2895f0");
