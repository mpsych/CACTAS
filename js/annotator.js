var H = H || {};

// 8 neighbor directions
const dk = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 0, 1, 1, 0, -1, -1, -1, 0, 1, 0];
const di = [0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, 0, -1, -1, -1, 0, 1, 1, 1, 0];
const dj = [0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1];


H.Annotator = function () {

  this.getPixel = null;
  this.setPixel = null;

  this.label = 0;

};




// find existing adjacent annotation
// return ijk coords of where an existing annotation was encountered
H.Annotator.prototype.findAdjacentAnnotation = function (i, j, k) {

  var visited = [];

  return this.findAnnotationRecursive(i, j, k, visited);

};


H.Annotator.prototype.findAnnotationRecursive = function (i, j, k, visited) {

  let label = this.getPixel(i, j, k);

  visited.push([i, j, k]);

  if (label != H.D.label) { // not sure if using H.D is clean but it works

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
H.Annotator.prototype.mergeAnnotations = function (i, j, k) {

  var label = this.getPixel(i, j, k);

  var visited = [];

  this.mergeRecursive(i, j, k, visited, label);

};


H.Annotator.prototype.mergeRecursive = function (i, j, k, visited, label) {

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

H.Annotator.prototype.thresholdedRegionGrowing = function (i, j, k, intensity) {
  let visited = [];

  let label = this.getPixel(i, j, k);

  let threshold = intensity * 0.3;

  this.thresholdedRegionGrowingRecursive(i, j, k, visited, label, threshold);
};

H.Annotator.prototype.thresholdedRegionGrowingRecursive = function (i, j, k, visited, label, threshold) {
  visited.push([i, j, k]);

  for (let x = 0; x < 26; x++) {

    this.next_px = [i + di[x], j + dj[x], k + dk[x]];
    next_px = [i + di[x], j + dj[x], k + dk[x]];

    if (next_px[0] >= 0 && next_px[0] < H.V.v.dimensions[0]
      && next_px[1] >= 0 && next_px[1] < H.V.v.dimensions[1]
      && next_px[2] >= 0 && next_px[2] < H.V.v.dimensions[2]) {

      if (!visited.some(a => next_px.length && next_px.every((v, i) => v === a[i]))) {

        let currentIntensity = H.V.v.getPixel(i + di[x], j + dj[x], k + dk[x]);

        if (currentIntensity > threshold) {

          // console.log(`(${i}, ${j}, ${k})=${currentIntensity} > ${threshold}`)
          this.setPixel(i + di[x], j + dj[x], k + dk[x], label);

          let r = this.thresholdedRegionGrowingRecursive(i + di[x], j + dj[x], k + dk[x], visited, label, threshold);
        }
      }
    }

  }
};
