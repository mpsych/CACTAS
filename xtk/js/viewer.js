H.Viewer = function(element) {
  

  var r_x = new X.renderer2D();
  r_x.container = 'viewerX';
  r_x.orientation = 'x';
  r_x.init();
  this.r_x = r_x;

  var r_y = new X.renderer2D();
  r_y.container = 'viewerY';
  r_y.orientation = 'y';
  r_y.init();
  this.r_y = r_y;

  var r_z = new X.renderer2D();
  r_z.container = 'viewerZ';
  r_z.orientation = 'z';
  r_z.init();
  this.r_z = r_z;

  var v = new X.volume();
  v.file = '../../data/plaque_normalized.nii.gz';
  // v.file = '../data/avf.nii.gz';

  r_x.add(v);

  XTK_LOADED = 0;

  r_y.onShowtime = this.onInitializationCompleted.bind(this);

  r_z.onShowtime = this.onInitializationCompleted.bind(this);

  r_x.onShowtime = function() {

    // start loading of other views
    r_y.add(v);
    r_z.add(v);

    r_y.render();
    r_z.render();

    this.onInitializationCompleted();

  }.bind(this);

  r_x.onScroll = function(e) {
    H.V.v.refresh();
  }

  r_y.onScroll = function(e) {
    H.V.v.refresh();
  }

  r_z.onScroll = function(e) {
    H.V.v.refresh();
  }

  r_x.render();

  this.v = v;
  this.r = r_y;

};


H.Viewer.prototype.onInitializationCompleted = function() {

  XTK_LOADED += 1;

  if(XTK_LOADED == 3) {
    // all 3 views are initialized

    this.changeView('Coronal');

    this.v.createEmptyLabelMap();
    this.v.labelmap.opacity = 0.7;    

    H.D.setupInteraction();

  }


};


H.Viewer.prototype.changeView = function(orientation) {

  Axial = document.getElementById('viewerX');
  Sagittal = document.getElementById('viewerY');
  Coronal = document.getElementById('viewerZ');

  Axial.style.display = 'none';
  Sagittal.style.display = 'none';
  Coronal.style.display = 'none';

  eval(orientation+'.style.display = "block";');

  if (orientation == 'Axial') {
    this.r = this.r_x;
  } else if (orientation == 'Sagittal') {
    this.r = this.r_y;
  } else if (orientation == 'Coronal') {
    this.r = this.r_z;
  }

  H.D.setupInteraction();

};

