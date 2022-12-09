var H = H || {};





H.Annotator = function () {

  this.getLabelmapPixel = null;
  this.setLabelmapPixel = null;

  this.getVolumePixel = null;

  this.label_to_find = -1;
  this.label_to_draw = -1;

  this.visited = [];

  this.threshold = null;
  this.threshold_tolerance = null;

  // 26 neighbor directions (9 + 8 + 9)
  this.di = [0, -1, -1, -1,  0,  1, 1, 1,  0, -1, -1, -1,  0,  1,  1,  1,  0, 0, -1, -1, -1,  0,  1, 1, 1, 0];
  this.dj = [0,  0,  0,  0,  0,  0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1,  1,  1,  1,  1,  1, 1, 1, 1];  
  this.dk = [1,  1,  0, -1, -1, -1, 0, 1,  1,  1,  0, -1, -1, -1,  0,  1,  0, 1,  1,  0, -1, -1, -1, 0, 1, 0];
};


H.Annotator.prototype.grow = function(i, j, k) {

  this.grow_recursive(i, j, k);

};


H.Annotator.prototype.grow_recursive = function(i, j, k) {


  this.visited.push([i, j, k]);

  for (var step = 0; step < 26; step++) {

    var new_ijk = [i + this.di[step], 
                   j + this.dj[step],
                   k + this.dk[step]];

    if (new_ijk[0] < 0 || new_ijk[0] >= 10 || 
        new_ijk[1] < 0 || new_ijk[1] >= 10 ||
        new_ijk[2] < 0 || new_ijk[2] >= 10) {

      // out of bounds
      continue;

    }


    // this point is within image dimensions

    // // check if we visited that coordinate before
    var visited = false;
    for (var v=0; v<this.visited.length; v++) {

      var q = this.visited[v];
      if (q[0] == new_ijk[0] && q[1] == new_ijk[1] && q[2] == new_ijk[2]) {
        
        // we have been here
        // ignore and jump out
        visited = true;
        break;

      } 

    }

    if (!visited) {

      // now other conditions 

      // perform action
      console.log(new_ijk);

      // we have not been here, start from that coordinate
      this.grow_recursive(new_ijk[0], new_ijk[1], new_ijk[2]);

    } // visited check

  } // for step

};





