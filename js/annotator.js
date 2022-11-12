var H = H || {};

// 8 neighbor directions
const dk = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 0, 1, 1, 0, -1, -1, -1, 0, 1, 0];
const di = [0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, 0, -1, -1, -1, 0, 1, 1, 1, 0];
const dj = [0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1];


H.Annotator = function () {

  this.getPixel = null;
  this.setPixel = null;

  this.current_label = null;
  this.label = null;

};




// find existing adjacent annotation
// return ijk coords of where an existing annotation was encountered
H.Annotator.prototype.findAdjacentAnnotation = function(i, j, k) {

  var visited = [];

  return this.findAnnotationRecursive(i, j, k, visited);

};


H.Annotator.prototype.findAnnotationRecursive = function(i, j, k, visited) {

  let label = this.getPixel(i, j, k);

  visited.push([i, j, k]);

  if (label != this.current_label) {

    // v.refresh();
    return [i, j, k];

  } else {

    for (let x = 0; x < 26; x++) {

      let next_px = [i + di[x], j + dj[x], k + dk[x]];

      if (!visited.some(a => next_px.length && next_px.every((v, i) => v === a[i]))) {

        if (this.getPixel(i + di[x], j + dj[x], k + dk[x]) != 0) {
        
          let r = this.findAnnotationRecursive(i + di[x], j + dj[x], k + dk[x], visited);

          if (r != null) return r;

        }
      
      }

    }

    return null;

  }

};



// takes a pixel, spreads its color to all adjacent pixels
H.Annotator.prototype.mergeAnnotations = function(i, j, k) {

  var label = this.getPixel(i, j, k);

  var visited = [];

  this.mergeRecursive(i, j, k, visited, label);

};


H.Annotator.prototype.mergeRecursive = function(i, j, k, visited, label) {

  visited.push([i, j, k]);

  for (let x = 0; x < 26; x++) {
    
    let next_px = [i + di[x], j + dj[x], k + dk[x]];

    if (!visited.some(a => next_px.length && next_px.every((v, i) => v === a[i]))) {

      if (this.getPixel(i + di[x], j + dj[x], k + dk[x]) != 0) {
      
        this.setPixel(i + di[x], j + dj[x], k + dk[x], label);

        let r = this.mergeRecursive(i + di[x], j + dj[x], k + dk[x], visited, label);
    
      }

    }

  }

};
