"use strict";

var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

// Used to pass in the resolution of the canvas
uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;
  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

uniform vec4 u_fogColor;
uniform float u_fogAmount;

out vec4 outColor;

void main() {
  vec4 color = texture(u_texture, v_texcoord);
  outColor = mix(color, u_fogColor, u_fogAmount);  
}
`;

var vertexShaderSourceShapes = `#version 300 es

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

var fragmentShaderSourceShapes = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

let shapes = {};
let buildings = {};
let mouseX = -1;
let mouseY = -1;
let mouse_down = false;
let mouseStartX_Y = {'x': -1, 'y': -1};
let canDragBoard = false;
let checkedDragBoard = false;
let grid = {};
let d = true;
let Image_drawing = 0;
let Drag_shape = 0;
let Resource_disps = 0;
let Draw_shapes = 0;
let counter = 0;
let building_selected_id = '';
let addHighlight = false;
let user_settings = {};
let global_scale = 1.5;
let building_info_open = true;
const GAME_BLOCK_AMOUNT_WIDTH = 50;
const GAME_BLOCK_AMOUNT_HEIGHT = 30;
const BLOCK_WIDTH = 30;
const BLOCK_HEIGHT = 30;
const GAME_BORDER = 4;

function display() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#game-canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
  var programShapes = webglUtils.createProgramFromSources(gl,
      [vertexShaderSourceShapes, fragmentShaderSourceShapes]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
  var positionAttributeLocationShapes = gl.getAttribLocation(programShapes, "a_position");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  var textureLocation = gl.getUniformLocation(program, "u_texture");
  var fogColorLocation = gl.getUniformLocation(program, "u_fogColor");
  var fogAmountLocation = gl.getUniformLocation(program, "u_fogAmount");
  var resolutionUniformLocationShapes = gl.getUniformLocation(programShapes, "u_resolution");
  var colorLocationShapes = gl.getUniformLocation(programShapes, "u_color");

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // create the position buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put a unit quad in the buffer
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  var positionBufferShapes = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vaoShapes = gl.createVertexArray();

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Put texcoords in the buffer
  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);


  function draw() {
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let begin = Date.now();
    let time = Date.now();
    drawImages();
    if (d) Image_drawing = Date.now() - time;
    time = Date.now();
    dragShape();
    if (d) Drag_shape = Date.now() - time;
    time = Date.now();
    updateResourceDisplays();
    if (d) Resource_disps = Date.now() - time;
    time = Date.now();
    refreshCanvas();
    if (d) Draw_shapes = Date.now() - time;
    time = Date.now();
    d = false;
    if (getRandomInt(30) === 1) d = true;
    const fps = 1000 / (Date.now() - begin);
    if (counter % 5 === 0) document.getElementById('fps').textContent = Math.floor(fps);
    counter++;
    requestAnimationFrame(draw);
  }
  // setInterval(() => {
  //   draw();
  // }, 1000/60);
  requestAnimationFrame(draw);

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  function drawImage(tex, texWidth, texHeight, dstX, dstY, fogColor, fogAmount, dstWidth, dstHeight) {
    if (dstWidth === undefined) {
      dstWidth = texWidth;
    }

    if (dstHeight === undefined) {
      dstHeight = texHeight;
    }

    gl.useProgram(program);

    // Setup the attributes for the quad
    gl.bindVertexArray(vao);

    var textureUnit = 0;
    // The the shader we're putting the texture on texture unit 0
    gl.uniform1i(textureLocation, textureUnit);

    // set the fog color and amount
    gl.uniform4fv(fogColorLocation, fogColor);
    gl.uniform1f(fogAmountLocation, fogAmount);

    // Bind the texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // this matrix will convert from pixels to clip space
    var matrix = m4.orthographic(
        0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);

    // translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dstX, dstY, 0);

    // scale our 1 unit quad
    // from 1 unit to dstWidth, dstHeight units
    matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // draw the quad (2 triangles, 6 vertices)
    var offset = 0;
    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }
  function drawImages() {
    const image_keys = Object.keys(image_draw_infos);
    for (const drawInfoKey of image_keys) {
      let drawInfo = image_draw_infos[drawInfoKey];
      var dstX      = drawInfo.x;
      var dstY      = drawInfo.y;
      var dstWidth  = drawInfo.textureInfo.width  * drawInfo.xScale;
      var dstHeight = drawInfo.textureInfo.height * drawInfo.yScale;
      var fogColor  = drawInfo.fogColor;
      var fogAmount = drawInfo.fogAmount;
      let x1 = dstX;
      let y1 = dstY;
      let x2 = dstY + dstWidth;
      let y2 = dstY + dstHeight;
      if ((x1 > window.innerWidth) && (y1 > window.innerHeight)) continue;
      if ((x1 > window.innerWidth) && (y2 < 0)) continue;
      if ((x2 < 0) && (y1 > window.innerHeight)) continue;
      if ((x2 < 0) && (y2 < 0)) continue;
      if ((fogAmount === 0) && drawInfo.highlightable && addHighlight) {
        fogAmount = 0.3;
        fogColor = [1, 1, 1, 1];
      } else if (!addHighlight) {
        fogAmount = 0;
      }
      if (dstWidth === undefined) {
        dstWidth = drawInfo.textureInfo.width;
      }
  
      if (dstHeight === undefined) {
        dstHeight = drawInfo.textureInfo.height;
      }
  
      gl.useProgram(program);
  
      // Setup the attributes for the quad
      gl.bindVertexArray(vao);
  
      var textureUnit = 0;
      // The the shader we're putting the texture on texture unit 0
      gl.uniform1i(textureLocation, textureUnit);
  
      // set the fog color and amount
      gl.uniform4fv(fogColorLocation, fogColor);
      gl.uniform1f(fogAmountLocation, fogAmount);
  
      // Bind the texture to texture unit 0
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, drawInfo.textureInfo.texture);
  
      // this matrix will convert from pixels to clip space
      var matrix = m4.orthographic(
          0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
  
      // translate our quad to dstX, dstY
      matrix = m4.translate(matrix, dstX, dstY, 0);
  
      // scale our 1 unit quad
      // from 1 unit to dstWidth, dstHeight units
      matrix = m4.scale(matrix, dstWidth, dstHeight, 1);
  
      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
  
      // draw the quad (2 triangles, 6 vertices)
      var offset = 0;
      var count = 6;
      gl.drawArrays(gl.TRIANGLES, offset, count);
    }
  }
  function refreshCanvas() {
  // and make it the one we're currently working with
  gl.bindVertexArray(vaoShapes);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocationShapes);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferShapes);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocationShapes, size, type, normalize, stride, offset);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(programShapes);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vaoShapes);

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  gl.uniform2f(resolutionUniformLocationShapes, gl.canvas.width, gl.canvas.height);
  const zs = Object.keys(shapes);
  for (const z of zs) {
    const shape_keys = Object.keys(shapes[z]);
    for (const shape_key of shape_keys) {
      let object = shapes[z][shape_key];
      let x1 = object.x;
      let x2 = object.x + object.width;
      let y1 = object.y;
      let y2 = object.y + object.height;
      if ((x1 > window.innerWidth) && (y1 > window.innerHeight)) continue;
      if ((x1 > window.innerWidth) && (y2 < 0)) continue;
      if ((x2 < 0) && (y1 > window.innerHeight)) continue;
      if ((x2 < 0) && (y2 < 0)) continue;
      const gl = object.gl;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          x1, y1,
          x2, y1,
          x1, y2,
          x1, y2,
          x2, y1,
          x2, y2,
      ]), gl.STATIC_DRAW);
      gl.uniform4f(colorLocationShapes, object.r/255, object.g/255, object.b/255, 1);
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
  return 'Success';
  }
  function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
  }
  gl.canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  gl.canvas.addEventListener('touchmove', (e) => {
    const touch = e.targetTouches[0];
    if (e.targetTouches.length > 1) {
      mouse_down = false;
      return;
    }
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }, {passive: true});
  gl.canvas.addEventListener('mousedown', (e) => {
    mouse_down = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseStartX_Y.x = mouseX;
    mouseStartX_Y.y = mouseY;
    grid.distFromStartX = grid.x - mouseStartX_Y.x;
    grid.distFromStartY = grid.y - mouseStartX_Y.y;
    for (const building_key of Object.keys(buildings)) {
      let building = buildings[building_key];
      building.updateDistFromStartX_Y();
    }
    for (const z of Object.keys(shapes)) {
      for (const shape_key of Object.keys(shapes[z])) {
        let shape = shapes[z][shape_key];
        shape.updateDistFromStartX_Y();
      }
    }
    for (const image_key of Object.keys(image_draw_infos)) {
      let image = image_draw_infos[image_key];
      image.updateDistFromStartX_Y();
    }
  });
  gl.canvas.addEventListener('touchstart', (e) => {
    mouse_down = true;
    const touch = e.targetTouches[0];
    if (e.targetTouches.length > 1) return mouseEnd();
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    mouseStartX_Y.x = mouseX;
    mouseStartX_Y.y = mouseY;
    grid.distFromStartX = grid.x - mouseStartX_Y.x;
    grid.distFromStartY = grid.y - mouseStartX_Y.y;
    for (const building_key of Object.keys(buildings)) {
      let building = buildings[building_key];
      building.updateDistFromStartX_Y();
    }
    for (const z of Object.keys(shapes)) {
      for (const shape_key of Object.keys(shapes[z])) {
        let shape = shapes[z][shape_key];
        shape.updateDistFromStartX_Y();
      }
    }
    for (const image_key of Object.keys(image_draw_infos)) {
      let image = image_draw_infos[image_key];
      image.updateDistFromStartX_Y();
    }
  }, {passive: true});
  gl.canvas.addEventListener('mouseup', (e) => {
    mouseEnd();
    console.log('X ', mouseX);
    console.log('Y ', mouseY);
  });
  gl.canvas.addEventListener('touchend', (e) => {
    mouseEnd();
  }, {passive: true});
  document.addEventListener('mouseup', function () {
    mouseEnd();
  });
  document.addEventListener('touchend', function () {
    mouseEnd();
  });
  function mouseEnd() {
    if (!mouse_down) return;
    for (let building_key of Object.keys(buildings)) {
      let building = buildings[building_key];
      if (building.checkForMouseHover()) {
        building.displaySquare();
        building_info_open = true;
        if (user_settings['open-square-after-move']) document.getElementById("building-info").className = "collapse-building-info open-building-info";
        break;
      }
    }
    canDragBoard = false;
    mouse_down = false;
    checkedDragBoard = false;
  }
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(url) {
  var canvas = document.querySelector("#game-canvas");
  var gl = canvas.getContext("webgl2");
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  var img = new Image();
  // img.crossOrigin = "anonymous";
  img.addEventListener('load', function() {
    textureInfo.width = img.width;
    textureInfo.height = img.height;

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
  });
  img.src = url;

  return textureInfo;
}

const textureInfos = {
  'inner': {
    'block': {
      'dark': [
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-1.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-2.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-3.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-4.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-5.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-1.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-2.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-3.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-4.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-5.png')
      ]
    },
    'bush': {
      'dark': [
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-bush-1.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/darks/inner-block-dark-bush-2.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-bush-1.png'),
        loadImageAndCreateTextureInfo('images/grass/inner-blocks/lights/inner-block-light-bush-2.png')
      ]
    }
  },
  'outer': {
    'rights': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-rights/outer-right-light-3.png')
      ],
    },
    'ups': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-ups/outer-up-light-3.png')
      ],
    },
    'downs': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-downs/outer-down-light-3.png')
      ],
    },
    'lefts': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-lefts/outer-left-light-3.png')
      ],
    },
    'corners': {
      'bottom-right-dark': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-bottom_right-dark-1.png'),
      'bottom-left-dark': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-bottom_left-dark-1.png'),
      'top-right-dark': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-top_right-dark-1.png'),
      'top-left-dark': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-top_left-dark-1.png'),
      'bottom-right-light': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-bottom_right-light-1.png'),
      'bottom-left-light': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-bottom_left-light-1.png'),
      'top-right-light': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-top_right-light-1.png'),
      'top-left-light': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/corners/outer-corner-top_left-light-1.png')
    },
    'outside': {
      'block': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-3.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-4.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-5.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-6.png')
      ],
      'tree': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-tree-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-tree-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/outer-block-tree-3.png') 
      ]
    },
    'left-down': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-downs/outer-left-down-light-3.png')
      ]
    },
    'left-up': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-left-ups/outer-left-up-light-3.png')
      ]
    },
    'right-down': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-downs/outer-right-down-light-3.png')
      ]
    },
    'right-up': {
      'dark': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-dark-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-dark-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-dark-3.png')
      ],
      'light': [
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-light-1.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-light-2.png'),
        loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outer-right-ups/outer-right-up-light-3.png')
      ]
    },
    'edge-bush': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/outers/bush.png')
  },
};

let image_draw_infos = {};

function dragShape() {
  if (building_selected_id != '') {
    let building_selected = buildings[building_selected_id];
    if (building_selected.checkForMouseHover()) {
      building_selected.updateXandY();
      building_selected.displaySquare();
      canDragBoard = false;
      checkedDragBoard = true;
      console.log('h')
      return true;
    }
  }
  if (!mouse_down) return;
  if (!canDragBoard && (!user_settings['no-square-movement'])) {
    for (const building_key of Object.keys(buildings)) {
      let building = buildings[building_key];
      if (building.checkForMouseHover()) {
        checkedDragBoard = true;
        canDragBoard = false;
        building.updateXandY();
        building.displaySquare();
        return true;
      }
    }
  }
  if ((!mouse_down) || (checkedDragBoard)) return;
  canDragBoard = true;
  let translateX = mouseX - mouseStartX_Y.x;
  let translateY = mouseY - mouseStartX_Y.y;
  translateBoardFromStart(translateX, translateY);
}

function translateBoardFromStart(translateX, translateY) {
  grid.x = mouseStartX_Y.x + translateX + grid.distFromStartX;
  if (grid.x > GAME_BORDER * BLOCK_WIDTH * global_scale) {
    grid.x = GAME_BORDER * BLOCK_WIDTH * global_scale;
    translateX = grid.x - mouseStartX_Y.x - grid.distFromStartX;
  } else if (grid.x + (GAME_BORDER + GAME_BLOCK_AMOUNT_WIDTH) * BLOCK_WIDTH * global_scale < window.innerWidth) {
    grid.x = window.innerWidth - (GAME_BORDER + GAME_BLOCK_AMOUNT_WIDTH) * BLOCK_WIDTH * global_scale;
    translateX = grid.x - mouseStartX_Y.x - grid.distFromStartX;
  }
  grid.y = mouseStartX_Y.y + translateY + grid.distFromStartY;
  if (grid.y > GAME_BORDER * BLOCK_HEIGHT * global_scale) {
    grid.y = GAME_BORDER * BLOCK_HEIGHT * global_scale;
    translateY = grid.y - mouseStartX_Y.y - grid.distFromStartY;
  } else if (grid.y + (GAME_BORDER + GAME_BLOCK_AMOUNT_HEIGHT) * BLOCK_HEIGHT * global_scale < window.innerHeight) {
    grid.y = window.innerHeight - (GAME_BORDER + GAME_BLOCK_AMOUNT_HEIGHT) * BLOCK_HEIGHT * global_scale;
    translateY = grid.y - mouseStartX_Y.y - grid.distFromStartY;
  }
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    building.translateX_YfromStartX_Y(translateX, translateY);
  }
  for (const z of Object.keys(shapes)) {
    for (const shape_key of Object.keys(shapes[z])) {
      let shape = shapes[z][shape_key];
      shape.translateX_YfromStartX_Y(translateX, translateY);
    }
  }
  for (const image_key of Object.keys(image_draw_infos)) {
    let image = image_draw_infos[image_key];
    image.translateX_YfromStartX_Y(translateX, translateY);
  }
}

function updateResourceDisplays() {
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    building.updateResourceDisplay();
  }
}