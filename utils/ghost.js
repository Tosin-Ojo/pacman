import Movement from "./movement.js";
import { SCARED_ABOUT_TO_EXPIRE } from "../constants.js";

export default class Ghost {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.movement = Math.floor(Math.random() * Object.keys(Movement).length);

    this.directionDefaultTimer = this.#random(10, 25);
    this.directionTimer = this.directionDefaultTimer;

    this.scaredAboutToExpireTimer = SCARED_ABOUT_TO_EXPIRE;

    this.#loadImages();
  }

  draw = (ctx, pause, pacman) => {
    if (!pause) {
      this.#move();
      this.#changeDirection();
    }

    this.#setImage(ctx, pacman);
    ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize);
  };

  collideWith = (pacman) => {
    const size = this.tileSize / 2;
    if (
      this.x < pacman.x + size &&
      this.x + size > pacman.x &&
      this.y < pacman.y + size &&
      this.y + size > pacman.y
    ) {
      return true;
    } else {
      return false;
    }
  };

  #random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  #changeDirection = () => {
    this.directionTimer--;
    let newMovementDirection = null;
    if (this.directionTimer === 0) {
      this.directionTimer = this.directionDefaultTimer;
      newMovementDirection = Math.floor(
        Math.random() * Object.keys(Movement).length
      );
    }

    if (
      newMovementDirection !== null &&
      this.movement !== newMovementDirection
    ) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (!this.tileMap.collideWall(this.x, this.y, newMovementDirection)) {
          this.movement = newMovementDirection;
        }
      }
    }
  };

  #move = () => {
    if (!this.tileMap.collideWall(this.x, this.y, this.movement)) {
      switch (this.movement) {
        case Movement.up:
          this.y -= this.velocity;
          break;
        case Movement.down:
          this.y += this.velocity;
          break;
        case Movement.left:
          this.x -= this.velocity;
          break;
        case Movement.right:
          this.x += this.velocity;
          break;

        default:
          break;
      }
    }
  };

  #loadImages = () => {
    this.normalGhost = new Image();
    this.normalGhost.src = "../images/ghost.png";

    this.scaredGhost = new Image();
    this.scaredGhost.src = "../images/scaredGhost.png";

    this.scaredGhostAlt = new Image();
    this.scaredGhostAlt.src = "../images/scaredGhostAlt.png";

    this.image = this.normalGhost;
  };

  #setImage = (ctx, pacman) => {
    if (pacman.powerDotActive) {
      this.#setImageActivePowerDot(pacman);
    } else {
      this.image = this.normalGhost;
    }
    ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize);
  };

  #setImageActivePowerDot = (pacman) => {
    if (pacman.powerDotAboutToExpire) {
      this.scaredAboutToExpireTimer--;
      if (this.scaredAboutToExpireTimer === 0) {
        this.scaredAboutToExpireTimer = SCARED_ABOUT_TO_EXPIRE;
        if (this.image === this.scaredGhost) {
          this.image = this.scaredGhostAlt;
        } else {
          this.image = this.scaredGhost;
        }
      }
    } else {
      this.image = this.scaredGhost;
    }
  };
}
