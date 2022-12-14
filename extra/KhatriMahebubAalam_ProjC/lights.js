var LightsT = function() {
  //===============================================================================
  // Constructor function:
    var I_pos = new Vector4();	// x,y,z,w:   w==1 for local 3D position,
                                // w==0 for light at infinity in direction (x,y,z)
    var isLit = false;						// true/false for ON/OFF
    var I_ambi = new Vector3();		// ambient illumination: r,g,b
    var I_diff = new Vector3();		// diffuse illumination: r,g,b.
    var I_spec = new Vector3();		// specular illumination: r,g,b.
    //
    var u_pos = false;						// GPU location for 'uniform' that holds I_pos
    var u_ambi = false;						// 																			 I_ambi
    var u_diff = false;						//																			 I_diff
    var u_spec = false;						//																			 I_spec.
    
      return {I_pos, isLit, I_ambi, I_diff, I_spec, 
              u_pos,        u_ambi, u_diff, u_spec};
  }