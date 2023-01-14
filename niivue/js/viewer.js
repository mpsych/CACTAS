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
  nv.setCrosshairColor([1, 0, 0, 0.1]);
  nv.opts.crosshairWidth = 1;


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

  nv.setSliceMM(true);
  nv.opts.dragMode = nv.dragModes.slicer3D;

  this.nv = nv;

};

