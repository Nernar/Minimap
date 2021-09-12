function save(path, filename, content) {
	tryout(function() {
		new java.io.File(path).mkdirs();
		let newFile = new java.io.File(path, filename);
		newFile.createNewFile();
		let outWrite = new java.io.OutputStreamWriter(new java.io.FileOutputStream(newFile));
		outWrite.append(content);
		outWrite.close();
	});
}

function load(path, filename) {
	let content = "";
	if (new java.io.File(path + filename).exists()) {
		let file = new java.io.File(path + filename),
			fos = new java.io.FileInputStream(file),
			str = new java.lang.StringBuilder(),
			ch;
		while ((ch = fos.read()) != -1) { str.append(java.lang.Character(ch)); }
		content = String(str.toString());
		fos.close();
	}
	return content;
}

function loadTxtFromUrl(url) {
	return tryout(function() {
		let content = new java.io.ByteArrayOutputStream();
		android.net.http.AndroidHttpClient.newInstance("userAgent").execute(new org.apache.http.client.methods.HttpGet(url)).getEntity().writeTo(content);
		content.close();
		return String(content.toString());
	}, function(e) {
		return "";
	});
}
