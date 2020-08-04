function minecraftButton(text, width, hight) {
	width = width || 40;
	hight = hight || 40;
	let button = new android.widget.Button(context);
	button.setText(text);
	button.setTextSize(15);
	button.setTextColor(colors.white);
	button.setBackgroundDrawable(drawBtnBack(width * density, hight * density));
	return button;
}
