import Movement from "./movement.js";
import { PACMAN_ANIMATION_TIMER } from "../constants.js";

export default class Pacman {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentDirection = null;
    this.requestedDirection = null;

    this.pacmanAnimationTimer = null;

    this.pacmanRotate = this.Rotate.right;

    this.wakaSound = new Audio("../sounds/waka.wav");
    this.powerDotSound = new Audio("../sounds/power_dot.wav");
    this.eatGhostSound = new Audio("../sounds/eat_ghost.wav");

    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;

    this.timers = [];

    this.madeFirstMove = false;

    document.addEventListener("keydown", this.#keydown);
    document.querySelector("#up").addEventListener("click", this.#btnup);
    document.querySelector("#right").addEventListener("click", this.#btnright);
    document.querySelector("#down").addEventListener("click", this.#btndown);
    document.querySelector("#left").addEventListener("click", this.#btnleft);

    this.#loadPacmanImages();
  }

  Rotate = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  draw = (ctx, pause, ghosts) => {
    if (!pause) {
      this.#move();
      this.#animate();
    }
    this.#eatDot();
    this.#eatPowerDot();
    this.#eatGhost(ghosts);

    const size = this.tileSize / 2;

    ctx.save();

    ctx.translate(this.x + size, this.y + size);
    ctx.rotate((this.pacmanRotate * 90 * Math.PI) / 180);
    ctx.drawImage(
      this.pacmanImages[this.pacmanImageIndex],
      -size,
      -size,
      this.tileSize,
      this.tileSize
    );

    ctx.restore();
  };

  #loadPacmanImages = () => {
    const pacmanImg1 = new Image();
    pacmanImg1.src = "../images/pac0.png";

    const pacmanImg2 = new Image();
    pacmanImg2.src = "../images/pac1.png";

    const pacmanImg3 = new Image();
    pacmanImg3.src = "../images/pac2.png";

    this.pacmanImages = [pacmanImg1, pacmanImg2, pacmanImg3, pacmanImg2];

    this.pacmanImageIndex = 0;
  };

  #keydown = (e) => {
    if (e.keyCode === 38) {
      if (this.currentDirection === Movement.down)
        this.currentDirection = Movement.up;
      this.requestedDirection = Movement.up;
      this.madeFirstMove = true;
    }
    if (e.keyCode === 40) {
      if (this.currentDirection === Movement.up)
        this.currentDirection = Movement.down;
      this.requestedDirection = Movement.down;
      this.madeFirstMove = true;
    }
    if (e.keyCode === 37) {
      if (this.currentDirection === Movement.right)
        this.currentDirection = Movement.left;
      this.requestedDirection = Movement.left;
      this.madeFirstMove = true;
    }
    if (e.keyCode === 39) {
      if (this.currentDirection === Movement.left)
        this.currentDirection = Movement.right;
      this.requestedDirection = Movement.right;
      this.madeFirstMove = true;
    }
  };

  #btnup = () => {
    if (this.currentDirection === Movement.down)
      this.currentDirection = Movement.up;
    this.requestedDirection = Movement.up;
    this.madeFirstMove = true;
  };

  #btnright = () => {
    if (this.currentDirection === Movement.left)
      this.currentDirection = Movement.right;
    this.requestedDirection = Movement.right;
    this.madeFirstMove = true;
  };

  #btndown = () => {
    if (this.currentDirection === Movement.up)
      this.currentDirection = Movement.down;
    this.requestedDirection = Movement.down;
    this.madeFirstMove = true;
  };

  #btnleft = () => {
    if (this.currentDirection === Movement.right)
      this.currentDirection = Movement.left;
    this.requestedDirection = Movement.left;
    this.madeFirstMove = true;
  };

  #move() {
    if (this.currentDirection !== this.requestedDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (!this.tileMap.collideWall(this.x, this.y, this.requestedDirection))
          this.currentDirection = this.requestedDirection;
      }
    }

    if (this.tileMap.collideWall(this.x, this.y, this.currentDirection)) {
      this.pacmanAnimationTimer = null;
      this.pacmanImageIndex = 1;
      return;
    } else if (
      this.currentDirection !== null &&
      this.pacmanAnimationTimer === null
    ) {
      this.pacmanAnimationTimer = PACMAN_ANIMATION_TIMER;
    }

    switch (this.currentDirection) {
      case Movement.up:
        this.y -= this.velocity;
        this.pacmanRotate = this.Rotate.up;
        break;
      case Movement.down:
        this.y += this.velocity;
        this.pacmanRotate = this.Rotate.down;
        break;
      case Movement.left:
        this.x -= this.velocity;
        this.pacmanRotate = this.Rotate.left;
        break;
      case Movement.right:
        this.x += this.velocity;
        this.pacmanRotate = this.Rotate.right;
        break;

      default:
        break;
    }
  }

  #animate = () => {
    if (this.pacmanAnimationTimer === null) return;
    this.pacmanAnimationTimer--;
    if (this.pacmanAnimationTimer === 0) {
      this.pacmanAnimationTimer = PACMAN_ANIMATION_TIMER;
      this.pacmanImageIndex++;
      if (this.pacmanImageIndex === this.pacmanImages.length)
        this.pacmanImageIndex = 0;
    }
  };

  #eatDot = () => {
    if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
      this.wakaSound.play();
    }
  };

  #eatPowerDot = () => {
    if (this.tileMap.eatPowerDot(this.x, this.y)) {
      this.powerDotSound.play();
      this.powerDotActive = true;
      this.powerDotAboutToExpire = false;
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];

      let powerDotTimer = setTimeout(() => {
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
      }, 6000);

      this.timers.push(powerDotTimer);

      let powerDotAboutToExpireTimer = setTimeout(() => {
        this.powerDotAboutToExpire = true;
      }, 3000);

      this.timers.push(powerDotAboutToExpireTimer);
    }
  };

  #eatGhost = (ghosts) => {
    if (this.powerDotActive) {
      const collideGhosts = ghosts.filter((ghost) => ghost.collideWith(this));
      collideGhosts.forEach((ghost) => {
        ghosts.splice(ghosts.indexOf(ghost), 1);
        this.eatGhostSound.play();
      });
    }
  };
}
