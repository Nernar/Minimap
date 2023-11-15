let policyShowMultiplayerPlayer = true;

Minimap.isAcceptableEntity = function(ent) {
	let type = getEntityType(ent);
	if (type == 1 || type == 63) {
		return policyShowMultiplayerPlayer;
	}
	if (typeof type == "string") {
		if (ENTITY_UNACCEPTABLE.indexOf(type) >= 0) {
			return false;
		}
		return true;
	}
	if (type < ENTITY_IDENTIFIER_RANGE[0] || type > ENTITY_IDENTIFIER_RANGE[1]) {
		return false;
	}
	if (ENTITY_UNACCEPTABLE.indexOf(type) >= 0) {
		return false;
	}
	return true;
};

Minimap.markAsUnacceptableEntity = function(type) {
	if (ENTITY_UNACCEPTABLE.indexOf(type) >= 0) {
		return;
	}
	ENTITY_UNACCEPTABLE.push(type);
};

const entities = [];

Callback.addCallback("EntityRemoved", function(entity) {
	if (Minimap.isAcceptableEntity(entity)) {
		let index = entities.indexOf(entity);
		if (index > -1) {
			entities.splice(index, 1);
		}
	}
});

Callback.addCallback("EntityAdded", function(entity) {
	if (Minimap.isAcceptableEntity(entity)) {
		// Entity uid may be added only once
		entities[entities.length] = entity;
	}
});

Callback.addCallback(isOutdated ? "DimensionLoaded" : "LocalPlayerChangedDimension", function(actorUid, currentId, lastId) {
	if (isOutdated) {
		dimensionNew = actorUid;
		if (actorUid == currentId) {
			return;
		}
	} else {
		dimensionNew = currentId;
		if (currentId == lastId) {
			return;
		}
	}
	while (entities.length > 0) {
		entities.pop();
	}
	redraw = true;
});
