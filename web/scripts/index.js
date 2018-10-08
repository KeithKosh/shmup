/** SHMUP main script: loads fonts, external graphics, etc., sets up engine/canvas, runs game loop. **/

//@TODO move these into an external settings file...

let gameWidth = 800;
let gameHeight = 800;

let pixelScale = 4;

let gameCanvas = null;
let gameContext = null;
let bgCanvas = null;
let bgContext = null;

let spriteCanvas = null;
let spriteContext = null;

let shadowCanvas = null;
let shadowContext = null;

let tileSize = 24;
let shadowOffset = 40;

let bg = new Image();
let sprite = new Image();

let offsetY = 0;
let playerX = 90;
let playerY = 150;

document.addEventListener('DOMContentLoaded', init, false);

function init() {
	// Build game canvas
	gameCanvas = document.createElement("canvas");
	gameCanvas.id = "gameCanvas";
	gameCanvas.width = gameWidth;
	gameCanvas.height = gameHeight;
	gameContext = gameCanvas.getContext('2d');
	gameContext.scale(4, 4);
	gameContext.imageSmoothingEnabled = false;

	document.body.appendChild(gameCanvas);

	spriteCanvas = document.createElement("canvas");
	spriteCanvas.width = gameWidth;
	spriteCanvas.height = gameHeight;
	spriteContext = spriteCanvas.getContext('2d');

	shadowCanvas = document.createElement("canvas");
	shadowCanvas.width = gameWidth;
	shadowCanvas.height = gameHeight;
	shadowContext = shadowCanvas.getContext('2d');

	bgCanvas = document.createElement("canvas");
	bgCanvas.width = gameWidth;
	bgCanvas.height = gameHeight;
	bgContext = bgCanvas.getContext('2d');

	sprite.src = 'images/sprite.png';
	bg.src = 'images/water2.gif';
	bg.onload = function() {
		window.requestAnimationFrame(gameLoop);
	}
}

function gameLoop() {
	offsetY += 1;
	if (offsetY >= tileSize) offsetY = 0;

	drawTiles();
	drawSprites();

	// Copy to screen
	gameContext.globalCompositeOperation = 'source-over';
	gameContext.globalAlpha = 1;

	let scaleDown = 0;
	let scalePrecision = 10;
	let scaleAmount = 3;
	for (z = 0; z < gameHeight / pixelScale; z+= scalePrecision) {
		gameContext.drawImage(bgCanvas, 0, z, gameWidth / pixelScale, scalePrecision, 0 - (scaleDown / 2), z, gameWidth / pixelScale + scaleDown, scalePrecision);
		scaleDown += scaleAmount;
	}
	
	// draw shadow map
	shadowContext.fillStyle = "#000080";
	shadowContext.fillRect(0, 0, gameWidth / pixelScale, gameHeight / pixelScale);
	shadowContext.globalCompositeOperation = 'destination-in';
	shadowContext.drawImage(spriteCanvas, shadowOffset, shadowOffset);

	gameContext.save();

	gameContext.globalCompositeOperation = 'multiply';
	gameContext.globalAlpha = .25;
	gameContext.drawImage(shadowCanvas, 0, 0);

	gameContext.restore();

	// draw sprites
	gameContext.drawImage(spriteCanvas, 0, 0);

	// draw HUD? todo

	window.requestAnimationFrame(gameLoop);
}

function drawTiles() {
	for (yCount = 0; yCount < Math.ceil((gameHeight + offsetY) / tileSize); yCount++) {
		for (xCount = 0; xCount < Math.ceil(gameWidth / tileSize); xCount++) {
			bgContext.drawImage(bg, xCount * tileSize, yCount * tileSize - (tileSize - offsetY));
		}
	}
}

function drawSprites() {
	// just one to start
	spriteContext.drawImage(sprite, playerX, playerY);
}