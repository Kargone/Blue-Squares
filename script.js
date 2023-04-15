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

shapes = {};
buildings = {};
let blue_squares = 0;
let blue_square_cost = 0;

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
    this.gl = document.querySelector("#game-canvas").getContext("webgl2");
    this.colorLocation = '';
    this.id = getRandomInt();
    this.z = 1;
    shapes[this.id] = this;
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
        const outlineInline = 22;
        const inlineInline = 2;
        this.x = x;
        this.y = y;
        this.width = widthGameBlocks * BLOCK_WIDTH;
        this.height = heightGameBlocks * BLOCK_HEIGHT;
        this.r = 160;
        this.g = 160;
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
            `(${this.r},${this.g},${this.b})`
        );
        square.z = 2;
        this.squareId = square.getId();
        this.selected = false;
        this.earningsPerSecond = 1;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.nextLevelUpgradeCost = 1;
        this.maxLevel = 10;
        this.level = 1;
        this.color = 'Blue';
        this.displayed = false;
        this.id = getRandomInt();
        document.getElementById('resource-displays').innerHTML += `
            <p id="resource-display-${this.id}" class="resource-display">+
                <span id="resource-display-${this.id}-count">${this.earningsPerSecond}</span>
                <img src="Images/blue_square.png" style="margin-left: 2px; margin-bottom: -2px; width: 10px; height: 10px; border: 2px solid black;">
            </p>
        `;
        buildings[this.id] = this;
    }
    checkForMouseHover() {
        if (!mouse_down) {
            document.getElementById(`resource-display-${this.id}`).style.display = 'inline-block';
            this.selected = false;
            return false;
        }
        if (this.selected) {
            if ((this.x - 20 < mouseX) && (mouseX < this.x + this.width + 20)) {
                if ((this.y - 20 < mouseY) && (mouseY < this.y + this.height + 20)) {
                    document.getElementById(`resource-display-${this.id}`).style.display = 'none';
                    this.selected = true;
                    return true;
                }
            }
        } else {
            if ((this.x + this.outlineInline < mouseX) && (mouseX < this.x + this.width - this.outlineInline)) {
                if ((this.y + this.outlineInline < mouseY) && (mouseY < this.y + this.height - this.outlineInline)) {
                    document.getElementById(`resource-display-${this.id}`).style.display = 'none';
                    this.selected = true;
                    return true;
                }
            }
        }
        document.getElementById(`resource-display-${this.id}`).style.display = 'inline-block';
        this.selected = false;
        return false;
    }
    updateXandY() {
        this.x = Math.round((mouseX - this.width / 2) / BLOCK_WIDTH) * BLOCK_WIDTH;
        this.y = Math.round((mouseY - this.height / 2) / BLOCK_HEIGHT) * BLOCK_HEIGHT;
        let outline_object = shapes[this.outelineId];
        outline_object.x = this.x + this.outlineInline;
        outline_object.y = this.y + this.outlineInline;
        let square_object = shapes[this.squareId];
        square_object.x = this.x + this.outlineInline + this.inlineInline;
        square_object.y = this.y + this.outlineInline + this.inlineInline;
    }
    upResource() {
        blue_squares += this.earningsPerSecond;
    }
    upgrade() {
        if (this.level >= this.maxLevel) return;
        if (blue_squares < this.nextLevelUpgradeCost) return;
        blue_squares -= this.nextLevelUpgradeCost;
        this.earningsPerSecond += 1;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.nextLevelUpgradeCost += 1;
        this.level += 1;
        this.outlineInline -= 2;
        this.r -= 16;
        this.g -= 16;
        let outline_object = shapes[this.outelineId];
        outline_object.x = this.x + this.outlineInline;
        outline_object.y = this.y + this.outlineInline;
        outline_object.width = this.width - (2 * this.outlineInline);
        outline_object.height = this.height - (2 * this.outlineInline);
        let square_object = shapes[this.squareId];
        square_object.x = this.x + this.outlineInline + this.inlineInline;
        square_object.y = this.y + this.outlineInline + this.inlineInline;
        square_object.width = this.width - (2 * this.outlineInline) - (2 * this.inlineInline);
        square_object.height = this.height - (2 * this.outlineInline) - (2 * this.inlineInline);
        square_object.r = this.r;
        square_object.g = this.g;
        square_object.b = this.b;
        document.getElementById(`resource-display-${this.id}-count`).textContent = this.earningsPerSecond;
        document.getElementById("blue-squares-count").textContent = blue_squares;
    }
    displaySquare() {
        if (this.displayed) return;
        for (let building_key of Object.keys(buildings)) {
            let building = buildings[building_key];
            building.displayed = false;
            building.removeUpgradeListener();
        }
        this.displayed = true;
        document.getElementById("building-info-square_type").textContent = `${this.color} Square`;
        document.getElementById("building-info-level").textContent = `Level: ${this.level}`;
        document.getElementById("building-info-earnings_second").textContent = `Earnings per second: ${this.earningsPerSecond}`;
        document.getElementById("building-info-earnings_hour").textContent = `Earnings per hour: ${this.earningsPerHour}`;
        document.getElementById("building-info-upgrade-number").textContent = this.nextLevelUpgradeCost;
        if (this.maxLevel === this.level) {
            document.getElementById("building-info-upgrade").style.display = 'none';
        } else {
            document.getElementById("building-info-upgrade").style.display = 'inline-block';
        }
        let upgrade_button = document.getElementById("building-info-upgrade");
        const this_square = this;
        this.upgradeButtonListner = function upgradeSquare() {
            this_square.displayed = false;
            this_square.upgrade();
            this_square.displaySquare();
        }
        upgrade_button.addEventListener('click', this.upgradeButtonListner, {'once': true});
    }
    removeUpgradeListener() {
        let upgrade_button = document.getElementById("building-info-upgrade");
        upgrade_button.removeEventListener('click', this.upgradeButtonListner);
    }
    updateResourceDisplay() {
        document.getElementById(`resource-display-${this.id}`).style.top = (this.y + 2) + 'px';
        document.getElementById(`resource-display-${this.id}`).style.left = (this.x + 10)+ 'px';
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
document.getElementById("blue-square-buy").addEventListener('click', function () {
    if (blue_squares < blue_square_cost) return;
    new blue_square((getRandomInt(30) + 4) * 30, (getRandomInt(18) + 4) * 30);
    blue_squares -= blue_square_cost;
    blue_square_cost = blue_square_cost + 2 * 2;
    document.getElementById("blue-square-cost").textContent = blue_square_cost;
});
setInterval(() => {
    for (let building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.upResource();
    }
    document.getElementById("blue-squares-count").textContent = blue_squares;
}, 1000);