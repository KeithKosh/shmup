/** SHMUP main script: loads fonts, external graphics, etc., sets up engine/canvas, runs game loop. **/

//@TODO move these into an external settings file...

let gameWidth = 480;
let gameHeight = 900;

let pixelScale = 4;

let gameCanvas = null;

document.addEventListener('DOMContentLoaded', init, false);

function init() {
	// Build game canvas
	gameCanvas = document.createElement("canvas");
	gameCanvas.id = "gameCanvas";

	document.body.appendChild(gameCanvas);
}