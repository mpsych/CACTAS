H.Drawer = function(viewer) {

  this.nv = viewer.nv;

  this.nv.canvas.onmousedown = function() {

    if (!this.nv.opts.drawingEnabled) {
      this.nv.setDrawingEnabled(1);
    }

  }.bind(this);

};


H.Drawer.prototype.getSegment = function(x, y, z) {
  
  let dx = nv.back.dims[1];
  let dy = nv.back.dims[2];
  let dz = nv.back.dims[3];
  
  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  return this.nv.drawBitmap[x + y * dx + z * dx * dy];

};

H.Drawer.prototype.setSegment = function(x, y, z, label) {
  
  let dx = nv.back.dims[1];
  let dy = nv.back.dims[2];
  let dz = nv.back.dims[3];
  
  x = Math.min(Math.max(x, 0), dx - 1);
  y = Math.min(Math.max(y, 0), dy - 1);
  z = Math.min(Math.max(z, 0), dz - 1);

  this.nv.drawBitmap[x + y * dx + z * dx * dy];

};
