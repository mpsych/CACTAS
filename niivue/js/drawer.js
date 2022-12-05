H.Drawer = function (viewer) {

  this.nv = viewer.nv;

  this.setupInteraction();

  this.label = 0;
  this.intensity = null;

  this.leftDown = false;
  this.position = null;

};


H.Drawer.prototype.getSegment = function (x, y, z) {

  let dx = nv.back.dims[1];
  let dy = nv.back.dims[2];
  let dz = nv.back.dims[3];

  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  return H.D.nv.drawBitmap[x + y * dx + z * dx * dy];

};

H.Drawer.prototype.setSegment = function (x, y, z, label) {

  let dx = nv.back.dims[1];
  let dy = nv.back.dims[2];
  let dz = nv.back.dims[3];

  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  H.D.nv.drawBitmap[x + y * dx + z * dx * dy] = label;

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



  if (H.D.leftDown) {

    H.D.setSegment(H.D.position[0], H.D.position[1], H.D.position[2], H.D.label);
    H.D.nv.refreshDrawing();
    // console.log(H.D.leftDown, H.D.position)

  }

};


H.Drawer.prototype.onMouseUp = function (e) {

  // TODO get annotations

  H.D.leftDown = false;

  var i = H.D.position[0];
  var j = H.D.position[1];
  var k = H.D.position[2];

  let newLabel = H.A.findAdjacentAnnotation(i, j, k);
  // console.log('newlabel', newLabel);
  if (newLabel) {
    // console.log(newLabel);
    [i, j, k] = newLabel;
    H.A.mergeAnnotations(i, j, k);
  }

};