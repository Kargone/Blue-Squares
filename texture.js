shapes = {};
buildings = {};

class rect {
    constructor(x = 0, y = 0, width, height, rgb) {
        this.x = x;
        this.y = y;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.width = width ?? 10;
        this.height = height ?? 10;
        this.gridX = (x - 400) / 20;
        this.gridY = (y - 100) / 20;
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
    clicked() {
        if (!mouse_down) return;
        if ((this.x < mouseX) &&
            (this.y < mouseY) &&
            (mouseX < this.x + 20) &&
            (mouseY < this.y + 20)
        ) {
            let rgb = copy(current_color).split(",");
            this.r = parseInt(rgb[0].split('(')[1]);
            this.g = parseInt(rgb[1]);
            this.b = parseInt(rgb[2].split(')')[0]);
            rects[`${this.gridX}_${this.gridY}`] = `(${this.r},${this.g},${this.b})`;
        }
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

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

let rects = {};
let pastColors = {
    'last_1': 'rgb(0,0,0)',
    'last_2': 'rgb(0,0,0)',
    'last_3': 'rgb(0,0,0)',
    'last_4': 'rgb(0,0,0)',
    'last_5': 'rgb(0,0,0)',
}
let current_color = 'rgb(0,120,0)';
let current_change = 'r';

document.getElementById('color').style.background = current_color;
let rgb = copy(current_color).split(",");
document.getElementById('r').innerHTML = `r-${parseInt(rgb[0].split('(')[1])}`;
document.getElementById('g').innerHTML = `g-${parseInt(rgb[1])}`;
document.getElementById('b').innerHTML = `b-${parseInt(rgb[2].split(')')[0])}`;
for (const color of Object.keys(pastColors)) {
    let rgb = copy(pastColors[color]).split(",");
    document.getElementById(color).innerHTML = `${color}: r-${parseInt(rgb[0].split('(')[1])} g-${parseInt(rgb[1])} b-${parseInt(rgb[2].split(')')[0])}`;
    document.getElementById(color + '_button').style.background = pastColors[color];
}
document.getElementById('r').addEventListener('click', function () {
    current_change = 'r';
});
document.getElementById('g').addEventListener('click', function () {
    current_change = 'g';
});
document.getElementById('b').addEventListener('click', function () {
    current_change = 'b';
});
document.addEventListener("keydown", (e) => {
    let pressedKey = String(e.key);
    let rgb = copy(current_color).split(",");
    let rgbs = {
        'r': parseInt(rgb[0].split('(')[1]),
        'g': parseInt(rgb[1]),
        'b': parseInt(rgb[2].split(')')[0]),
    }
    if (pressedKey === "ArrowUp") {
        rgbs[current_change]++;
    } else if (pressedKey === "ArrowDown") {
        rgbs[current_change]--;
    }
    current_color = `rgb(${rgbs.r},${rgbs.g},${rgbs.b})`;
    document.getElementById('color').style.background = current_color;
    let rgb2 = copy(current_color).split(",");
    document.getElementById('r').innerHTML = `r-${parseInt(rgb2[0].split('(')[1])}`;
    document.getElementById('g').innerHTML = `g-${parseInt(rgb2[1])}`;
    document.getElementById('b').innerHTML = `b-${parseInt(rgb2[2].split(')')[0])}`;
});

for (let x = 1; x <= 15; x++) {
    for (let y = 1; y <= 15; y++) {
        const rect1 = new rect(x*20 + 400, y*20 + 100, 20, 20);
        rects[`${x}_${y}`] = `(${rect1.r},${rect1.g},${rect1.b})`;
    }
}

document.getElementById('copy').addEventListener('click', function () {
    navigator.clipboard.writeText(JSON.stringify(rects));
});