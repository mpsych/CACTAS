H.Drawer = function(viewer) {

  this.viewer = viewer;

  this.i = null;
  this.j = null;
  this.k = null;

  this.label = 1;

};

H.Drawer.prototype.getSegment = function(x, y, z) {
  
  return H.V.v.labelmap.getPixel(x, y, z);

};

H.Drawer.prototype.setSegment = function(x, y, z, label) {
  
  return H.V.v.labelmap.setPixel(x, y, z, label);

};

H.Drawer.prototype.setupInteraction = function() {

  var r = this.viewer.r;

  r.interactor.onMouseMove = this.onMouseMove.bind(this);
  r.interactor.onMouseUp = this.onMouseUp.bind(this);

};


H.Drawer.prototype.onMouseMove = function(e) {

  if (!e.ctrlKey) return;

  var r = this.viewer.r;
  var v = this.viewer.v;

  e.cancel = true; // no window/level adjustment

  ijk = r.xy2ijk(e.clientX, e.clientY)
  if (!ijk) return;


  let i = Math.max(0, ijk[1][0].toFixed(0));
  let j = Math.max(0, ijk[1][1].toFixed(0));
  let k = Math.max(0, ijk[1][2].toFixed(0));

  v.labelmap.setPixel(i, j, k, this.label);

  this.i = i;
  this.j = j;
  this.k = k;

};


H.Drawer.prototype.onMouseUp = function(e) {


  this.viewer.v.refresh(); 

  let i = this.i;
  let j = this.j;
  let k = this.k;

  let newLabel = H.A.findAdjacentAnnotation(i, j, k);
  if (newLabel) {
    // console.log(newLabel);
    [i, j, k] = newLabel;
    H.A.mergeAnnotations(i, j, k);
  }

  this.viewer.v.refresh();

};




