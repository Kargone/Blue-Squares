const game_canvas = document.getElementById('game-canvas');
const body = document.getElementById('body');

let vh = window.innerHeight * 0.01;
let aspect_ratio = window.innerWidth / window.innerHeight;
document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
game_canvas.style.width = window.innerWidth + 'px';
game_canvas.style.height = window.innerHeight + 'px';
body.style.width = window.innerWidth + 'px';
body.style.height = window.innerHeight + 'px';

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
    game_canvas.style.width = window.innerWidth + 'px';
    game_canvas.style.height = window.innerHeight + 'px';
    body.style.width = window.innerWidth + 'px';
    body.style.height = window.innerHeight + 'px';
    aspect_ratio = window.innerWidth / window.innerHeight;
    // block_height = BLOCK_WIDTH * aspect_ratio;
});

const GAME_BLOCK_AMOUNT_WIDTH = 50;
const GAME_BLOCK_AMOUNT_HEIGHT = 30;
const BLOCK_WIDTH = 15;
let block_height = 15;
const GAME_BORDER = 4;
const OUTER_GRASS_COLOR = '(20,110,16)';
const INNER_GRASS_COLOR = '(30,227,23)';

shapes = [];

class rect {
  constructor(x = 0, y = 0, width, height, rgb) {
    this.x = x;
    this.y = y;
    this.width = width || 10;
    this.height = height || 10;
    if (rgb != undefined) {
        rgb = rgb.split(",");
        this.r = parseInt(rgb[0].substring(1, rgb[0].length)) || 255;
        this.g = parseInt(rgb[1]) || 255;
        this.b = parseInt(rgb[2].substring(0, rgb[0].length - 1)) || 255;
    } else {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
    this.gl = document.querySelector("#game-canvas").getContext("webgl2");
    this.colorLocation = '';
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
    gl.uniform4f(colorLocation, this.r/255, this.g/255, this.b/255, 1);
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
        this.fill = fill || '(255,255,255)';
    }
    drawRect() {
        new rect(this.x, this.y, this.width, this.height, this.fill);
    }
    drawGrass() {
        if (this.x < BLOCK_WIDTH * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.x >= BLOCK_WIDTH * GAME_BLOCK_AMOUNT_WIDTH - BLOCK_WIDTH * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.y < block_height * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.y >= block_height * GAME_BLOCK_AMOUNT_HEIGHT - block_height * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else {
            const grass_block = new shape(this.x, this.y, this.width, this.height, INNER_GRASS_COLOR);
            grass_block.drawRect();
            // grass_block.drawGrid();
        }
        function drawOuterBlockOfGrass(object) {
            const grass_block = new shape(object.x, object.y, object.width, object.height, OUTER_GRASS_COLOR);
            grass_block.drawRect();
            // grass_block.drawGrid();
        }
    }
    pixelGrass() {
        new rect(this.x, this.y, this.width, this.height, this.fill);
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

const grass = new shape(600, 200, 400, 400, OUTER_GRASS_COLOR);
grass.pixelGrass();