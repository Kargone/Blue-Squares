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
        this.gridX = (x - 400) / 10;
        this.gridY = (y - 100) / 10;
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
            (mouseX < this.x + 10) &&
            (mouseY < this.y + 10)
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

let rects = {"1_1":"(0,0,0)","1_2":"(0,0,0)","1_3":"(0,0,0)","1_4":"(0,0,0)","1_5":"(0,0,0)","1_6":"(0,0,0)","1_7":"(0,0,0)","1_8":"(0,0,0)","1_9":"(0,0,0)","1_10":"(0,0,0)","1_11":"(0,0,0)","1_12":"(0,0,0)","1_13":"(0,0,0)","1_14":"(0,0,0)","1_15":"(0,0,0)","2_1":"(0,0,0)","2_2":"(0,0,0)","2_3":"(0,0,0)","2_4":"(0,0,0)","2_5":"(0,0,0)","2_6":"(0,0,0)","2_7":"(0,0,0)","2_8":"(0,0,0)","2_9":"(0,0,0)","2_10":"(0,0,0)","2_11":"(0,0,0)","2_12":"(0,0,0)","2_13":"(0,0,0)","2_14":"(0,0,0)","2_15":"(0,0,0)","3_1":"(0,0,0)","3_2":"(0,0,0)","3_3":"(0,0,0)","3_4":"(0,0,0)","3_5":"(0,0,0)","3_6":"(0,0,0)","3_7":"(0,0,0)","3_8":"(0,0,0)","3_9":"(0,0,0)","3_10":"(0,0,0)","3_11":"(0,0,0)","3_12":"(0,0,0)","3_13":"(0,0,0)","3_14":"(0,0,0)","3_15":"(0,0,0)","4_1":"(0,0,0)","4_2":"(0,0,0)","4_3":"(0,0,0)","4_4":"(0,0,0)","4_5":"(0,0,0)","4_6":"(0,0,0)","4_7":"(0,0,0)","4_8":"(0,0,0)","4_9":"(0,0,0)","4_10":"(0,0,0)","4_11":"(0,0,0)","4_12":"(0,0,0)","4_13":"(0,0,0)","4_14":"(0,0,0)","4_15":"(0,0,0)","5_1":"(0,0,0)","5_2":"(0,0,0)","5_3":"(0,0,0)","5_4":"(0,0,0)","5_5":"(0,0,0)","5_6":"(0,0,0)","5_7":"(0,0,0)","5_8":"(0,0,0)","5_9":"(0,0,0)","5_10":"(0,0,0)","5_11":"(0,0,0)","5_12":"(0,0,0)","5_13":"(0,0,0)","5_14":"(0,0,0)","5_15":"(0,0,0)","6_1":"(0,0,0)","6_2":"(0,0,0)","6_3":"(0,0,0)","6_4":"(0,0,0)","6_5":"(0,0,0)","6_6":"(0,0,0)","6_7":"(0,0,0)","6_8":"(0,0,0)","6_9":"(0,0,0)","6_10":"(0,0,0)","6_11":"(0,0,0)","6_12":"(0,0,0)","6_13":"(0,0,0)","6_14":"(0,0,0)","6_15":"(0,0,0)","7_1":"(0,0,0)","7_2":"(0,0,0)","7_3":"(0,0,0)","7_4":"(0,0,0)","7_5":"(0,0,0)","7_6":"(0,0,0)","7_7":"(0,0,0)","7_8":"(0,0,0)","7_9":"(0,0,0)","7_10":"(0,0,0)","7_11":"(0,0,0)","7_12":"(0,0,0)","7_13":"(0,0,0)","7_14":"(0,0,0)","7_15":"(0,0,0)","8_1":"(0,0,0)","8_2":"(0,0,0)","8_3":"(0,0,0)","8_4":"(0,0,0)","8_5":"(0,0,0)","8_6":"(0,0,0)","8_7":"(0,0,0)","8_8":"(0,0,0)","8_9":"(0,0,0)","8_10":"(0,0,0)","8_11":"(0,0,0)","8_12":"(0,0,0)","8_13":"(0,0,0)","8_14":"(0,0,0)","8_15":"(0,0,0)","9_1":"(0,0,0)","9_2":"(0,0,0)","9_3":"(0,0,0)","9_4":"(0,0,0)","9_5":"(0,0,0)","9_6":"(0,0,0)","9_7":"(0,0,0)","9_8":"(0,0,0)","9_9":"(0,0,0)","9_10":"(0,0,0)","9_11":"(0,0,0)","9_12":"(0,0,0)","9_13":"(0,0,0)","9_14":"(0,0,0)","9_15":"(0,0,0)","10_1":"(0,0,0)","10_2":"(0,0,0)","10_3":"(0,0,0)","10_4":"(0,0,0)","10_5":"(0,0,0)","10_6":"(0,0,0)","10_7":"(0,0,0)","10_8":"(0,0,0)","10_9":"(0,0,0)","10_10":"(0,0,0)","10_11":"(0,0,0)","10_12":"(0,0,0)","10_13":"(0,0,0)","10_14":"(0,0,0)","10_15":"(0,0,0)","11_1":"(0,0,0)","11_2":"(0,0,0)","11_3":"(0,0,0)","11_4":"(0,0,0)","11_5":"(0,0,0)","11_6":"(0,0,0)","11_7":"(0,0,0)","11_8":"(0,0,0)","11_9":"(0,0,0)","11_10":"(0,0,0)","11_11":"(0,0,0)","11_12":"(0,0,0)","11_13":"(0,0,0)","11_14":"(0,0,0)","11_15":"(0,0,0)","12_1":"(0,0,0)","12_2":"(0,0,0)","12_3":"(0,0,0)","12_4":"(0,0,0)","12_5":"(0,0,0)","12_6":"(0,0,0)","12_7":"(0,0,0)","12_8":"(0,0,0)","12_9":"(0,0,0)","12_10":"(0,0,0)","12_11":"(0,0,0)","12_12":"(0,0,0)","12_13":"(0,0,0)","12_14":"(0,0,0)","12_15":"(0,0,0)","13_1":"(0,0,0)","13_2":"(0,0,0)","13_3":"(0,0,0)","13_4":"(0,0,0)","13_5":"(0,0,0)","13_6":"(0,0,0)","13_7":"(0,0,0)","13_8":"(0,0,0)","13_9":"(0,0,0)","13_10":"(0,0,0)","13_11":"(0,0,0)","13_12":"(0,0,0)","13_13":"(0,0,0)","13_14":"(0,0,0)","13_15":"(0,0,0)","14_1":"(0,0,0)","14_2":"(0,0,0)","14_3":"(0,0,0)","14_4":"(0,0,0)","14_5":"(0,0,0)","14_6":"(0,0,0)","14_7":"(0,0,0)","14_8":"(0,0,0)","14_9":"(0,0,0)","14_10":"(0,0,0)","14_11":"(0,0,0)","14_12":"(0,0,0)","14_13":"(0,0,0)","14_14":"(0,0,0)","14_15":"(0,0,0)","15_1":"(0,0,0)","15_2":"(0,0,0)","15_3":"(0,0,0)","15_4":"(0,0,0)","15_5":"(0,0,0)","15_6":"(0,0,0)","15_7":"(0,0,0)","15_8":"(0,0,0)","15_9":"(0,0,0)","15_10":"(0,0,0)","15_11":"(0,0,0)","15_12":"(0,0,0)","15_13":"(0,0,0)","15_14":"(0,0,0)","15_15":"(0,0,0)","1_16":"(0,0,0)","1_17":"(0,0,0)","1_18":"(0,0,0)","1_19":"(0,0,0)","1_20":"(0,0,0)","2_16":"(0,0,0)","2_17":"(0,0,0)","2_18":"(0,0,0)","2_19":"(0,0,0)","2_20":"(0,0,0)","3_16":"(0,0,0)","3_17":"(0,0,0)","3_18":"(0,0,0)","3_19":"(0,0,0)","3_20":"(0,0,0)","4_16":"(0,0,0)","4_17":"(0,0,0)","4_18":"(0,0,0)","4_19":"(0,0,0)","4_20":"(0,0,0)","5_16":"(0,0,0)","5_17":"(0,0,0)","5_18":"(0,0,0)","5_19":"(0,0,0)","5_20":"(0,0,0)","6_16":"(0,0,0)","6_17":"(0,0,0)","6_18":"(0,0,0)","6_19":"(0,0,0)","6_20":"(0,0,0)","7_16":"(0,0,0)","7_17":"(0,0,0)","7_18":"(0,0,0)","7_19":"(0,0,0)","7_20":"(0,0,0)","8_16":"(0,0,0)","8_17":"(0,0,0)","8_18":"(0,0,0)","8_19":"(0,0,0)","8_20":"(0,0,0)","9_16":"(0,0,0)","9_17":"(0,0,0)","9_18":"(0,0,0)","9_19":"(0,0,0)","9_20":"(0,0,0)","10_16":"(0,0,0)","10_17":"(0,0,0)","10_18":"(0,0,0)","10_19":"(0,0,0)","10_20":"(0,0,0)","11_16":"(0,0,0)","11_17":"(0,0,0)","11_18":"(0,0,0)","11_19":"(0,0,0)","11_20":"(0,0,0)","12_16":"(0,0,0)","12_17":"(0,0,0)","12_18":"(0,0,0)","12_19":"(0,0,0)","12_20":"(0,0,0)","13_16":"(0,0,0)","13_17":"(0,0,0)","13_18":"(0,0,0)","13_19":"(0,0,0)","13_20":"(0,0,0)","14_16":"(0,0,0)","14_17":"(0,0,0)","14_18":"(0,0,0)","14_19":"(0,0,0)","14_20":"(0,0,0)","15_16":"(0,0,0)","15_17":"(0,0,0)","15_18":"(0,0,0)","15_19":"(0,0,0)","15_20":"(0,0,0)","16_1":"(0,0,0)","16_2":"(0,0,0)","16_3":"(0,0,0)","16_4":"(0,0,0)","16_5":"(0,0,0)","16_6":"(0,0,0)","16_7":"(0,0,0)","16_8":"(0,0,0)","16_9":"(0,0,0)","16_10":"(0,0,0)","16_11":"(0,0,0)","16_12":"(0,0,0)","16_13":"(0,0,0)","16_14":"(0,0,0)","16_15":"(0,0,0)","16_16":"(0,0,0)","16_17":"(0,0,0)","16_18":"(0,0,0)","16_19":"(0,0,0)","16_20":"(0,0,0)","17_1":"(0,0,0)","17_2":"(0,0,0)","17_3":"(0,0,0)","17_4":"(0,0,0)","17_5":"(0,0,0)","17_6":"(0,0,0)","17_7":"(0,0,0)","17_8":"(0,0,0)","17_9":"(0,0,0)","17_10":"(0,0,0)","17_11":"(0,0,0)","17_12":"(0,0,0)","17_13":"(0,0,0)","17_14":"(0,0,0)","17_15":"(0,0,0)","17_16":"(0,0,0)","17_17":"(0,0,0)","17_18":"(0,0,0)","17_19":"(0,0,0)","17_20":"(0,0,0)","18_1":"(0,0,0)","18_2":"(0,0,0)","18_3":"(0,0,0)","18_4":"(0,0,0)","18_5":"(0,0,0)","18_6":"(0,0,0)","18_7":"(0,0,0)","18_8":"(0,0,0)","18_9":"(0,0,0)","18_10":"(0,0,0)","18_11":"(0,0,0)","18_12":"(0,0,0)","18_13":"(0,0,0)","18_14":"(0,0,0)","18_15":"(0,0,0)","18_16":"(0,0,0)","18_17":"(0,0,0)","18_18":"(0,0,0)","18_19":"(0,0,0)","18_20":"(0,0,0)","19_1":"(0,0,0)","19_2":"(0,0,0)","19_3":"(0,0,0)","19_4":"(0,0,0)","19_5":"(0,0,0)","19_6":"(0,0,0)","19_7":"(0,0,0)","19_8":"(0,0,0)","19_9":"(0,0,0)","19_10":"(0,0,0)","19_11":"(0,0,0)","19_12":"(0,0,0)","19_13":"(0,0,0)","19_14":"(0,0,0)","19_15":"(0,0,0)","19_16":"(0,0,0)","19_17":"(0,0,0)","19_18":"(0,0,0)","19_19":"(0,0,0)","19_20":"(0,0,0)","20_1":"(0,0,0)","20_2":"(0,0,0)","20_3":"(0,0,0)","20_4":"(0,0,0)","20_5":"(0,0,0)","20_6":"(0,0,0)","20_7":"(0,0,0)","20_8":"(0,0,0)","20_9":"(0,0,0)","20_10":"(0,0,0)","20_11":"(0,0,0)","20_12":"(0,0,0)","20_13":"(0,0,0)","20_14":"(0,0,0)","20_15":"(0,0,0)","20_16":"(0,0,0)","20_17":"(0,0,0)","20_18":"(0,0,0)","20_19":"(0,0,0)","20_20":"(0,0,0)"}
let pastColors = {
    'last_1': 'rgb(0,0,0)',
    'last_2': 'rgb(0,0,0)',
    'last_3': 'rgb(0,0,0)',
    'last_4': 'rgb(0,0,0)',
    'last_5': 'rgb(0,0,0)',
}
let current_color = 'rgb(0,0,0)';
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
    document.getElementById('current_text').textContent = `Current_${current_change}:`;
});
document.getElementById('g').addEventListener('click', function () {
    current_change = 'g';
    document.getElementById('current_text').textContent = `Current_${current_change}:`;
});
document.getElementById('b').addEventListener('click', function () {
    current_change = 'b';
    document.getElementById('current_text').textContent = `Current_${current_change}:`;
});
for (let x = 1; x < 6; x++) {
    document.getElementById(`last_${x}`).addEventListener('click', function () {
        console.log('click')
        current_color = copy(pastColors[`last_${x}`]);
        document.getElementById('color').style.background = current_color;
        let rgb = copy(current_color).split(",");
        document.getElementById('r').innerHTML = `r-${parseInt(rgb[0].split('(')[1])}`;
        document.getElementById('g').innerHTML = `g-${parseInt(rgb[1])}`;
        document.getElementById('b').innerHTML = `b-${parseInt(rgb[2].split(')')[0])}`;
    });
}
document.addEventListener("keydown", (e) => {
    let pressedKey = String(e.key);
    console.log(pressedKey)
    if (pressedKey === ' ') {
        for (let x = 5; x > 1; x--) {
            pastColors[`last_${x}`] = copy(pastColors[`last_${x - 1}`]);
        }
        pastColors[`last_1`] = copy(current_color);
        for (const color of Object.keys(pastColors)) {
            let rgb = copy(pastColors[color]).split(",");
            document.getElementById(color).innerHTML = `${color}: r-${parseInt(rgb[0].split('(')[1])} g-${parseInt(rgb[1])} b-${parseInt(rgb[2].split(')')[0])}`;
            document.getElementById(color + '_button').style.background = pastColors[color];
        }
        return;
    }
    let rgb = copy(current_color).split(",");
    let rgbs = {
        'r': parseInt(rgb[0].split('(')[1]),
        'g': parseInt(rgb[1]),
        'b': parseInt(rgb[2].split(')')[0]),
    }
    if ((pressedKey === "ArrowUp") || (pressedKey === "w")) {
        rgbs[current_change]++;
    } else if ((pressedKey === "ArrowDown") || (pressedKey === "s")) {
        rgbs[current_change]--;
    } else if ((pressedKey === "ArrowLeft") || (pressedKey === "a")) {
        rgbs[current_change] -= 10;
    } else if ((pressedKey === "ArrowRight") || (pressedKey === "d")) {
        rgbs[current_change] += 10;
    } else if (pressedKey === "z") {
        current_change = 'r';
    } else if (pressedKey === "x") {
        current_change = 'g';
    } else if (pressedKey === "c") {
        current_change = 'b';
    }
    if (rgbs[current_change] < 0) rgbs[current_change] = 0;
    if (rgbs[current_change] > 255) rgbs[current_change] = 255;
    current_color = `rgb(${rgbs.r},${rgbs.g},${rgbs.b})`;
    document.getElementById('color').style.background = current_color;
    document.getElementById('current_text').textContent = `Current_${current_change}:`;
    let rgb2 = copy(current_color).split(",");
    document.getElementById('r').innerHTML = `r-${parseInt(rgb2[0].split('(')[1])}`;
    document.getElementById('g').innerHTML = `g-${parseInt(rgb2[1])}`;
    document.getElementById('b').innerHTML = `b-${parseInt(rgb2[2].split(')')[0])}`;
});


for (let x = 1; x <= 30; x++) {
    for (let y = 1; y <= 30; y++) {
        rects[`${x}_${y}`] = rects[`${x}_${y}`] ?? `(${parseInt(rgb[0].split('(')[1])},${parseInt(rgb[1])},${parseInt(rgb[2].split(')')[0])})`;
        const rect1 = new rect(x*10 + 400, y*10 + 100, 10, 10, `rgb${rects[`${x}_${y}`]}`);
    }
}

document.getElementById('copy').addEventListener('click', function () {
    navigator.clipboard.writeText(JSON.stringify(rects));
});