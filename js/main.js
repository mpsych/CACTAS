var H = H || {};
H.version = '0.1';

window.onload = function() {

  var url = 'data/avf.nii.gz';

  var query = window.location.search;
  var params = new URLSearchParams(query);
  var data = params.get('data');
  var filename = params.get('filename');

  if (data) {
    console.log('Loading', data);
    url = data;
  }

  H.V = new H.Viewer( document.getElementById('viewer'), url );
  H.D = new H.Drawer( H.V ); // attach drawer

  if (filename) {
    console.log('Storing', filename)
    H.D.filename = filename;
  }


  H.A = new H.Annotator();
  H.A.setLabelmapPixel = H.D.setLabelmapPixel;
  H.A.getLabelmapPixel = H.D.getLabelmapPixel;
  H.A.getVolumePixel = H.D.getVolumePixel;
  H.A.getVolumeDimensions = H.D.getVolumeDimensions;
};

function growingBenchmark() {
  let evt = new MouseEvent("click", {
    clientX: 568,
    clientY: 354,
    ctrlKey: true
  });

  let viewer = document.getElementById('viewer');

  // for (let x = 0; x < 1; x++) {
  //   viewer.dispatchEvent(evt);
  //   console.log("a");
  // }
}