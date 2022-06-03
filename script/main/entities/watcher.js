let entities = [];

Callback.addCallback("EntityRemoved", function(entity) {
	if (isAcceptableEntity(entity)) {
		let index = entities.indexOf(entity);
		if (index > -1) {
			entities.splice(index, 1);
		}
	}
});

Callback.addCallback("EntityAdded", function(entity) {
	if (isAcceptableEntity(entity)) {
		// Entity uid may be added only once
		entities[entities.length] = entity;
	}
});
