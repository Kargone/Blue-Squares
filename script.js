const game_canvas = document.getElementById('game-canvas');
const ctx = game_canvas.getContext('2d');

let vh = window.innerHeight * 0.01;
let aspect_ratio = window.innerWidth / window.innerHeight;
document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
game_canvas.style.width = window.innerWidth + 'px';
game_canvas.style.height = window.innerHeight + 'px';

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
    game_canvas.style.width = window.innerWidth + 'px';
    game_canvas.style.height = window.innerHeight + 'px';
    aspect_ratio = window.innerWidth / window.innerHeight;
    block_height = BLOCK_WIDTH * aspect_ratio;
});

const GAME_BLOCK_AMOUNT_WIDTH = 50;
const GAME_BLOCK_AMOUNT_HEIGHT = 30;
const BLOCK_WIDTH = 15;
let block_height = Math.round(BLOCK_WIDTH / aspect_ratio);
const GAME_BORDER = 4;
const OUTER_GRASS_COLOR = '#146e10';
const INNER_GRASS_COLOR = '#1ee317';

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

gui_disable_antialiasing(ctx);

/* Disable antialiasing */
function gui_disable_antialiasing (ctx) {
	ctx.imageSmoothingEnabled       = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled    = false;
	ctx.msImageSmoothingEnabled     = false;
	ctx.oImageSmoothingEnabled      = false;
}

renderGame();


// /* Get mouse pos in canvas */
// function get_mouse_pos (can, evt) {

// 	var rect = can.getBoundingClientRect();

// 	return {
// 		x: evt.clientX - rect.left,
// 		y: evt.clientY - rect.top
// 	};
// }

// var devicePixelRatio = window.devicePixelRatio || 1;

// this.low_quality = function () {
//     document.getElementById ("high_ing").style.backgroundColor = "#3A2A0D";
//     document.getElementById ("low_ing").style.backgroundColor  = "#B56D18";
//     Cookies.set ("starve_quality",  "low", { expires: 30 });
//     document.getElementById ("input_ratio").value = 0.5 / (devicePixelRatio / backingStoreRatio);
//     game.change_ratio ();
//     ui.quality = 0;
// };


// /* Scale ratio */
// if (Cookies.get ("starve_scale")) {

//     ratio_opt = Number (Cookies.get ("starve_scale"));
//     document.getElementById ("input_ratio").value = ratio_opt;
//     ratio_opt *=  (devicePixelRatio / backingStoreRatio);
//     resize_canvas ();
// }

// /* Update ratio */
// this.change_ratio = function () {

//     Cookies.set ("starve_scale", "" + document.getElementById ("input_ratio").value);
//     ratio_opt = document.getElementById ("input_ratio").value * (devicePixelRatio / backingStoreRatio);
//     resize_canvas ();
// }

// var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
// 	ctx.mozBackingStorePixelRatio ||
// 	ctx.msBackingStorePixelRatio ||
// 	ctx.oBackingStorePixelRatio ||
// 	ctx.backingStorePixelRatio || 1;

//     game_body.onresize = resize_canvas;

//     function resize_canvas () {

//         if (can.width != window.innerWidth) {
//             can.width = window.innerWidth;
//             canw = can.width;
//             canw2 = can.width  / 2;
//         }
    
//         if (can.height != window.innerHeight) {
    
//             can.height = window.innerHeight;
//             canh = can.height;
//             canh2 = can.height / 2;
//         }
    
    
//         canm  = { x : canw2, y : canh2 };
    
//         var ow = can.width;
//         var oh = can.height;
    
//         if (ratio_opt === -1)
//             ratio = devicePixelRatio / backingStoreRatio;
//         else ratio = ratio_opt;
    
//         can.width = ow * ratio;
//         can.height = oh * ratio;
//         can.style.width = ow + "px";
//         can.style.height = oh + "px";
//         ctx.scale (ratio, ratio);
    
//         /* Resize cam of user */
//         if (user) {
//             user.cam.rw  = ow;
//             user.cam.rh  = oh;
//         }
    
//         /* Update loading view configuration */
//         if (loader.is_run) loader.update ();
//         /* Update UI configuration */
//         else if (ui.is_run) ui.update ();
//         /* Update game scene */
//         else if (game.is_run) game.update ();
//         /* Update scoreboard scene */
//         else if (scoreboard.is_run) scoreboard.update ();
//     }