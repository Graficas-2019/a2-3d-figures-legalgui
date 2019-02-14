var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

 function initViewport(gl, canvas) {
   const width = $(window).width();
   const height = $(window).height();
   canvas.width = width;
   canvas.height = height;
   gl.viewport(0, 0, width, height);
 }

 function initGL(canvas) {
   // Create a project matrix with 45 degree field of view
   const width = $(canvas).width();
   const height = $(canvas).height();
   projectionMatrix = mat4.create();
   mat4.perspective(projectionMatrix, Math.PI / 4, width / height, 1, 100);
   mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
 }

// TO DO: Create the functions for each of the figures.

///////////
// PYRAMID
///////////

// Get Vec3 configuration
function getDefinedVec3(option){
  return vec3.fromValues(Math.cos(Math.PI * 2 / 5 * option), Math.sin(Math.PI * 2 / 5 * option), 0)
}

function createPyramid(gl, translation, rotationAxis) {

  transform = mat4.create();
  mat4.rotateX(transform, transform, - Math.PI / 2);
  mat4.scale(transform, transform, vec3.fromValues(0.5, 0.5, 0.5));

  // Specify fundamental structure
  var vertex_a = vec3.transformMat4(vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 1), transform);
  var vertex_b = vec3.transformMat4(vec3.fromValues(1, 0, 0), vec3.fromValues(1, 0, 0), transform);
  var vertex_c = vec3.transformMat4(getDefinedVec3(1), getDefinedVec3(1), transform);
  var vertex_d = vec3.transformMat4(getDefinedVec3(1), getDefinedVec3(2), transform);
  var vertex_e = vec3.transformMat4(getDefinedVec3(1), getDefinedVec3(3), transform);
  var vertex_f = vec3.transformMat4(getDefinedVec3(1), getDefinedVec3(4), transform);

  // vValues
  var vValues = [3,3,3,3,3,9]

  // RGB Colors and Alpha
  var colors = [
    [192 / 255, 192 / 255, 192 / 255, 1],
    [255 / 255, 255 / 255, 255 / 255, 1],
    [255 / 255, 255 / 255, 0 / 255, 1],
    [0 / 255, 255 / 255, 255 / 255, 1],
    [255 / 255, 0 / 255, 255 / 255, 1],
    [128 / 255, 0 / 255, 128 / 255, 1]
  ]

  // Push to vector
  var verts = [];
  verts.push(...vertex_a); verts.push(...vertex_b); verts.push(...vertex_c);
  verts.push(...vertex_a); verts.push(...vertex_c); verts.push(...vertex_d);
  verts.push(...vertex_a); verts.push(...vertex_d); verts.push(...vertex_e);
  verts.push(...vertex_a); verts.push(...vertex_e); verts.push(...vertex_f);
  verts.push(...vertex_a); verts.push(...vertex_f); verts.push(...vertex_b);
  verts.push(...vertex_b); verts.push(...vertex_c); verts.push(...vertex_d);
  verts.push(...vertex_d); verts.push(...vertex_e); verts.push(...vertex_f);
  verts.push(...vertex_f); verts.push(...vertex_d); verts.push(...vertex_b);

  // Push to vector
  var vertexColors = [];
  for (var i = 0; i < vValues.length; i++) {
    for (var j = 0; j < vValues[i]; j++) vertexColors.push(...colors[i]);
  }

  // Push to vector
  var indicesArray = [];
  var newSize = verts.length / 3;
  for (let i = 0; i < newSize; ++i) { indicesArray.push(i);}

  //Buffer creation
  var vBuffer = gl.createBuffer();
  var cBuffer = gl.createBuffer();
  var iBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesArray), gl.STATIC_DRAW);

  // Pyramid object
  var pyramid = {
    nVerts: verts.length,
    nColors: vertexColors.length,
    nIndices: indicesArray.length,

    buffer: vBuffer,
    cBuffer: cBuffer,
    indices: iBuffer,

    vSize: 3,
    colorSize: 4,

    modelViewMatrix: mat4.create(),
    primtype: gl.TRIANGLES,
    currentTime: Date.now()
  };

  mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

  pyramid.update = function () {
    // Here we check time
    var now = Date.now();
    var time = now - this.currentTime;
    this.currentTime = now;
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, Math.PI * 2 * (time / duration), rotationAxis);
  };

  return pyramid;
}


///////////////
/// OCTAHEDRON
///////////////

function createOctahedron(gl, translation, rotationAxis) {

  // Specify fundamental structure
  const vertices = [
    [0.5, 0, 0], [0, 0.5, 0], [-0.5, 0, 0],
    [0, -0.5, 0], [0, 0, 0.5], [0, 0, -0.5],
  ];

  // vValues
  var vValues = [9,3,3,3,3,3,3,3]

  // RGB Colors and Alpha
  const colors = [
    [128 / 255, 0 / 255, 128 / 255, 1],
    [0 / 255, 255 / 255, 100 / 255, 1],
    [230 / 255, 255 / 255, 255 / 255, 1],
    [255 / 255, 20 / 255, 200 / 255, 1],
    [20 / 255, 20 / 255, 20 / 255, 1],
    [100 / 255, 30 / 255, 255 / 255, 1],
    [12 / 255, 255 / 255, 0 / 255, 1],
    [192 / 255, 192 / 255, 192 / 255, 1],
  ];

  // Vertex intersection
  const intersection = [
    0, 1, 4, 1, 2, 4, 2, 3, 4,
    0, 3, 4, 0, 1, 5, 1, 2, 5,
    2, 3, 5, 0, 3, 5,
  ];

  // Push to vector
  const verts = [];
  for (let i of intersection) { verts.push(...vertices[i]); }

  // Push to vector
  const indicesArray = [];
  for (let i = 0; i < intersection.length; ++i) { indicesArray.push(i); }

  // Push to vector
  var vertexColors = [];
  for (var i = 0; i < vValues.length; i++) {
    for (var j = 0; j < vValues[i]; j++) vertexColors.push(...colors[i]);
  }


  // Buffer creation
  var cBuffer = gl.createBuffer();
  var vBuffer = gl.createBuffer();
  var iBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesArray), gl.STATIC_DRAW);


  // Octahedron object
  var octahedron = {
    buffer: vBuffer,
    cBuffer: cBuffer,
    indices: iBuffer,
    vSize: 3,
    nVerts: verts.length,
    colorSize: 4,
    nColors: vertexColors.length,
    nIndices: indicesArray.length,
    primtype: gl.TRIANGLES,
    modelViewMatrix: mat4.create(),
    currentTime: Date.now()
  };

  mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

  let differential = 0.01;
  octahedron.update = function () {
    var now = Date.now();
    var time = now - this.currentTime;
    this.currentTime = now;
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, Math.PI * 2 * (time / duration), rotationAxis);
    if (Math.abs(this.modelViewMatrix[13]) > 1.40) { differential = -differential; }
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, vec3.fromValues(0, differential, 0));
  };

  return octahedron;
}


/////////////////
/// DODECAHEDRON
/////////////////


// Function to get the ratio
function getR(x){
  return 1/(Math.pow(((1.0 + Math.sqrt(5.0)) * 0.5),x))
}

function createDodecahedron(gl, translation, rotationAxis1, rotationAxis2) {

  // Specify fundamental structure
  const vertices = [
    [0, 1, getR(2)], [0, 1, -getR(2)], [0, -1, getR(2)],
    [0, -1, -getR(2)], [1, getR(2), 0], [-1, getR(2), 0],
    [1, -getR(2), 0], [-1, -getR(2), 0], [getR(1), getR(1), getR(1)],
    [-getR(1), getR(1), getR(1)], [getR(1), getR(1), -getR(1)],
    [-getR(1), getR(1), -getR(1)], [getR(1), -getR(1), getR(1)],
    [-getR(1), -getR(1), getR(1)], [getR(1), -getR(1), -getR(1)],
    [-getR(1), -getR(1), -getR(1)], [getR(2), 0, 1],
    [-getR(2), 0, 1], [getR(2), 0, -1],[-getR(2), 0, -1],
  ];

  // vValues
  var vValues = [9,9,9,9,9,9,9,9,9,9,9,9]

  // RGB Colors and Alpha
  var colors = [
    [40 / 255, 255 / 255, 255 / 255, 1],[20 / 255, 0 / 255, 255 / 255, 1],
    [0 / 255, 0 / 255, 128 / 255, 1], [0 / 255, 128 / 255, 0 / 255, 1],
    [192 / 255, 192 / 255, 192 / 255, 1], [0 / 255, 255 / 255, 0 / 255, 1],
    [130 / 255, 0 / 255, 0 / 255, 1], [192 / 255, 192 / 255, 192 / 255, 1],
    [255 / 255, 255 / 255, 255 / 255, 1], [0 / 255, 255 / 255, 0 / 255, 1],
    [200 / 255, 0 / 255, 0 / 255, 1], [255 / 255, 0 / 255, 255 / 255, 1],
  ]

  // Vertex intersection
  const intersection = [
    16, 17, 9, 9, 0, 8, 16, 9, 8, 17, 16, 12, 12, 2, 13, 17, 12, 13,
    18, 19, 15, 15, 3, 14, 18, 15, 14, 19, 18, 10, 10, 1, 11, 19, 10, 11,
    1, 0, 8, 8, 4, 10, 1, 8, 10, 0, 1, 11, 11, 5, 9, 0, 11, 9,
    3, 2, 13, 13, 7, 15, 3, 13, 15, 2, 3, 14, 14, 6, 12, 2, 14, 12,
    4, 6, 12, 12, 16, 8, 4, 12, 8, 6, 4, 10, 10, 18, 14, 6, 10, 14,
    5, 7, 15, 15, 19, 11, 5, 15, 11, 7, 5, 9, 9, 17, 13, 7, 9, 13,
  ];

  // Push to vector
  const verts = [];
  for (let i of intersection) {
    verts.push(...vertices[i]);
  }

  // Push to vector
  const indicesArray = [];
  for (let i = 0; i < intersection.length; ++i) {
    indicesArray.push(i);
  }

  // Push to vector
  var vertexColors = [];
  for (var i = 0; i < vValues.length; i++) {
    for (var j = 0; j < vValues[i]; j++)
      vertexColors.push(...colors[i]);
  }

  // Buffer creation
  var cBuffer = gl.createBuffer();
  var vBuffer = gl.createBuffer();
  var iBuffer = gl.createBuffer();

  // Buffer binding
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesArray), gl.STATIC_DRAW);


  // Dodecahedron object
  var dodecahedron = {
    nColors: vertexColors.length,
    nIndices: indicesArray.length,
    nVerts: verts.length,
    cBuffer: cBuffer,
    vSize: 3,

    buffer: vBuffer,
    indices: iBuffer,
    colorSize: 4,
    primtype: gl.TRIANGLES,
    modelViewMatrix: mat4.create(),
    currentTime: Date.now()
  };

  mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

  dodecahedron.update = function () {
    var now = Date.now();
    var time = now - this.currentTime;
    this.currentTime = now;
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, Math.PI * 2 * (time / duration), rotationAxis2);
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, Math.PI * 2 * (time / duration), rotationAxis1);
  };

  return dodecahedron;
}

//////////////
// END FIGURES
//////////////

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.cBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
