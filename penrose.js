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
   * edgeLinks is an array of 4 2-element arrays, each describing
   * a edge of the tile, starting from the initial vertex and
   * proceeding in a counterclockwise direction.
   * Each 2-element array contains a number identifying the type
   * of edge followed by a number identifying the type of edge
   * that it can be connected to.
   */
  function Tile(smallAngleDeg, edgeLinks) {
    var me = this
      , smallAngleRad = smallAngleDeg * Math.PI / 180
      , cosA = Math.cos(smallAngleRad)
      , sinA = Math.sin(smallAngleRad)
      , linkTypeEdges = []
    ;

    this.smallAngleDeg = smallAngleDeg;
    this.edgeLinks     = edgeLinks;
    this.x = 0.0;
    this.y = 0.0;
    this.orientationDeg = 0;
    this.baseVertexPoints = [
        [0.0, 0.0]
      , [1.0, 0.0]
      , [1.0 + cosA, sinA]
      , [cosA, sinA]
    ];
    this.edgeOrientationOffsets = [
        0
      , smallAngleDeg
      , 180
      , 180 + smallAngleDeg
    ];

    this.eachBaseVertexCoords = function(callback) {
      me.baseVertexPoints.forEach(function(vertexPt, idx) {
        callback( vertexPt[0], vertexPt[1], idx );
      });
    }

    edgeLinks.forEach( function(edgeLink, edgeIdx) {
      var edgeType = edgeLink[0];
      linkTypeEdges[edgeType] = edgeIdx;
    });
    this.linkTypeEdges = linkTypeEdges;

    this.getEdgeOrientation = function(edgeIdx) {
      return (
        this.orientationDeg + this.edgeOrientationOffsets[edgeIdx]
      ) % 360;
    };

    this.getVertexPoint = function(vertexIdx) {
      var baseVertexPoint = this.baseVertexPoints[vertexIdx]
        , baseX = baseVertexPoint[0]
        , baseY = baseVertexPoint[1]
        , orientationRad = this.orientationDeg * Math.PI / 180
        , cosO = Math.cos(orientationRad)
        , sinO = Math.sin(orientationRad)
      ;

      return [
          this.x + baseX * cosO - baseY * sinO
        , this.y + baseY * cosO + baseX * sinO
      ];
    };
  }

  /**
   * Prototype for tiles with angles of 72 and 108 degrees.
   */
  function FatTile() { }
  FatTile.prototype = new Tile(72,
    [
        [0, 1]
      , [2, 3]
      , [3, 2]
      , [1, 0]
    ]);

  /**
   * Prototype for tiles with angles of 36 and 144 degrees.
   */
  function SkinnyTile() { }
  SkinnyTile.prototype = new Tile(36,
    [
        [1, 0]
      , [0, 1]
      , [3, 2]
      , [2, 3]
    ]);

  var TileAbbrTypeMap = {
      F: FatTile
    , S: SkinnyTile
  }

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
    [   ['S', {t:0, e:1}]
      , ['F', {t:1, e:3}]
    ]
  );
  adjustWindow();

  /**
   * initialTileAbbr is 'F' for a fat tile or 'S' for a skinny
   * tile.
   *
   * tileBranches is an array of instructions for attaching tiles
   * to previously added tiles. Each instrivtion is an array
   * containing a tile abbreviation letter and an opject with "t"
   * (tile index) and "e" (edge index) values.
   *
   * The index of the initial tile is 0 the index of each
   * additional tile is 1 greater than the previously added tile.
   * The edges of a tile are numbered starting from zero and
   * proceeding counterclockwise around the tile.
   *
   * Since each tile has exactly one edge that can be attached to
   * any specific edge of any other tile, the new tile is
   * automatically rotated to connect its appropriate edge to
   * the specified edge of the existing tile.
   */
  function renderTiles(initialTileAbbr, tileBranches) {
    var tileList = []
      , useFatTemplateEl
      , useSkinnyTemplateEl
      , tileTypeElMap
      , initialTile
      , initialTileEl
      , i
    ;

    tilingEl.innerHTML =
      "<use href='#fat-tile' xlink:href='#fat-tile' />" +
      "<use href='#skinny-tile' xlink:href='#skinny-tile' />";

    tileTypeElMap = {
        F: tilingEl.childNodes[0].cloneNode()
      , S: tilingEl.childNodes[1].cloneNode()
    };

    tilingEl.innerHTML = '';

    initialTile = new (TileAbbrTypeMap[initialTileAbbr])();
    tileList.push( initialTile );
    initialTileEl = tileTypeElMap[initialTileAbbr].cloneNode();
    initialTile.element = initialTileEl;

    tilingEl.appendChild( initialTileEl );

    tileBranches.forEach( function(tileAttachment) {
      var tileAbbr = tileAttachment[0]
        , attachToTileIdx = tileAttachment[1]['t']
        , attachToEdgeIdx = tileAttachment[1]['e']
        , attachToTile = tileList[attachToTileIdx]
        , attachEdgeType = attachToTile.edgeLinks[attachToEdgeIdx][1]
        , tile = new (TileAbbrTypeMap[tileAbbr])()
        , attachEdgeIdx = tile.linkTypeEdges[attachEdgeType]
        , tileEl = tileTypeElMap[tileAbbr].cloneNode()
        , toEdgeStartPoint
        , edgeUntranslatedEndPoint
        , tileOffsetVector
      ;

      tile.element = tileEl;

      tileList.push( tile );
      tilingEl.appendChild( tileEl );

      tile.orientationDeg = (
          attachToTile.getEdgeOrientation(attachToEdgeIdx)
        - tile.edgeOrientationOffsets[attachEdgeIdx]
        + 180 + 360
      ) % 360;

      toEdgeStartPoint = attachToTile.getVertexPoint( attachToEdgeIdx );
      edgeUntranslatedEndPoint = tile.getVertexPoint( (attachEdgeIdx + 1) % 4 );

      tile.x = toEdgeStartPoint[0] - edgeUntranslatedEndPoint[0]
      tile.y = toEdgeStartPoint[1] - edgeUntranslatedEndPoint[1];

      tileEl.setAttribute(
        'transform',
        'translate(' + tile.x + ', ' + tile.y + ') rotate(' + tile.orientationDeg + ')'
      );
    });
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
