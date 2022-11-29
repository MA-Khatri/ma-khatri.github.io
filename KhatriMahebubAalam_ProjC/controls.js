// Movement Scaling
var mScaling = 1;

// Camera variables
const cam = {
    ep: {
        x: 10,
        y: 0,
        z: 0
    },
    la: {
        x: 9,
        y: 0,
        z: 0
    },
    up: {
        x: 0,
        y: 0,
        z: 1
    }
}

// Mouse movement for camera
const mousCam = {
    isDrag: false,
    xMclik: 0.0,
    yMclik: 0.0,
    xMdragTot: 0.0,
    yMdragTot: 0.0,
}

function getOrientation() {
    var x = cam.la.x - cam.ep.x;
    var y = cam.la.y - cam.ep.y;
    var z = cam.la.z - cam.ep.z;
    var mag = Math.sqrt(x*x + y*y + z*z);
    return [x/mag, y/mag, z/mag];
}

function getPerpOrientation() {
    var orientation = getOrientation();
    px = orientation[1]*cam.up.z - orientation[2]*cam.up.y;
    py = orientation[2]*cam.up.x - orientation[0]*cam.up.z;
    pz = orientation[0]*cam.up.y - orientation[1]*cam.up.x;
    var mag = Math.sqrt(px*px + py*py + pz*pz);
    return [px/mag, py/mag, pz/mag];
}

function myKeyDown(kev) {
    var orientation = getOrientation();
    orientation = orientation.map(x => x/mScaling);
    var perpOrient = getPerpOrientation();
    perpOrient = perpOrient.map(x => x/mScaling);

    switch(kev.code) {
        case "KeyW":    
            cam.ep.x += orientation[0];
            cam.ep.y += orientation[1];
            cam.ep.z += orientation[2];
            cam.la.x += orientation[0];
            cam.la.y += orientation[1];
            cam.la.z += orientation[2];
            break;
        case "KeyS":  
            cam.ep.x -= orientation[0];
            cam.ep.y -= orientation[1];
            cam.ep.z -= orientation[2];
            cam.la.x -= orientation[0];
            cam.la.y -= orientation[1];
            cam.la.z -= orientation[2];
            break;
        case "KeyD": 
            cam.ep.x += perpOrient[0];
            cam.ep.y += perpOrient[1];
            cam.ep.z += perpOrient[2];
            cam.la.x += perpOrient[0];
            cam.la.y += perpOrient[1];
            cam.la.z += perpOrient[2];
            break;
        case "KeyA":  
            cam.ep.x -= perpOrient[0];
            cam.ep.y -= perpOrient[1];
            cam.ep.z -= perpOrient[2];
            cam.la.x -= perpOrient[0];
            cam.la.y -= perpOrient[1];
            cam.la.z -= perpOrient[2];
            break;
        case "Space":
            cam.ep.z += 1/mScaling;
            cam.la.z += 1/mScaling;
            break;
        case "KeyP":
            play *= -1;
            break
    };

    if (kev.shiftKey) {
        cam.ep.z -= 1/mScaling;
        cam.la.z -= 1/mScaling;
    };
    
    kev.preventDefault();
}

// Mouse drag code adopted from ControlQuaternion.js starter code:
function myMouseDown(ev) {
    var rect = ev.target.getBoundingClientRect();	
    var xp = ev.clientX - rect.left;
    var yp = g_canvas.height - (ev.clientY - rect.top);
    var x = (xp - g_canvas.width/2) / (g_canvas.width/2);
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

    mousCam.isDrag = true;
    mousCam.xMclik = x;
    mousCam.yMclik = y;
}
    
function myMouseMove(ev) {
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = g_canvas.height - (ev.clientY - rect.top);
    var x = (xp - g_canvas.width/2) / (g_canvas.width/2);
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

    if (mousCam.isDrag==true) {
        mousCam.xMdragTot += (x - mousCam.xMclik);
        mousCam.yMdragTot += (y - mousCam.yMclik);    
        mousCam.xMclik = x;
        mousCam.yMclik = y;
    } else return;
}
    
function myMouseUp(ev) {
    ev.preventDefault();
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = g_canvas.height - (ev.clientY - rect.top);
    var x = (xp - g_canvas.width/2) / (g_canvas.width/2);
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

    mousCam.isDrag = false;
    mousCam.xMdragTot += (x - mousCam.xMclik);
    mousCam.yMdragTot += (y - mousCam.yMclik);    
}

function updateCam() {
    cam.la.x = cam.ep.x - Math.cos((mousCam.xMdragTot*100%360)*Math.PI/180);
    cam.la.y = cam.ep.y + Math.sin((mousCam.xMdragTot*100%360)*Math.PI/180);
    cam.la.z = cam.ep.z + mousCam.yMdragTot;
    // How can we get camera to move along a sine curve along z axis? (i.e. ball movement?)
    // cam.la.z = cam.ep.z + Math.sin((mousCam.yMdragTot*50%360)*0.0174533);
}

function playPause() {
    play *= -1;
}