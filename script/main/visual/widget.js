function minecraftButton(text, width, hight) {
	width = width || 40;
	hight = hight || 40;
	let button = new android.widget.Button(getContext());
	button.setText(text);
	button.setTextSize(15);
	button.setTextColor(Colors.WHITE);
	button.setBackgroundDrawable(drawBtnBack(width * getDisplayDensity(), hight * getDisplayDensity()));
	return button;
}
