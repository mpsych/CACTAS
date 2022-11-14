var H = H || {};
H.version = '0.1';

window.onload = function() {

  H.V = new H.Viewer( document.getElementById('viewer') );
  H.D = new H.Drawer( H.V ); // attach drawer

  H.A = new H.Annotator();
  H.A.setPixel = H.D.setSegment;
  H.A.getPixel = H.D.getSegment;

  
};

function changeView() {

    var combobox = document.getElementById('view');
    var orientation = combobox.selectedOptions[0].outerText;

    H.V.changeView(orientation);

};


