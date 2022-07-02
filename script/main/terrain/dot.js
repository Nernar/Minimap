const mapDotFauna = [
	6, // saplings
	20, // glass
	31, // grass
	32, // dead grass
	37, // yellow flower
	38, // flowers
	39, // mushroom
	40, // fly agaric
	50, // torch
	59, // wheat
	74, // unlit redstone torch
	75, // lit redstone torch
	76, // redstone torch
	77, // stone button
	95, // invisible bedrock
	102, // glass panel
	104, // pumpkin sprout
	105, // watermelon sprout
	106, // creeper
	127, // cocoa
	132, // string
	141, // carrot
	142, // potato
	143, // wooden button
	175, // sunflower, roses, tall grasses
	191, // colored glass panel
	199, // frame
	202, // chemkstry red torch
	204, // chemistry blue torch
	217, // structure void
	239, // chemistry underwater torch
	241, // colored glass
	244, // beetroot
	250, // some tech
	253, // tinted glass
	254, // tinted colored glass
	385, // sea grass
	386, // coral fan
	388, // mosses
	389, // colored mosses
	390, // lichens
	391, // lichens
	392, // lichens
	393, // kelp
	395, // acacia button
	396, // birch button
	397, // dark oak button
	398, // jungle button
	399, // spruce button
	411, // sea pickles
	415, // bubbles
	416, // barrier
	419, // bamboo sapling
	470, // light block
	478, // red nether grass
	479, // blue nether grass
	483, // red nether mushroom
	484, // blue nether mushroom
	486, // nether roots
	493, // blue small nether grass
	515, // red nether button
	516, // blue nether button
	523, // soul torch
	542, // nether germ
	551 // nether bastion button
];

const mapDot = [
	function monochromaticColormap(ix, iz) {
		let iy = 256;
		let deltaY = 10;
		do {
			let block = World.getBlockID(ix, iy - 10, iz);
			if (block != 0) {
				if (deltaY == 10) {
					deltaY = 1;
					iy += 10;
				} else {
					if (mapDotFauna.indexOf(block) == -1) {
						return (colormap[block] ? colormap[block][World.getBlockData(ix, iy, iz)] : 0) || -1;
					}
				}
			}
		} while (iy -= deltaY);
		return 0;
	},
	function surfaceHeightMap(ix, iz) {
		let color = 0;
		let iy = 256;
		let deltaY = 10;
		do {
			let block = World.getBlockID(ix, iy, iz);
			if (block != 0) {
				if (deltaY == 10) {
					deltaY = 1;
					iy += 10;
				}
				switch (block) {
					case 9:
						if (World.getBlockID(ix, iy - 9, iz) == 9) {
							return -13882190;
						}
						if (World.getBlockID(ix, iy - 6, iz) == 9) {
							return !(ix % 2) == !((iz + 1) % 2) ? -13882190 : -13224231;
						}
						if (World.getBlockID(ix, iy - 4, iz) == 9) {
							return -13224231;
						}
						if (World.getBlockID(ix, iy - 2, iz) == 9) {
							return !(ix % 2) == !((iz + 1) % 2) ? -13224231 : -12632068;
						}
						return -12632068;
					case 12:
						if (World.getBlockData(ix, iy, iz)) {
							color = 0xd57d32;
						} else {
							color = 0xf4e6a1;
						}
						break;
					case 35:
					case 159:
					case 171:
						color = [0xfcf9f2, 0xd57d32, 0xb04bd5, 0x6597d5, 0xe2e232, 0x7dca19, 0xef7da3, 0x4b4b4b, 0x979797, 0x4b7d97, 0x7d3eb0, 0x324bb0, 0x654b32, 0x657d32, 0x973232, 0x191919][World.getBlockData(ix, iy - 10, iz)];
						break;
					case 5:
					case 85:
					case 157:
					case 158:
						color = [0x8d7647, 0x7e5430, 0xf4e6a1, 0x956c4c, 0xd57d32, 0x654b32, 0, 0, 0x8d7647, 0x7e5430, 0xf4e6a1, 0x956c4c, 0xd57d32, 0x654b32, 0, 0][World.getBlockData(ix, iy - 10, iz)];
						break;
					case 43:
					case 44:
						color = [0x6f6f6f, 0xf4e6a1, 0x8d7647, 0x6f6f6f, 0x973232, 0x6f6f6f, 0xfcfcfc, 0x6f0200, 0x6f6f6f, 0xf4e6a1, 0x8d7647, 0x6f6f6f, 0x973232, 0x6f6f6f, 0xfcfcfc, 0x6f0200][World.getBlockData(ix, iy - 10, iz)];
						break;
					default:
						if (mapDotFauna.indexOf(block) != -1) {
							continue;
						}
						color = (colormapHex[block] ? colormapHex[block][World.getBlockData(ix, iy, iz)] : 0) || 0;
				}
				if (World.getBlockID(ix - 1, iy - 2, iz)) {
					return reflectColorRgb(android.graphics.Color.red(color) * 0.703125, android.graphics.Color.green(color) * 0.703125, android.graphics.Color.blue(color) * 0.703125);
				}
				if (World.getBlockID(ix - 1, iy - 1, iz)) {
					return reflectColorRgb(android.graphics.Color.red(color) * 0.859375, android.graphics.Color.green(color) * 0.859375, android.graphics.Color.blue(color) * 0.859375);
				}
				return reflectColorRgb(android.graphics.Color.red(color), android.graphics.Color.green(color), android.graphics.Color.blue(color));
			}
		} while ((iy -= deltaY) > 0);
		return 0;
	},
	function undergroundMap(ix, iz) {
		let count = 0;
		let block = 1;
		let blockNew;
		let iy = 128;
		let y = iy;
		let r;
		let g;
		let b;
		let increment = 3;
		do {
			blockNew = World.getBlockID(ix, iy - 3, iz);
			if (mapDotFauna.indexOf(blockNew) == -1) {
				switch (blockNew) {
					case 0:
					case 17:
					case 18:
					case 64:
					case 66:
					case 161:
					case 162:
						blockNew = 1;
						break;
					case 8:
					case 9:
						blockNew = 0;
						if (count > 1) {
							r = r || 1;
							g = g || 1;
							b = b || 255;
							blockNew = 1;
						}
						break;
					case 10:
					case 11:
						blockNew = 0;
						if (count > 1) {
							r = r || 255;
							g = g || 1;
							b = b || 1;
							blockNew = 1;
						}
						break;
					case 4:
					case 48:
						blockNew = 2;
						if (count > 2) {
							r = r || 1;
							g = g || 255;
							b = b || 255;
						}
						break;
					case 97:
					case 98:
						blockNew = 2;
						if (count > 2) {
							r = r || 255;
							g = g || 1;
							b = b || 255;
						}
						break;
					default:
						blockNew = 2;
				}
			} else {
				blockNew = 1;
			}
			if (blockNew != block) {
				count += blockNew;
				y = iy;
			}
			if (count == 5) {
				iy += 3;
				increment = 1;
				count = 6;
				blockNew = 1;
			} else if (count == 8) {
				r = r || 150;
				g = g || 255;
				b = b || 0;
				return reflectColorRgb(r * (0.8 * (y / 127) + 0.2), g * (0.9 * (y / 127) + 0.1), b * (0.9 * (y / 127) + 0.1));
			}
			block = blockNew;
		} while ((iy -= increment) > 0);
		y = y || 127;
		return reflectColorRgb(255 * (y / 127), 255 * (y / 127), 255 * (y / 127));
	}
];
