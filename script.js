// const game_canvas = document.getElementById('game-canvas');
// const ctx = game_canvas.getContext('2d');

// let vh = window.innerHeight * 0.01;
// let aspect_ratio = window.innerWidth / window.innerHeight;
// document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
// game_canvas.style.width = window.innerWidth + 'px';
// game_canvas.style.height = window.innerHeight + 'px';

// window.addEventListener('resize', () => {
//     let vh = window.innerHeight * 0.01;
//     document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
//     game_canvas.style.width = window.innerWidth + 'px';
//     game_canvas.style.height = window.innerHeight + 'px';
//     aspect_ratio = window.innerWidth / window.innerHeight;
//     block_height = BLOCK_WIDTH * aspect_ratio;
// });

// const GAME_BLOCK_AMOUNT_WIDTH = 50;
// const GAME_BLOCK_AMOUNT_HEIGHT = 30;
// const BLOCK_WIDTH = 15;
// let block_height = Math.round(BLOCK_WIDTH / aspect_ratio);
// const GAME_BORDER = 4;
// const OUTER_GRASS_COLOR = '#146e10';
// const INNER_GRASS_COLOR = '#1ee317';

shapes = [];

class rect {
  constructor(x, y) {
    this.width = 50;
    this.height = 50;
    this.x = x || 100;
    this.y = y || 0;
    this.gl = document.querySelector("#c").getContext("webgl2");
    this.colorLocation ='';
    shapes.push(this);
  }
  draw() {
    let x1 = this.x;
    let x2 = this.x + this.width;
    let y1 = this.y;
    let y2 = this.y + this.height;
    const gl = this.gl;
    const colorLocation = this.colorLocation;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
    ]), gl.STATIC_DRAW);
    // Set a random color.
    gl.uniform4f(colorLocation, 100/255, 100/255, 100/255, 1);
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

class shape {
    constructor(x, y, width, height, fill) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fill = fill || '';
    }
    drawRect() {
        ctx.beginPath();
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }
    drawGrass() {
        if (this.x <= BLOCK_WIDTH * GAME_BORDER) {
            const grass_block = new shape(this.x, this.y, this.width, this.height, OUTER_GRASS_COLOR);
            grass_block.drawRect();
            grass_block.drawGrid();
        } else if (this.x >= BLOCK_WIDTH * GAME_BLOCK_AMOUNT_WIDTH - BLOCK_WIDTH * GAME_BORDER) {
            const grass_block = new shape(this.x, this.y, this.width, this.height, OUTER_GRASS_COLOR);
            grass_block.drawRect();
            grass_block.drawGrid();
        } else if (this.y <= block_height * GAME_BORDER) {
            const grass_block = new shape(this.x, this.y, this.width, this.height, OUTER_GRASS_COLOR);
            grass_block.drawRect();
            grass_block.drawGrid();
        } else if (this.y >= block_height * GAME_BLOCK_AMOUNT_HEIGHT - block_height * GAME_BORDER) {
            const grass_block = new shape(this.x, this.y, this.width, this.height, OUTER_GRASS_COLOR);
            grass_block.drawRect();
            grass_block.drawGrid();
        } else {
            const grass_block = new shape(this.x, this.y, this.width, this.height, INNER_GRASS_COLOR);
            grass_block.drawRect();
            grass_block.drawGrid();
        }
    }
    drawGrid() {
        const line1 = new shape(this.x, this.y, this.width, this.y, 'black');
        line1.drawLine();
        const line2 = new shape(this.x, this.y, this.x, this.height, 'black');
        line2.drawLine();
    }
    drawLine() {
        ctx.beginPath()
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.width, this.height);
        ctx.lineWidth = .2;
        ctx.stroke();
    }
}

function renderGame() {
    for (let current_block_height = 0; current_block_height < GAME_BLOCK_AMOUNT_HEIGHT; current_block_height++) {
        for (let current_block_width = 0; current_block_width < GAME_BLOCK_AMOUNT_WIDTH; current_block_width++) {
            const block = new shape(current_block_width * BLOCK_WIDTH, current_block_height * block_height, BLOCK_WIDTH, block_height);
            block.drawGrass();
        }
    }
}

const rectangle = new rect(100, 100);