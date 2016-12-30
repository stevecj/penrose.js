(function(document, Math){
  "use strict";

  var windowEl = document.getElementById('pt-window')
    , tilingEl = document.getElementById('pt-tiling')
    , fatTileEl = document.getElementById('fat-tile')
    , skinnyTileEl = document.getElementById('skinny-tile')
    , fatPSL = fatTileEl.pathSegList
    , skinnyPSL = skinnyTileEl.pathSegList
  ;

  /**
   * smallAngleDeg is the smaller of the 2 angles of the diamond
   * (parallelogram) shaped tile.
   * faceTypes is an array of 4 2-element arrays, each
   * containing a letter ('a' or 'b') and a number (0 or 1).
   * Faces of 2 different tiles can be conjoined if the letter of
   * each face is the same as the letter of the other and the
   * number of each face is different than the number of the
   * other.
   */
  function Tile(smallAngleDeg, faceTypes) {
    var me = this
      , smallAngleRad = smallAngleDeg * Math.PI / 180
      , cosA = Math.cos(smallAngleRad)
      , sinA = Math.sin(smallAngleRad)
    ;

    this.smallAngleDeg = smallAngleDeg;
    this.faceTypes     = faceTypes;
    this.x = 0.0;
    this.y = 0.0;
    this.orientationDeg = 0;
    this.baseVertexPoints = [
        [0.0, 0.0]
      , [1.0, 0.0]
      , [1.0 + cosA, sinA]
      , [cosA, sinA]
    ];
    this.faceOrientationOffsets = [
        0
      , smallAngleDeg
      , 180
      , 180 + smallAngleDeg
    ];

    this.eachBaseVertexCoords = function eachBaseVertexCoords(callback) {
      me.baseVertexPoints.forEach(function(vertexPt, idx) {
        callback( vertexPt[0], vertexPt[1], idx );
      });
    }
  }

  /**
   * Prototype for tiles with angles of 72 and 108 degrees.
   */
  function FatTile() { }
  FatTile.prototype = new Tile(72,
    [
        ['a', 0]
      , ['b', 0]
      , ['b', 1]
      , ['a', 1]
    ]);

  /**
   * Prototype for tiles with angles of 36 and 144 degrees.
   */
  function SkinnyTile() { }
  SkinnyTile.prototype = new Tile(36,
    [
        ['a', 0]
      , ['a', 1]
      , ['b', 0]
      , ['b', 1]
    ]);

  function applyTileShapeToPathEl(tile, pathEl) {
    var psl = pathEl.pathSegList;

    tile.eachBaseVertexCoords( function(x, y, idx) {
      var createSegFn = (idx == 0) ?
        'createSVGPathSegMovetoAbs' :
        'createSVGPathSegLinetoAbs' ;
      psl.appendItem( fatTileEl[createSegFn](x, y) );
    });
    psl.appendItem( fatTileEl.createSVGPathSegClosePath() );
  }

  applyTileShapeToPathEl( FatTile.prototype, fatTileEl );
  applyTileShapeToPathEl( SkinnyTile.prototype, skinnyTileEl );

  renderTiles(
    'F',
    [   {S: {t:0, f:3}}
      , {S: {t:1, f:0}}
    ]
  );
  adjustWindow();

  function renderTiles(initialTileAbbr) {
    tilingEl.innerHTML =
      "<use href='#fat-tile' xlink:href='#fat-tile' />" +
      "<use href='#skinny-tile' xlink:href='#skinny-tile' />";
    var useFatTemplateEl    = tilingEl.childNodes[0].cloneNode();
    var useSkinnyTemplateEl = tilingEl.childNodes[1].cloneNode();
    tilingEl.innerHTML = '';

    //TODO: Replace the 2 lines below with placement of
    //      cloned, positioned, and rotated nodes according
    //      to the instructions passed in.
    tilingEl.appendChild( useFatTemplateEl.cloneNode() );
    tilingEl.appendChild( useSkinnyTemplateEl.cloneNode() );
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

})(document, Math);
