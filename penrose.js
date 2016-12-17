(function(){
  var tilingEl = document.getElementById('penrose-tiling')
    , outerRadius = 0.9
    , innerRadius = outerRadius * Math.sin(18 * Math.PI / 180)
    , top = innerRadius
    , bottom = -innerRadius
    , left = -outerRadius
    , right = outerRadius
  ;
  tilingEl.innerHTML="<path d='M " + left + " 0 L 0 " + top + " L " + right + " 0 L 0 " + bottom + " z' fill='orange' />";
})();
