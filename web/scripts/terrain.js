export class Terrain {
	/* Terrain generates a new simulated random 2D array of data
		 with a defined width and height.

	   width: the width of the 2D array.
	   height: the height of the 2D array.
	   saturation: how 'full' the terrain map is. 0 is empty, 1
	   is completely solid.
	*/
	constructor(width, height, saturation = 0.8) {
		this.width = width;
		this.height = height;
		this.map = Array(height);
		this.map.fill("");

		this.saturation = saturation;
	}

	generateMap() {
		// Generate bottom up, specifically so we can 'build' on terrain with new lines at top as it scrolls down.
		for (let rowCount = this.height - 1; rowCount >= 0; rowCount--) {
			this.addRow(rowCount);
		}

		return this.map;
	}

	newLine() {
		// Delete bottom row
		this.map.pop();
		// Insert new row at the top, moving everything else down
		this.map.unshift("");
		// Fill in the new row with data
		this.addRow(0);

		return this.map;
	}

	addRow(rowNumber) {
		let newChar = "";
		for (let colCount = 0; colCount < this.width; colCount++) {
			if (Math.random() < this.saturation) {
				newChar = "X";
			} else {
				newChar = " ";
			}
			// put in char
			this.map[rowNumber] = `${this.map[rowNumber].substring(0, colCount)}${newChar}${this.map[rowNumber].substring(colCount + 1)}`;
		}
	}

	dimensions() {
		return {width: this.width, height: this.height};
	}
};