import { Terrain } from "./terrain.js";

/** SHMUP main script: loads fonts, external graphics, etc., sets up engine/canvas, runs game loop. **/

//@TODO move these into an external settings file...

let { ceil, floor, round } = Math;

let gameWidth = 800;
let gameHeight = 800;

let pixelScale = 4;

let domCanvas = null;
let domContext = null;

let gameCanvas = null;
let gameContext = null;
let bgCanvas = null;
let bgContext = null;

let spriteCanvas = null;
let spriteContext = null;

let shadowCanvas = null;
let shadowContext = null;

let cloudsCanvas = null;
let cloudsContext = null;

let tileSize = 24;
let shadowOffset = 40;

let bg = new Image();
let sprite = new Image();

let clouds = [];
let cloudsTerrain = null;
let cloudsSize = 25;

let scrollSpeed = 1;

let offsetY = 0;
let cloudsY = 0;
let playerX = 90;
let playerY = 150;
let moveSpeed = 1.5;

let keyQueue = [];
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_FIRE = 16;

let bullets = [];
let BULLET_COOLDOWN = 15;
let bulletTime = 0;

document.addEventListener('DOMContentLoaded', init, false);

function init() {
	// Build game canvas
	domCanvas = document.createElement("canvas");
	domCanvas.id = "gameCanvas";
	domCanvas.width = gameWidth;
	domCanvas.height = gameHeight;
	domContext = domCanvas.getContext('2d');
	domContext.scale(pixelScale, pixelScale);
	domContext.imageSmoothingEnabled = false;

	document.body.appendChild(domCanvas);

	gameCanvas = document.createElement("canvas");
	gameCanvas.width = gameWidth;
	gameCanvas.height = gameHeight;
	gameContext = gameCanvas.getContext('2d');

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

	cloudsCanvas = document.createElement("canvas");
	cloudsCanvas.width = gameWidth;
	cloudsCanvas.height = gameHeight;
	cloudsContext = cloudsCanvas.getContext('2d');

	// add key listeners
	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	// load clouds terrain
	cloudsTerrain = new Terrain(Math.ceil(gameWidth / cloudsSize), Math.ceil(gameHeight / cloudsSize) + 1);
	clouds = cloudsTerrain.generateMap();

	// load images
	sprite.src = 'images/sprite.png';
	bg.src = 'images/water2.gif';
	bg.onload = function() {
		window.requestAnimationFrame(gameLoop);
	}
}

function gameLoop() {
	// check keys and move sprites
	moveSprites();

	// advance scrolling
	offsetY += scrollSpeed;
	if (offsetY >= tileSize) offsetY = offsetY % tileSize;

	cloudsY += scrollSpeed * 3;
	if (cloudsY >= cloudsSize) {
		cloudsY = cloudsY % cloudsSize;
		clouds = cloudsTerrain.newLine();
	}

	drawTiles();
	drawSprites();

	// Copy to screen
	gameContext.globalCompositeOperation = 'source-over';
	gameContext.globalAlpha = 1;

	// Add perspective
	let scalePrecision = tileSize / 2;
	let scaleXAmount = 3.5;
	let scaleYAmount = 0.1;
	let scaleCount = 0;
	let scaleX = 0;
	let scaleY = 0;
	for (let z = 0; z < gameHeight / pixelScale; z += scalePrecision) {
		//gameContext.drawImage(bgCanvas, 0, z, gameWidth / pixelScale, scaleYPrecision, 0 - (scaleY / 2), z + (scaleY * scaleCount), gameWidth / pixelScale + scaleX, scaleYPrecision + scaleCount, 25);
		gameContext.drawImage(bgCanvas,
			0,
			z,
			gameWidth / pixelScale,
			scalePrecision,
			0 - (scaleX / 2),
			z + (scaleY * scaleCount),
			round(gameWidth / pixelScale + scaleX),
			round(scalePrecision + (scaleY * 2) + scaleYAmount)
		);
		scaleX += scaleXAmount;
		scaleY += scaleYAmount;
		scaleCount++;
		if (z + (scaleY * scaleCount) >= gameHeight / pixelScale) break;
	}
	
	// draw shadow map
	shadowContext.globalCompositeOperation = 'source-over';
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

	// draw clouds
	cloudsContext.fillStyle = "#ffffff";
	cloudsContext.clearRect(0, 0, gameWidth, gameHeight);
	
	for (let rowCount = 0; rowCount < cloudsTerrain.dimensions().height; rowCount++) {
		for (let colCount = 0; colCount < cloudsTerrain.dimensions().width; colCount++) {
			if (clouds[rowCount].substring(colCount, colCount + 1) == 'X') {
				cloudsContext.fillRect(colCount * cloudsSize, rowCount * cloudsSize - cloudsSize + cloudsY, cloudsSize, cloudsSize);
			}
		}
	}

	gameContext.save();

	gameContext.globalCompositeOperation = 'lighter';
	gameContext.globalAlpha = .05;
	//gameContext.drawImage(cloudsCanvas, 0, 0);

	gameContext.restore();

	// draw HUD? todo

	// finally copy completed canvas to screen
	domContext.drawImage(gameCanvas, 0, 0);

	window.requestAnimationFrame(gameLoop);
}

function drawTiles() {
	for (let yCount = 0; yCount < Math.ceil((gameHeight + offsetY) / tileSize); yCount++) {
		for (let xCount = 0; xCount < Math.ceil(gameWidth / tileSize); xCount++) {
			bgContext.drawImage(bg, xCount * tileSize, yCount * tileSize - (tileSize - offsetY));
		}
	}
}

function drawSprites() {
	spriteContext.clearRect(0, 0, gameWidth, gameHeight);

	// player ship
	spriteContext.drawImage(sprite, Math.round(playerX), Math.round(playerY));

	// bullets
	spriteContext.fillStyle = "#ffffff";
	for (let bulletCount = 0; bulletCount < bullets.length; bulletCount++) {
		if (bullets[bulletCount].y <= 0) {
			bullets.splice(bulletCount, 1);
			bulletCount--;
		} else {
			spriteContext.fillRect(bullets[bulletCount].x, bullets[bulletCount].y, 1, 1);
			bullets[bulletCount].y -= 5;
		}
	}
}

function moveSprites() {
	if (keyQueue.indexOf(KEY_RIGHT) > -1) {
		playerX += moveSpeed;
	} else if (keyQueue.indexOf(KEY_LEFT) > -1) {
		playerX -= moveSpeed;
	}

	if (playerX < 0) playerX = 0;
	if (playerX > gameWidth / pixelScale - sprite.width) playerX = gameWidth / pixelScale - sprite.width;

	if (keyQueue.indexOf(KEY_UP) > -1) {
		playerY -= moveSpeed;
	} else if (keyQueue.indexOf(KEY_DOWN) > -1) {
		playerY += moveSpeed;
	}

	if (playerY < 0) playerY = 0;
	if (playerY > gameHeight / pixelScale - sprite.height) playerY = gameHeight / pixelScale - sprite.height;


	if (bulletTime > 0) bulletTime--;
	if (keyQueue.indexOf(KEY_FIRE) > -1) {
		if (bulletTime == 0) {
			bullets.push({
				x: Math.round(playerX + (sprite.width / 2)),
				y: Math.round(playerY - 1)
			});
			bulletTime = BULLET_COOLDOWN;
		}
	}
}

function keyDownHandler(evt) {
	if (keyQueue.indexOf(evt.keyCode) == -1) {
		keyQueue.push(evt.keyCode);
	}
}

function keyUpHandler(evt) {
	if (keyQueue.indexOf(evt.keyCode) > -1) {
		keyQueue.splice(keyQueue.indexOf(evt.keyCode), 1);
	}
}