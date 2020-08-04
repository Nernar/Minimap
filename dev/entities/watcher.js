let entities = new Array();

Callback.addCallback("EntityRemoved", function(entity) {
	if (Entity.getType(entity) <= 120 && Entity.getType(entity) >= 10) {
		let index = entities.indexOf(entity)
		if (index > -1) {
			entities.splice(index, 1);
		}
	}
});

Callback.addCallback("EntityAdded", function(entity) {
	if (Entity.getType(entity) <= 120 && Entity.getType(entity) >= 10) {
		entities[entities.length] = entity;
	}
});
