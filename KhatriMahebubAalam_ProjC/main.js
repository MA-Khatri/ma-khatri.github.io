// WebGL context
var gl;
var g_canvas;

// VBOs and shaders
worldBox = new VBObox0();
gouraudBox = new VBObox1();
phongBox = new VBObox2();

// Model, view, projection, normal matrices
var g_vpMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_modelMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

// Animation globals
var g_last = Date.now();
var play = 1;

const anim = {
    ball: 0,
    ballSTEP: 15,
    grid: 0,
    gridSTEP: 30,
    tree: 0,
    treeSTEP: 5,
    treeFLIP: 1,
    treeLIMIT: 5,
    tentacle: 0,
    tentacleSTEP: 20,
    tentacleFLIP: 1,
    tentacleLIMIT: 15
}

function main() {
    g_canvas = document.getElementById('webgl');
    gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true});
    // gl = getWebGLContext(g_canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.enable(gl.DEPTH_TEST);

    // Initialize VBO boxes
    worldBox.init(gl);
    gouraudBox.init(gl);
    phongBox.init(gl);

    // Event listeners
    window.addEventListener("keydown", myKeyDown, false);
    g_canvas.addEventListener("mousedown", myMouseDown);
    g_canvas.addEventListener("mousemove", myMouseMove);
    g_canvas.addEventListener("mouseup", myMouseUp);

    // Initial resize of canvas
    drawResize();

    // Animation and drawing
    var tick = function() {
        if (play > 0) {
            animate();
        } else {
            g_last = Date.now();
        }
        requestAnimationFrame(tick, g_canvas); 
        drawPort();
    };
    tick();   
}

function animate() {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  anim.ball = anim.ball + (anim.ballSTEP * elapsed) / 1000.0;
  anim.grid = anim.grid + (anim.gridSTEP * elapsed) / 1000.0;

  anim.tree = (anim.tree + (anim.treeSTEP*elapsed)/1000) % (anim.treeLIMIT + 10);
  if ((anim.tree >= anim.treeLIMIT && anim.treeSTEP > 0) || (anim.tree <= -anim.treeLIMIT && anim.treeSTEP < 0)) {
      anim.treeFLIP *= -1;
      anim.treeSTEP *= anim.treeFLIP;
  }

  anim.tentacle = (anim.tentacle + (anim.tentacleSTEP*elapsed)/1000) % (anim.tentacleLIMIT + 10);
  if ((anim.tentacle >= anim.tentacleLIMIT && anim.tentacleSTEP > 0) || (anim.tentacle <= -anim.tentacleLIMIT && anim.tentacleSTEP < 0)) {
      anim.tentacleFLIP *= -1;
      anim.tentacleSTEP *= anim.tentacleFLIP;
  }
}

function drawAll() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    worldBox.switchToMe();
    worldBox.adjust();
    worldBox.draw();

    var mode = document.getElementById("shadingStyle").value;
    if (mode == "BPgouraud" || mode == "Pgouraud") {
        gouraudBox.switchToMe();
        gouraudBox.draw();
    }
    if (mode == "BPphong" || mode == "Pphong") {
        phongBox.switchToMe();
        phongBox.draw();
    }
}

function drawResize() {
    var margin = 20;
    g_canvas.width = innerWidth - margin;
    g_canvas.height = (innerHeight*2/3) - margin;
    drawPort();
}

function drawPort() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    updateCam();

    gl.viewport(0, 0, g_canvas.width, g_canvas.height);

    var yfov = 30;
    var vpAspect = g_canvas.width / g_canvas.height;
    var near = 1;
    var far = 200;
    g_vpMatrix.setPerspective(yfov, vpAspect, near, far);
    g_vpMatrix.lookAt(cam.ep.x, cam.ep.y, cam.ep.z, cam.la.x, cam.la.y, cam.la.z, cam.up.x, cam.up.y, cam.up.z);
    g_mvpMatrix.set(g_vpMatrix).multiply(g_modelMatrix);

    drawAll();
}