(function(document, Math){
  var a36 = 36 * Math.PI / 180
    , sin36 = Math.sin(a36)
    , cos36 = Math.cos(a36)
    , a108 = 108 * Math.PI / 180
    , sin108 = Math.sin(a108)
    , cos108 = Math.cos(a108)
    , narrowTriangleMarkup =
        "<path" +
            " id='narrow-triangle'" +
            " d='" +
                 "M 1 0" +
                " L 0 0" +
                " L " + cos36 + " " + sin36 +

             "'" +
            " fill='orange'" +
            " vector-effect='non-scaling-stroke'" +
            " stroke='black'" +
        " />"
    , wideTriangleMarkup =
        "<path" +
            " id='wide-triangle'" +
            " d='" +
                 "M 1 0" +
                " L 0 0" +
                " L " + cos108 + " " + sin108 +
             "'" +
            " fill='lightblue'" +
            " vector-effect='non-scaling-stroke'" +
            " stroke='black'" +
        " />"
    , defsEl = document.getElementById('pt-defs')
    , tilingEl = document.getElementById('pt-reference-frame')
  ;

  defsEl.innerHTML = narrowTriangleMarkup + wideTriangleMarkup;

  var initialShapeSelectEl =
          document.getElementById('initial-shape-select');

  function renderTiling() {
    var initialShapeSelectEl = document.getElementById('initial-shape-select');
    switch(initialShapeSelectEl.value) {
      case "wt":
        tilingEl.innerHTML =
          "<use href='#wide-triangle' xlink:href='#wide-triangle' />";
        break;
      case 'nt':
        tilingEl.innerHTML =
          "<use href='#narrow-triangle' xlink:href='#narrow-triangle' />";
        break;
      case 'wd':
        tilingEl.innerHTML =
          "<use href='#wide-triangle' xlink:href='#wide-triangle' />" +
          "<use href='#wide-triangle' xlink:href='#wide-triangle' transform='scale(-1 -1) translate(" + (-(cos108 + 1.0)) + " " + (-sin108) + ")'/>";
        break;
      case 'nd':
        tilingEl.innerHTML =
          "<use href='#narrow-triangle' xlink:href='#narrow-triangle' />" +
          "<use href='#narrow-triangle' xlink:href='#narrow-triangle' transform='scale(-1 -1) translate(" + (-(cos36 + 1.0)) + " " + (-sin36) + ")'/>";
        break;
    }
  }

  renderTiling();

  initialShapeSelectEl.addEventListener('change', renderTiling);

})(document, Math);
