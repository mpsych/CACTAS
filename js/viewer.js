H.Viewer = function(element, url) {
  
  //instance of niivue
  nv = new niivue.Niivue({    
    textHeight : 0.02,
    loadingText: 'please wait',
    rulerColor: [0, 1, 1, 0.1]
  });

  //attach object to viewer
  nv.attachToCanvas(element);

  //set default view to coronal
  // nv.setSliceType(nv.sliceTypeCoronal);
  
  // crosshair
  nv.setCrosshairColor([0, 1, 1, 0.1]);
  nv.opts.crosshairWidth = 0.2;
  nv.opts.show3Dcrosshair = true;



  var data = [{
    url: url,
    colorMap: 'gray',
    opacity: 1, 
    visible: true,
    cal_min: 130,
    cal_max: 1000
  }];

  nv.drawOpacity = 1.0;
  nv.setDrawColormap("_slicer3d")

  nv.loadVolumes(data);

  nv.setSliceMM(true);
  nv.opts.dragMode = nv.dragModes.slicer3D;

  this.nv = nv;

  this.view = 4;

};

H.Viewer.prototype.changeView = function() {

  this.view++;

  if (this.view > 4) {
    this.view = 0;
  }

  this.nv.setSliceType(this.view);

};
