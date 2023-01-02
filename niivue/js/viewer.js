H.Viewer = function(element, url) {
  
  //instance of niivue
  nv = new niivue.Niivue({    
  textHeight : 0.01,    onLocationChange: function(e) {

    },
    loadingText: 'please wait',
  });

  //attach object to viewer
  nv.attachToCanvas(element);

  //set default view to coronal
  // nv.setSliceType(nv.sliceTypeCoronal);
  
  //dissable crosshair
  nv.setCrosshairColor([0, 0, 0, 0]);

  nv.opts.crosshairWidth = 0;


  var data = [{
    // url: '../data/avf.nii.gz',
    // url: '../data/esus12.nrrd',
    url: url,
    colorMap: 'gray',
    opacity: 1, 
    visible: true,
    cal_min: -500,
    cal_max: 1600
  }];

  nv.loadVolumes(data);

  // TODO zoom?
  nv.setSliceMM(true);
  nv.opts.dragMode = nv.dragModes.pan;

  nv.onImageLoaded = function() {

    // nv.volumes[0].cal_min  = -500
    // nv.volumes[0].cal_max = 1600
    // nv.updateGLVolume();

    // nv.drawScene();

  };

  // nv.createOnLocationChange();

  // nv.onLocationChange = function(e) {
  //   console.log(e)
  // }

  this.nv = nv;

};

H.Viewer.prototype.changeView = function(orientation) {

  // only allow 0-4 as input

  var type = eval('nv.sliceType' + orientation);

  nv.setSliceType(type);

};

