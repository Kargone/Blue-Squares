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
});

const GAME_BLOCK_AMOUNT_WIDTH = 54;
const GAME_BLOCK_AMOUNT_HEIGHT = 27;
const BLOCK_WIDTH = 30;
const BLOCK_HEIGHT = 30;
const GAME_BORDER = 4;
const OUTER_GRASS_COLOR = '(20,110,16)';
const INNER_GRASS_COLOR = '(30,227,23)';

shapes = [];
buildings = [];

class rect {
  constructor(x = 0, y = 0, width, height, rgb) {
    this.x = x;
    this.y = y;
    this.width = width || 10;
    this.height = height || 10;
    if (rgb != undefined) {
        rgb = rgb.split(",");
        this.r = parseInt(rgb[0].split('(')[1]);
        this.g = parseInt(rgb[1]);
        this.b = parseInt(rgb[2].split(')')[0]);
    } else {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
    console.log(this.r,this.g,this.b)
    this.gl = document.querySelector("#game-canvas").getContext("webgl2");
    this.colorLocation = '';
    this.id = getRandomInt();
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
  getId() {
    return this.id;
  }
}

class Grass_Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    drawGrass() {
        if (this.x < BLOCK_WIDTH * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.x >= BLOCK_WIDTH * GAME_BLOCK_AMOUNT_WIDTH - BLOCK_WIDTH * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.y < BLOCK_HEIGHT * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else if (this.y >= BLOCK_HEIGHT * GAME_BLOCK_AMOUNT_HEIGHT - BLOCK_HEIGHT * GAME_BORDER) {
            drawOuterBlockOfGrass(this);
        } else {
            const doShade = ((this.x / BLOCK_WIDTH) + (this.y / BLOCK_HEIGHT)) % 2;
            const grass_block = new Grass_Block(this.x, this.y, this.width, this.height);
            if (doShade === 0) grass_block.drawInnerGrassBlock1();
            if (doShade === 1) grass_block.drawInnerGrassBlock2();
        }
        function drawOuterBlockOfGrass(object) {
            const grass_block = new Grass_Block(object.x, object.y, object.width, object.height);
            grass_block.drawOuterGrassBlock();
        }
    }
    drawOuterGrassBlock() {
        var image_draw_info = {
            x: this.x,
            y: this.y,
            xScale: this.width / 300,
            yScale: this.height / 300,
            textureInfo: textureInfos[2],
        };
        image_draw_infos.push(image_draw_info);
    }
    drawInnerGrassBlock1() {
        var image_draw_info = {
            x: this.x,
            y: this.y,
            xScale: this.width / 300,
            yScale: this.height / 300,
            textureInfo: textureInfos[1],
        };
        image_draw_infos.push(image_draw_info);
    }
    drawInnerGrassBlock2() {
        var image_draw_info = {
            x: this.x,
            y: this.y,
            xScale: this.width / 300,
            yScale: this.height / 300,
            textureInfo: textureInfos[0],
        };
        image_draw_infos.push(image_draw_info);
    }
}

class blue_square {
    constructor(x = 100, y = 100) {
        const widthGameBlocks = 2;
        const heightGameBlocks = 2;
        const outlineInline = 20;
        const inlineInline = 2;
        this.x = x;
        this.y = y;
        this.width = widthGameBlocks * BLOCK_WIDTH;
        this.height = heightGameBlocks * BLOCK_HEIGHT;
        this.r = 0;
        this.g = 0;
        this.b = 255;
        this.gl = document.querySelector("#game-canvas").getContext("webgl2");
        this.colorLocation = '';
        this.outlineInline = outlineInline;
        this.inlineInline = inlineInline;
        const outline = new rect(
            this.x + outlineInline,
            this.y + outlineInline,
            this.width - (2 * outlineInline),
            this.height - (2 * outlineInline)
        );
        this.outelineId = outline.getId();
        const square = new rect(
            this.x + outlineInline + inlineInline,
            this.y + outlineInline + inlineInline,
            this.width - (2 * outlineInline) - (2 * inlineInline),
            this.height - (2 * outlineInline) - (2 * inlineInline),
            '(160,160,255)'
        );
        this.squareId = square.getId();
        this.selected = false;
        buildings.push(this);
    }
    checkForMouse() {
        if (!mouse_down) return false;
        if (this.selected) {
            if ((this.x - 20 < mouseX) && (mouseX < this.x + this.width + 20)) {
                if ((this.y - 20 < mouseY) && (mouseY < this.y + this.height + 20)) {
                    this.selected = true;
                    return true;
                }
            }
        } else {
            if ((this.x + this.outlineInline < mouseX) && (mouseX < this.x + this.width - this.outlineInline)) {
                if ((this.y + this.outlineInline < mouseY) && (mouseY < this.y + this.height - this.outlineInline)) {
                    this.selected = true;
                    return true;
                }
            }
        }
        this.selected = false;
        return false;
    }
    updateXandY() {
        this.x = Math.round((mouseX - this.width / 2) / BLOCK_WIDTH) * BLOCK_WIDTH;
        this.y = Math.round((mouseY - this.height / 2) / BLOCK_HEIGHT) * BLOCK_HEIGHT;
        for (let index in shapes) {
            let element = shapes[index];
            if (element.id === this.outelineId) {
                shapes[index].x = this.x + this.outlineInline;
                shapes[index].y = this.y + this.outlineInline;
            } else if (element.id === this.squareId) {
                shapes[index].x = this.x + this.outlineInline + this.inlineInline;
                shapes[index].y = this.y + this.outlineInline + this.inlineInline;
            }
        }
    }
}

function renderGame() {
    for (let current_block_height = 0; current_block_height < GAME_BLOCK_AMOUNT_HEIGHT; current_block_height++) {
        for (let current_block_width = 0; current_block_width < GAME_BLOCK_AMOUNT_WIDTH; current_block_width++) {
            const block = new Grass_Block(current_block_width * BLOCK_WIDTH, current_block_height * BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
            block.drawGrass();
        }
    }
}

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

renderGame();
new blue_square(120, 120);
new blue_square(180, 120);
new blue_square(120, 180);
new blue_square(180, 180);
// const grass = new shape(400, 0, 20, 20);
// grass.drawInnerGrassBlock1();
// const grass2 = new shape(400, 300, 300, 300);
// grass2.drawInnerGrassBlock2();
// const grass3 = new shape(700, 300, 300, 300);
// grass3.drawInnerGrassBlock1();
// const grass4 = new shape(700, 0, 300, 300);
// grass4.drawInnerGrassBlock2();
// const grass5 = new shape(100, 0, 300, 300);
// grass5.drawOuterGrassBlock();
// const grass6 = new shape(100, 300, 300, 300);
// grass6.drawOuterGrassBlock();