"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

let shapes = {};

function refreshCanvas() {
  // Get A WebGL context
  var canvas = document.querySelector("#game-canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  for (let zindex of [1, 3]) {
    Object.keys(shapes).forEach(function (key) {
        if (shapes[key].z != zindex) return;
        let object = shapes[key];
        object.colorLocation = colorLocation;
        object.move();
        object.draw();
    });
  }
  return 'Success';
}

setInterval(() => {
    refreshCanvas();
}, 1000/20);

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

function getRandomIntMinMax(min = 0, max = 1000000000) {
    return Math.floor(Math.random() * (max - min)) + min;
}

class rect {
    constructor(x, y, width, height, rgb, dx, dy) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.distFromStartX = -1;
        this.distFromStartY = -1;
        this.width = width ?? 10;
        this.height = height ?? 10;
        if (rgb === 'rgb(146, 151, 247)') {
            const background = new rect(this.x - 3, this.y - 3, this.width + 6, this.height + 6, 'rgb(0,0,0');
            this.backgroundId = background.id;
            background.z = 2;
        }
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
        this.dx = dx ?? 0;
        this.dy = dy ?? 0;
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
    updateDistFromStartX_Y() {
        this.distFromStartX = this.x - mouseStartX_Y.x;
        this.distFromStartY = this.y - mouseStartX_Y.y;
    }
    move() {
        if (this.x + this.dx + this.width >= window.innerWidth) {
            this.x = window.innerWidth - this.width;
            this.y += this.dy;
            this.dx *= -1;
        } else if (this.y + this.dy + this.height >= window.innerHeight) {
            this.y = window.innerHeight - this.height;
            this.x += this.dx;
            this.dy *= -1;
        } else if (this.x + this.dx < 0) {
            this.x = 0;
            this.y += this.dy;
            this.dx *= -1;
        } else if (this.y + this.dy < 0) {
            this.y = 0;
            this.x += this.dx;
            this.dy *= -1;
        } else {
            this.x += this.dx;
            this.y += this.dy;
        }
        if (this.backgroundId != undefined) {
            const background = shapes[this.backgroundId];
            background.colorLocation = this.colorLocation;
            background.x = this.x - 3;
            background.y = this.y - 3;
            background.width = this.width + 6;
            background.height = this.height + 6;
            background.draw();
        }
    }
}

const spacing = 15;
const lines_width = Math.ceil(window.innerWidth / spacing);
const lines_height = Math.ceil(window.innerHeight / spacing);

for (let x = 1; x <= lines_width; x++) {
    new rect(x * spacing, 0, 1, window.innerHeight, 'rgb(240,240,240)');
}

for (let y = 0; y <= lines_height; y++) {
    new rect(0, y * spacing, window.innerWidth, 1, 'rgb(240,240,240)');
}

const square_count = getRandomIntMinMax(10, 15);

for (let square_number = 0; square_number < square_count; square_number++) {
    console.log(square_count);
    const side_length = getRandomIntMinMax(30, 50);
    const square = new rect(
        getRandomIntMinMax(0, window.innerWidth - side_length), 
        getRandomIntMinMax(0, window.innerHeight - side_length), 
        side_length, 
        side_length, 
        'rgb(146, 151, 247)',
        [1, -1][getRandomInt(2)] * getRandomIntMinMax(2, 8) / 10,
        [1, -1][getRandomInt(2)] * getRandomIntMinMax(2, 8) / 10
    );
    square.z = 3;
}

const lower = 0;
const upper = 89;
let percentage = 0;
let direction_percentage = 2;
setInterval(() => {
    percentage += direction_percentage;
    if (percentage < lower) {
        percentage = lower;
        direction_percentage *= -1;
    } else if (percentage > upper) {
        percentage = lower;
    }
    document.querySelector(':root').style.setProperty('--grad', `${percentage}%`);
}, 1000/10);