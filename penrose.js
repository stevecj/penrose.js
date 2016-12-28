(function(document, Math){
  "use strict";

  var windowEl = document.getElementById('pt-window')
    , tilingEl = document.getElementById('pt-tiling')
    , fatTileEl = document.getElementById('fat-tile')
    , skinnyTileEl = document.getElementById('skinny-tile')
    , fatPSL = fatTileEl.pathSegList
    , skinnyPSL = skinnyTileEl.pathSegList
    , a72 = degToRad(72)
    , cos72 = Math.cos(a72)
    , sin72 = Math.sin(a72)
    , a36 = degToRad(36)
    , cos36 = Math.cos(a36)
    , sin36 = Math.sin(a36)
  ;

  fatPSL.appendItem( fatTileEl.createSVGPathSegMovetoAbs(0.0, 0.0) );
  fatPSL.appendItem( fatTileEl.createSVGPathSegLinetoAbs(1.0, 0.0) );
  fatPSL.appendItem( fatTileEl.createSVGPathSegLinetoAbs(1.0 + cos72, sin72) );
  fatPSL.appendItem( fatTileEl.createSVGPathSegLinetoAbs(cos72, sin72) );
  fatPSL.appendItem( fatTileEl.createSVGPathSegClosePath() );

  skinnyPSL.appendItem( skinnyTileEl.createSVGPathSegMovetoAbs(0.0, 0.0) );
  skinnyPSL.appendItem( skinnyTileEl.createSVGPathSegLinetoAbs(1.0, 0.0) );
  skinnyPSL.appendItem( skinnyTileEl.createSVGPathSegLinetoAbs(1.0 + cos36, sin36) );
  skinnyPSL.appendItem( skinnyTileEl.createSVGPathSegLinetoAbs(cos36, sin36) );
  skinnyPSL.appendItem( skinnyTileEl.createSVGPathSegClosePath() );

  renderTiles();
  adjustWindow();

  function renderTiles() {
    tilingEl.innerHTML =
      "<use href='#fat-tile' xlink:href='#fat-tile' />" +
      "<use href='#skinny-tile' xlink:href='#skinny-tile' transform='rotate(72)' />";
  }

  function adjustWindow() {
    var extents
      , contentSize
    ;

    extents = tilingEl.getBBox();
    contentSize = extents.width > extents.height ?
      extents.width :
      extents.height;
    contentSize += 2.0;
    windowEl.transform.baseVal.getItem(0).setScale(2.0 / contentSize, 2.0 / contentSize);
    windowEl.transform.baseVal.getItem(1).setTranslate(-extents.x - extents.width / 2.0, -extents.y - extents.height / 2.0);
  }

  function degToRad(degrees) {
    degrees = degrees % 360;
    if(degrees > 180) { degrees = 360 - degrees; }
    if(degrees < -180) { degrees = 360 + degrees; }
    return degrees * Math.PI / 180;
  }

})(document, Math);
