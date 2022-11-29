// Gouraud Shading
function VBObox1() {
  
    this.VERT_SRC =
    'precision highp float;\n' +

    'struct MatlT {\n' +
	'		vec3 emit;\n' +
	'		vec3 ambi;\n' +
	'		vec3 diff;\n' +
	'		vec3 spec;\n' +
	'		int shiny;\n' +
    '		};\n' +
    
    'struct LampT {\n' +
    '	vec3 pos;\n' +
    ' 	vec3 ambi;\n' +
    ' 	vec3 diff;\n' +
    '	vec3 spec;\n' +
    '}; \n' +

    'attribute vec4 a_Position; \n' +
    'attribute vec4 a_Normal; \n' +

    'uniform LampT u_LampSet[1];\n' +
	'uniform MatlT u_MatlSet[1];\n' +
    'uniform vec3 u_eyePosWorld; \n' +
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' +
    'uniform mat4 u_NormalMatrix; \n' +
    'uniform int u_Mode; \n' + 
    'uniform vec3 u_Multipliers; \n' + 

    'varying vec4 v_Color;\n' +

    'void main() { \n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
    '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '   vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
    '   vec3 lightDirection = normalize(u_LampSet[0].pos - vec3(vertexPosition));\n' +
    '   vec3 eyeDirection = normalize(u_eyePosWorld - vertexPosition.xyz);\n' +
    '   float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '   vec3 H = normalize(lightDirection + eyeDirection);\n' +
    '   float nDotH = max(dot(H, normal), 0.0);\n' +

    '   float e64 = 0.0; \n' +
    '   if (u_Mode == 0 && nDotH > 0.0) { \n' + // blinn-phong lighting
    '       e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
    '   } else if (u_Mode == 1 && nDotL > 0.0) { \n' + // phong lighting
    '       e64 = pow(nDotL, float(u_MatlSet[0].shiny));\n' +
    '   } \n' +

    '	vec3 emissive =	u_MatlSet[0].emit;\n' +
    '   vec3 diffuse = u_LampSet[0].diff * u_MatlSet[0].diff * nDotL * u_Multipliers.x;\n' +
    '   vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi * u_Multipliers.y;\n' +
    '	vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64 * u_Multipliers.z;\n' +

    '   v_Color = vec4(emissive + ambient + diffuse + speculr, 1.0);\n' +
    '}\n';

	this.FRAG_SRC =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' + 
    '}\n';

    this.shapes = initShapes();

	this.vboContents = this.shapes[0];

	this.vboVerts = this.vboContents.length / 7;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
    this.vboBytes = this.vboContents.length * this.FSIZE;               
	this.vboStride = this.vboBytes / this.vboVerts; 
    this.vboFcount_a_Position =  4;
    this.vboFcount_a_Normal = 3;
    console.assert((this.vboFcount_a_Position + this.vboFcount_a_Normal) * this.FSIZE == this.vboStride, 
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");

    this.vboOffset_a_Position = 0;
    this.vboOffset_a_Normal = this.vboFcount_a_Position * this.FSIZE;
    
    this.vboLoc;
    this.shaderLoc;
    
    this.a_PositionLoc;
    this.a_NormalLoc
    
    this.u_EyePosWorld;
    this.eyePosWorld = new Float32Array(3);
    this.mvpMatrix = new Matrix4();
    this.u_MvpMatrix;
    this.modelMatrix = new Matrix4();
    this.u_ModelMatrix;
    this.normalMatrix = new Matrix4();
    this.u_NormalMatrix;

    this.lamp0 = new LightsT();
    this.matlSel= MATL_RED_PLASTIC;
    this.matl0 = new Material(this.matlSel);
    this.u_Mode;
    this.u_Multipliers;
    this.Multipliers = new Vector3([1.0, 1.0, 1.0]);
}

VBObox1.prototype.init = function() {
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
    
    this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
    this.a_NormalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
    if (this.a_PosLoc < 0 || this.a_NormalLoc < 0) {
        console.log(this.constructor.name + '.init() Failed to get GPU location of attribute');
        return -1;
    }
    
    this.u_EyePosWorld  = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
    this.u_ModelMatrix  = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
    this.u_MvpMatrix    = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    if(!this.u_EyePosWorld || !this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_NormalMatrix) {
        console.log('Failed to get GPUs matrix storage locations');
        return;
    }

    this.lamp0.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');	
    this.lamp0.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
    this.lamp0.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
    this.lamp0.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
    if(!this.lamp0.u_pos || !this.lamp0.u_ambi	|| !this.lamp0.u_diff || !this.lamp0.u_spec) {
      console.log('Failed to get GPUs Lamp0 storage locations');
      return;
    }

    // ... for Phong material/reflectance:
	this.matl0.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
	this.matl0.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
	this.matl0.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
	this.matl0.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
	this.matl0.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
	if(!this.matl0.uLoc_Ke || !this.matl0.uLoc_Ka || !this.matl0.uLoc_Kd || !this.matl0.uLoc_Ks || !this.matl0.uLoc_Kshiny) {
		console.log('Failed to get GPUs Reflectance storage locations');
		return;
	}

    this.u_Mode = gl.getUniformLocation(gl.program, 'u_Mode');
    if(!this.u_Mode) {
		console.log('Failed to get mode storage location');
		return;
	}

    this.u_Multipliers = gl.getUniformLocation(gl.program, 'u_Multipliers');
    if(!this.u_Multipliers) {
		console.log('Failed to get Multipliers storage location');
		return;
	}
	
    var worldLightColor = document.getElementById("worldLightColor").value;
    var wrgb = worldLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var ambientLightColor = document.getElementById("ambientLightColor").value;
    var argb = ambientLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var specularLightColor = document.getElementById("specularLightColor").value;
    var srgb = specularLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var lightx = document.getElementById("worldLightX").value;
    document.getElementById("LIGHTX").innerHTML = lightx;
    var lighty = document.getElementById("worldLightY").value;
    document.getElementById("LIGHTY").innerHTML = lighty;
    var lightz = document.getElementById("worldLightZ").value;
    document.getElementById("LIGHTZ").innerHTML = lightz;

    var diffuseMulltiplier = document.getElementById("diffuseMultiplier").value;
    document.getElementById("DIFFUSEMULTIPLIER").innerHTML = diffuseMulltiplier;
    var ambientMulltiplier = document.getElementById("ambientMultiplier").value;
    document.getElementById("AMBIENTMULTIPLIER").innerHTML = ambientMulltiplier;
    var specularMulltiplier = document.getElementById("specularMultiplier").value;
    document.getElementById("SPECULARMULTIPLIER").innerHTML = specularMulltiplier;
    this.Multipliers = [diffuseMulltiplier, ambientMulltiplier, specularMulltiplier];

    // Init World-coord. position & colors of first light source in global vars;
    this.lamp0.I_pos.elements.set( [lightx, lighty, lightz]);
    this.lamp0.I_ambi.elements.set([argb[0], argb[1], argb[2]]);
    this.lamp0.I_diff.elements.set([wrgb[0], wrgb[1], wrgb[2]]);
    this.lamp0.I_spec.elements.set([srgb[0], srgb[1], srgb[2]]);
}

VBObox1.prototype.switchToMe = function() {
    gl.useProgram(this.shaderLoc);	
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);	

    gl.vertexAttribPointer(this.a_PositionLoc, this.vboFcount_a_Position, gl.FLOAT, false, this.vboStride, this.vboOffset_a_Position);
    gl.vertexAttribPointer(this.a_NormalLoc, this.vboFcount_a_Normal, gl.FLOAT, false, this.vboStride, this.vboOffset_a_Normal);
                                
    gl.enableVertexAttribArray(this.a_PositionLoc);
    gl.enableVertexAttribArray(this.a_NormalLoc);
}

VBObox1.prototype.isReady = function() {
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

VBObox1.prototype.draw = function() {
    if (this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + '.adjust() call you needed to call this.switchToMe()!!');
    } 

    // Position the camera in world coordinates:
	this.eyePosWorld.set([cam.ep.x, cam.ep.y, cam.ep.z]);
	gl.uniform3fv(this.u_EyePosWorld, this.eyePosWorld);// use it to set our uniform
	// (Note: uniform4fv() expects 4-element float32Array as its 2nd argument)
	
    var worldLightColor = document.getElementById("worldLightColor").value;
    var wrgb = worldLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var ambientLightColor = document.getElementById("ambientLightColor").value;
    var argb = ambientLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var specularLightColor = document.getElementById("specularLightColor").value;
    var srgb = specularLightColor.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)/255 });
    var lightx = document.getElementById("worldLightX").value;
    document.getElementById("LIGHTX").innerHTML = lightx;
    var lighty = document.getElementById("worldLightY").value;
    document.getElementById("LIGHTY").innerHTML = lighty;
    var lightz = document.getElementById("worldLightZ").value;
    document.getElementById("LIGHTZ").innerHTML = lightz;

    var diffuseMulltiplier = document.getElementById("diffuseMultiplier").value;
    document.getElementById("DIFFUSEMULTIPLIER").innerHTML = diffuseMulltiplier;
    var ambientMulltiplier = document.getElementById("ambientMultiplier").value;
    document.getElementById("AMBIENTMULTIPLIER").innerHTML = ambientMulltiplier;
    var specularMulltiplier = document.getElementById("specularMultiplier").value;
    document.getElementById("SPECULARMULTIPLIER").innerHTML = specularMulltiplier;
    this.Multipliers = [diffuseMulltiplier, ambientMulltiplier, specularMulltiplier];

    this.matlSel = parseInt(document.getElementById("materialSelect").value);
    this.matl0.setMatl(this.matlSel);

    var mode = document.getElementById("shadingStyle").value;
    if (mode == "BPgouraud") {
        gl.uniform1i(this.u_Mode, 0)
    }
    else if (mode == "Pgouraud") {
        gl.uniform1i(this.u_Mode, 1)
    }

    // Init World-coord. position & colors of first light source in global vars;
    this.lamp0.I_pos.elements.set( [lightx, lighty, lightz]);
    this.lamp0.I_ambi.elements.set([argb[0], argb[1], argb[2]]);
    this.lamp0.I_diff.elements.set([wrgb[0], wrgb[1], wrgb[2]]);
    this.lamp0.I_spec.elements.set([srgb[0], srgb[1], srgb[2]]);

    gl.uniform3fv(this.lamp0.u_pos, this.lamp0.I_pos.elements.slice(0,3));
    //		 ('slice(0,3) member func returns elements 0,1,2 (x,y,z) ) 
    gl.uniform3fv(this.lamp0.u_ambi, this.lamp0.I_ambi.elements);		// ambient
    gl.uniform3fv(this.lamp0.u_diff, this.lamp0.I_diff.elements);		// diffuse
    gl.uniform3fv(this.lamp0.u_spec, this.lamp0.I_spec.elements);		// Specular
    gl.uniform3fv(this.u_Multipliers, this.Multipliers)

    this.reloadMaterial();

    // Draw Sphere
    this.modelMatrix.setIdentity();
    this.modelMatrix.set(g_modelMatrix);
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.rotate(anim.ball, 0, 0, 1);
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[1], this.shapes[2]);

    // Draw Utah Teapot
    this.modelMatrix.setIdentity();
    this.modelMatrix.set(g_modelMatrix);
    this.modelMatrix.translate(0, 4, 0);
    this.modelMatrix.rotate(90, 1, 0, 0);
    this.modelMatrix.rotate(anim.ball, 0, 1, 0);
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[3], this.shapes[4]);    

    // Draw Cube
    this.modelMatrix.setIdentity();
    this.modelMatrix.set(g_modelMatrix);
    this.modelMatrix.translate(0, -5, 0);
    this.modelMatrix.rotate(90, 1, 0, 0);
    this.modelMatrix.rotate(anim.ball, 0, 1, 0);
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[5], this.shapes[6]);   

    // Draw Bunny
    this.modelMatrix.setIdentity();
    this.modelMatrix.set(g_modelMatrix);
    this.modelMatrix.translate(0, 6, 0);
    this.modelMatrix.rotate(90, 1, 0, 0);
    this.modelMatrix.rotate(anim.ball, 0, 1, 0);
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[7], this.shapes[8]);   

    // Draw Cylinder
    this.matl0.setMatl(17);
    this.reloadMaterial();
    this.modelMatrix.setIdentity();
    this.modelMatrix.translate(-10, 0, 1);
    this.drawBranch(anim.tree, 0); 

    // Draw Cylinder
    this.matl0.setMatl(19);
    this.reloadMaterial();
    this.modelMatrix.setIdentity();
    this.modelMatrix.translate(-10, 5, 0);
    this.modelMatrix.rotate(-90, 0, 1, 0);
    this.drawTentacle(anim.tentacle); 

    // Draw Spinning Pyramids
    this.matl0.setMatl(13);
    this.reloadMaterial();
    this.modelMatrix.setIdentity();
    this.modelMatrix.translate(-10, -6, 3);
    this.modelMatrix.scale(2, 2, 2);
    // this.modelMatrix.rotate(-90, 0, 1, 0);
    this.drawSpinningPyramids(anim.tentacle, anim.tentacle, anim.ball); 

    // Draw Light Point
    this.matl0.setMatl(23);
    this.reloadMaterial();
    this.modelMatrix.setIdentity();
    this.modelMatrix.set(g_modelMatrix);
    this.modelMatrix.translate(lightx, lighty, lightz);
    this.modelMatrix.scale(0.1, 0.1, 0.1);
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[1], this.shapes[2]);
}

VBObox1.prototype.setMatrices = function() {
    gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
    this.mvpMatrix.setIdentity();
    this.mvpMatrix.set(g_vpMatrix).multiply(this.modelMatrix);
    gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
}

VBObox1.prototype.drawCylinder = function() {
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[9], this.shapes[10]);   
}

VBObox1.prototype.drawBranch = function(angle, iter) {
    if (iter < 3) {
        pushMatrix(this.modelMatrix);

            pushMatrix(this.modelMatrix);
                this.modelMatrix.scale(0.1, 0.1, 1);
                this.drawCylinder();
            this.modelMatrix = popMatrix();

            pushMatrix(this.modelMatrix);
                this.modelMatrix.translate(0, 0, 1);
                this.modelMatrix.rotate(angle+25, 1, 0, 0);
                this.modelMatrix.translate(0, 0, 1);
                pushMatrix(this.modelMatrix);
                    this.modelMatrix.scale(0.1, 0.1, 1);
                    this.drawCylinder();
                this.modelMatrix = popMatrix();
                this.drawBranch(angle, iter+1);
            this.modelMatrix = popMatrix();

            pushMatrix(this.modelMatrix);
                this.modelMatrix.translate(0, 0, 1);
                this.modelMatrix.rotate(angle+25, 0, 1, 0);
                this.modelMatrix.translate(0, 0, 1);
                pushMatrix(this.modelMatrix);
                    this.modelMatrix.scale(0.1, 0.1, 1);
                    this.drawCylinder();
                this.modelMatrix = popMatrix();
                this.drawBranch(angle, iter+1);
            this.modelMatrix = popMatrix();

            pushMatrix(this.modelMatrix);
                this.modelMatrix.translate(0, 0, 1);
                this.modelMatrix.rotate(angle+25, -1, -1, 0);
                this.modelMatrix.translate(0, 0, 1);
                pushMatrix(this.modelMatrix);
                    this.modelMatrix.scale(0.1, 0.1, 1);
                    this.drawCylinder();
                this.modelMatrix = popMatrix();
                this.drawBranch(angle, iter+1);
            this.modelMatrix = popMatrix();

        this.modelMatrix = popMatrix();
    }
}

VBObox1.prototype.drawTentacle = function(angle) {
    pushMatrix(this.modelMatrix);
        this.modelMatrix.scale(0.5,0.5,0.5);
        this.modelMatrix.rotate(90, 0, 1, 0);
        // this.modelMatrix.rotate(angle, 0, 1, 0);
        this.modelMatrix.translate(0, 0, 1);
        this.drawCylinder();
        let tentacleIter = 10;
        while (tentacleIter--) {
            this.modelMatrix.rotate(angle/3, 0, 1, 0);
            this.modelMatrix.scale(0.75,0.75,0.75);
            this.modelMatrix.translate(0, 0, 2.225);
            this.drawCylinder();
        }
    this.modelMatrix = popMatrix(this.modelMatrix);
}

VBObox1.prototype.drawPyramid = function() {
    this.setMatrices();
    gl.drawArrays(gl.TRIANGLES, this.shapes[11], this.shapes[12]);   
}

VBObox1.prototype.drawSpinningPyramids = function(angle1, angle2, angle3) {
    pushMatrix(this.modelMatrix);
    this.modelMatrix.rotate(angle3, 0, 0, 1);
    this.modelMatrix.translate(-1, 0, 0);
    this.modelMatrix.scale(0.5, 0.5, 0.5);
    this.modelMatrix.rotate(angle1, 1, 1, 1);
    this.modelMatrix.translate(-1, 0, 0)
    pushMatrix(this.modelMatrix);
        this.modelMatrix.rotate(90, 0, 1, 0);
        this.modelMatrix.rotate(angle2, 0, 0, 1);
        this.modelMatrix.translate(0.33333, 0.33333, 0);
        this.drawPyramid();
    this.modelMatrix = popMatrix(this.modelMatrix);
        this.modelMatrix.rotate(-90, 0, 1, 0);
        this.modelMatrix.rotate(angle2, 0, 0, 1);
        this.modelMatrix.translate(0.33333, 0.33333, -2);
        this.drawPyramid();
    this.modelMatrix = popMatrix(this.modelMatrix);
}

VBObox1.prototype.reloadMaterial = function() {
    gl.uniform3fv(this.matl0.uLoc_Ke, this.matl0.K_emit.slice(0,3));
	gl.uniform3fv(this.matl0.uLoc_Ka, this.matl0.K_ambi.slice(0,3));
    gl.uniform3fv(this.matl0.uLoc_Kd, this.matl0.K_diff.slice(0,3));
	gl.uniform3fv(this.matl0.uLoc_Ks, this.matl0.K_spec.slice(0,3));
	gl.uniform1i(this.matl0.uLoc_Kshiny, parseInt(this.matl0.K_shiny, 10));
}

VBObox1.prototype.reload = function() {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
}