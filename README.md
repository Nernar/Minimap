# Minimap

![Version](https://img.shields.io/badge/dynamic/json?label=version&query=version&url=https://raw.githubusercontent.com/nernar/minimap/master/mod.info&color=D19121&logoColor=white&logo=clockify&style=flat-square)
![Lines of code](https://img.shields.io/tokei/lines/github/nernar/minimap?color=2727E3&logoColor=white&logo=sourcegraph&style=flat-square)
![License](https://img.shields.io/github/license/nernar/minimap?color=D22128&logoColor=white&logo=apache&style=flat-square)
[![Telegram](https://img.shields.io/badge/channel-gray?logo=telegram&style=flat-square)](https://t.me/ntInsideChat)

Find your way around in Minecraft.

## Customization

Customization takes place during game, just hold minimap to open config menu.

Swipe to hide minimap in a small button, press to open full-screen mode. Double tap or cross your fingers to change zoom.

You can put your own head into `assets/entities/63`, it will be used as local player crosshair. Recommended (.png) size is 16x16 or 32x32.

## Integration

Integration is carried out through ModAPI, it is enough to create a callback to wait for Minimap.
```js
ModAPI.addAPICallback("Minimap", function(api) {
	// Future activities will be done right here.
});
```

### Colormap

Minimap uses a colormap to render surface topography. Color goes through a contrast change before use, so it is recommended to use brightest one.

To update relief atlas/colormap, you can change color separately
```js
api.setColor(BlockID.some_staff, 0x00ffaa);
```
or update multiple colors at once (it will be merged with exiting one).
```js
api.mergeColormap({
	some_staff: 0x00ffaa,
	some_another_staff: 0x33ffbb
});
```
It is desirable to register all variants of block meta, otherwise zero will be used
```js
api.setColor(BlockID.some_staff, [0x00ffaa, 0x33ffbb]);
```

#### Dependent Biome

Additionally, colormaps now can dependent on any biomes. This may be used for foliage colors or grass, but choice dependent on target.

For example, colorize stone (all variations, e.g. granite, diorite) in Mountain Edge to blue
```js
api.setBiomeDependentColor("stone", [
	20: 0x3333ff
]);
```
where 20 is represented as Mountain Edge biome.

Meanwhile, `api.mergeBiomeDependentColormap' do some same stuff, just like ordinary colormap.

You can find vanilla biome ids at [wiki/Biome](https://minecraft.fandom.com/wiki/Biome).

### Entity Heads

Easiest way to add an indicator is to add your custom mob. You can add entity by caste and bitmap for drawing.

```js
api.registerEntity("namespace:best_friend",
	"iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABQ0lEQVR42u2XvUoDQRRG9ze7UWIUxFgI+gb2IqkUhJRWVimCGIhvoGgrio2ND2ApYmEKtbCw8xFsEkTRpAiRZEPY7M6OrWeLbTPF3O7MXC4fnJll1llfK0jjX8WJgXJMCxyKGBzHAmxZ7HcdGyxlar4x5dIBnLTzdMWSDbN+DlzMmWBh0HkvCLkvhVageICLRhXsuXSe9+fA49GAA2x+B/qdb/DZ/aNWoFiA0+oeFpLITN3jgIrtiI4HffBqaQn8O+QZqW9taAWKBZjxPCxUjq7Au+VzcK3cynR+3SyB714vwbcnB1qBYgE67XcsNI9r4P3tefDDy1vmwMPKJvimsQNudXtagWIBgohvtMkX7/nH5whcsNzMgU/PPCPLK3mwabhagWIB2j9dvgcS/gcsLhQzB4TRhG9GzwcHY5HZrxVMPcAfzvdd0aEdUs8AAAAASUVORK5CYII=",
	api.CASTE_PASSIVE);
```
Second argument is Base64 encoded bitmap, you can also pass a file or an already loaded bitmap using android.graphics.BitmapFactory. Entity identifier itself can be a numeral.

If you want to completely hide chicken from minimap, use
```js
api.markAsUnacceptableEntity(10);
```

### Indicators / Markers

You can register a pointer for later use in markers. Marker can display various optional objects or treasure locations.

First you need to register a pointer and marker by uid
```js
let pointerUid = api.registerPointer(
	new api.Pointer(
		new java.io.File(__dir__ + "assets/pointer.png"),
		new android.graphics.Matrix(),
		false
	)
);
api.registerExtendedMarker("itemUseLocal", pointerUid);
```

Now you can control marker how and when you want. Note that you need to unload marker when moving too far, to other dimensions, and so on. Otherwise, it will continue to be drawn, taking up space in memory.

```js
Callback.addCallback("ItemUseLocal", function(coords) {
	Minimap.mark("itemUseLocal", coords.x, coords.y);
});
```
In this case, we are adding marker, ignoring one more "force" argument. Before adding a marker, a check will be made and if this marker is already located at these coordinates, then a new one will not be added.

However, marker does not unload in other dimensions and generally does not react in any way to player moving away.

```js
Callback.addCallback("LocalPlayerChangedDimension", function() {
	Minimap.unmarkType("itemUseLocal");
});

Callback.addCallback("LocalLevelLeft", function() {
	Minimap.unmarkType("itemUseLocal");
});
```

## Contribution

Source code is open to anyone and everyone, credit yourself in `script/main/header.js` below all to keep credit.
