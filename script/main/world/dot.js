let chests = [];

let mapDot = [
	function basicSurfaceMap(ix, iz) {
		let iy = 130,
			deltaY = 10,
			colors = {
				1: -8487298,
				3: -7970749,
				4: -8487298,
				8: -14000385,
				9: -14000385,
				10: -637952,
				11: -637952,
				12: -2370656,
				13: -8618884,
				17: -10005725,
				18: -13534192,
				24: -3817840,
				48: -10193052,
				78: -984069,
				79: -5255937,
				82: -6314831,
				98: -8487298,
				99: -7509421,
				100: -4774107,
				109: -8487298,
				110: -9542807,
				128: -3817840,
				159: -2968927,
				161: -8028101,
				162: -13293288,
				172: -6857405,
				174: -5255937,
				243: -10797283
			};
		do {
			let block = World.getBlockID(ix, iy - 10, iz);
			if (block != 0) {
				if (deltaY == 10) {
					deltaY = 1;
					iy += 10;
				} else {
					return colors[block] || -8540361;
				}
			}
		} while (iy -= deltaY);
		return 0;
	},
	function minecraftMap(ix, iz) {
		let color,
			iy = 130,
			deltaY = 10,
			o = android.graphics.Color;
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
					case 54:
						chests[chests.length] = [ix + 0.5, iz + 0.5];
					default:
						let colors = {
							2: 0x7db037,
							3: 0x956c4c,
							6: 0x007b00,
							8: 0x3f3ffc,
							10: 0xfc0000,
							11: 0xfc0000,
							17: 0x8d7647,
							18: 0x007b00,
							19: 0xe2e232,
							22: 0x4981fc,
							24: 0xf4e6a1,
							30: 0xfcfcfc,
							31: 0x007b00,
							32: 0x8d7647,
							37: 0x007b00,
							38: 0x007b00,
							39: 0x007b00,
							40: 0x007b00,
							41: 0xf7eb4c,
							42: 0xa5a5a5,
							45: 0x973232,
							46: 0xfc0000,
							47: 0x8d7647,
							49: 0x191919,
							53: 0x8d7647,
							54: 0x8d7647,
							57: 0x5bd8d2,
							59: 0x007b00,
							60: 0x956c4c,
							78: 0xfcfcfc,
							79: 0x9e9efc,
							80: 0xfcfcfc,
							81: 0x007b00,
							82: 0xa2a6b6,
							83: 0x007b00,
							86: 0xd57d32,
							87: 0x6f0200,
							91: 0xd57d32,
							99: 0x8d7647,
							100: 0x973232,
							103: 0x7dca19,
							104: 0x007b00,
							105: 0x007b00,
							106: 0x007b00,
							107: 0x8d7647,
							108: 0x973232,
							110: 0x7d3eb0,
							111: 0x007b00,
							112: 0x6f0200,
							113: 0x6f0200,
							114: 0x6f0200,
							121: 0xf4e6a1,
							128: 0xf4e6a1,
							133: 0x00d639,
							134: 0x7e5430,
							135: 0xf4e6a1,
							136: 0x956c4c,
							141: 0x007b00,
							142: 0x007b00,
							152: 0xfc0000,
							155: 0xfcfcfc,
							156: 0xfcfcfc,
							161: 0x007b00,
							162: 0x8d7647,
							163: 0xd57d32,
							164: 0x654b32,
							170: 0xf7eb4c,
							172: 0xd57d32,
							174: 0x9e9efc,
							175: 0x007b00,
							183: 0x7e5430,
							184: 0xf4e6a1,
							185: 0x956c4c,
							187: 0xd57d32,
							186: 0x654b32,
							243: 0x7e5430,
							244: 0x007b00
						};
						color = colors[block] || 0x6f6f6f;
				}
				if (World.getBlockID(ix - 1, iy - 2, iz)) {
					return o.rgb(o.red(color) * (180 / 255), o.green(color) * (180 / 255), o.blue(color) * (180 / 255));
				}
				if (World.getBlockID(ix - 1, iy - 1, iz)) {
					return o.rgb(o.red(color) * (220 / 255), o.green(color) * (220 / 255), o.blue(color) * (220 / 255));
				}
				return o.rgb(o.red(color), o.green(color), o.blue(color));
			}
		} while (iy -= deltaY);
		return 0;
	},
	function caveMap(ix, iz) {
		let count = 0,
			block = 1,
			blockNew,
			iy = 62,
			y,
			r,
			g,
			b,
			increment = 3;
		do {
			blockNew = World.getBlockID(ix, iy - 3, iz);
			switch (blockNew) {
				case 0:
				case 17:
				case 18:
				case 20:
				case 50:
				case 64:
				case 66:
				case 106:
				case 127:
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
				case 54:
					chests[chests.length] = [ix + 0.5, iz + 0.5];
				default:
					blockNew = 2;
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
				return android.graphics.Color.rgb(r * (0.8 * (y / 127) + 0.2), g * (0.9 * (y / 127) + 0.1), b * (0.9 * (y / 127) + 0.1));
			}
			block = blockNew;
		} while (iy -= increment);
		y = y || 127;
		r = 255; g = 255; b = 255;
		return android.graphics.Color.rgb(r * (0.8 * (y / 127) + 0.2), g * (0.8 * (y / 127) + 0.2), b * (0.8 * (y / 127) + 0.2));
	}
];
