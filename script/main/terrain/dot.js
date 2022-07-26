Minimap.SMOOTHING_FAUNA = [
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
	111, // lilypad
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

const smoothingDot = [
	null,
	function terrainBlock(id) {
		if (GenerationUtils_AdaptedScript === undefined) {
			return GenerationUtils.isTerrainBlock(id);
		}
		return GenerationUtils_AdaptedScript.isTerrainBlock(id);
	},
	function ignoreTransparent(id) {
		if (GenerationUtils_AdaptedScript === undefined) {
			return !GenerationUtils.isTransparentBlock(id);
		}
		return !GenerationUtils_AdaptedScript.isTransparentBlock(id);
	},
	function ignoreFauna(id) {
		return Minimap.SMOOTHING_FAUNA.indexOf(id) == -1;
	}
];

Minimap.SMOOTHING_DOT = smoothingDot;

const heightmapDot = [
	function nearestGenerationSurface(ix, iz) {
		return findSurface(ix, DIMENSION == 1 ? 80 : 256, iz);
	},
	function nearestOptimumSurface(ix, iz) {
		let iy = findSurface(ix, DIMENSION == 1 ? 80 : 256, iz);
		if (DIMENSION != 1) {
			let delta = 8;
			do {
				if (canSeeSky(ix, iy, iz)) {
					if (delta == 8) {
						delta = 1;
						iy -= 8;
					} else if (delta == 1) {
						iy--;
						break;
					}
				}
			} while ((iy += delta) <= 256);
		}
		do {
			let block = getBlockId(ix, iy, iz);
			if (block == 385) {
				break;
			}
			if (block == 0 || !(!settings.mapSmoothing || smoothingDot[settings.mapSmoothing](block))) {
				iy -= 1;
				break;
			}
		} while ((iy += 1) <= 256);
		return iy;
	},
	function clearanceDeltaHeight(ix, iz) {
		let iy = DIMENSION == 1 ? 80 : 256;
		let delta = 8;
		do {
			let block = getBlockId(ix, iy, iz);
			if (block != 0) {
				if (delta == 8) {
					delta = 1;
					iy += 8;
				} else {
					if (!settings.mapSmoothing || smoothingDot[settings.mapSmoothing](block)) {
						return iy;
					}
				}
			}
		} while ((iy -= delta) > 0);
		return 0;
	},
	function nearestSurfaceUnderSky(ix, iz) {
		let iy = 1;
		let delta = 16;
		do {
			if (canSeeSky(ix, iy, iz)) {
				if (delta == 16) {
					delta = 1;
					iy -= 16;
				} else if (delta == 1) {
					return --iy;
				}
			}
		} while ((iy += delta) <= 256);
		return 256;
	}
];

Minimap.HEIGHTMAP_DOT = heightmapDot;

const mapDot = [
	function monochromaticColormap(ix, iz) {
		let iy = heightmapDot[settings.mapSurface](ix, iz);
		let block = getBlockId(ix, iy, iz);
		if (block == 0) {
			return 0;
		}
		let meta = getBlockData(ix, iy, iz);
		if (block == 385) {
			block = 9;
		}
		let color = 0;
		if (biomeColormap.hasOwnProperty(block)) {
			let biome = getBiome(ix, iz);
			if (biomeColormap[block][meta]) {
				color = biomeColormap[block][meta][biome] || biomeColormap[block][meta][0] || 0;
			}
			if (color == 0 && biomeColormap[block][0]) {
				color = biomeColormap[block][0][biome] || biomeColormap[block][0][0] || 0;
			}
		}
		if (color == 0) {
			if (settings.stylesheetVanillaColormap) {
				color = getMapColor(block);
			}
			if (color == 0) {
				color = colormap[block] ? (colormap[block][meta] || colormap[block][0] || 0) : -1;
			}
		}
		iy = Math.abs((iy + 1) % 32 - 16);
		return reflectColorRgb(((color >> 16) & 0xff) * (iy * 0.01875 + 0.7),
			((color >> 8) & 0xff) * (iy * 0.01875 + 0.7),
			(color & 0xff) * (iy * 0.01875 + 0.7));
	},
	function surfaceHeightMap(ix, iz) {
		let iy = heightmapDot[settings.mapSurface](ix, iz);
		let block = getBlockId(ix, iy, iz);
		if (block == 0) {
			return 0;
		}
		let meta = getBlockData(ix, iy, iz);
		let color = 0;
		if (biomeColormap.hasOwnProperty(block)) {
			let biome = getBiome(ix, iz);
			if (biomeColormap[block][meta]) {
				color = biomeColormap[block][meta][biome] || biomeColormap[block][meta][0] || 0;
			}
			if (color == 0 && biomeColormap[block][0]) {
				color = biomeColormap[block][0][biome] || biomeColormap[block][0][0] || 0;
			}
		}
		switch (block) {
			case 9:
				if (color == 0) {
					color = -12632068;
				}
				if (getBlockId(ix, iy - 9, iz) == 9) {
					return reflectColorRgb(((color >> 16) & 0xff) * 0.90625,
						((color >> 8) & 0xff) * 0.90625,
						(color & 0xff) * 0.90625);
				}
				if (getBlockId(ix, iy - 6, iz) == 9) {
					if (!(ix % 2) == !((iz + 1) % 2)) {
						return reflectColorRgb(((color >> 16) & 0xff) * 0.90625,
							((color >> 8) & 0xff) * 0.90625,
							(color & 0xff) * 0.90625);
					}
					return reflectColorRgb(((color >> 16) & 0xff) * 0.9375,
						((color >> 8) & 0xff) * 0.9375,
						(color & 0xff) * 0.9375);
				}
				if (getBlockId(ix, iy - 4, iz) == 9) {
					return reflectColorRgb(((color >> 16) & 0xff) * 0.96875,
						((color >> 8) & 0xff) * 0.96875,
						(color & 0xff) * 0.96875);
				}
				if (getBlockId(ix, iy - 2, iz) == 9) {
					if (!(ix % 2) == !((iz + 1) % 2)) {
						return reflectColorRgb(((color >> 16) & 0xff) * 0.96875,
							((color >> 8) & 0xff) * 0.96875,
							(color & 0xff) * 0.96875);
					}
					return reflectColorRgb(((color >> 16) & 0xff) * 0.984375,
						((color >> 8) & 0xff) * 0.984375,
						(color & 0xff) * 0.984375);
				}
				return color;
			case 385:
				if (color == 0) {
					return -12632068;
				}
				return color;
			case 12:
				if (meta != 0) {
					color = 0xd57d32;
				} else {
					color = 0xf4e6a1;
				}
				break;
			case 35:
			case 159:
			case 171:
				color = [0xfcf9f2, 0xd57d32, 0xb04bd5, 0x6597d5, 0xe2e232, 0x7dca19, 0xef7da3, 0x4b4b4b, 0x979797, 0x4b7d97, 0x7d3eb0, 0x324bb0, 0x654b32, 0x657d32, 0x973232, 0x191919][getBlockData(ix, iy - 10, iz)];
				break;
			case 5:
			case 85:
			case 157:
			case 158:
				color = [0x8d7647, 0x7e5430, 0xf4e6a1, 0x956c4c, 0xd57d32, 0x654b32, 0, 0, 0x8d7647, 0x7e5430, 0xf4e6a1, 0x956c4c, 0xd57d32, 0x654b32, 0, 0][getBlockData(ix, iy - 10, iz)];
				break;
			case 43:
			case 44:
				color = [0x6f6f6f, 0xf4e6a1, 0x8d7647, 0x6f6f6f, 0x973232, 0x6f6f6f, 0xfcfcfc, 0x6f0200, 0x6f6f6f, 0xf4e6a1, 0x8d7647, 0x6f6f6f, 0x973232, 0x6f6f6f, 0xfcfcfc, 0x6f0200][getBlockData(ix, iy - 10, iz)];
				break;
			default:
				if (color == 0) {
					if (settings.stylesheetVanillaColormap) {
						color = getMapColor(block);
					}
					if (color == 0) {
						color = colormap[block] ? (colormap[block][meta] || colormap[block][0] || 0) : -1;
					}
				}
		}
		let y = Math.abs((iy + 1) % 32 - 16);
		if (getBlockId(ix - 1, iy - 2, iz)) {
			return reflectColorRgb(((color >> 16) & 0xff) * 0.96875 * (y * 0.020703125 + 0.7),
				((color >> 8) & 0xff) * 0.96875 * (y * 0.020703125 + 0.7),
				(color & 0xff) * 0.96875 * (y * 0.020703125 + 0.7));
		}
		if (getBlockId(ix - 1, iy - 1, iz)) {
			return reflectColorRgb(((color >> 16) & 0xff) * 0.984375 * (y * 0.0197265625 + 0.7),
			((color >> 8) & 0xff) * 0.984375 * (y * 0.0197265625 + 0.7),
			(color & 0xff) * 0.984375 * (y * 0.0197265625 + 0.7));
		}
		return reflectColorRgb(((color >> 16) & 0xff) * (y * 0.01875 + 0.7),
			((color >> 8) & 0xff) * (y * 0.01875 + 0.7),
			(color & 0xff) * (y * 0.01875 + 0.7));
	},
	function undergroundMap(ix, iz) {
		let count = 0;
		let block = 1;
		let blockNew;
		let iy = 63;
		let y = iy;
		let r;
		let g;
		let b;
		let increment = 3;
		do {
			blockNew = getBlockId(ix, iy, iz);
			if (!settings.mapSmoothing || smoothingDot[settings.mapSmoothing](blockNew)) {
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
		return reflectColorRgb(255 * (0.9 * (y / 127) + 0.1), 255 * (0.9 * (y / 127) + 0.1), 255 * (0.9 * (y / 127) + 0.1));
	}
];

Minimap.COLORMAP_DOT = mapDot;
