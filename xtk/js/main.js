var H = H || {};
H.version = '0.1';

window.onload = function() {

  H.V = new H.Viewer( document.getElementById('viewer') );
  H.D = new H.Drawer( H.V ); // attach drawer
  
};

function changeView() {

    var combobox = document.getElementById('view');
    var orientation = combobox.selectedOptions[0].outerText;

    H.V.changeView(orientation);

};


