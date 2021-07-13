const launchModification = function(additionalScope) {
	if (additionalScope !== undefined) {
		__mod__.RunMod(additionalScope);
		return;
	}
	Launch();
};

(function() {
	try {
		ConfigureMultiplayer({
			name: "auto",
			version: "auto",
			isClientOnly: true
		});
	} catch (e) {
		launchModification({
			isOutdated: true
		});
		return;
	}

	launchModification();
})();
