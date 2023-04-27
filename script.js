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
grid = {
    'x': (GAME_BORDER) * BLOCK_WIDTH, 
    'y': (GAME_BORDER) * BLOCK_HEIGHT,
    'distFromStartX': -1,
    'distFromStartY': -1,
};
let blue_squares = 0;
let blue_square_cost = 0;
let building_info_open = true;
let building_create_open = true;
let notificationRemoved = {'id':'removed or not'};

class rect {
    constructor(x = 0, y = 0, width, height, rgb) {
        this.x = x;
        this.y = y;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
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
    translateX_YfromStartX_Y(x, y) {
        this.x = mouseStartX_Y.x + x + this.distFromStartX;
        this.y = mouseStartX_Y.y + y + this.distFromStartY;
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
}

class Grass_Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.width = width;
        this.height = height;
        this.id = getRandomInt();
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
            const DO_SHADe = ((this.x / BLOCK_WIDTH) + (this.y / BLOCK_HEIGHT)) % 2;
            const GRASS_BLOCK = new Grass_Block(this.x, this.y, this.width, this.height);
            grid[`${this.x / BLOCK_WIDTH - GAME_BORDER + 1}_${this.y / BLOCK_HEIGHT - GAME_BORDER + 1}`] = '';
            if (DO_SHADe === 0) GRASS_BLOCK.drawInnerGrassBlock1();
            if (DO_SHADe === 1) GRASS_BLOCK.drawInnerGrassBlock2();
        }
        function drawOuterBlockOfGrass(object) {
            const GRASS_BLOCK = new Grass_Block(object.x, object.y, object.width, object.height);
            GRASS_BLOCK.drawOuterGrassBlock();
        }
    }
    drawOuterGrassBlock() {
        this.xScale = this.width / 300;
        this.yScale = this.height / 300;
        this.textureInfo = textureInfos[2];
        image_draw_infos[this.id] = this;
    }
    drawInnerGrassBlock1() {
        this.xScale = this.width / 300;
        this.yScale = this.height / 300;
        this.textureInfo = textureInfos[1];
        image_draw_infos[this.id] = this;
    }
    drawInnerGrassBlock2() {
        this.xScale = this.width / 300;
        this.yScale = this.height / 300;
        this.textureInfo = textureInfos[0];
        image_draw_infos[this.id] = this;
    }
    translateX_YfromStartX_Y(x, y) {
        this.x = mouseStartX_Y.x + x + this.distFromStartX;
        this.y = mouseStartX_Y.y + y + this.distFromStartY;
        image_draw_infos[this.id]['x'] = this.x;
        image_draw_infos[this.id]['y'] = this.y;
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
}

class blue_square {
    constructor(object) {
        const WIDTH_GAME_BLOCKS = 2;
        const HEIGHT_GAME_BLOCKS = 2;
        const BLOCK_INLINE = 22;
        const BORDER_WIDTH = 2;
        this.width = WIDTH_GAME_BLOCKS * BLOCK_WIDTH;
        this.height = HEIGHT_GAME_BLOCKS * BLOCK_HEIGHT;
        this.r = 160;
        this.g = 160;
        this.b = 255;
        this.gl = document.querySelector("#game-canvas").getContext("webgl2");
        this.colorLocation = '';
        this.x = 20;
        this.y = 20;
        this.originalX = copy(this.x);
        this.originalY = copy(this.y);
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.coordX = 0;
        this.coordY = 0;
        for (let x_y of Object.keys(grid)) {
            x_y = x_y.split('_');
            const gridX = parseInt(x_y[0]);
            const gridY = parseInt(x_y[1]);
            if (grid[`${gridX}_${gridY}`] != '') continue;
            if (grid[`${gridX + 1}_${gridY}`] != '') continue;
            if (grid[`${gridX}_${gridY + 1}`] != '') continue;
            if (grid[`${gridX + 1}_${gridY + 1}`] != '') continue;
            this.x = (gridX - 1) * BLOCK_WIDTH + grid.x;
            this.y = (gridY - 1) * BLOCK_HEIGHT + grid.y;
            this.originalX = copy(this.x);
            this.originalY = copy(this.y);
            grid[`${gridX}_${gridY}`] = 'blue_square';
            grid[`${gridX + 1}_${gridY}`] = 'blue_square';
            grid[`${gridX}_${gridY + 1}`] = 'blue_square';
            grid[`${gridX + 1}_${gridY + 1}`] = 'blue_square';
            this.coordX = gridX;
            this.coordY = gridY;
            break;
        }
        this.blockInline = BLOCK_INLINE;
        this.borderWidth = BORDER_WIDTH;
        const OUTLINE = new rect(
            this.x + BLOCK_INLINE,
            this.y + BLOCK_INLINE,
            this.width - (2 * BLOCK_INLINE),
            this.height - (2 * BLOCK_INLINE)
        );
        this.outelineId = OUTLINE.getId();
        const SQUARE = new rect(
            this.x + BLOCK_INLINE + BORDER_WIDTH,
            this.y + BLOCK_INLINE + BORDER_WIDTH,
            this.width - (2 * BLOCK_INLINE) - (2 * BORDER_WIDTH),
            this.height - (2 * BLOCK_INLINE) - (2 * BORDER_WIDTH),
            `(${this.r},${this.g},${this.b})`
        );
        SQUARE.z = 2;
        this.squareId = SQUARE.getId();
        this.selected = false;
        this.earningsPerSecond = 1;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.nextLevelUpgradeCost = 1;
        this.maxLevel = 10;
        this.level = 1;
        this.color = 'Blue';
        this.displayed = false;
        this.id = getRandomInt();
        this.totalCost = blue_square_cost;
        document.getElementById('resource-displays').innerHTML += `
            <p id="resource-display-${this.id}" class="resource-display">+
                <span id="resource-display-${this.id}-count">${this.earningsPerSecond}</span>
                <img src="Images/blue_square.png" class="resource-image">
            </p>
        `;
        buildings[this.id] = this;
    }
    checkForMouseHover() {
        if (!mouse_down) {
            if (this.selected) {
                this.checkXandY();
            }
            document.getElementById(`resource-display-${this.id}`).style.visibility = 'visible';
            this.selected = false;
            return false;
        }
        // if (this.selected) {
            
        // } else {
        //     if ((this.x + this.blockInline < mouseX) && (mouseX < this.x + this.width - this.blockInline)) {
        //         if ((this.y + this.blockInline < mouseY) && (mouseY < this.y + this.height - this.blockInline)) {
        //             document.getElementById(`resource-display-${this.id}`).style.visibility = 'hidden';
        //             this.selected = true;
        //             return true;
        //         }
        //     }
        // }
        if ((this.x - 20 < mouseX) && (mouseX < this.x + this.width + 20)) {
            if ((this.y - 20 < mouseY) && (mouseY < this.y + this.height + 20)) {
                if (!this.selected) {
                    grid[`${this.coordX}_${this.coordY}`] = '';
                    grid[`${this.coordX + 1}_${this.coordY}`] = '';
                    grid[`${this.coordX}_${this.coordY + 1}`] = '';
                    grid[`${this.coordX + 1}_${this.coordY + 1}`] = '';
                }
                document.getElementById(`resource-display-${this.id}`).style.visibility = 'hidden';
                this.selected = true;
                return true;
            }
        }
        if (this.selected) {
            this.checkXandY();
        }
        document.getElementById(`resource-display-${this.id}`).style.visibility = 'visible';
        this.selected = false;
        return false;
    }
    updateXandY() {
        this.x = Math.round((mouseX - this.width / 2) / BLOCK_WIDTH) * BLOCK_WIDTH;
        this.y = Math.round((mouseY - this.height / 2) / BLOCK_HEIGHT) * BLOCK_HEIGHT;
        this.setCoordXandY();
        this.x = (this.coordX - 1) * BLOCK_WIDTH + grid.x;
        this.y = (this.coordY - 1) * BLOCK_HEIGHT + grid.y;
        let outline_object = shapes[this.outelineId];
        outline_object.x = this.x + this.blockInline;
        outline_object.y = this.y + this.blockInline;
        let square_object = shapes[this.squareId];
        square_object.x = this.x + this.blockInline + this.borderWidth;
        square_object.y = this.y + this.blockInline + this.borderWidth;
    }
    checkXandY() {
        console.log('g')
        this.selected = false;
        if (
            (this.x > 0) && 
            (this.x >= grid.x) && 
            (this.y > 0) && 
            (this.y >= grid.y) && 
            (grid[`${this.coordX}_${this.coordY}`] === '') &&
            (grid[`${this.coordX + 1}_${this.coordY}`] === '') &&
            (grid[`${this.coordX}_${this.coordY + 1}`] === '') &&
            (grid[`${this.coordX + 1}_${this.coordY + 1}`] === '')
        ) {
            this.originalX = this.x;
            this.originalY = this.y;
            this.setCoordXandY();
            grid[`${this.coordX}_${this.coordY}`] = 'blue_square';
            grid[`${this.coordX + 1}_${this.coordY}`] = 'blue_square';
            grid[`${this.coordX}_${this.coordY + 1}`] = 'blue_square';
            grid[`${this.coordX + 1}_${this.coordY + 1}`] = 'blue_square';
        } else {
            this.x = copy(this.originalX);
            this.y = copy(this.originalY);
            this.setCoordXandY();
            grid[`${this.coordX}_${this.coordY}`] = 'blue_square';
            grid[`${this.coordX + 1}_${this.coordY}`] = 'blue_square';
            grid[`${this.coordX}_${this.coordY + 1}`] = 'blue_square';
            grid[`${this.coordX + 1}_${this.coordY + 1}`] = 'blue_square';
            let outline_object = shapes[this.outelineId];
            outline_object.x = this.x + this.blockInline;
            outline_object.y = this.y + this.blockInline;
            let square_object = shapes[this.squareId];
            square_object.x = this.x + this.blockInline + this.borderWidth;
            square_object.y = this.y + this.blockInline + this.borderWidth;
        }
    }
    setCoordXandY() {
        this.coordX = Math.round((this.x - grid.x) / BLOCK_WIDTH) + 1;
        this.coordY = Math.round((this.y - grid.y) / BLOCK_WIDTH) + 1;
    }
    upResource() {
        blue_squares += this.earningsPerSecond;
    }
    upgrade() {
        if (this.level >= this.maxLevel) return;
        if (blue_squares < this.nextLevelUpgradeCost) return;
        blue_squares -= this.nextLevelUpgradeCost;
        this.totalCost += this.nextLevelUpgradeCost;
        this.earningsPerSecond += 1;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.nextLevelUpgradeCost += 1;
        this.level += 1;
        this.blockInline -= 2;
        this.r -= 16;
        this.g -= 16;
        let outline_object = shapes[this.outelineId];
        outline_object.x = this.x + this.blockInline;
        outline_object.y = this.y + this.blockInline;
        outline_object.width = this.width - (2 * this.blockInline);
        outline_object.height = this.height - (2 * this.blockInline);
        let square_object = shapes[this.squareId];
        square_object.x = this.x + this.blockInline + this.borderWidth;
        square_object.y = this.y + this.blockInline + this.borderWidth;
        square_object.width = this.width - (2 * this.blockInline) - (2 * this.borderWidth);
        square_object.height = this.height - (2 * this.blockInline) - (2 * this.borderWidth);
        square_object.r = this.r;
        square_object.g = this.g;
        square_object.b = this.b;
        document.getElementById(`resource-display-${this.id}-count`).textContent = this.earningsPerSecond;
        document.getElementById("blue-squares-count").textContent = blue_squares;
    }
    displaySquare() {
        if (this.displayed) return;
        document.getElementById('building-info-no-content').style.display = 'none';
        document.getElementById('building-info-content').style.visibility = 'visible';
        for (const building_key of Object.keys(buildings)) {
            let building = buildings[building_key];
            building.displayed = false;
            building.removeUpgradeListener();
            building.removeDeleteListener();
        }
        this.displayed = true;
        document.getElementById("building-info-square_type").textContent = `${this.color} Square`;
        document.getElementById("building-info-level").textContent = `Level: ${this.level}`;
        document.getElementById("building-info-earnings_second").textContent = `Earnings per second: ${this.earningsPerSecond}`;
        document.getElementById("building-info-earnings_hour").textContent = `Earnings per hour: ${this.earningsPerHour}`;
        document.getElementById("building-info-upgrade-number").textContent = this.nextLevelUpgradeCost;
        document.getElementById("building-info-delete-number").textContent = this.totalCost;
        if (this.maxLevel === this.level) {
            document.getElementById("building-info-upgrade").style.display = 'none';
        } else {
            document.getElementById("building-info-upgrade").style.display = 'inline-block';
        }
        const THIS_SQUARE = this;
        let upgrade_button = document.getElementById("building-info-upgrade");
        this.upgradeButtonListner = function upgradeSquare() {
            THIS_SQUARE.displayed = false;
            THIS_SQUARE.upgrade();
            THIS_SQUARE.displaySquare();
        }
        upgrade_button.addEventListener('click', this.upgradeButtonListner, {'once': true});
        let delete_button = document.getElementById("building-info-delete");
        this.deleteButtonListner = function tryToDeleteSquare() {
            notification('Are you sure?');
            THIS_SQUARE.deleteButtonListner = function deleteSquare() {
                delete buildings[THIS_SQUARE.id];
                delete shapes[THIS_SQUARE.outelineId];
                delete shapes[THIS_SQUARE.squareId];
                blue_squares += THIS_SQUARE.totalCost;
                document.getElementById(`resource-display-${THIS_SQUARE.id}`).remove();
                THIS_SQUARE.removeUpgradeListener();
                document.getElementById('building-info-no-content').style.display = 'block';
                document.getElementById('building-info-content').style.visibility = 'hidden';
            }
            let delete_button = document.getElementById("building-info-delete");
            delete_button.addEventListener('click', THIS_SQUARE.deleteButtonListner, {'once': true});
        }
        delete_button.addEventListener('click', this.deleteButtonListner, {'once': true});
    }
    removeUpgradeListener() {
        let upgrade_button = document.getElementById("building-info-upgrade");
        upgrade_button.removeEventListener('click', this.upgradeButtonListner);
    }
    removeDeleteListener() {
        let delete_button = document.getElementById("building-info-delete");
        delete_button.removeEventListener('click', this.deleteButtonListner);
    }
    updateResourceDisplay() {
        document.getElementById(`resource-display-${this.id}`).style.top = (this.y + 2) + 'px';
        document.getElementById(`resource-display-${this.id}`).style.left = (this.x + 10)+ 'px';
    }
    translateX_YfromStartX_Y(x, y) {
        this.x = mouseStartX_Y.x + x + this.distFromStartX;
        this.y = mouseStartX_Y.y + y + this.distFromStartY;
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
}

function renderGame() {
    for (let current_block_height = 0; current_block_height < GAME_BLOCK_AMOUNT_HEIGHT; current_block_height++) {
        for (let current_block_width = 0; current_block_width < GAME_BLOCK_AMOUNT_WIDTH; current_block_width++) {
            const BLOCK = new Grass_Block(current_block_width * BLOCK_WIDTH, current_block_height * BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
            BLOCK.drawGrass();
        }
    }
}

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

function notification(text) {
    let x = getRandomInt();
    document.getElementById("notifications").innerHTML += `
        <div class="notification" id="noti${x}">
            <p class="notificationText">${text}</p>
            <p class="deleteNotification" id="delete${x}">X</p>
        </div>
    `;
    notificationRemoved[x] = false;
    for (notificationId of Object.keys(notificationRemoved)) {
        if (notificationRemoved[notificationId]) continue;
        let tempNotificationId = notificationId;
        document.getElementById("delete"+tempNotificationId).addEventListener('click', function () {
            document.getElementById("noti"+tempNotificationId).remove();
            notificationRemoved[tempNotificationId] = true;
        });
    }
    setTimeout(function() {
        if (notificationRemoved[x]) return;
        document.getElementById("noti"+x).remove();
        notificationRemoved[x] = true;
    }, 3000);
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

renderGame();

document.getElementById("blue-square-buy").addEventListener('click', function () {
    if (blue_squares < blue_square_cost) return;
    new blue_square();
    blue_squares -= blue_square_cost;
    blue_square_cost = blue_square_cost + 2 * 2;
    document.getElementById("blue-square-cost").textContent = blue_square_cost;
});

document.getElementById("toggle-building-info").addEventListener('click', function () {
    building_info_open = !building_info_open;
    if (building_info_open) {
        document.getElementById("building-info").className = "collapse-building-info open-building-info";
    } else {
        document.getElementById("building-info").className = "collapse-building-info";
    }
});

document.getElementById("toggle-building-create").addEventListener('click', function () {
    building_create_open = !building_create_open;
    if (building_create_open) {
        document.getElementById("building-create").className = "collapse-building-create open-building-create";
    } else {
        document.getElementById("building-create").className = "collapse-building-create";
    }
});

const UP_RESOURCES = setInterval(() => {
    for (const building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.upResource();
    }
    document.getElementById("blue-squares-count").textContent = blue_squares;
}, 1000);