let policyShowMultiplayerPlayer = true;

const isAcceptableEntity = function(ent) {
	let type = Entity.getType(ent);
	if (type == 1) {
		return policyShowMultiplayerPlayer;
	}
	if (type < ENTITY_IDENTIFIER_RANGE[0] || type > ENTITY_IDENTIFIER_RANGE[1]) {
		return false;
	}
	if (ENTITY_UNACCEPTABLE.indexOf(type) >= 0) {
		return false;
	}
	return true;
};

const entities = [];

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

Callback.addCallback(isOutdated ? "DimensionLoaded" : "LocalPlayerChangedDimension", function(actorUid, currentId, lastId) {
	if (isOutdated) {
		if (actorUid == currentId) {
			return;
		}
	} else if (currentId == lastId) {
		return;
	}
	while (entities.length > 0) {
		entities.pop();
	}
	redraw = true;
});
