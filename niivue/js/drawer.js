H.Drawer = function (viewer) {

  this.nv = viewer.nv;

  this.setupInteraction();

  this.label = 0;
  this.intensity = null;

  this.leftDown = false;
  this.position = null;

};


H.Drawer.prototype.getLabelmapPixel = function (x, y, z) {

  let dx = H.D.nv.volumes[0].dims[1];
  let dy = H.D.nv.volumes[0].dims[2];
  let dz = H.D.nv.volumes[0].dims[3];

  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  return H.D.nv.drawBitmap[x + y * dx + z * dx * dy];

};

H.Drawer.prototype.setLabelmapPixel = function (x, y, z, label) {

  let dx = H.D.nv.volumes[0].dims[1];
  let dy = H.D.nv.volumes[0].dims[2];
  let dz = H.D.nv.volumes[0].dims[3];

  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  H.D.nv.drawBitmap[x + y * dx + z * dx * dy] = label;

};

H.Drawer.prototype.getVolumePixel = function(x, y, z) {

  return H.D.nv.volumes[0].getValue(x,y,z);

};

H.Drawer.prototype.getVolumeDimensions = function() {

  return H.D.nv.volumes[0].dims.slice(1);

};


H.Drawer.prototype.setupInteraction = function () {

  // since we are not using the niivue
  // drawing that is builtin, we need
  // to keep track of the mouse position like this
  this.nv.onLocationChange = function (e) {

    this.intensity = e.values[0].value.toFixed(3).replace(/\.?0*$/, "");

    // we just enable drawing for a second to create the array
    if (!this.nv.opts.drawingEnabled) {
      this.nv.setDrawingEnabled(1);
    }
    // but then disable it
    this.nv.setDrawingEnabled(0);

    H.D.position = e['vox'];

    console.log(H.D.position)

  }.bind(this);


  this.nv.canvas.onmousedown = this.onMouseDown.bind(this);
  this.nv.canvas.onmousemove = this.onMouseMove.bind(this);
  this.nv.canvas.onmouseup = this.onMouseUp.bind(this);


};


H.Drawer.prototype.onMouseDown = function (e) {

  H.D.leftDown = true;

  H.D.label += 1;

};


H.Drawer.prototype.onMouseMove = function (e) {



  // if (H.D.leftDown) {

  //   H.D.setSegment(H.D.position[0], H.D.position[1], H.D.position[2], H.D.label);
  //   H.D.nv.refreshDrawing();
  //   // console.log(H.D.leftDown, H.D.position)

  // }

};


H.Drawer.prototype.onMouseUp = function (e) {

  // TODO get annotations

  H.D.leftDown = false;


  if (!e.ctrlKey) return;


  var i = H.D.position[0];
  var j = H.D.position[1];
  var k = H.D.position[2];

  // i = 512 - i;

  // let newLabel = H.A.findAdjacentAnnotation(i, j, k);
  // // console.log('newlabel', newLabel);
  // if (newLabel) {
  //   // console.log(newLabel);
  //   [i, j, k] = newLabel;
  //   H.A.mergeAnnotations(i, j, k);
  // }


  this.intensity = H.D.getVolumePixel(i, j, k);

  // H.A.thresholdedRegionGrowing(i, j, k, this.intensity);

  H.A.threshold = this.intensity;
  H.A.intensity_max = H.D.nv.volumes[0].global_max;
  H.A.threshold_tolerance = 30;
  H.A.label_to_draw = H.D.label;
  H.A.mode = H.Annotator.MODES.GROW;

  H.A.grow(i, j, k);

  // let newLabel = H.A.findAdjacentAnnotation(i, j, k);
  // if (newLabel) {
  //   // console.log(newLabel);
  //   [i, j, k] = newLabel;
  //   H.A.mergeAnnotations(i, j, k);
  // }

  // H.A.mode = H.Annotator.MODES.MERGE;
  // H.A.grow(i, j, k);

  H.D.nv.refreshDrawing();

  // this.viewer.v.refresh();


};