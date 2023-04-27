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

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
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
    Object.keys(image_draw_infos).forEach(function(drawInfoKey) {
      let drawInfo = image_draw_infos[drawInfoKey];
      var dstX      = drawInfo.x;
      var dstY      = drawInfo.y;
      var dstWidth  = drawInfo.textureInfo.width  * drawInfo.xScale;
      var dstHeight = drawInfo.textureInfo.height * drawInfo.yScale;

      drawImage(
        drawInfo.textureInfo.texture,
        drawInfo.textureInfo.width,
        drawInfo.textureInfo.height,
        dstX, dstY, dstWidth, dstHeight);
    });
    dragShape();
    updateResourceDisplays();
    refreshCanvas();
  }
  setInterval(() => {
    draw();
  }, 1000/60);

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  function drawImage(tex, texWidth, texHeight, dstX, dstY, dstWidth, dstHeight) {
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
  });
  gl.canvas.addEventListener('touchend', (e) => {
    mouseEnd();
  });
  function mouseEnd() {
    if (!mouse_down) return;
    for (let building_key of Object.keys(buildings)) {
      let building = buildings[building_key];
      if (building.checkForMouseHover()) {
        building.displaySquare();
        building_info_open = true;
        document.getElementById("building-info").className = "collapse-building-info open-building-info";
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

const textureInfos = [
  loadImageAndCreateTextureInfo('Images/innerBlock1.png'),
  loadImageAndCreateTextureInfo('Images/innerBlock2.png'),
  loadImageAndCreateTextureInfo('Images/outerBlock.png'),
];

let image_draw_infos = {};

function dragShape() {
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    if (!building.selected) continue;
    if (building.checkForMouseHover()) {
      building.updateXandY();
      building.displaySquare();
      canDragBoard = false;
      return true;
    }
  }
  for (const building_key of Object.keys(buildings)) {
    let building = buildings[building_key];
    if (building.checkForMouseHover()) {
      building.updateXandY();
      building.displaySquare();
      canDragBoard = false;
      return true;
    }
  }
  if ((!mouse_down) || (!canDragBoard)) return;
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