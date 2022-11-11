H.Drawer = function(viewer) {

  this.r = viewer.r;

  // this.r.onMouseUp = function() {


  // };

  // this.r.onMouseMove = function() {


  // };

};


H.Drawer.prototype.getSegment = function(x, y, z) {
  
  return this.viewer.v.labelmap.getPixel(x, y, z);

};

H.Drawer.prototype.setSegment = function(x, y, z, label) {
  
  return this.viewer.v.labelmap.setPixel(x, y, z, label);

};
