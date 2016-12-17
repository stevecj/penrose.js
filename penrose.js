(function(){
  var a18 = 18 * Math.PI / 180
    , sin18 = Math.sin(a18)
    , narrowDiamondMarkup =
        "<path d='M -1 0 L 0 " + sin18 + " L 1 0 L 0 -" + sin18 + " z' fill='orange' vector-effect='non-scaling-stroke' stroke='black' />"
    , tilingEl = document.getElementById('penrose-tiling')
  ;
  tilingEl.innerHTML = narrowDiamondMarkup;
})();
