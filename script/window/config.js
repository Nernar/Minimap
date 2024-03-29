Minimap.OptionPreset = {
	checkBox: function(when, args) {
		let layoutElement = new android.widget.RelativeLayout(getContext()),
			checkBtn = new android.widget.CheckBox(getContext()),
			checkBtnParams = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
			text = new android.widget.TextView(getContext()),
			textParams = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);
		text.setTextColor(Colors.LTGRAY);
		text.setTextSize(17);
		text.setText(translate(args[2]));
		checkBtn.setId(1);
		checkBtn.setChecked(!!settings[args[1]]);
		checkBtn.setOnCheckedChangeListener(function(buttonView, isChecked) {
			settings[args[1]] = !!isChecked;
			notifyConfigChanged(args[1]);
		});
		checkBtnParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
		checkBtnParams.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
		textParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
		textParams.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
		textParams.addRule(android.widget.RelativeLayout.LEFT_OF, 1);
		layoutElement.addView(checkBtn, checkBtnParams);
		layoutElement.addView(text, textParams);
		layoutElement.setPadding(10 * getDisplayDensity(), 5 * getDisplayDensity(), 10 * getDisplayDensity(), 5 * getDisplayDensity());
		return layoutElement;
	},
	subScreen: function(when, args) {
		let text = new android.widget.TextView(getContext());
		text.setTextSize(17);
		text.setText(translate(args[1]));
		text.setTextColor(Colors.LTGRAY);
		text.setPadding(10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity());
		text.setOnClickListener(function(v) {
			Minimap.createConfigDialog(args[2]).show();
		});
		return text;
	},
	sectionDivider: function(when, args) {
		let text = new android.widget.TextView(getContext());
		text.setTextSize(15);
		text.setText(translate(args[1]));
		text.setTextColor(Colors.WHITE);
		text.setBackgroundDrawable(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [Colors.PRIMARY, Colors.ACCENT, Colors.PRIMARY]));
		text.setPadding(10 * getDisplayDensity(), 0, 10 * getDisplayDensity(), 0);
		return text;
	},
	keyValue: function(when, args) {
		let layoutElement = new android.widget.RelativeLayout(getContext()),
			text = new android.widget.TextView(getContext()),
			textParams = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
			textValue = new android.widget.TextView(getContext()),
			textValueParams = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);
		text.setTextSize(17);
		text.setTextColor(Colors.LTGRAY);
		text.setText(android.text.Html.fromHtml(translate(args[2])));
		text.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
		textValue.setTextSize(17);
		textValue.setTextColor(Colors.ACCENT);
		textValue.setClickable(false);
		textValue.setId(1);
		switch (args[1]) {
			case "multipleChoice":
				if (args[4].length <= settings[args[3]]) {
					settings[args[3]] = 0;
				}
				let variants = args[4].slice().map(function(what) {
					return translate(what);
				});
				textValue.setText(variants[settings[args[3]]]);
				layoutElement.setOnClickListener(function(v) {
					let print = new android.app.AlertDialog.Builder(getContext(),
							android.R.style.Theme_DeviceDefault_Dialog);
					print.setSingleChoiceItems(variants, settings[args[3]], function(parent, position, id) {
						settings[args[3]] = position;
						for (let i = 5; i < args.length; i += 2) {
							settings[args[i]] = args[i + 1][position];
						}
						textValue.setText(variants[position]);
						notifyConfigChanged(args[3]);
						print.dismiss();
					});
					print.setTitle(translate(args[2]));
					print.setNegativeButton(translate("Cancel"), function(dialog, whichButton) {
						print.dismiss();
					});
					print = print.create();
					print.getWindow().setLayout(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.MATCH_PARENT);
					let listView = print.getListView();
					listView.setDivider(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [Colors.PRIMARY, Colors.ACCENT, Colors.PRIMARY]));
					listView.setDividerHeight(2);
					listView.setPadding(10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity());
					print.show();
				});
				break;
			case "slider":
				textValue.setText(translate("%s" + args[7], settings[args[3]]));
				layoutElement.setOnClickListener(function(v) {
					let print = new android.app.AlertDialog.Builder(getContext(),
							android.R.style.Theme_DeviceDefault_Dialog),
						seekBar = new android.widget.SeekBar(getContext());
					seekBar.setMax((args[5] - args[4]) / args[6]);
					seekBar.setProgress((settings[args[3]] - args[4]) / args[6]);
					seekBar.setOnSeekBarChangeListener({
						onProgressChanged: function(seekBar, progress, fromUser) {
							print.setTitle(translate(args[2]) + ": " + translate("%s" + args[7], (progress * args[6] + args[4])));
						}
					});
					print.setView(seekBar);
					print.setTitle(translate(args[2]) + ": " + translate("%s" + args[7], settings[args[3]]));
					print.setPositiveButton(translate("Apply"), function(dialog, whichButton) {
						settings[args[3]] = seekBar.getProgress() * args[6] + args[4];
						textValue.setText(translate("%s" + args[7], settings[args[3]]));
						notifyConfigChanged(args[3]);
						print.dismiss();
					});
					print.setNegativeButton(translate("Cancel"), function(dialog, whichButton) {
						print.dismiss();
					});
					print = print.create();
					print.getWindow().setLayout(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.MATCH_PARENT);
					print.show();
				});
				break;
			case "text":
				textValue.setText(translate(args[3]));
				text.setOnClickListener(function(v) {
				    if (args[4]) {
				    	notifyConfigChanged(args[4]);
				    	when();
				    }
				});
		}
		textParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
		textParams.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
		textParams.addRule(android.widget.RelativeLayout.LEFT_OF, 1);
		textValueParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
		textValueParams.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
		layoutElement.addView(textValue, textValueParams);
		layoutElement.addView(text, textParams);
		layoutElement.setPadding(10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity(), 10 * getDisplayDensity());
		return layoutElement;
	}
};

Minimap.createConfigDialog = function() {
	let print = new android.app.AlertDialog.Builder(getContext(),
		android.R.style.Theme_DeviceDefault_DialogWhenLarge);
	let scroll = new android.widget.ScrollView(getContext()),
		layout = new android.widget.LinearLayout(getContext()),
		rulerParams = new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, 2);
	layout.setOrientation(android.widget.LinearLayout.VERTICAL);
	layout.setPadding(10 * getDisplayDensity(), 0, 10 * getDisplayDensity(), 0);
	for (let i = 2; i < arguments[0].length; i += 1) {
		layout.addView(Minimap.OptionPreset[arguments[0][i][0]](function() {
			print.dismiss();
		}, arguments[0][i]));
		if (i + 1 < arguments[0].length) {
			let ruler = new android.view.View(getContext());
			ruler.setBackgroundDrawable(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [Colors.PRIMARY, Colors.ACCENT, Colors.PRIMARY]));
			layout.addView(ruler, rulerParams);
		}
	}
	scroll.addView(layout);
	print.setView(scroll);
	print.setTitle(translate(arguments[0][0]));
	print.setPositiveButton(translate(arguments[0][1]), function(dialog, whichButton) {
		Minimap.saveConfig();
	});
	print = print.create();
	let popup = print.getWindow();
	popup.setLayout(getDisplayPercentWidth(60), android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
	popup.setGravity(android.view.Gravity.LEFT | android.view.Gravity.BOTTOM);
	return print;
};
