H.Drawer = function (viewer) {

  this.viewer = viewer;

  this.i = null;
  this.j = null;
  this.k = null;

  this.label = 0;
  this.intensity = null;

  this.leftDown = false;

};

H.Drawer.prototype.getLabelmapPixel = function (x, y, z) {

  return H.V.v.labelmap.getPixel(x, y, z);

};

H.Drawer.prototype.setLabelmapPixel = function (x, y, z, label) {

  return H.V.v.labelmap.setPixel(x, y, z, label);

};

H.Drawer.prototype.getVolumePixel = function(x, y, z) {

  return H.V.v.getPixel(x, y, z);

};

H.Drawer.prototype.getVolumeDimensions = function() {

  return H.V.v.dimensions;

};

H.Drawer.prototype.setupInteraction = function () {

  var r = this.viewer.r;


  r.interactor.onMouseDown = this.onMouseDown.bind(this);
  r.interactor.onMouseMove = this.onMouseMove.bind(this);
  r.interactor.onMouseUp = this.onMouseUp.bind(this);

};


H.Drawer.prototype.onMouseDown = function (e) {

  if (e) { // for xtk e is a boolean for left mouse button

    this.label += 1;

    this.leftDown = true;

  }

};


H.Drawer.prototype.onMouseMove = function (e) {

  var r = this.viewer.r;
  var v = this.viewer.v;

  if (this.leftDown) {
    e.cancel = true; // no window/level adjustment
  }

  ijk = r.xy2ijk(e.offsetX, e.offsetY)
  if (!ijk) return;

  let i = Math.max(0, ijk[1][0].toFixed(0));
  let j = Math.max(0, ijk[1][1].toFixed(0));
  let k = Math.max(0, ijk[1][2].toFixed(0));

  this.i = i;
  this.j = j;
  this.k = k;

};


H.Drawer.prototype.onMouseUp = function (e) {


  if (!this.leftDown) {
    return;
  }

  this.leftDown = false;

  let i = this.i;
  let j = this.j;
  let k = this.k;

  this.intensity = this.viewer.v.getPixel(i, j, k);

  H.A.threshold = this.intensity;
  H.A.intensity_max = H.V.v.max;
  H.A.threshold_tolerance = 30;
  H.A.label_to_draw = H.D.label;

  H.A.grow(i, j, k);

  this.refresh();

};

H.Drawer.prototype.refresh = function() {

  H.V.v.refresh();

};

H.Drawer.prototype.save = function () {
  
  H.V.v.labelmap.save();

};


