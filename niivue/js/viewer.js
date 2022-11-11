H.Viewer = function(element) {
  
  //instance of niivue
  nv = new niivue.Niivue();

  //attach object to viewer
  nv.attachToCanvas(element);

  //set default view to coronal
  nv.setSliceType(nv.sliceTypeCoronal);
  
  //dissable crosshair
  nv.setCrosshairColor([0, 0, 0, 0]);

  var data = [{
    url: '../../data/avf.nii.gz',
    colorMap: 'gray',
    opacity: 1, 
    visible: true
  }];

  nv.loadVolumes(data);

  // TODO zoom?
  // nv.setSliceMM(true);
  // nv.opts.dragMode = nv.dragModes.pan;

  this.nv = nv;

};

H.Viewer.prototype.changeView = function(orientation) {

  // only allow 0-4 as input

  var type = eval('nv.sliceType' + orientation);

  nv.setSliceType(type);

};

