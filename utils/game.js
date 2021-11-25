import TileMap from "./tilemap.js";
import { TILE_SIZE, VELOCITY } from "../constants.js";

const canvas = document.querySelector("#pacman__canvas");
const ctx = canvas.getContext("2d");
const tileMap = new TileMap(TILE_SIZE);
const pacman = tileMap.getPacman(VELOCITY);
const ghosts = tileMap.getGhosts(VELOCITY);

let gameOver = false;
let gameWin = false;

const gameOverSound = new Audio("../sounds/gameOver.wav");
const gameWinSound = new Audio("../sounds/gameWin.wav");

const gameLoop = () => {
  tileMap.draw(ctx);
  drawGameEnd();
  pacman.draw(ctx, pause(), ghosts);
  ghosts.forEach((ghost) => ghost.draw(ctx, pause(), pacman));
  checkGameOver();
  checkGameWin();
};

const checkGameOver = () => {
  if (!gameOver) {
    gameOver = isGameOver();
    if (gameOver) {
      gameOverSound.play();
    }
  }
};

const checkGameWin = () => {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) {
      gameWinSound.play();
    }
  }
};

const isGameOver = () => {
  return ghosts.some(
    (ghost) => !pacman.powerDotActive && ghost.collideWith(pacman)
  );
};

const pause = () => {
  return !pacman.madeFirstMove || gameOver || gameWin;
};

const drawGameEnd = () => {
  const info = document.querySelector(".game__over");
  const text = document.querySelector("#game__info");
  if (gameOver || gameWin) {
    text.innerHTML = "YOU WIN!";
    if (gameOver) {
      text.innerHTML = "GAME OVER";
    }

    info.style.display = "flex";
  }
};

tileMap.setCanvasSize(canvas);
setInterval(gameLoop, 1000 / 75);
