// Modified version from BasicShapesCam.js
function makeGroundGrid() {
    var xcount = 100;			
    var ycount = 100;		
    var xymax  = 50.0;	
    var xColr = new Float32Array([0.5, 0.5, 0.5]);
    var yColr = new Float32Array([0.5, 0.5, 0.5]);
    
    var floatsPerVertex = 7;
    var gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));

                            
    var xgap = xymax/(xcount-1);
    var ygap = xymax/(ycount-1);
        
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
        if(v%2==0) {
            gndVerts[j  ] = -xymax + (v  )*xgap;
            gndVerts[j+1] = -xymax;
            gndVerts[j+2] = 0.0;
            gndVerts[j+3] = 1.0;
        }
        else {
            gndVerts[j  ] = -xymax + (v-1)*xgap;
            gndVerts[j+1] = xymax;
            gndVerts[j+2] = 0.0;
            gndVerts[j+3] = 1.0;
        }
        gndVerts[j+4] = xColr[0];
        gndVerts[j+5] = xColr[1];
        gndVerts[j+6] = xColr[2];
    }

    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
        if(v%2==0) {
            gndVerts[j  ] = -xymax;
            gndVerts[j+1] = -xymax + (v  )*ygap;
            gndVerts[j+2] = 0.0;
            gndVerts[j+3] = 1.0;
        }
        else {
            gndVerts[j  ] = xymax;
            gndVerts[j+1] = -xymax + (v-1)*ygap;
            gndVerts[j+2] = 0.0;
            gndVerts[j+3] = 1.0;
        }
        gndVerts[j+4] = yColr[0];
        gndVerts[j+5] = yColr[1];
        gndVerts[j+6] = yColr[2];
    }

    return gndVerts;
}

function makeTriangleGrid() {
    var xcount = 50;
    var ycount = 50;

    var vertices = [(2 * xcount + 1) * (2 * ycount + 1)];

    var i = 0;
    for (var y = -ycount; y <= ycount; y++) {
        for (var x = -xcount; x <= xcount; x++) {
            vertices[i] = [x, y, (Math.cos(x)+Math.sin(y))/4-0.125, 1, 0.5, 0.5, 0.5];
            i++;
        }
    }

    var lines = [2*xcount * 2*ycount * 12];
    var vert = 0;
    var line = 0;
    for (var y = -ycount; y < ycount; y++) {
        for (var x = -xcount; x < xcount; x++) {
            lines[line + 0]  = vertices[vert + 0             ];
            lines[line + 1]  = vertices[vert + 2*xcount+1    ];
            lines[line + 2]  = vertices[vert + 2*xcount+1    ];
            lines[line + 3]  = vertices[vert + 1             ];
            lines[line + 4]  = vertices[vert + 1             ];
            lines[line + 5]  = vertices[vert + 0             ];
            
            lines[line + 6]  = vertices[vert + 2*xcount+1    ];
            lines[line + 7]  = vertices[vert + 2*xcount+1 + 1];
            lines[line + 8]  = vertices[vert + 2*xcount+1 + 1];
            lines[line + 9]  = vertices[vert + 1             ];
            lines[line + 10] = vertices[vert + 1             ];
            lines[line + 11] = vertices[vert + 2*xcount+1    ];

            vert++;
            line += 12;
        }
        vert++;
    }

    var triangles = new Float32Array(2*xcount * 2*ycount * 12 * 7);
    for (var i = 0, j = 0; i < lines.length*7; i += 7, j++) {
        triangles[i + 0] = lines[j][(i+0)%7];
        triangles[i + 1] = lines[j][(i+1)%7];
        triangles[i + 2] = lines[j][(i+2)%7];
        triangles[i + 3] = lines[j][(i+3)%7];
        triangles[i + 4] = lines[j][(i+4)%7];
        triangles[i + 5] = lines[j][(i+5)%7];
        triangles[i + 6] = lines[j][(i+6)%7];
    }

    return triangles;
}

function makeAxes() {
    var axesVerts = new Float32Array([
        0, 0, 0, 1, 1, 0, 0,
        1, 0, 0, 1, 1, 0, 0,

        0, 0, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,

        0, 0, 0, 1, 0, 0, 1,
        0, 0, 1, 1, 0, 0, 1,
    ])
    return axesVerts;
}

function makeRing(delta_theta=1) {
    let vertices = [];
    let d2r = Math.PI/180;
    for (theta=0;theta<=360-delta_theta;theta+=delta_theta) {
        vertices.push(Math.cos(theta*d2r));
        vertices.push(Math.sin(theta*d2r));
        vertices.push(0);
    }

    let count = vertices.length/3;

    let ringVerts = new Float32Array(count*7);

    for (i=0,j=0;i<ringVerts.length;i+=7,j+=3) {
        ringVerts[i]   = vertices[j];
        ringVerts[i+1] = vertices[j+1];
        ringVerts[i+2] = vertices[j+2];
        ringVerts[i+3] = 1.0;
        ringVerts[i+4] = 1;
        ringVerts[i+5] = 0;
        ringVerts[i+6] = 0;
    }

    return ringVerts;
}

function makeGrids() {
    var simple = makeGroundGrid();
    var triangle = makeTriangleGrid();
    var axes = makeAxes();
    var ring = makeRing();
    var size = simple.length + triangle.length + axes.length + ring.length;
    var grids = new Float32Array(size);
    var simple_start = 0;
    for (i=simple_start,j=0;j<simple.length;i++,j++) grids[i] = simple[j];
    var triangle_start = i;
    for (i=triangle_start,j=0;j<triangle.length;i++,j++) grids[i] = triangle[j];
    var axes_start = i;
    for (i=axes_start,j=0;j<axes.length;i++,j++) grids[i] = axes[j];
    var ring_start = i;
    for (i=ring_start,j=0;j<ring.length;i++,j++) grids[i] = ring[j];    
    return [grids, simple_start/7, simple.length/7, triangle_start/7, triangle.length/7, axes_start/7, axes.length/7, ring_start/7, ring.length/7];
}

// ----- Shapes with normal xyzw and normal vector xyz
function makeSphere(SPHERE_DIV) {

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
  
    var positions = [];
    var indices = [];
  
    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
      aj = j * Math.PI / SPHERE_DIV;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= SPHERE_DIV; i++) {
        ai = i * 2 * Math.PI / SPHERE_DIV;
        si = Math.sin(ai);
        ci = Math.cos(ai);
  
        positions.push(si * sj);  // X
        positions.push(cj);       // Y
        positions.push(ci * sj);  // Z
      }
    }
  
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
      for (i = 0; i < SPHERE_DIV; i++) {
        p1 = j * (SPHERE_DIV+1) + i;
        p2 = p1 + (SPHERE_DIV+1);
  
        indices.push(p1);
        indices.push(p2);
        indices.push(p1 + 1);
  
        indices.push(p1 + 1);
        indices.push(p2);
        indices.push(p2 + 1);
      }
    }

    // Note: for this sphere, the normal is the same as the positions
    // Convert indices to array with position, color, and normal

    var output = new Float32Array(indices.length*7);
    for (it0 = 0, it1 = 0; it0 < indices.length; it0++, it1 += 7) {
        output[it1 + 0] = positions[3*indices[it0] + 0]; // x
        output[it1 + 1] = positions[3*indices[it0] + 1]; // y
        output[it1 + 2] = positions[3*indices[it0] + 2]; // z
        output[it1 + 3] = 1.0; // w
        output[it1 + 4] = positions[3*indices[it0] + 0];
        output[it1 + 5] = positions[3*indices[it0] + 1];
        output[it1 + 6] = positions[3*indices[it0] + 2];
    }

    return output
}

// Adopted from LightedCube_perFragment.js
function makeCube() {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // Coordinates
    var vertices = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    // Convert to single array
    var output = new Float32Array(indices.length*7);
    for (it0 = 0, it1 = 0; it0 < indices.length; it0++, it1 += 7) {
        output[it1 + 0] = vertices[3*indices[it0] + 0]; // x
        output[it1 + 1] = vertices[3*indices[it0] + 1]; // y
        output[it1 + 2] = vertices[3*indices[it0] + 2]; // z
        output[it1 + 3] = 1.0; // w
        output[it1 + 4] = normals[3*indices[it0] + 0];
        output[it1 + 5] = normals[3*indices[it0] + 1];
        output[it1 + 6] = normals[3*indices[it0] + 2];
    }

    return output
}

function makePyramid() {
    return new Float32Array([
-1.0,-1.0,-0.33331112148219744,1.0,0.0,-0.8944003694560878,0.4472672345665549,
0.3333777570356051,-1.0,-0.33331112148219744,1.0,0.0,-0.8944003694560878,0.4472672345665549,
-0.3332444859287895,-0.3332444859287895,1.0,1.0,0.0,-0.8944003694560878,0.4472672345665549,
-1.0,0.3333777570356051,-0.33331112148219744,1.0,-0.0,-0.0,-1.0,
0.3333777570356051,-1.0,-0.33331112148219744,1.0,-0.0,-0.0,-1.0,
-1.0,-1.0,-0.33331112148219744,1.0,-0.0,-0.0,-1.0,
-1.0,-1.0,-0.33331112148219744,1.0,-0.8944003694560878,0.0,0.4472672345665549,
-0.3332444859287895,-0.3332444859287895,1.0,1.0,-0.8944003694560878,0.0,0.4472672345665549,
-1.0,0.3333777570356051,-0.33331112148219744,1.0,-0.8944003694560878,0.0,0.4472672345665549,
0.3333777570356051,-1.0,-0.33331112148219744,1.0,0.8944361311571121,-0.0,0.4471957147387455,
0.3333777570356051,0.3333777570356051,-0.33331112148219744,1.0,0.8944361311571121,-0.0,0.4471957147387455,
-0.3332444859287895,-0.3332444859287895,1.0,1.0,0.8944361311571121,-0.0,0.4471957147387455,
0.3333777570356051,0.3333777570356051,-0.33331112148219744,1.0,0.0,0.8944361311571121,0.4471957147387455,
-1.0,0.3333777570356051,-0.33331112148219744,1.0,0.0,0.8944361311571121,0.4471957147387455,
-0.3332444859287895,-0.3332444859287895,1.0,1.0,0.0,0.8944361311571121,0.4471957147387455,
0.3333777570356051,0.3333777570356051,-0.33331112148219744,1.0,-0.0,-0.0,-1.0,
0.3333777570356051,-1.0,-0.33331112148219744,1.0,-0.0,-0.0,-1.0,
-1.0,0.3333777570356051,-0.33331112148219744,1.0,-0.0,-0.0,-1.0
    ])
}

function initShapes() {    
    var sphereVerts = makeSphere(29);
    var utahVerts = makeUtahTeapot();
    var cubeVerts = makeCube();
    var bunnyVerts = makeBunny();
    var cylinderVerts = makeCylinder();
    var pyramidVerts = makePyramid();
    var mySiz = sphereVerts.length + utahVerts.length + cubeVerts.length + bunnyVerts.length + cylinderVerts.length + pyramidVerts.length;
    var shapes = new Float32Array(mySiz);
    sphereStart = 0;
    for (i=sphereStart,j=0;j<sphereVerts.length;i++,j++) shapes[i] = sphereVerts[j];
    utahStart = i;
    for (i=utahStart,j=0;j<utahVerts.length;i++,j++) shapes[i] = utahVerts[j];
    cubeStart = i;
    for (i=cubeStart,j=0;j<cubeVerts.length;i++,j++) shapes[i] = cubeVerts[j];
    bunnyStart = i;
    for (i=bunnyStart,j=0;j<bunnyVerts.length;i++,j++) shapes[i] = bunnyVerts[j];
    cylinderStart = i;
    for (i=cylinderStart,j=0;j<cylinderVerts.length;i++,j++) shapes[i] = cylinderVerts[j];
    pyramidStart = i;
    for (i=pyramidStart,j=0;j<pyramidVerts.length;i++,j++) shapes[i] = pyramidVerts[j];

    return [shapes, sphereStart/7, sphereVerts.length/7, utahStart/7, utahVerts.length/7, 
            cubeStart/7, cubeVerts.length/7, bunnyStart/7, bunnyVerts.length/7,
            cylinderStart/7, cylinderVerts.length/7, pyramidStart/7, pyramidVerts.length/7];
}