function settingsUI() {
	let textSize = 17,
		padding = 10,
		context = UI.getContext();
	let print = new android.app.AlertDialog.Builder(context);
	let scroll = new android.widget.ScrollView(context),
		layout = new android.widget.LinearLayout(context),
		len = arguments[0].length,
		rulerLp = new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, 2),
		addOption = {
			checkBox: function (args) {
				let layoutElement = new android.widget.RelativeLayout(context),
					checkBtn = new android.widget.CheckBox(context),
					checkBtnLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
					text = new android.widget.TextView(context),
					textLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);
				text.setTextSize(textSize);
				text.setText(args[2]);
				checkBtn.setId(1);
				checkBtn.setChecked(Boolean(settings[args[1]]));
				checkBtn.setOnCheckedChangeListener(function(buttonView, isChecked) {
					if (isChecked) {
						settings[args[1]] = 1;
					} else {
						settings[args[1]] = 0;
					}
					settingsChanged(args[1]);
				});
				checkBtnLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				checkBtnLp.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				textLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				textLp.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				textLp.addRule(android.widget.RelativeLayout.LEFT_OF, 1);
				layoutElement.addView(checkBtn, checkBtnLp);
				layoutElement.addView(text, textLp);
				layoutElement.setPadding(padding, padding * 0.5, padding, padding * 0.5);
				return layoutElement;
			},
			subScreen: function (args) {
				let text = new android.widget.TextView(context);
				text.setTextSize(textSize);
				text.setText("> " + args[1]);
				text.setPadding(padding, padding, padding, padding);
				text.setOnClickListener(function(v){
					settingsUI(args[2]).show();
				});
				return text;
			},
			sectionDivider: function (args) {
				let text = new android.widget.TextView(context);
				text.setTextSize(textSize * 0.9);
				text.setText(args[1]);
				text.setTextColor(android.graphics.Color.WHITE)
				text.setBackgroundDrawable(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [android.graphics.Color.parseColor("#4151b0"), android.graphics.Color.parseColor("#2895f0"), android.graphics.Color.parseColor("#4151b0")]));
				text.setPadding(padding, 0, padding, 0);
				return text;
			},
			keyValue: function (args) {
				let layoutElement = new android.widget.RelativeLayout(context),
					text = new android.widget.TextView(context),
					textLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT),
					textValue = new android.widget.TextView(context),
					textValueLp = new android.widget.RelativeLayout.LayoutParams(android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT, android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);
				text.setTextSize(textSize);
				text.setText(android.text.Html.fromHtml(args[2]));
				text.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
				textValue.setTextSize(textSize);
				textValue.setTextColor(android.graphics.Color.parseColor("#4151b0"));
				textValue.setId(1);
				switch (args[1]) {
					case "multipleChoice":
						if (args[4].length <= settings[args[3]]) {settings[args[3]] = 0}
						textValue.setText(args[4][settings[args[3]]]);
						textValue.setOnClickListener(function(v) {
							let print = new android.app.AlertDialog.Builder(context),
								listView = new android.widget.ListView(context),
								adapter = new android.widget.ArrayAdapter(context, android.R.layout.simple_list_item_single_choice, args[4]);
							listView.setAdapter(adapter);
							listView.setChoiceMode(android.widget.ListView.CHOICE_MODE_SINGLE);
							listView.setItemChecked(settings[args[3]], true);
							listView.setDivider(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [android.graphics.Color.parseColor("#4151b0"), android.graphics.Color.parseColor("#2895f0"), android.graphics.Color.parseColor("#4151b0")]));
							listView.setDividerHeight(2);
							listView.setPadding(padding, padding, padding, padding);
							listView.setOnItemClickListener(function(parent, view, position, id) {
								settings[args[3]] = position;
								for (let i = 5; i < args.length; i += 2) {
									settings[args[i]] = args[i + 1][position];
								}
								textValue.setText(args[4][position]);
								settingsChanged(args[3]);
								print.dismiss();
							});
							print.setView(listView);
							print.setTitle(args[2]);
							print.setNegativeButton("Cancel", function(dialog, whichButton) {
								print.dismiss();
							});
							print = print.show();
						});
						break;
					case "slider":
						textValue.setText(settings[args[3]] + args[7]);
						textValue.setOnClickListener(function(v){
							let print = new android.app.AlertDialog.Builder(context),
								seekBar = new android.widget.SeekBar(context);
							seekBar.setMax((args[5] - args[4]) / args[6]);
							seekBar.setProgress((settings[args[3]] - args[4]) / args[6]);
							seekBar.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
								onProgressChanged: function(seekBar, progress, fromUser) {
									print.setTitle(args[2] + "  " + (progress * args[6] + args[4]) + args[7]);
								}
							}));
							print.setView(seekBar);
							print.setTitle(args[2] + "  " + settings[args[3]] + args[7]);
							print.setPositiveButton("OK", function(dialog, whichButton) {
								settings[args[3]] = seekBar.getProgress() * args[6] + args[4];
								textValue.setText(settings[args[3]] + args[7]);
								settingsChanged(args[3]);
								print.dismiss();
							});
							print.setNegativeButton("Cancel", function(dialog, whichButton) {
								print.dismiss();
							});
							print = print.show();
						});
						break;
					default:
						textValue.setText(String(args[3]));
				}
				textLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				textLp.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				textLp.addRule(android.widget.RelativeLayout.LEFT_OF, 1);
				textValueLp.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				textValueLp.addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				layoutElement.addView(textValue, textValueLp);
				layoutElement.addView(text, textLp);
				layoutElement.setPadding(padding, padding, padding, padding);
				return layoutElement;
			}
		};
	padding = padding * context.getResources().getDisplayMetrics().density;
	layout.setOrientation(android.widget.LinearLayout.VERTICAL);
	layout.setPadding(padding, 0, padding, 0);
	for (let i = 2; i < len; i += 1) {
		layout.addView(addOption[arguments[0][i][0]](arguments[0][i]));
		if (i + 1 < len) {
			let ruler = new android.view.View(context);
			ruler.setBackgroundDrawable(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT, [android.graphics.Color.parseColor("#4151b0"), android.graphics.Color.parseColor("#2895f0"), android.graphics.Color.parseColor("#4151b0")]));
			layout.addView(ruler, rulerLp);
		}
	}
	scroll.addView(layout);
	print.setView(scroll);
	print.setTitle(arguments[0][0]);
	print.setPositiveButton(arguments[0][1], function(dialog,whichButton) {
		saveSettings();
	});
	return print;
}
