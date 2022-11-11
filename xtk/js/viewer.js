H.Viewer = function(element) {
  

  var r_x = new X.renderer2D();
  r_x.container = 'viewerX';
  r_x.orientation = 'x';
  r_x.init();

  var r_y = new X.renderer2D();
  r_y.container = 'viewerY';
  r_y.orientation = 'y';
  r_y.init();

  var r_z = new X.renderer2D();
  r_z.container = 'viewerZ';
  r_z.orientation = 'z';
  r_z.init();

  var v = new X.volume();
  // v.file = '../../data/p.nii.gz';
  v.file = '../../data/avf.nii.gz';

  r_x.add(v);

  XTK_LOADED = 0;

  r_y.onShowtime = function() {

    XTK_LOADED += 1;

    if(XTK_LOADED == 3) {
      H.V.changeView('Coronal');
    }
  }

  r_z.onShowtime = function() {

    XTK_LOADED += 1;

    if(XTK_LOADED == 3) {
      H.V.changeView('Coronal');
    }

  }

  r_x.onShowtime = function() {

    // trigger other loading

    r_y.add(v);
    r_z.add(v);

    r_y.render();
    r_z.render();

    XTK_LOADED += 1;

    if(XTK_LOADED == 3) {
      H.V.changeView('Coronal');
    }

  }


  r_x.render();

  this.v = v;
  this.r = r_y;

};

H.Viewer.prototype.changeView = function(orientation) {

  Axial = document.getElementById('viewerX');
  Sagittal = document.getElementById('viewerY');
  Coronal = document.getElementById('viewerZ');

  Axial.style.display = 'none';
  Sagittal.style.display = 'none';
  Coronal.style.display = 'none';

  eval(orientation+'.style.display = "block";');

};

