(function( document, Math ) {
  "use strict";

  var directions = {
            '0': new Point( new X( 2, -2 ), new Y( 0,  0 ) )

        ,  '36': new Point( new X( 1,  0 ), new Y( 1,  0 ) )
        ,  '72': new Point( new X( 0,  1 ), new Y( 0,  1 ) )
        , '108': new Point( new X( 0, -1 ), new Y( 0,  1 ) )
        , '144': new Point( new X(-1,  0 ), new Y( 1,  0 ) )

        , '180': new Point( new X(-2,  2 ), new Y( 0,  0 ) )

        , '216': new Point( new X(-1,  0 ), new Y(-1,  0 ) )
        , '252': new Point( new X( 0, -1 ), new Y( 0, -1 ) )
        , '288': new Point( new X( 0,  1 ), new Y( 0, -1 ) )
        , '324': new Point( new X( 1,  0 ), new Y(-1,  0 ) )
      }
    , a36 = 36 * Math.PI / 180
    , a72 = 72 * Math.PI / 180
    , cos36 = Math.cos(a36)
    , cos72 = Math.cos(a72)
    , sin36 = Math.sin(a36)
    , sin72 = Math.sin(a72)
    , tilingEl = document.getElementById('pt-tiling')
  ;

  /**
   * Represents a point or a direction vector in terms
   * of Cartesian x and y coordinates.
   */
  function Point( x, y ) {
    this.x = x;
    this.y = y;

    this.key = [ x.key, y.key ];

    this.add = function( other ) {
      return new Point(
          this.x.add( other.x )
        , this.y.add( other.y )
      );
    };
  }
  Point.prototype.toString = function() {
    return 'Point(x: ' + this.x + ', y: ' + this.y + ')';
  };

  /**
   * An x direction component expressed as the sum of multiples
   * of cos(36 degrees) and cos(72 degrees).
   * Since cos(36 degrees) minus cos(72 degrees) equals 1/2,
   * multiples of 1/2 can also be expressed.
   */
  function X(c36, c72) {
    this.c36 = c36;
    this.c72 = c72;

    this.key = [ c36, c72 ];

    this.add = function( other ) {
      return new X(
          this.c36 + other.c36
        , this.c72 + other.c72
      );
    }
  }
  X.prototype.toString = function() {
    return 'X(c36: ' + this.c36 + ', c72: ' + this.c72 + ')';
  };
  X.prototype.toFloat = function() {
    return this.c36 * cos36 + this.c72 * cos72;
  }

  /**
   * A y direction component expressed as the sum of multiples
   * of sin(36 degrees) and sin(72 degrees).
   */
  function Y(s36, s72) {
    this.s36 = s36;
    this.s72 = s72;

    this.key = [ s36, s72 ];

    this.add = function( other ) {
      return new Y(
          this.s36 + other.s36
        , this.s72 + other.s72
      );
    }
  }
  Y.prototype.toString = function() {
    return 'Y(s36: ' + this.cs6 + ', s72: ' + this.s72 + ')';
  };
  Y.prototype.toFloat = function() {
    return this.s36 * sin36 + this.s72 * sin72;
  }

  /**
   * A direction starting from a specific point, also having a
   * type (string value) used in determining whether the ray
   * may coincide with another ray.
   */
  function Ray( type, originPt, angleDeg ) {
    this.type     = type;
    this.originPt = originPt
    this.angleDeg = angleDeg;

    this.direction = directions[angleDeg];
    this.key = [ originPt.key, angleDeg ];
  }
  Ray.prototype.toString = function() {
    return 'Ray(type: ' + this.type + ', originPt: ' + this.originPt + ', angleDeg: ' + this.angleDeg + ')';
  }

  /**
   * Returns the ray that, assuming the given ray is an edge, is
   * the same line segment measured from the opposite end and
   * with an opposite direction.
   * The new ray is also given a complementary type-string.
   */
  Ray.prototype.getEdgeComplement = function() {
    var originPt = this.originPt.add( this.direction )
      , angleDeg = (this.angleDeg + 180) % 360
      , type;

    switch( this.type ) {
      case 'ea+': type = 'ea-' ; break;
      case 'ea-': type = 'ea+' ; break;
      case 'eb+': type = 'eb-' ; break;
      case 'eb-': type = 'eb-' ; break;
      case 'spoke': type = '~spoke' ; break;
    }

    return new Ray( type, originPt, angleDeg );
  };

  /**
   * A Rhombus (diamond) shaped tile described as the point
   * location of its initial vertex (origin) and the angle of
   * orientation of its first edge counterclockwise from the
   * origin.
   */
  function Tile( type, smallAngleDeg, edgeTypes, originPt, orientationDeg ) {
    var largeAngleDeg = 180 - smallAngleDeg
      , edgeRay0 = new Ray(
          edgeTypes[0] , originPt , orientationDeg
        )
      , edgeRay1 = new Ray(
            edgeTypes[1]
          , edgeRay0.originPt.add( edgeRay0.direction )
          , (edgeRay0.angleDeg + smallAngleDeg) % 360
        )
      , edgeRay2 = new Ray(
            edgeTypes[2]
          , edgeRay1.originPt.add( edgeRay1.direction )
          , (edgeRay1.angleDeg + largeAngleDeg) % 360
        )
      , edgeRay3 = new Ray(
            edgeTypes[3]
          , edgeRay2.originPt.add( edgeRay2.direction )
          , (edgeRay2.angleDeg + smallAngleDeg) % 360
        )
    ;

    this.type = type;
    this.smallAngleDeg  = smallAngleDeg;
    this.originPt       = originPt;
    this.orientationDeg = orientationDeg;

    this.edges = [ edgeRay0, edgeRay1, edgeRay2, edgeRay3 ];
    this.vertices = [
        edgeRay0.originPt
      , edgeRay1.originPt
      , edgeRay2.originPt
      , edgeRay3.originPt
    ];
  }
  Tile.prototype.getRays = function() {
    var spokes = []
      , edgeIdx
      , edgeRay
      , adjEdgeIdx
      , spokeAngleDeg
      , adjAngleDeg
      , spoke
    ;

    for( edgeIdx=0 ; edgeIdx < 4; edgeIdx++ ) {
      adjEdgeIdx = ( edgeIdx + 3 ) % 4;
      edgeRay = this.edges[ edgeIdx ];
      adjAngleDeg = ( this.edges[ adjEdgeIdx ].angleDeg + 180 ) % 360;
      spokeAngleDeg = this.edges[ edgeIdx ].angleDeg;
      while( true ) {
        spokeAngleDeg = ( spokeAngleDeg + 36 ) % 360;
        if( spokeAngleDeg === adjAngleDeg ) {
          break;
        } else {
          spoke = new Ray( 'spoke', edgeRay.originPt, spokeAngleDeg );
          spokes.push( spoke );
        }
      }
    }

    return this.edges.concat( spokes );
  };

  function buildFatTile( originPt, orientation ) {
    return new Tile(
      'fat', 72, [ 'ea+', 'eb+', 'eb-', 'ea-' ],
      originPt, orientation
    );
  }

  function buildSkinnyTile( originPt, orientation ) {
    return new Tile(
      'skinny', 36, [ 'ea-', 'ea+', 'eb-', 'eb+' ],
      originPt, orientation
    );
  }

  function renderTile( tile ) {
    var pathEl = document.createElementNS("http://www.w3.org/2000/svg", 'path')
      , psl = pathEl.pathSegList;
    ;

    pathEl.setAttribute(
      'class',
      'pt-tile pt-' + tile.type
    );
    psl.appendItem( pathEl.createSVGPathSegMovetoAbs(
        tile.vertices[0].x.toFloat()
      , tile.vertices[0].y.toFloat()
    ) );
    psl.appendItem( pathEl.createSVGPathSegLinetoAbs(
        tile.vertices[1].x.toFloat()
      , tile.vertices[1].y.toFloat()
    ) );
    psl.appendItem( pathEl.createSVGPathSegLinetoAbs(
        tile.vertices[2].x.toFloat()
      , tile.vertices[2].y.toFloat()
    ) );
    psl.appendItem( pathEl.createSVGPathSegLinetoAbs(
        tile.vertices[3].x.toFloat()
      , tile.vertices[3].y.toFloat()
    ) );
    psl.appendItem( pathEl.createSVGPathSegClosePath() );

    tilingEl.appendChild( pathEl );
  }

  function TileMap() {
    this.tiles = [];
    this.rays = {};
  }
  TileMap.prototype.addTile = function addTile( tile ) {
    var me = this
      , tileRays = tile.getRays()
    ;

    tileRays.forEach( function( ray ) {
      var rayComplement, rayComplementMatch;
      if( me.rays[ray.key] ) {
        throw "Tile ray " + ray + " would coincide with an existing ray.";
      }

      rayComplement = ray.getEdgeComplement();
      rayComplementMatch = me.rays[ rayComplement.key ];
      if( rayComplementMatch ) {
        if( rayComplementMatch.type !== rayComplement.type ) {
          rayComplementMatch
          throw "Tile edge-complement ray " + rayComplement + " would coincide with an existing ray of a different type.";
        }
      }
    });

    tileRays.forEach( function( ray ) {
      me.rays[ray.key] = ray;
    });
    this.tiles.push( tile );
  };

  var tileMap = new TileMap();
  var tile = buildSkinnyTile( new Point( new X(0,0), new Y(0,0) ), 0 );
  var tile2 = buildFatTile( new Point( new X(2,-2), new Y(0,0) ), 360 - 144 - 36 );

  tileMap.addTile( tile );
  tileMap.addTile( tile2 );
  renderTile( tile );
  renderTile( tile2 );

})(document, Math);
