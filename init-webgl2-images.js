"use strict";

var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

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

let shapes;
let buildings;
let mouseX = -1;
let mouseY = -1;
let mouse_down = false;
let mouseStartX_Y = {'x': -1, 'y': -1};
let canDragBoard = true;
let grid;
let d = false;

function main() {
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

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  var textureLocation = gl.getUniformLocation(program, "u_texture");
  var fogColorLocation = gl.getUniformLocation(program, "u_fogColor");
  var fogAmountLocation = gl.getUniformLocation(program, "u_fogAmount");

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
    let time = Date.now();
    Object.keys(image_draw_infos).forEach(function(drawInfoKey) {
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
      if ((x1 > window.innerWidth) && (y1 > window.innerHeight)) return;
      if ((x1 > window.innerWidth) && (y2 < 0)) return;
      if ((x2 < 0) && (y1 > window.innerHeight)) return;
      if ((x2 < 0) && (y2 < 0)) return;
      if ((fogAmount === 0) && drawInfo.highlightable && addHighlight) {
        fogAmount = 0.3;
        fogColor = [1, 1, 1, 1];
      } else if (!addHighlight) {
        fogAmount = 0;
      }
      drawImage(
        drawInfo.textureInfo.texture,
        drawInfo.textureInfo.width,
        drawInfo.textureInfo.height,
        dstX, dstY, fogColor, fogAmount, 
        dstWidth, dstHeight);
    });
    if (d) console.log('Image drawing: ', Date.now() - time);
    time = Date.now();
    dragShape();
    if (d) console.log('Drag shape: ', Date.now() - time);
    time = Date.now();
    updateResourceDisplays();
    if (d) console.log('Resource disps: ', Date.now() - time);
    time = Date.now();
    refreshCanvas();
    if (d) console.log('Draw shapes: ', Date.now() - time);
    time = Date.now();
    d = false;
    if (getRandomInt(60) === 1) d = true;
  }
  setInterval(() => {
    draw();
  }, 1000/60);

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
  });
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
    for (const shape_key of Object.keys(shapes)) {
      let shape = shapes[shape_key];
      shape.updateDistFromStartX_Y();
    }
    for (const image_key of Object.keys(image_draw_infos)) {
      let image = image_draw_infos[image_key];
      image.updateDistFromStartX_Y();
    }
  });
  gl.canvas.addEventListener('touchstart', (e) => {
    mouse_down = true;
    const touch = e.targetTouches[0];
    if (e.targetTouches.length > 1) {
      mouse_down = false;
      return;
    }
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
    for (const shape_key of Object.keys(shapes)) {
      let shape = shapes[shape_key];
      shape.updateDistFromStartX_Y();
    }
    for (const image_key of Object.keys(image_draw_infos)) {
      let image = image_draw_infos[image_key];
      image.updateDistFromStartX_Y();
    }
  });
  gl.canvas.addEventListener('mouseup', (e) => {
    mouseEnd();
    console.log('X ', mouseX);
    console.log('Y ', mouseY);
  });
  gl.canvas.addEventListener('touchend', (e) => {
    mouseEnd();
  });
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
    canDragBoard = true;
    mouse_down = false;
  }
}

main();

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
    'edge-bush': loadImageAndCreateTextureInfo('images/Grass/Outer-Blocks/bush.png')
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
      console.log('h')
      return true;
    }
  }
  if (!mouse_down) return;
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    if (building.checkForMouseHover()) {
      building.updateXandY();
      building.displaySquare();
      canDragBoard = false;
      return true;
    }
  }
  if ((!mouse_down) || (!canDragBoard) || (user_settings['no-square-movement'])) return;
  const translateX = mouseX - mouseStartX_Y.x;
  const translateY = mouseY - mouseStartX_Y.y;
  grid.x = mouseStartX_Y.x + translateX + grid.distFromStartX;
  grid.y = mouseStartX_Y.y + translateY + grid.distFromStartY;
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    building.translateX_YfromStartX_Y(translateX, translateY);
  }
  for (const shape_key of Object.keys(shapes)) {
    let shape = shapes[shape_key];
    shape.translateX_YfromStartX_Y(translateX, translateY);
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