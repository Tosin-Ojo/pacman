import Pacman from "./pacman.js";
import Ghost from "./ghost.js";
import Movement from "./movement.js";

import { BOX, DOT_ANIMATION_TIMER } from "../constants.js";

export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;

    this.yellowDot = new Image();
    this.yellowDot.src = "../images/yellowDot.png";

    this.pinkDot = new Image();
    this.pinkDot.src = "../images/pinkDot.png";

    this.wall = new Image();
    this.wall.src = "../images/wall.png";

    this.powerDot = this.pinkDot;
    this.powerDotAnimationTimer = DOT_ANIMATION_TIMER;

    this.box = BOX;
  }

  draw = (ctx) => {
    this.box.forEach((row, index) => {
      row.map((column, i) => {
        // ctx.strokeStyle = "yellow";
        // ctx.strokeRect(
        //   i * this.tileSize,
        //   index * this.tileSize,
        //   this.tileSize,
        //   this.tileSize
        // );

        if (column === 1) return this.#drawWall(ctx, i, index, this.tileSize);
        else if (column === 0)
          return this.#drawDot(ctx, i, index, this.tileSize);
        else if (column == 7)
          return this.#drawPowerDot(ctx, i, index, this.tileSize);
        else {
          this.#drawBlank(ctx, i, index, this.tileSize);
        }
      });
    });
  };

  #drawWall = (ctx, column, row, size) => {
    ctx.drawImage(
      this.wall,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  };

  #drawDot = (ctx, column, row, size) => {
    ctx.drawImage(
      this.yellowDot,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  };

  #drawPowerDot = (ctx, column, row, size) => {
    this.powerDotAnimationTimer--;
    if (this.powerDotAnimationTimer === 0) {
      this.powerDotAnimationTimer = DOT_ANIMATION_TIMER;
      if (this.powerDot === this.pinkDot) {
        this.powerDot = this.yellowDot;
      } else {
        this.powerDot = this.pinkDot;
      }
    }
    ctx.drawImage(this.powerDot, column * size, row * size, size, size);
  };

  #drawBlank = (ctx, column, row, size) => {
    ctx.fillStyle = "black";
    ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
  };

  getPacman = (velocity) => {
    let x;
    let y;

    this.box.forEach((row, index) => {
      row.map((column, i) => {
        if (column === 4) {
          this.box[index][i] = 0;
          x = i;
          y = index;
        }
      });
    });
    return new Pacman(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      velocity,
      this
    );
  };

  getGhosts = (velocity) => {
    const ghosts = [];

    this.box.forEach((row, index) => {
      row.map((column, i) => {
        if (column === 6) {
          this.box[index][i] = 0;
          return ghosts.push(
            new Ghost(
              i * this.tileSize,
              index * this.tileSize,
              this.tileSize,
              velocity,
              this
            )
          );
        }
      });
    });
    return ghosts;
  };

  setCanvasSize = (canvas) => {
    canvas.width = this.box[0].length * this.tileSize;
    canvas.height = this.box.length * this.tileSize;
  };

  collideWall = (x, y, direction) => {
    if (direction === null) return;

    if (
      Number.isInteger(x / this.tileSize) &&
      Number.isInteger(y / this.tileSize)
    ) {
      let column = 0;
      let row = 0;
      let nextColumn = 0;
      let nextRow = 0;

      switch (direction) {
        case Movement.right:
          nextColumn = x + this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case Movement.left:
          nextColumn = x - this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case Movement.up:
          nextRow = y - this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;
        case Movement.down:
          nextRow = y + this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;

        default:
          break;
      }

      const tile = this.box[row][column];
      if (tile === 1) {
        return true;
      }
    }
    return false;
  };

  didWin = () => {
    return this.#dotsLeft() === 0;
  };

  eatDot = (x, y) => {
    const row = y / this.tileSize;
    const column = x / this.tileSize;

    if (Number.isInteger(row) && Number.isInteger(column)) {
      if (this.box[row][column] === 0) {
        this.box[row][column] = 5;
        return true;
      }
    }
    return false;
  };

  eatPowerDot = (x, y) => {
    const row = y / this.tileSize;
    const column = x / this.tileSize;

    if (Number.isInteger(row) && Number.isInteger(column)) {
      if (this.box[row][column] === 7) {
        this.box[row][column] = 5;
        return true;
      }
    }
    return false;
  };

  #dotsLeft = () => {
    return this.box.flat().filter((tile) => tile === 0).length;
  };
}
