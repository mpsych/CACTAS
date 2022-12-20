var H = H || {};




H.Annotator = function () {

  this.getLabelmapPixel = null;
  this.setLabelmapPixel = null;

  this.getVolumePixel = null;

  this.getVolumeDimensions = null;

  this.label_to_find = -1;
  this.label_to_draw = -1;

  this.visited = [];

  this.intensity_max = -1;

  this.threshold = null;
  this.threshold_tolerance = null;

  this.mode = H.Annotator.MODES.GROW; 

  // 26 neighbor directions (9 + 8 + 9)
  this.di = [0, -1, -1, -1,  0,  1, 1, 1,  0, -1, -1, -1,  0,  1,  1,  1,  0, 0, -1, -1, -1,  0,  1, 1, 1, 0];
  this.dj = [0,  0,  0,  0,  0,  0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1,  1,  1,  1,  1,  1, 1, 1, 1];  
  this.dk = [1,  1,  0, -1, -1, -1, 0, 1,  1,  1,  0, -1, -1, -1,  0,  1,  0, 1,  1,  0, -1, -1, -1, 0, 1, 0];
};

H.Annotator.MODES = {
  'GROW': 0,
  'MERGE': 1,
};

H.Annotator.prototype.grow = function(i, j, k) {

  // this.visited = [];

  this.dimensions = this.getVolumeDimensions();

  this.grow_recursive(i, j, k);

};


H.Annotator.prototype.grow_recursive = function(i, j, k) {


  this.visited.push([i, j, k]);
  this.setLabelmapPixel(i, j, k, this.label_to_draw);


  var dimensions = this.dimensions;

  for (var step = 0; step < 26; step++) {

    var new_ijk = [i + this.di[step], 
                   j + this.dj[step],
                   k + this.dk[step]];

    if (new_ijk[0] < 0 || new_ijk[0] >= dimensions[0] || 
        new_ijk[1] < 0 || new_ijk[1] >= dimensions[1] ||
        new_ijk[2] < 0 || new_ijk[2] >= dimensions[2]) {

      // out of bounds
      continue;

    }


    // this point is within image dimensions

    // // check if we visited that coordinate before
    var visited = false;
    var visited_length = this.visited.length;
    for (var v=0; v<visited_length; v++) {

      var q = this.visited[v];
      if (q[0] == new_ijk[0] && q[1] == new_ijk[1] && q[2] == new_ijk[2]) {
        
        // we have been here
        // ignore and jump out
        visited = true;
        break;

      } 

    }

    if (!visited) {

      var intensity = this.getVolumePixel(new_ijk[0], new_ijk[1], new_ijk[2]);

      // now other conditions

      if (this.mode == H.Annotator.MODES.MERGE) {

        var old_label = this.getLabelmapPixel(new_ijk[0], new_ijk[1], new_ijk[2]);

        if (old_label != 0 && old_label != this.label_to_draw) {

          console.log('Found label!', old_label);

          // console.log('merging', i, j, k, new_ijk, 'old', old_label, 'new', this.label_to_draw);

          // // next pixel is already colored, now overwrite it
          // this.setLabelmapPixel(new_ijk[0], new_ijk[1], new_ijk[2], this.label_to_draw);

          // this.grow_recursive(new_ijk[0], new_ijk[1], new_ijk[2]);

        }

      }

      // tolerance from 
      // https://github.com/effepivi/ICP3038/blob/master/Lectures/8-Segmentation/notebooks/3-region-growing-opencv.ipynb
      if (this.mode == H.Annotator.MODES.GROW && Math.abs(intensity-this.threshold) <= (this.threshold_tolerance / 100.0 * this.threshold)) {

        // perform action
        console.log('growing', intensity, i, j, k, new_ijk, step, visited, this.label_to_draw);
        // this.setLabelmapPixel(new_ijk[0], new_ijk[1], new_ijk[2], this.label_to_draw);

        // we have not been here, start from that coordinate
        this.grow_recursive(new_ijk[0], new_ijk[1], new_ijk[2]);

      }


    } // visited check

  } // for step

};





