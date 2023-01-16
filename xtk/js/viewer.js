H.Viewer = function(element, url) {
  

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
  v.file = url;

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

    H.V.v.windowLow  = -500
    H.V.v.windowHigh = 1600


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

    // this.changeView('Coronal');

    this.v.createEmptyLabelMap();
    this.v.labelmap.opacity = 0.7;    

    H.D.setupInteraction();

  }


};
