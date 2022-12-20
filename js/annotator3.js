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

  this.visited = [];

  var dimensions = this.getVolumeDimensions();

  var point_list = [];
  point_list.push([i, j, k]);

  var counter = 0;

  while( point_list.length != 0) {

    if (counter++ > 30000) {
      console.log('canceled!')
      break;
    }

    var this_point = point_list.pop();

    var i = this_point[0];
    var j = this_point[1];
    var k = this_point[2];

    this.visited.push([i, j, k]);
    this.setLabelmapPixel(i, j, k, this.label_to_draw);

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

        if (Math.abs(intensity-this.threshold) <= (this.threshold_tolerance / 100.0 * this.threshold)) {

          point_list.push(new_ijk);

        }

      } 


    }

  };

};
