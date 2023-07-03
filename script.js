const game_canvas = document.getElementById('game-canvas');
const body = document.getElementById('body');
let vh = window.innerHeight * 0.01;
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
});
display();
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getDatabase,
    child,
    ref,
    set,
    get,
    push, 
    update,
    remove
  } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyByhAfobvZt_OQu-32tVbXho6n2L4IaNEE",
    authDomain: "blue-squares-d1f83.firebaseapp.com",
    databaseURL: "https://blue-squares-d1f83-default-rtdb.firebaseio.com",
    projectId: "blue-squares-d1f83",
    storageBucket: "blue-squares-d1f83.appspot.com",
    messagingSenderId: "902439481018",
    appId: "1:902439481018:web:4cc44b28a38a62e8c01c83",
    measurementId: "G-Q5HDHVEEDJ"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase(app));

const GAME_BLOCK_AMOUNT_WIDTH = 50;
const GAME_BLOCK_AMOUNT_HEIGHT = 30;
const BLOCK_WIDTH = 30;
const BLOCK_HEIGHT = 30;
const GAME_BORDER = 4;

shapes = {
    'z1': {}, 
    'z2': {}
};
buildings = {};
const MAX_GLOBAL_SCALE = Math.min(
    window.innerWidth / 5 / BLOCK_WIDTH, 
    window.innerHeight / 5 / BLOCK_WIDTH
);
const MIN_GLOBAL_SCALE = Math.max(
    window.innerWidth / 25 / BLOCK_WIDTH, 
    window.innerHeight / 25 / BLOCK_WIDTH
);
global_scale = MIN_GLOBAL_SCALE;
grid = {
    'x': (GAME_BORDER) * BLOCK_WIDTH * global_scale, 
    'y': (GAME_BORDER) * BLOCK_HEIGHT * global_scale,
    'distFromStartX': -1,
    'distFromStartY': -1
};
building_selected_id = '';
const colors = {
    'Blue': {
        'r': 160,
        'g': 160,
        'b': 255,
        'r2': 16,
        'g2': 16,
        'b2': 255,
    },
    'Red': {
        'r': 255,
        'g': 160,
        'b': 160,
        'r2': 255,
        'g2': 16,
        'b2': 16,
    },
    'Green': {
        'r': 160,
        'g': 255,
        'b': 160,
        'r2': 16,
        'g2': 255,
        'b2': 16,
    },
    'Purple': {
        'r': 200,
        'g': 150,
        'b': 255,
        'r2': 180,
        'g2': 0,
        'b2': 255,
    },
    'Orange': {
        'r': 255,
        'g': 200,
        'b': 160,
        'r2': 255,
        'g2': 180,
        'b2': 0,
    },
    'Yellow': {
        'r': 255,
        'g': 255,
        'b': 160,
        'r2': 255,
        'g2': 255,
        'b2': 0,
    },
    'White': {
        'r': 80,
        'g': 80,
        'b': 80,
        'r2': 250,
        'g2': 250,
        'b2': 250,
    },
};
building_info_open = true;
let building_create_open = true;
let currencies = {
    'blue_squares': 0,
    'red_squares': 0,
    'green_squares': 0,
    'purple_squares': 0,
    'orange_squares': 0,
    'yellow_squares': 0,
    'white_squares': 0
};
let buy_costs = {
    'blue_squares': 0,
    'red_squares': 0,
    'green_squares': 0,
    'purple_squares': 0,
    'orange_squares': 0,
    'yellow_squares': 0,
    'white_squares': 0
};
user_settings = {
    'all-notifications': true,
    'notification-invalid-movement': true,
    'notification-not-enough-upgrade': true,
    'notification-not-enough-new-square': true,
    'notification-deletion': true,
    'no-delete': false,
    'double-tap-delete': true,
    'no-square-movement': false,
    'open-square-after-move': true
};
let grass_grid = [
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"],
    ["o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o"]
];
addHighlight = false;
let last_touch_distance = 0;
let username;
let userId = JSON.parse(localStorage.getItem('blue-squares:user')).uid;
let in_game_time = 0;

// for (let grass_grid_y = 0; grass_grid_y < GAME_BLOCK_AMOUNT_HEIGHT + 2; grass_grid_y++) {
//     grass_grid[grass_grid_y] = [];
//     for (let grass_grid_x = 0; grass_grid_x < GAME_BLOCK_AMOUNT_WIDTH + 2; grass_grid_x++) {
//         if ((grass_grid_y === 0) || (grass_grid_y === GAME_BLOCK_AMOUNT_HEIGHT + 1)) {
//             grass_grid[grass_grid_y][grass_grid_x] = 'o';
//             continue;
//         }
//         if ((grass_grid_x === 0) || (grass_grid_x === GAME_BLOCK_AMOUNT_WIDTH + 1)) { 
//             grass_grid[grass_grid_y][grass_grid_x] = 'o';
//             continue;
//         }
//         grass_grid[grass_grid_y][grass_grid_x] = 'i';
//     }    
// }

// for (let _ = 0; _ < 100; _++) {
//     const _x = getRandomInt(GAME_BLOCK_AMOUNT_WIDTH / 2) * 2;
//     const _y = getRandomInt(GAME_BLOCK_AMOUNT_HEIGHT / 2) * 2;
//     grass_grid[_y][_x] = 'o';
//     grass_grid[_y][_x + 1] = 'o';
//     grass_grid[_y + 1][_x] = 'o';
//     grass_grid[_y + 1][_x + 1] = 'o';
// }

window.addEventListener('wheel', function(event) {
    if (mouse_down) return;
    if (event.deltaY < 0) {
        // console.log('scrolling up');
        const multiplier = 1.1;
        if (global_scale * multiplier <= MAX_GLOBAL_SCALE) setScales(multiplier);
    } else if (event.deltaY > 0) {
        // console.log('scrolling down');
        const multiplier = 0.9;
        if (global_scale * multiplier >= MIN_GLOBAL_SCALE) setScales(multiplier);
    }
});

window.addEventListener('touchstart', (e) => {
    last_touch_distance = 1;
    console.log(e.targetTouches[0]);
    if (e.targetTouches.length != 2) return;
    const touch_1 = e.targetTouches[0];
    const touch_2 = e.targetTouches[1];
    last_touch_distance = getDistance(touch_1.clientX, touch_1.clientY, touch_2.clientX, touch_2.clientY);
});

window.addEventListener('touchmove', (e) => {
    if (e.targetTouches.length != 2) return last_touch_distance = 0;
    const touch_1 = e.targetTouches[0];
    const touch_2 = e.targetTouches[1];
    const current_touch_distance = getDistance(touch_1.clientX, touch_1.clientY, touch_2.clientX, touch_2.clientY);
    const multiplier = current_touch_distance / last_touch_distance;
    if ((global_scale * multiplier <= MAX_GLOBAL_SCALE) &&
        (global_scale * multiplier >= MIN_GLOBAL_SCALE)
        ) setScales(multiplier);
    last_touch_distance = copy(current_touch_distance);
});

window.addEventListener('touchend', (e) => {
    last_touch_distance = 1;
});

class rect {
    constructor(x, y, width, height, rgb, z) {
        this.scale = 1;
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.width = width ?? 10;
        this.height = height ?? 10;
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
        this.z = z ?? 1;
        shapes[`z${this.z}`][this.id] = this;
    }
    draw() {
        let x1 = this.x;
        let x2 = this.x + this.width;
        let y1 = this.y;
        let y2 = this.y + this.height;
        if ((x1 > window.innerWidth) && (y1 > window.innerHeight)) return;
        if ((x1 > window.innerWidth) && (y2 < 0)) return;
        if ((x2 < 0) && (y1 > window.innerHeight)) return;
        if ((x2 < 0) && (y2 < 0)) return;
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
        gl.uniform4f(colorLocation, this.r/255, this.g/255, this.b/255, 1);
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
    translate(x, y) {
        this.x += x;
        this.y += y;
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
    setScale(multiplier) {
        this.scale *= multiplier;
        this.width = this.width * multiplier;
        this.height = this.height * multiplier;
        this.x = multiplier * (this.x - mouseX) + mouseX;
        this.y = multiplier * (this.y - mouseY) + mouseY;
    }
}

class grass_block {
    constructor(x, y, width, height) {
        this.scale = 1;
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.width = width ?? BLOCK_WIDTH * global_scale;
        this.height = height ?? BLOCK_HEIGHT * global_scale;
        this.highlightable = false;
        this.id = getRandomInt();
    }
    drawGrass(coordX, coordY) {
        if ((coordX < GAME_BORDER) ||
            (coordX > GAME_BLOCK_AMOUNT_WIDTH + (GAME_BORDER + 1)) ||
            (coordY < GAME_BORDER) ||
            (coordY > GAME_BLOCK_AMOUNT_HEIGHT + (GAME_BORDER + 1))
            ) return this.drawGrassImage(textureInfos.outer["edge-bush"]);
        this.gridX = coordX - GAME_BORDER - 1;
        this.gridY = coordY - GAME_BORDER - 1;
        if (grass_grid[coordY - GAME_BORDER][coordX - GAME_BORDER] != 'o') {
            const DO_SHADE = ((this.x / (BLOCK_WIDTH * global_scale)) + (this.y / (BLOCK_HEIGHT * global_scale))) % 2;
            grid[`${coordX - GAME_BORDER}_${coordY - GAME_BORDER}`] = '';
            this.highlightable = true;
            if (getRandomInt(10) === 1) {
                if ((Math.round(DO_SHADE) === 0) || (Math.round(DO_SHADE) === 2)) return this.drawGrassImage(textureInfos.inner.bush.dark[getRandomInt(2)]);
                if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.inner.bush.light[getRandomInt(2)]);
            } else {
                if ((Math.round(DO_SHADE) === 0) || (Math.round(DO_SHADE) === 2)) return this.drawGrassImage(textureInfos.inner.block.dark[getRandomInt(5)]);
                if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.inner.block.light[getRandomInt(5)]);
            }
            return;
        }
        coordX -= GAME_BORDER;
        coordY -= GAME_BORDER;
        let local_grass_grid = [
            ['o', 'o', 'o'],
            ['o', 'o', 'o'],
            ['o', 'o', 'o']
        ];
        try {
          local_grass_grid[0][0] = copy(grass_grid[coordY - 1][coordX - 1]);
        } catch {
            // local_grass_grid[0][0] = 'o';
        }
        try {
          local_grass_grid[0][1] = copy(grass_grid[coordY - 1][coordX]);
        } catch {
            // local_grass_grid[0][1] = 'o';
        }
        try {
          local_grass_grid[0][2] = copy(grass_grid[coordY - 1][coordX + 1]);
        } catch {
            // local_grass_grid[0][2] = 'o';
        }
        try {
          local_grass_grid[1][0] = copy(grass_grid[coordY][coordX - 1]);
        } catch {
            // local_grass_grid[1][0] = 'o';
        }
        try {
          local_grass_grid[1][2] = copy(grass_grid[coordY][coordX + 1]);
        } catch {
            // local_grass_grid[1][2] = 'o';
        }
        try {
          local_grass_grid[2][0] = copy(grass_grid[coordY + 1][coordX - 1]);
        } catch {
            // local_grass_grid[2][0] = 'o';
        }
        try {
          local_grass_grid[2][1] = copy(grass_grid[coordY + 1][coordX]);
        } catch {
            // local_grass_grid[2][1] = 'o';
        }
        try {
          local_grass_grid[2][2] = copy(grass_grid[coordY + 1][coordX + 1]);
        } catch {
            // local_grass_grid[2][2] = 'o';
        }
        const check_types = [
            'checkTop_left_corner',
            'checkTop_right_corner',
            'checkBottom_right_corner',
            'checkBottom_left_corner',
            'checkUp_left_sides',
            'checkUp_right_sides',
            'checkDown_right_sides',
            'checkDown_left_sides',
            'checkUp_side',
            'checkDown_side',
            'checkRight_side',
            'checkLeft_side'
        ];
        for (const check of check_types) {
            if (this[check](local_grass_grid, coordX, coordY)) return;
        }
        if (getRandomInt(30) === 1) {
            this.drawGrassImage(textureInfos.outer.outside.tree[getRandomInt(3)]);
        } else {
            this.drawGrassImage(textureInfos.outer.outside.block[getRandomInt(6)]);
        }
    }
    checkTop_left_corner(local_grass_grid, coordX, coordY) {
        const top_left_corner = [
            ['i', 'o', 'o'],
            ['o', 'o', 'o'],
            ['o', 'o', 'o']
        ];
        if (JSON.stringify(local_grass_grid) === JSON.stringify(top_left_corner)) {
            const DO_SHADE = (coordX + coordY) % 2;
            if (Math.round(DO_SHADE) === 0) return this.drawGrassImage(textureInfos.outer.corners["top-left-dark"]);
            if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.outer.corners["top-left-light"]);
            return true;
        }
        return false;
    }
    checkTop_right_corner(local_grass_grid, coordX, coordY) {
        const top_right_corner = [
            ['o', 'o', 'i'],
            ['o', 'o', 'o'],
            ['o', 'o', 'o']
        ];
        if (JSON.stringify(local_grass_grid) === JSON.stringify(top_right_corner)) {
            const DO_SHADE = (coordX + coordY) % 2;
            if (Math.round(DO_SHADE) === 0) return this.drawGrassImage(textureInfos.outer.corners["top-right-dark"]);
            if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.outer.corners["top-right-light"]);
            return true;
        }
        return false;
    }
    checkBottom_right_corner(local_grass_grid, coordX, coordY) {
        const bottom_right_corner = [
            ['o', 'o', 'o'],
            ['o', 'o', 'o'],
            ['o', 'o', 'i']
        ];
        if (JSON.stringify(local_grass_grid) === JSON.stringify(bottom_right_corner)) {
            const DO_SHADE = (coordX + coordY) % 2;
            if (Math.round(DO_SHADE) === 0) return this.drawGrassImage(textureInfos.outer.corners["bottom-right-dark"]);
            if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.outer.corners["bottom-right-light"]);
            return true;
        }
        return false;
    }
    checkBottom_left_corner(local_grass_grid, coordX, coordY) {
        const bottom_left_corner = [
            ['o', 'o', 'o'],
            ['o', 'o', 'o'],
            ['i', 'o', 'o']
        ];
        if (JSON.stringify(local_grass_grid) === JSON.stringify(bottom_left_corner)) {
            const DO_SHADE = (coordX + coordY) % 2;
            if (Math.round(DO_SHADE) === 0) return this.drawGrassImage(textureInfos.outer.corners["bottom-left-dark"]);
            if (Math.round(DO_SHADE) === 1) return this.drawGrassImage(textureInfos.outer.corners["bottom-left-light"]);
            return true;
        }
        return false;
    }
    checkUp_left_sides(local_grass_grid, coordX, coordY) {
        const up_left_sides = [
            [true,                           local_grass_grid[0][1] === 'i', true],
            [local_grass_grid[1][0] === 'i', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'o'],
            [true,                           local_grass_grid[2][1] === 'o', local_grass_grid[2][2] === 'o']
        ];
        if (JSON.stringify(up_left_sides) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer["left-up"].dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer["left-up"].light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkUp_right_sides(local_grass_grid, coordX, coordY) {
        const up_right_sides = [
            [true,                           local_grass_grid[0][1] === 'i', true],
            [local_grass_grid[1][0] === 'o', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'i'],
            [local_grass_grid[2][0] === 'o', local_grass_grid[2][1] === 'o', true]
        ];
        if (JSON.stringify(up_right_sides) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer["right-up"].dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer["right-up"].light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkDown_right_sides(local_grass_grid, coordX, coordY) {
        const down_right_sides = [
            [local_grass_grid[0][0] === 'o', local_grass_grid[0][1] === 'o', true],
            [local_grass_grid[1][0] === 'o', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'i'],
            [true,                           local_grass_grid[2][1] === 'i', true]
        ];
        if (JSON.stringify(down_right_sides) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer["right-down"].dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer["right-down"].light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkDown_left_sides(local_grass_grid, coordX, coordY) {
        const down_left_sides = [
            [true,                           local_grass_grid[0][1] === 'o', local_grass_grid[0][2] === 'o'],
            [local_grass_grid[1][0] === 'i', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'o'],
            [true,                           local_grass_grid[2][1] === 'i', true]
        ];
        if (JSON.stringify(down_left_sides) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer["left-down"].dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer["left-down"].light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkUp_side(local_grass_grid, coordX, coordY) {
        const up_side = [
            [true,                           local_grass_grid[0][1] === 'i', true],
            [local_grass_grid[1][0] === 'o', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'o'],
            [local_grass_grid[2][0] === 'o', local_grass_grid[2][1] === 'o', local_grass_grid[2][2] === 'o']
        ];
        if (JSON.stringify(up_side) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer.ups.dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer.ups.light[getRandomInt(3)]);
            return true;   
        }
        return false;
    }
    checkDown_side(local_grass_grid, coordX, coordY) {
        const down_side = [
            [local_grass_grid[0][0] === 'o', local_grass_grid[0][1] === 'o', local_grass_grid[0][2] === 'o'],
            [local_grass_grid[1][0] === 'o', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'o'],
            [true,                           local_grass_grid[2][1] === 'i', true]
        ];
        if (JSON.stringify(down_side) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer.downs.dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer.downs.light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkRight_side(local_grass_grid, coordX, coordY) {
        const right_side = [
            [local_grass_grid[0][0] === 'o', local_grass_grid[0][1] === 'o', true],
            [local_grass_grid[1][0] === 'o', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'i'],
            [local_grass_grid[2][0] === 'o', local_grass_grid[2][1] === 'o', true]
        ];
        if (JSON.stringify(right_side) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer.rights.dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer.rights.light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    checkLeft_side(local_grass_grid, coordX, coordY) {
        const left_side = [
            [true,                           local_grass_grid[0][1] === 'o', local_grass_grid[0][2] === 'o'],
            [local_grass_grid[1][0] === 'i', local_grass_grid[1][1] === 'o', local_grass_grid[1][2] === 'o'],
            [true,                           local_grass_grid[2][1] === 'o', local_grass_grid[2][2] === 'o']
        ];
        if (JSON.stringify(left_side) === "[[true,true,true],[true,true,true],[true,true,true]]") {
            const DO_SHADE = (coordX + coordY + 1) % 2;
            if (Math.round(DO_SHADE) === 0) this.drawGrassImage(textureInfos.outer.lefts.dark[getRandomInt(3)]);
            if (Math.round(DO_SHADE) === 1) this.drawGrassImage(textureInfos.outer.lefts.light[getRandomInt(3)]);
            return true;
        }
        return false;
    }
    drawGrassImage(textureInfo) {
        this.xScale = this.width / 300;
        this.yScale = this.height / 300;
        this.textureInfo = textureInfo;
        this.fogColor = [0, 0, 0, 1];
        this.fogAmount = 0;
        image_draw_infos[this.id] = this;
        return true;
    }
    updateInfo() {
        image_draw_infos[this.id] = this;
    }
    translateX_YfromStartX_Y(x, y) {
        this.x = mouseStartX_Y.x + x + this.distFromStartX;
        this.y = mouseStartX_Y.y + y + this.distFromStartY;
    }
    translate(x, y) {
        this.x += x;
        this.y += y;
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
    setScale(multiplier) {
        this.scale = multiplier;
        this.width *= multiplier;
        this.height *= multiplier;
        this.xScale = this.width / 300;
        this.yScale = this.height / 300;
        this.x = multiplier * (this.x - mouseX) + mouseX;
        this.y = multiplier * (this.y - mouseY) + mouseY;

    }
    highlight(fogColor, fogAmount = 0.3) {
        this.fogColor = fogColor;
        this.fogAmount = fogAmount;
    }
    removeHighlight() {
        this.fogAmount = 0;
    }
}

class square {
    constructor(object) {
        if (object == undefined) object = {};
        const WIDTH_GAME_BLOCKS = object.gameBlockWidth ?? 2;
        const HEIGHT_GAME_BLOCKS = object.gameBlockHeight ?? 2;
        this.scale = global_scale;
        this.width = object.width ?? WIDTH_GAME_BLOCKS * BLOCK_WIDTH * global_scale;
        this.height = object.height ?? HEIGHT_GAME_BLOCKS * BLOCK_HEIGHT * global_scale;
        this.gl = document.querySelector("#game-canvas").getContext("webgl2");
        this.colorLocation = '';
        this.level = object.level ?? 1;
        this.maxLevel = object.maxLevel ?? 10;
        this.color = object.color ?? 'Blue';
        this.rChangePerLevel = (colors[this.color]['r2'] - colors[this.color]['r']) / (this.maxLevel - 1);
        this.gChangePerLevel = (colors[this.color]['g2'] - colors[this.color]['g']) / (this.maxLevel - 1);
        this.bChangePerLevel = (colors[this.color]['b2'] - colors[this.color]['b']) / (this.maxLevel - 1);
        this.r = object.r ?? colors[this.color]['r'] + (this.level - 1) * this.rChangePerLevel;
        this.g = object.g ?? colors[this.color]['g'] + (this.level - 1) * this.gChangePerLevel;
        this.b = object.b ?? colors[this.color]['b'] + (this.level - 1) * this.bChangePerLevel;
        this.x = object.x ?? 100;
        this.y = object.y ?? 100;
        this.originalX = copy(this.x);
        this.originalY = copy(this.y);
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.coordX = object.coordX ?? 0;
        this.coordY = object.coordY ?? 0;
        if ((this.coordX != 0) && (this.coordY != 0)) {
            if ((grid[`${this.coordX}_${this.coordY}`] != '') ||
                (grid[`${this.coordX + 1}_${this.coordY}`] != '') ||
                (grid[`${this.coordX}_${this.coordY + 1}`] != '') ||
                (grid[`${this.coordX + 1}_${this.coordY + 1}`] != '')
                ) this.assignCoords();
            this.x = (this.coordX - 1) * BLOCK_WIDTH * global_scale + grid.x;
            this.y = (this.coordY - 1) * BLOCK_HEIGHT * global_scale + grid.y;
            this.originalX = copy(this.x);
            this.originalY = copy(this.y);
            grid[`${this.coordX}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX}_${this.coordY + 1}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY + 1}`] = `${this.color}_square`;
        } else {
            if (!this.assignCoords()) return this.removed = true;
        }
        const BLOCK_INLINE = (24 - this.level * 2) * global_scale;
        const BORDER_WIDTH = 2 * global_scale;
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
            `(${this.r},${this.g},${this.b})`, 2
        );
        this.squareId = SQUARE.getId();
        this.selected = false;
        this.nextLevelUpgradeCost = object.nextLevelCost ?? this.level * 10000;
        this.earningsPerSecond = object.earningsPerSecond ?? this.level;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.displayed = false;
        this.health = object.health ?? 100;
        this.maxHealth = object.maxHealth ?? 100;
        this.id = object.id ?? getRandomInt();
        this.totalCost = object.totalCost ?? buy_costs[`${this.color.toLowerCase()}_squares`];
        document.getElementById('resource-displays').innerHTML += `
            <div id="resource-display-${this.id}" class="resource-display">+
                <span id="resource-display-${this.id}-count">${this.earningsPerSecond}</span>
                <div id="resource-display-resource-icon-${this.id}" class="resource-icon ${this.color.toLowerCase()}">
            </div>
        `;
        this.createdAt = object.createdAt ?? Date.now();
        this.timeCreated = object.timeCreated ?? getFormatedTime(this.createdAt);
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].highlightable = false;
        buildings[this.id] = this;
        update(ref(db, `users/${userId}/game-data/building-data/${this.id}`), {
            "level": this.level,
            "type": `${this.color}_square`,
            "created-at": this.createdAt,
            "total-cost": this.totalCost,
            "coordX": this.coordX,
            "coordY": this.coordY
        });
        return this.removed = false;
    }
    assignCoords() {
        for (let x_y of Object.keys(grid)) {
            x_y = x_y.split('_');
            const gridX = parseInt(x_y[0]);
            const gridY = parseInt(x_y[1]);
            if (grid[`${gridX}_${gridY}`] != '') continue;
            if (grid[`${gridX + 1}_${gridY}`] != '') continue;
            if (grid[`${gridX}_${gridY + 1}`] != '') continue;
            if (grid[`${gridX + 1}_${gridY + 1}`] != '') continue;
            this.x = (gridX - 1) * BLOCK_WIDTH * global_scale + grid.x;
            this.y = (gridY - 1) * BLOCK_HEIGHT * global_scale + grid.y;
            this.originalX = copy(this.x);
            this.originalY = copy(this.y);
            grid[`${gridX}_${gridY}`] = `${this.color}_square`;
            grid[`${gridX + 1}_${gridY}`] = `${this.color}_square`;
            grid[`${gridX}_${gridY + 1}`] = `${this.color}_square`;
            grid[`${gridX + 1}_${gridY + 1}`] = `${this.color}_square`;
            this.coordX = gridX;
            this.coordY = gridY;
            return true;
        }
        notification('Cannot be created');
        return false;
    }
    checkForMouseHover() {
        if (user_settings['no-square-movement']) return;
        if (!mouse_down) {
            if (this.selected) {
                this.checkXandY();
                building_selected_id = '';
                this.removeHighlights();
            }
            document.getElementById(`resource-display-${this.id}`).style.visibility = 'visible';
            this.selected = false;
            return false;
        }
        if (this.selected) {
            if ((this.x - 10 < mouseX) && (mouseX < this.x + this.width + 10)) {
                if ((this.y - 10 < mouseY) && (mouseY < this.y + this.height + 10)) {
                    if ((mouseX > grid.x) && (mouseY > grid.y) && (mouseX < grid.x + BLOCK_WIDTH * global_scale * GAME_BLOCK_AMOUNT_WIDTH) && (mouseY < grid.y + BLOCK_HEIGHT * global_scale * GAME_BLOCK_AMOUNT_HEIGHT)) {
                        if (!this.selected) {
                            grid[`${this.coordX}_${this.coordY}`] = '';
                            grid[`${this.coordX + 1}_${this.coordY}`] = '';
                            grid[`${this.coordX}_${this.coordY + 1}`] = '';
                            grid[`${this.coordX + 1}_${this.coordY + 1}`] = '';
                        }
                        document.getElementById(`resource-display-${this.id}`).style.visibility = 'hidden';
                        this.addHighlights();
                        this.selected = true;
                        building_selected_id = copy(this.id);
                        return true;
                    }
                }
            }
        } else {
            if ((this.x + this.blockInline < mouseX) && (mouseX < this.x + this.width - this.blockInline)) {
                if ((this.y + this.blockInline < mouseY) && (mouseY < this.y + this.height - this.blockInline)) {
                    if ((mouseX > grid.x) && (mouseY > grid.y) && (mouseX < grid.x + BLOCK_WIDTH * global_scale * GAME_BLOCK_AMOUNT_WIDTH) && (mouseY < grid.y + BLOCK_HEIGHT * global_scale * GAME_BLOCK_AMOUNT_HEIGHT)) {
                        if (!this.selected) {
                            grid[`${this.coordX}_${this.coordY}`] = '';
                            grid[`${this.coordX + 1}_${this.coordY}`] = '';
                            grid[`${this.coordX}_${this.coordY + 1}`] = '';
                            grid[`${this.coordX + 1}_${this.coordY + 1}`] = '';
                        }
                        document.getElementById(`resource-display-${this.id}`).style.visibility = 'hidden';
                        this.addHighlights();
                        this.selected = true;
                        building_selected_id = copy(this.id);
                        return true;
                    }
                }
            }
        }
        if (this.selected) {
            this.checkXandY();
            building_selected_id = '';
            this.removeHighlights();
        }
        document.getElementById(`resource-display-${this.id}`).style.visibility = 'visible';
        this.selected = false;
        return false;
    }
    addHighlights() {
        addHighlight = true;
        this.highlightUnder();
    }
    highlightUnder() {
        const top_left_good = grid[`${this.coordX + 1}_${this.coordY + 1}`] === ''; 
        const top_right_good = grid[`${this.coordX}_${this.coordY + 1}`] === ''; 
        const bottom_left_good = grid[`${this.coordX + 1}_${this.coordY}`] === ''; 
        const bottom_right_good = grid[`${this.coordX}_${this.coordY}`] === '';
        if (top_left_good) image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].highlight([0, 1, 0, 1]);
            else image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].highlight([1, 0, 0, 1]);
        if (top_right_good) image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].highlight([0, 1, 0, 1]);
            else image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].highlight([1, 0, 0, 1]);
        if (bottom_left_good) image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].highlight([0, 1, 0, 1]);
            else image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].highlight([1, 0, 0, 1]);
        if (bottom_right_good) image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].highlight([0, 1, 0, 1]);
            else image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].highlight([1, 0, 0, 1]);
    }
    removeHighlights() {
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].fogColor = [1, 1, 1, 1];
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].fogColor = [1, 1, 1, 1];
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].fogColor = [1, 1, 1, 1];
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].fogColor = [1, 1, 1, 1];
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].highlightable = false;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].highlightable = false;
        const top_left_good = grid[`${this.coordX + 1}_${this.coordY + 1}`] === ''; 
        const top_right_good = grid[`${this.coordX}_${this.coordY + 1}`] === ''; 
        const bottom_left_good = grid[`${this.coordX + 1}_${this.coordY}`] === ''; 
        const bottom_right_good = grid[`${this.coordX}_${this.coordY}`] === '';
        if (!top_left_good) image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].fogAmount = 0;
        if (!top_right_good) image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].fogAmount = 0;
        if (!bottom_left_good) image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].fogAmount = 0;
        if (!bottom_right_good) image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].fogAmount = 0;
        addHighlight = false;
    }
    updateXandY() {
        this.removeHighlights();
        this.x = (mouseX - this.width / 2);
        this.y = (mouseY - this.height / 2);
        this.setCoordXandY();
        this.x = (this.coordX - 1) * BLOCK_WIDTH * global_scale + grid.x;
        this.y = (this.coordY - 1) * BLOCK_HEIGHT * global_scale + grid.y;
        if (this.selected) this.addHighlights();
        let outline_object = shapes['z1'][this.outelineId];
        outline_object.x = this.x + this.blockInline;
        outline_object.y = this.y + this.blockInline;
        let square_object = shapes['z2'][this.squareId];
        square_object.x = this.x + this.blockInline + this.borderWidth;
        square_object.y = this.y + this.blockInline + this.borderWidth;
    }
    checkXandY() {
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
            this.removeHighlights();
            this.originalX = copy(this.x);
            this.originalY = copy(this.y);
            this.setCoordXandY();
            grid[`${this.coordX}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX}_${this.coordY + 1}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY + 1}`] = `${this.color}_square`;
            this.updateSquareInFirebase();
        } else {
            this.removeHighlights();
            this.x = copy(this.originalX);
            this.y = copy(this.originalY);
            this.setCoordXandY();
            grid[`${this.coordX}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY}`] = `${this.color}_square`;
            grid[`${this.coordX}_${this.coordY + 1}`] = `${this.color}_square`;
            grid[`${this.coordX + 1}_${this.coordY + 1}`] = `${this.color}_square`;
            let outline_object = shapes['z1'][this.outelineId];
            outline_object.x = this.x + this.blockInline;
            outline_object.y = this.y + this.blockInline;
            let square_object = shapes['z2'][this.squareId];
            square_object.x = this.x + this.blockInline + this.borderWidth;
            square_object.y = this.y + this.blockInline + this.borderWidth;
            if (user_settings['notification-invalid-movement'] && user_settings['all-notifications']) notification('Invalid Movement');
        }
    }
    setCoordXandY() {
        this.coordX = Math.round((this.x - grid.x) / (BLOCK_WIDTH * global_scale)) + 1;
        this.coordY = Math.round((this.y - grid.y) / (BLOCK_WIDTH * global_scale)) + 1;
    }
    upResource() {
        currencies[`${this.color.toLowerCase()}_squares`] += this.earningsPerSecond;
    }
    upgrade() {
        if ((this.level >= this.maxLevel) && user_settings['all-notifications']) return notification('Reached max level');
        if (this.level >= this.maxLevel) return;
        if ((currencies[`${this.color.toLowerCase()}_squares`] < this.nextLevelUpgradeCost) && 
            user_settings['notification-not-enough-upgrade'] && 
            user_settings['all-notifications']) return notification('Not enough resources');
        if (currencies[`${this.color.toLowerCase()}_squares`] < this.nextLevelUpgradeCost) return;
        currencies[`${this.color.toLowerCase()}_squares`] -= this.nextLevelUpgradeCost;
        this.totalCost += this.nextLevelUpgradeCost;
        this.earningsPerSecond += 1;
        this.earningsPerHour = this.earningsPerSecond * 3600;
        this.nextLevelUpgradeCost += 1;
        this.level += 1;
        this.blockInline -= 2 * global_scale;
        this.r += this.rChangePerLevel;
        this.g += this.gChangePerLevel;
        this.b += this.bChangePerLevel;
        let outline_object = shapes['z1'][this.outelineId];
        outline_object.x = this.x + this.blockInline;
        outline_object.y = this.y + this.blockInline;
        outline_object.width = this.width - (2 * this.blockInline);
        outline_object.height = this.height - (2 * this.blockInline);
        let square_object = shapes['z2'][this.squareId];
        square_object.x = this.x + this.blockInline + this.borderWidth;
        square_object.y = this.y + this.blockInline + this.borderWidth;
        square_object.width = this.width - (2 * this.blockInline) - (2 * this.borderWidth);
        square_object.height = this.height - (2 * this.blockInline) - (2 * this.borderWidth);
        square_object.r = this.r;
        square_object.g = this.g;
        square_object.b = this.b;
        document.getElementById(`resource-display-${this.id}-count`).textContent = this.earningsPerSecond;
        document.getElementById(`${this.color.toLowerCase()}-squares-count`).textContent = getFormatedNumber(currencies[`${this.color.toLowerCase()}_squares`]);
        this.updateSquareInFirebase();
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
        document.getElementById("building-info-created").textContent = `Created on: ${this.timeCreated}`;
        document.getElementById("building-info-earnings_second").textContent = `Earnings per second: ${this.earningsPerSecond}`;
        document.getElementById("building-info-earnings_hour").textContent = `Earnings per hour: ${this.earningsPerHour}`;
        document.getElementById("building-info-upgrade-text").textContent = `Upgrade ${getFormatedNumber(this.nextLevelUpgradeCost)}`;
        document.getElementById("building-info-delete-text").textContent = `Delete ${getFormatedNumber(this.totalCost)}`;
        document.getElementById("building-info-upgrade-resource-icon").className = `resource-icon ${this.color.toLowerCase()}`;
        document.getElementById("building-info-delete-resource-icon").className = `resource-icon ${this.color.toLowerCase()}`;
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
            let delete_button = document.getElementById("building-info-delete");
            if (user_settings['no-delete']) return delete_button.addEventListener('click', THIS_SQUARE.deleteButtonListner, {'once': true});
            THIS_SQUARE.deleteButtonListner = function deleteSquare() {
                THIS_SQUARE.remove();
            }
            if (!user_settings['double-tap-delete']) return THIS_SQUARE.deleteButtonListner();
            if (user_settings['notification-deletion'] && user_settings['all-notifications']) notification('Are you sure?');
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
    remove() {
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY)].highlightable = true;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY)].highlightable = true;
        image_draw_infos[getGrassBlockId(this.coordX, this.coordY - 1)].highlightable = true;
        image_draw_infos[getGrassBlockId(this.coordX - 1, this.coordY - 1)].highlightable = true;
        grid[`${this.coordX}_${this.coordY}`] = '';
        grid[`${this.coordX + 1}_${this.coordY}`] = '';
        grid[`${this.coordX}_${this.coordY + 1}`] = '';
        grid[`${this.coordX + 1}_${this.coordY + 1}`] = '';
        delete buildings[this.id];
        delete shapes['z1'][this.outelineId];
        delete shapes['z2'][this.squareId];
        currencies[`${this.color.toLowerCase()}_squares`] += this.totalCost;
        document.getElementById(`resource-display-${this.id}`).remove();
        this.removeUpgradeListener();
        document.getElementById('building-info-no-content').style.display = 'block';
        document.getElementById('building-info-content').style.visibility = 'hidden';
        remove(ref(db, `users/${userId}/game-data/building-data/${this.id}`));
    }
    updateResourceDisplay() {
        document.getElementById(`resource-display-${this.id}`).style.top = (this.y + 2.5 * 2 * global_scale) + 'px';
        document.getElementById(`resource-display-${this.id}`).style.left = (this.x + 1 * 2 * global_scale) + 'px';
        document.getElementById(`resource-display-${this.id}`).style.fontSize = (20 * global_scale) + 'px';
        document.getElementById(`resource-display-resource-icon-${this.id}`).style.height = (10 * global_scale) + 'px';
        document.getElementById(`resource-display-resource-icon-${this.id}`).style.width = (10 * global_scale) + 'px';
        document.getElementById(`resource-display-resource-icon-${this.id}`).style.borderWidth = (2 * global_scale) + 'px';
    }
    translateX_YfromStartX_Y(x, y) {
        this.x = mouseStartX_Y.x + x + this.distFromStartX;
        this.y = mouseStartX_Y.y + y + this.distFromStartY;
        this.originalX = copy(this.x);
        this.originalY = copy(this.y);
    }
    translate(x, y) {
        this.x += x;
        this.y += y;
        this.originalX = copy(this.x);
        this.originalY = copy(this.y);
    }
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
    setScale(multiplier) {
        this.scale *= multiplier;
        this.width *= multiplier;
        this.height *= multiplier;
        this.x = multiplier * (this.x - mouseX) + mouseX;
        this.y = multiplier * (this.y - mouseY) + mouseY;
        this.originalX = copy(this.x);
        this.originalY = copy(this.y);
        this.blockInline *= multiplier;
        this.borderWidth *= multiplier;
    }
    collectAfktime(milliseconds) {
        currencies[`${this.color.toLowerCase()}_squares`] += this.earningsPerSecond * Math.floor(milliseconds / 1000);
    }
    updateSquareInFirebase() {
        update(ref(db, `users/${userId}/game-data/building-data/${this.id}`), {
            "level": this.level,
            "total-cost": this.totalCost,
            "coordX": this.coordX,
            "coordY": this.coordY
        });
    }
    export() {
        return {
            'level': this.level,
            'type': `${this.color}_square`,
            'created-at': this.createdAt,
            'total-cost': this.totalCost,
            'coordX': this.coordX,
            'coordY': this.coordY
        };
    }
}

function createGrass() {
    for (let current_block_y = 1; current_block_y <= GAME_BLOCK_AMOUNT_HEIGHT + GAME_BORDER * 2; current_block_y++) {
        for (let current_block_x = 1; current_block_x <= GAME_BLOCK_AMOUNT_WIDTH + GAME_BORDER * 2; current_block_x++) {
            const BLOCK = new grass_block(
                (current_block_x - 1) * BLOCK_WIDTH * global_scale, 
                (current_block_y - 1) * BLOCK_HEIGHT * global_scale, 
                BLOCK_WIDTH * global_scale, 
                BLOCK_HEIGHT * global_scale
            );
            BLOCK.drawGrass(current_block_x, current_block_y);
        }
    }
}

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

function eventListners() {
    for (const color of Object.keys(colors)) {
        document.getElementById(`${color.toLowerCase()}-square-buy`).addEventListener('click', function () {
            if (currencies[`${color.toLowerCase()}_squares`] < buy_costs[`${color.toLowerCase()}_squares`] &&
                user_settings['notification-not-enough-new-square'] &&
                user_settings['all-notifications']) return notification('Not enough resources');
            if (currencies[`${color.toLowerCase()}_squares`] < buy_costs[`${color.toLowerCase()}_squares`]) return;
            const new_square = new square({'color': color});
            if  (new_square.removed) return;
            currencies[`${color.toLowerCase()}_squares`] -= buy_costs[`${color.toLowerCase()}_squares`];
            buy_costs[`${color.toLowerCase()}_squares`] = buy_costs[`${color.toLowerCase()}_squares`] + 2;
            document.getElementById(`${color.toLocaleLowerCase()}-square-cost`).textContent = `Buy ${getFormatedNumber(buy_costs[`${color.toLowerCase()}_squares`])}`;
            updateBuyCosts();
        });
        if (buy_costs[`${color.toLowerCase()}_squares`] > 0) {
            document.getElementById(`${color.toLocaleLowerCase()}-square-cost`).textContent = `Buy ${getFormatedNumber(buy_costs[`${color.toLowerCase()}_squares`])}`;
        }
    }
    
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
    
    document.getElementById("settings").addEventListener('click', function () {
        document.getElementById("settings-tab-container").style.display = 'block';
        if (user_settings['all-notifications']) {
            document.getElementById('other-notification-contianer').className = '';
            document.getElementById('other-notification-contianer').style.height = '112px';
            document.getElementById('other-notification-contianer').style.opacity = '1';
        } else {
            document.getElementById('other-notification-contianer').className = '';
            document.getElementById('other-notification-contianer').style.height = '0px';
            document.getElementById('other-notification-contianer').style.opacity = '0';
        }
        if (!user_settings['no-delete']) {
            document.getElementById('double-delete-container').className = 'toggle';
        } else {
            document.getElementById('double-delete-container').className = 'toggle collasped-selector';
        }
        if (!user_settings['no-square-movement']) {
            document.getElementById('open-square-after-move-container').className = 'toggle';
        } else {
            document.getElementById('open-square-after-move-container').className = 'toggle collasped-selector';
        }
    });

    document.getElementById("close-settings").addEventListener('click', function () {
        document.getElementById("settings-tab-container").style.display = 'none';
    });

    document.getElementById("settings-tab-close").addEventListener('click', function () {
        document.getElementById("settings-tab-container").style.display = 'none';
    });

    for (const type of Object.keys(user_settings)) {
        document.getElementById(`${type}-toggle`).addEventListener('click', function () {
            user_settings[type] = this.checked;
            if (type === 'all-notifications') {
                if (user_settings[type]) {
                    document.getElementById('other-notification-contianer').className = 'collapse-selectors uncollapse-selectors ';
                } else {
                    document.getElementById('other-notification-contianer').className = 'collapse-selectors';
                }
            } else if (type === 'no-delete') {
                if (!user_settings[type]) {
                    document.getElementById('double-delete-container').className = 'toggle collapse-selector uncollapse-selector';
                } else {
                    document.getElementById('double-delete-container').className = 'toggle collapse-selector';
                }
            } else if (type === 'no-square-movement') {
                if (!user_settings[type]) {
                    document.getElementById('open-square-after-move-container').className = 'toggle collapse-selector uncollapse-selector';
                } else {
                    document.getElementById('open-square-after-move-container').className = 'toggle collapse-selector';
                }
            }
            updateUserSettings();
        });
    }

    for (const type of Object.keys(user_settings)) {
        document.getElementById(`${type}-toggle`).checked = user_settings[type];
    }
    
    document.getElementById("settings-username-input").addEventListener('change', function () {
        const tempUsername = this.value;
        if ((tempUsername != "") && (tempUsername.length < 15)) {
            username = tempUsername;
            update(ref(db, `users/${userId}/game-data`), {
                "username": username
            });
            update(ref(db, `users/${userId}`), {
                "username": username
            });
        } else if (tempUsername.length >= 15) {
            this.value = username;
            notification("Username length must be less than 15 characters");
        } else {
            this.value = username;
            notification("Not a valid username");
        }
    });

    document.getElementById("settings-username-input").value = username;

    document.getElementById("log-out").addEventListener('click', function () {
        localStorage.removeItem('blue-squares:user');
        localStorage.removeItem('blue-squares:sign-in-type');
        sessionStorage.clear();
        window.location.href = "/Intro Info/intro-page.html";
    });

    document.getElementById("leaderboard").addEventListener('click', function () {
        document.getElementById("leaderboard-tab-container").style.display = 'block';
    });
    
    document.getElementById("close-leaderboard").addEventListener('click', function () {
        document.getElementById("leaderboard-tab-container").style.display = 'none';
    });

    document.getElementById("leaderboard-tab-close").addEventListener('click', function () {
        document.getElementById("leaderboard-tab-container").style.display = 'none';
    });
}

function getFormatedTime(utc_code = Date.now()) {
    const now = new Date(utc_code);
    const month = now.getMonth();
    const day_of_week = now.getDay();
    const day = now.getDate();
    const year = now.getFullYear();
    let hours = now.getHours();
    const mintues = now.getMinutes();
    const seconds = now.getSeconds();
    let meridiem;
    if (hours < 12) {
        meridiem = 'AM';
    } else if (hours === 12) {
        meridiem = 'PM';
    } else {
        meridiem = 'PM';
        hours -= 12;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];
    const date = `${days[day_of_week]}, ${day} ${months[month]} ${year}`;
    const time = `${hours < 10 ? '0' + hours : hours}:${mintues < 10 ? '0' + mintues : mintues}:${seconds < 10 ? '0' + seconds : seconds} ${meridiem}`;
    const dateTime = time+'  '+date;
    return dateTime;
}

function getFormatedNumber(number = 0) {
    let suffixes = ['K', 'M', 'B', 'T', 'Q'];
    if (number < 1000) return `${number}`;
    for (let suffix_key in suffixes) {
        suffix_key = parseInt(suffix_key);
        const suffex = suffixes[suffix_key];
        const lower_bound = Math.pow(1000, suffix_key + 1);
        const upper_bound = Math.pow(1000, suffix_key + 2);
        if ((lower_bound <= number) && (number < upper_bound)) {
            number /= lower_bound;
            number = String(number).substring(0, 4);
            if (number.substring(3, 4) === '.') return number.substring(0, 3) + suffex;
            return number + suffex;
        }
    }
    return 'ERROR';
}

function afkTime(since) {
    let milliseconds = since;
    let days = Math.floor(milliseconds / 1000 / 60 / 60 / 24);
    milliseconds -= days * 1000 * 60 * 60 * 24;
    days = days > 0? `${days} ${days === 1? 'day' : 'days'} ` : '';
    let hours = Math.floor(milliseconds / 1000 / 60 / 60);
    milliseconds -= hours * 1000 * 60 * 60;
    hours = hours > 0? `${hours} ${hours === 1? 'hour' : 'hours'} ` : '';
    let minutes = Math.floor(milliseconds / 1000 / 60);
    milliseconds -= minutes * 1000 * 60;
    minutes = minutes > 0? `${minutes} ${minutes === 1? 'minute' : 'minutes'} ` : '';
    let seconds = Math.floor(milliseconds / 1000);
    milliseconds -= seconds * 1000;
    seconds = seconds > 0? `${seconds} ${seconds === 1? 'second' : 'seconds'} ` : '';
    const timeSince = `${days}${hours}${minutes}${seconds}`;
    return timeSince;
}

function setScales(multiplier) {
    for (const building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.setScale(multiplier);
    }
    for (const z of Object.keys(shapes)) {
        for (const shape_key of Object.keys(shapes[z])) {
            let shape = shapes[z][shape_key];
            shape.setScale(multiplier);
        }
    }
    for (const image_key of Object.keys(image_draw_infos)) {
        let image = image_draw_infos[image_key];
        image.setScale(multiplier);
    }
    grid.x = multiplier * (grid.x - mouseX) + mouseX;
    grid.y = multiplier * (grid.y - mouseY) + mouseY;
    global_scale *= multiplier;
    let translateX = 0;
    let translateY = 0;
    const orginal_grid_x = grid.x;
    const orginal_grid_y = grid.y;
    if (grid.x > GAME_BORDER * BLOCK_WIDTH * global_scale) {
        grid.x = GAME_BORDER * BLOCK_WIDTH * global_scale;
        translateX = grid.x - orginal_grid_x;
    } else if (grid.x + (GAME_BORDER + GAME_BLOCK_AMOUNT_WIDTH) * BLOCK_WIDTH * global_scale < window.innerWidth) {
        grid.x = window.innerWidth - (GAME_BORDER + GAME_BLOCK_AMOUNT_WIDTH) * BLOCK_WIDTH * global_scale;
        translateX = grid.x - orginal_grid_x;
    }
    if (grid.y > GAME_BORDER * BLOCK_HEIGHT * global_scale) {
        grid.y = GAME_BORDER * BLOCK_HEIGHT * global_scale;
        translateY = grid.y - orginal_grid_y;
    } else if (grid.y + (GAME_BORDER + GAME_BLOCK_AMOUNT_HEIGHT) * BLOCK_HEIGHT * global_scale < window.innerHeight) {
        grid.y = window.innerHeight - (GAME_BORDER + GAME_BLOCK_AMOUNT_HEIGHT) * BLOCK_HEIGHT * global_scale;
        translateY = grid.y - orginal_grid_y;
    }
    for (const building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.translate(translateX, translateY);
    }
    for (const z of Object.keys(shapes)) {
        for (const shape_key of Object.keys(shapes[z])) {
        let shape = shapes[z][shape_key];
        shape.translate(translateX, translateY);
        }
    }
    for (const image_key of Object.keys(image_draw_infos)) {
        let image = image_draw_infos[image_key];
        image.translate(translateX, translateY);
    }
}

function getGrassBlockId(gridX, gridY) {
    for (const image_key of Object.keys(image_draw_infos)) {
        let image = image_draw_infos[image_key];
        if ((image.gridX === gridX) && (image.gridY === gridY)) return image.id;
    }
}

function createIntialSquares(count) {
    for (let i = 0; i < count; i++) {
        new square({'color': 'Blue'});
    }
}

function centerBoard() {
    const orginal_grid_x = grid.x;
    grid.x = window.innerWidth / 2 - (GAME_BLOCK_AMOUNT_WIDTH / 2) * BLOCK_WIDTH * global_scale - BLOCK_WIDTH * global_scale;
    const translateX = grid.x - orginal_grid_x;
    const orginal_grid_y = grid.y;
    grid.y = window.innerHeight / 2 - (GAME_BLOCK_AMOUNT_HEIGHT / 2) * BLOCK_HEIGHT * global_scale - BLOCK_HEIGHT * global_scale;
    const translateY = grid.y - orginal_grid_y;
    for (const building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.translate(translateX, translateY);
    }
    for (const z of Object.keys(shapes)) {
        for (const shape_key of Object.keys(shapes[z])) {
        let shape = shapes[z][shape_key];
        shape.translate(translateX, translateY);
        }
    }
    for (const image_key of Object.keys(image_draw_infos)) {
        let image = image_draw_infos[image_key];
        image.translate(translateX, translateY);
    }
}

function getDistance(x1, y1, x2, y2){
    let y = x2 - x1;
    let x = y2 - y1;
    return Math.sqrt(x * x + y * y);
}

function updateBuyCosts() {
    update(ref(db, `users/${userId}/game-data`), {
        "buy-costs": buy_costs
    });
}

function updateCurrincies() {
    update(ref(db, `users/${userId}/game-data`), {
        "currencies": currencies
    });
}

function updateInGameTime(log_in_number) {
    update(ref(db, `users/${userId}/logins/login-${log_in_number}`), {
        "in-game-time": in_game_time
    });
}

function updateUserSettings() {
    update(ref(db, `users/${userId}/game-data`), {
        "user-settings": user_settings
    });
}

export function createGame() {
    username = sessionStorage.getItem('blue-squares:username');
    notification(`Hello ${username}`);
    const intial_player_data = JSON.parse(sessionStorage.getItem('blue-squares:intialPlayerData'));
    grass_grid = JSON.parse(intial_player_data['grass-grid']);
    user_settings = intial_player_data['user-settings'];
    currencies = intial_player_data['currencies'];
    buy_costs = intial_player_data['buy-costs'];
    username = intial_player_data['username'];
    createGrass();
    eventListners();
    centerBoard();
    const building_data = intial_player_data['building-data'];
    for (const building_key of Object.keys(building_data)) {
        const building = building_data[building_key];
        const color = building.type.split('_')[0];
        new square({
            'id': building_key,
            'level': building.level,
            'createdAt': building['created-at'],
            'totalCost': building['total-cost'],
            'color': color,
            'coordX': building.coordX,
            'coordY': building.coordY
        });
    }
    const afked_time = sessionStorage.getItem('blue-squares:afk-collected');
    const afked_time_formated = afkTime(parseInt(afked_time));
    for (const building_key of Object.keys(buildings)) {
        let building = buildings[building_key];
        building.collectAfktime(afked_time);
    }
    notification(`Collceted ${afked_time_formated} worth of time`);
    const log_in_number = sessionStorage.getItem('blue-squares:login_in_number');
    const UP_RESOURCES = setInterval(() => {
        for (const building_key of Object.keys(buildings)) {
            let building = buildings[building_key];
            building.upResource();
        }
        for (const color of Object.keys(colors)) {
            document.getElementById(`${color.toLowerCase()}-squares-count`).textContent = getFormatedNumber(currencies[`${color.toLowerCase()}_squares`]);
        }
        updateCurrincies();
        in_game_time += 1000;
        updateInGameTime(log_in_number); 
    }, 1000);
    setTimeout(() => {
        window.location.href = "/Intro Info/intro-page.html";
    }, 1000 * 60 * 30);
}