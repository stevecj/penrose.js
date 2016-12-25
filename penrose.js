(function(){
  var a36 = 36 * Math.PI / 180
    , sin36 = Math.sin(a36)
    , cos36 = Math.cos(a36)
    , a72 = 72 * Math.PI / 180
    , sin72 = Math.sin(a72)
    , cos72 = Math.cos(a72)
    , narrowTriangleMarkup =
        "<path d='M 1 0 L 0 0 L " + cos36 + " " + sin36 + "' fill='orange' vector-effect='non-scaling-stroke' stroke='black' />"
    , wideTriangleMarkup =
        "<path d='M 1 0 L 0 0 L " + cos72 + " " + sin72 + "' fill='lightblue' vector-effect='non-scaling-stroke' stroke='black' />"
    , tilingEl = document.getElementById('pt-reference-frame')
  ;
  tilingEl.innerHTML =
    "<g transform='translate(-0.9 -0.5)'>" + wideTriangleMarkup + "</g>" +
    "<g transform='translate(-0.1 0.1)'>" + narrowTriangleMarkup + "</g>";
})();
