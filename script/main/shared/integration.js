const requireGlobal = function(what, fallback) {
	if (this.hasOwnProperty(what)) {
		return this[what];
	}
	return fallback;
};

Minimap.requireGlobal = function(what, fallback) {
	return requireGlobal(what, fallback);
};

ModAPI.registerAPI("Minimap", Minimap);

Logger.Log("Minimap API shared with name Minimap.", "API");
