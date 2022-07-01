const mapDot = [
	function monochromaticColormap(ix, iz) {
		let iy = 130;
		let deltaY = 10;
		do {
			let block = World.getBlockID(ix, iy - 10, iz);
			if (block != 0) {
				if (deltaY == 10) {
					deltaY = 1;
					iy += 10;
				} else {
					return (colormap[block] ? colormap[block][World.getBlockData(ix, iy, iz)] : 0) || -1;
				}
			}
		} while (iy -= deltaY);
		return 0;
	},
	function surfaceHeightMap(ix, iz) {
		let color = 0;
		let iy = 130;
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
						color = (colormap[block] ? -colormap[block][World.getBlockData(ix, iy, iz)] : 0) || 1;
				}
				if (World.getBlockID(ix - 1, iy - 2, iz)) {
					return reflectColorRgb(android.graphics.Color.red(color) * 0.703125, android.graphics.Color.green(color) * 0.703125, android.graphics.Color.blue(color) * 0.703125);
				}
				if (World.getBlockID(ix - 1, iy - 1, iz)) {
					return reflectColorRgb(android.graphics.Color.red(color) * 0.859375, android.graphics.Color.green(color) * 0.859375, android.graphics.Color.blue(color) * 0.859375);
				}
				return reflectColorRgb(android.graphics.Color.red(color), android.graphics.Color.green(color), android.graphics.Color.blue(color));
			}
		} while (iy -= deltaY);
		return 0;
	},
	function undergroundMap(ix, iz) {
		let count = 0;
		let block = 1;
		let blockNew;
		let iy = 62;
		let y = 0;
		let r = 0;
		let g = 0;
		let b = 0;
		let increment = 3;
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
				return reflectColorRgb(r * (0.8 * (y / 127) + 0.2), g * (0.9 * (y / 127) + 0.1), b * (0.9 * (y / 127) + 0.1));
			}
			block = blockNew;
			if (iy < 0 || iy > 127) {
				break;
			}
		} while (iy -= increment);
		y = y || 127;
		r = 255;
		g = 255;
		b = 255;
		return reflectColorRgb(r * (0.8 * (y / 127) + 0.2), g * (0.8 * (y / 127) + 0.2), b * (0.8 * (y / 127) + 0.2));
	}
];
