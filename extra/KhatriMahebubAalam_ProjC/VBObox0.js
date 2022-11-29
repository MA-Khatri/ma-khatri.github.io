// Ground plane grid
function VBObox0() {
  
	this.VERT_SRC =
    'precision highp float;\n' +

    'uniform mat4 u_ModelMat0;\n' +
    'uniform float u_timer;\n' +
    'attribute vec4 a_Pos0;\n' +
    'attribute vec3 a_Colr0;\n'+
    'varying vec3 v_Colr0;\n' +

    'void main() {\n' +
    '   vec4 newPosn = a_Pos0;\n' +
    '   if (u_timer != 0.0) { \n' +
    '       newPosn.z = a_Pos0.z * sin(u_timer*3.141592265/180.0);\n' +
    '   } \n' +
    '   gl_Position = u_ModelMat0 * newPosn;\n' +
    '   v_Colr0 = a_Colr0;\n' +
    ' }\n';

	this.FRAG_SRC =
    'precision mediump float;\n' +
    'varying vec3 v_Colr0;\n' +
    'void main() {\n' +
    '   gl_FragColor = vec4(v_Colr0, 1.0);\n' + 
    '}\n';

    this.grids_output = makeGrids();
    this.vboContents = this.grids_output[0];
    // this.simpleStart = grids_output[1];
    // this.simpleLen = grids_output[2];
    // this.trianglesStart = grids_output[3];
    // this.trianglesLen = grids_output[4];
    // this.axesStart = grids_output[5];
    // this.axesLen = grids_output[6];

    this.floatsPerVertex = 7;
	this.vboVerts = this.vboContents.length / this.floatsPerVertex;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
    this.vboBytes = this.vboContents.length * this.FSIZE;               
	this.vboStride = this.vboBytes / this.vboVerts; 
    this.vboFcount_a_Pos0 =  4;
    this.vboFcount_a_Colr0 = 3;
    console.assert((this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0) * this.FSIZE == this.vboStride, 
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

	this.vboOffset_a_Pos0 = 0;
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
	this.vboLoc;
	this.shaderLoc;
	this.a_PosLoc;
	this.a_ColrLoc;
	this.ModelMat = new Matrix4();
	this.u_ModelMatLoc;
    this.u_timer;
}

VBObox0.prototype.init = function() {
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
    }

	gl.program = this.shaderLoc;

	this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
        console.log(this.constructor.name + '.init() failed to create VBO in GPU. Bye!'); 
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

    gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);
    
    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
    if (this.a_PosLoc < 0) {
        console.log(this.constructor.name + '.init() Failed to get GPU location of attribute a_Pos0');
        return -1;
    }
    this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
    if (this.a_ColrLoc < 0) {
        console.log(this.constructor.name + '.init() failed to get the GPU location of attribute a_Colr0');
        return -1;
    }
    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
    if (!this.u_ModelMatLoc) { 
        console.log(this.constructor.name + '.init() failed to get GPU location for u_ModelMat1 uniform');
        return;
    }
    this.u_timer = gl.getUniformLocation(this.shaderLoc, 'u_timer');
}

VBObox0.prototype.switchToMe = function() {
    gl.useProgram(this.shaderLoc);	
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);	

    gl.vertexAttribPointer(this.a_PosLoc, this.vboFcount_a_Pos0, gl.FLOAT, false, this.vboStride, this.vboOffset_a_Pos0);						
    gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, gl.FLOAT, false, this.vboStride, this.vboOffset_a_Colr0);
                                
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
    var isOK = true;
    if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
        console.log(this.constructor.name + '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
    }
    if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
    }
    return isOK;
}

VBObox0.prototype.adjust = function() {
    if (this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + '.adjust() call you needed to call this.switchToMe()!!');
    }  

    this.ModelMat.setIdentity();
    this.ModelMat.set(g_mvpMatrix);

    gl.uniformMatrix4fv(this.u_ModelMatLoc,	false, this.ModelMat.elements);
}

VBObox0.prototype.draw = function() {
    if (this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + '.draw() call you needed to call this.switchToMe()!!');
    }  

    var type = document.getElementById("GPgrid").value;
    if (type == "simple") {
        gl.uniform1f(this.u_timer, 0.0);
        gl.drawArrays(gl.LINES, this.grids_output[1], this.grids_output[2]);
    } else if (type == "triangular_mesh") {
        gl.uniform1f(this.u_timer, anim.grid);
        gl.drawArrays(gl.LINES, this.grids_output[3], this.grids_output[4]);
    }

    gl.uniform1f(this.u_timer, 0.0);
    this.ModelMat.setIdentity();
    this.ModelMat.set(g_modelMatrix);
    this.ModelMat.scale(8, 8, 8);
    var temp = new Matrix4();
    temp.set(g_vpMatrix).multiply(this.ModelMat);
    gl.uniformMatrix4fv(this.u_ModelMatLoc, false, temp.elements);
    gl.drawArrays(gl.LINES, this.grids_output[5], this.grids_output[6]);

    this.ModelMat.setIdentity();
    this.ModelMat.set(g_modelMatrix);
    this.ModelMat.translate(-10, -6, 3);
    this.ModelMat.scale(2, 2, 2);
    var temp = new Matrix4();
    temp.set(g_vpMatrix).multiply(this.ModelMat);
    gl.uniformMatrix4fv(this.u_ModelMatLoc, false, temp.elements);
    gl.drawArrays(gl.LINE_LOOP, this.grids_output[7], this.grids_output[8]);
}

VBObox0.prototype.reload = function() {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
}

// Needs testing!
VBObox0.prototype.empty = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.uniformMatrix4fv(this.u_ModelMatLoc, false, null);
    gl.useProgram(null);
    gl.disableVertexAttribArray(this.a_PosLoc);
    gl.disableVertexAttribArray(this.a_ColrLoc)
    // what else...?
    
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

// Needs testing!
VBObox0.prototype.restore = function() {
    VBObox0.switchToMe(); // hmmmm.....

//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}