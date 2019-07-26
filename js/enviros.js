//Class

//var worldo;
//var visuao;

class world {
  constructor( path, start, icll, fps ) {
    this.unit = 25;
    this.path = path;
    this.start = start;
    this.icll = icll;
    this.fps = fps;
    this.pPath = this.genPath( );
    this.history = null;
    this.time = 0;
    this.tTime = 10 * this.fps;
    this.mobiles = [ ];
    this.mods = [ ];
  }

  static main( ) {
    var SVG = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid red" );
    var SVG2 = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid green" );

    var icll = [
      [
        [ "info" ],
        [ "GoToWallAtAngle", [ 315 ] ],
        //[ "FollowWall", [ "right" ] ],
        [ "wait", [ ] ]
      ],
      [ 
        [ "info" ],
        [ "GoToWallAtAngle", [ 135 ] ],
        //[ "FollowWall", [ "left" ] ],
        [ "wait", [ ] ]
      ],
      [
        [ "info" ],
        [ "wait", [ 9 ] ],
        [ "GoToWallAtAngle", [ 315 ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],
      [
        [ "info" ],
        [ "GoToPoint", { x:25, y:50 } ],
        [ "GoToCenter", [ ] ],
        [ "GoOutAtAngle", { r:1, d:45 } ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ]
    ];

    var worldo = new world(
      world.genPoly( { x:50, y:50 }, 25, 0, 360 ),
      { x:50, y:50 },
      icll,
      60
    );

    //nothing									~30ms
    //worldo.mods.push( new lineFillMod( worldo ) );//medium			~65ms
    //worldo.mods.push( new coSuMod( worldo, 0, 1, SVG2 ) );//light		~10ms
    //worldo.mods.push( new exitFindMod( worldo, { x:25, y:50 } ) );//light	~5ms

    worldo.createHistory( );
    //worldo.createHistory( );	//exitFindMod requires two createHistory's

    var visuao = new visual( SVG, worldo );
    var motor = setInterval( visual.reEnact.bind( visuao ), 1000 / worldo.fps );
  }

  static genPoly( c, r, a, n ) {
    var poly = [ ];
    for( var i = 0; i < n; i++ ) {
      var sumAng = ( a * Math.PI / 180 ) + ( i * 2 * Math.PI / n );
      poly.push( {
        x:c.x + r * Math.cos( sumAng ),
        y:c.y - r * Math.sin( sumAng )
      } );
    }
    poly.push( poly[ 0 ] );
    return( poly );
  }

  genPath( ) {
    if( this.path[ 0 ].x != this.path[ this.path.length - 1 ].x ||
      this.path[ 0 ].y != this.path[ this.path.length - 1 ].y
    ) {
      this.path.push( this.path[ 0 ] );
    }
    var pPath = [ ];
    var curPt = null;
    for( var i = 0; i < this.path.length; i++ ) {
      var nextPt = this.path[ i ];
      if( curPt ) {
        var distance = Math.hypot( nextPt.y - curPt.y, nextPt.x - curPt.x );
        var totalSteps = Math.floor( this.fps * distance / this.unit ) + 1;
        for( var j = 0; j < totalSteps; j++ ) {
          var pt = {
            x:curPt.x + ( j / totalSteps ) * ( nextPt.x - curPt.x ),
            y:curPt.y + ( j / totalSteps ) * ( nextPt.y - curPt.y )
          };
          pPath.push( pt );
        }
      }
      curPt = nextPt;
    }
    pPath.push( pPath[ 0 ] );
    return( pPath );
  }

  //returns point relative to a unit polygon at origin, code is reduced rel. to p11 = 0,0
  static wallAtAngle( deg, angle ) {
    var fa = Math.floor( ( angle / 360 ) * deg );
    var d2r = Math.PI / 180;
    var p12 = { x:Math.cos( angle * d2r ), y:-Math.sin( angle * d2r ) };
    var p21 = { x:Math.cos( fa * d2r ), y:-Math.sin( fa * d2r ) };
    var p22 = { x:Math.cos( ( fa + 1 ) * d2r ), y:-Math.sin( ( fa + 1 ) * d2r ) };
    var m1 = p12.y / p12.x;
    var m2 = ( p22.y - p21.y ) / ( p22.x - p21.x );
    var c2 = p22.y - m2 * p22.x;
    var d = m2 - m1;
    return( { x:( -c2 ) / d, y:( -m1 * c2 ) / d } );
  }

  Init( ) {
    this.time = 0;	//Reset time
    this.mobiles = [ ];		//Reset mobiles for run
    for( var i = 0; i < this.icll.length; i++ ) {	//Refill mobiles for run
      this.mobiles.push( new mobile(
        this, this.start.x, this.start.y, i, this.icll[ i ]
      ) );
    }
    for( var j = 0; j < this.mods.length; j++ ) {	//Reset modules
      if( this.mods[ j ].Init ) {
        this.mods[ j ].Init( );
      }
    }
  }

  createHistory( ) {
    this.Init( );
    this.history = [ ];		//Reset History
    for( var i = 0; i < this.icll.length; i++ ) {
      this.history.push( [ ] );
    }
    while( this.time < this.tTime ) {
      for( var i = 0; i < this.icll.length; i++ ) {
        var who = this.mobiles[ i ];
        this.history[ i ].push( { x:who.x, y:who.y } );
        who.energy = who.vel * this.unit / this.fps;
        while( who.energy > 0 ) {
          who[ who.icl[ who.on ][ 0 ] ]( who.icl[ who.on ][ 1 ] );
        }
      }
      for( var j = 0; j < this.mods.length; j++ ) {
        if( this.mods[ j ].Update ) {
          this.mods[ j ].Update( );
        }
      }
      this.time++;
    }
  }
}





class mobile {
  constructor( world, x, y, num, icl ) {
    this.w = world;
    this.x = x;
    this.y = y;
    this.num = num;
    this.on = 1;
    this.icl = icl;
    this.vel = 1;
    this.a = 0;
    this.energy = 0;
    this.target = null;
    this.know = 0;
  }

  DirectTo( value ) {
    var dLoc = { x:value.x - this.x, y:value.y - this.y };
    var dist = Math.hypot( dLoc.y, dLoc.x );
    if( dist < this.energy ) {
      this.x = value.x;
      this.y = value.y;
      this.energy -= dist;
    } else {
      var ang = Math.atan2( dLoc.y, dLoc.x );
      this.x += Math.cos( ang ) * this.energy;
      this.y += Math.sin( ang ) * this.energy;
      this.energy = 0;
    }
  }

  wait( value ) {
    if( value[ 0 ] ) {
      if( this.target == null ) {
        this.target = value[ 0 ] * this.w.unit;
      }
      if ( this.target < this.energy ) {
        this.energy -= this.target;
        this.on++;
        this.target = null;
      } else {
        this.target -= this.energy;
        this.energy = 0;
      }
    } else {
      this.energy = 0;
    }
  }

  GoToPoint( value ) {
    if ( ( this.x == value.x ) && ( this.y == value.y ) ) {
      this.on++;
    } else {
      this.DirectTo( value );
    }
  }

  GoToCenter( value ) {
    if ( ( this.x == this.w.start.x ) && ( this.y == this.w.start.y ) ) {
      this.on++;
    } else {
      this.DirectTo( this.w.start );
    }
  }

  GoOutAtAngle( value ) {
    if ( this.target == null ) {
      var angHold = value.d * ( Math.PI / 180 );
      this.target = {
        x:this.x + value.r * this.w.unit * Math.cos( angHold ),
        y:this.y - value.r * this.w.unit * Math.sin( angHold )
      };
    }
    if ( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo( this.target );
    }
  }

  GoToWall( value ) {
    for( var i = 0; i < this.pPath.length - 1; i++ ) {
      var u = { x:this.x - this.path[ i ].x, y:this.y - this.path[ i ].y };
      var v = {
        x:this.path[ i + 1 ].x - this.path[ i ].x,
        y:this.path[ i + 1 ].y - this.path[ i ].y
      };
    }
  }

  WallAtAngle( worldo, value ) {
    var closest = worldo.unit / worldo.fps;
    var who = 0;
    for( var i = 0; i < worldo.pPath.length; i++ ) {
      var ang = Math.atan2(
        worldo.pPath[ i ].y - worldo.start.y,
        worldo.pPath[ i ].x - worldo.start.x
      );
      if( ang < 0 ) {
        ang += 2 * Math.PI;
      }
      ang = Math.abs( value * Math.PI / 180 - ang );
      if( ang < closest ) {
        closest = ang;
        who = i;
      }
    }
    return( worldo.pPath[ who ] );
  }

  GoToWallAtAngle( value ) {
    if ( this.target == null ) {
      this.target = this.WallAtAngle( this.w, value );
    }
    if ( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.a = value[ 0 ];
      this.on++;
    } else {
      this.DirectTo( this.target );
    }
  }

  FollowWall( value ) {
    var dir = ( value[ 0 ] == "left" ) ? ( 1 ) : ( -1 );
    var del = ( this.w.unit / this.w.fps ) * dir;
    if ( value[ 1 ] ) {
      if ( this.target == null ) {
        this.target = this.a + value[ 1 ] * ( Math.PI / 180 ) * dir;
      }
      var leftCondition = this.a + del;
      var rightCondition = this.target;
      if ( dir < 0 ) {
        rightCondition = leftCondition;
        leftCondition = this.target;
      }
      if ( leftCondition > rightCondition ) {
        this.on++;
        this.a = this.target;
        this.target = null;
      } else {
        this.a += del;
      }
    } else {
      this.a += del;
    }
    var hold = this.WallAtAngle( this.w.deg, this.a );
    hold.x = this.w.start.x + this.w.unit * hold.x;
    hold.y = this.w.start.y + this.w.unit * hold.y;
    this.DirectTo( hold );
  }
}





class exitFindMod {
  constructor( world, exit, ) {
    this.w = world;
    this.step = this.w.unit / this.w.fps;
    this.premo = null;
    this.exit = exit;
    this.fTime = null;
  }

  Init( ) {
    if( this.w.history ) {
      this.premo = this.w.history;
    }
  }

  Update( ) {
    if( this.premo ) {
      var loc = this.w.history, j = 0;
      for( var i = 0; i < loc.length; i++ ) {
        var distance = Math.hypot(
          this.exit.y - loc[ i ][ loc[ i ].length - 1 ].y,
          this.exit.x - loc[ i ][ loc[ i ].length - 1 ].x
        );
        
        if( distance <= this.step / 2 ) {
          this.w.mobiles[ i ].on = this.w.mobiles[ i ].icl.length - 1;
          this.w.mobiles[ i ].know = 1;
          j++;
        }
      }
      if( j == loc.length ) {
        this.w.tTime = this.w.time;
      }
    }
  }
}





class lineFillMod {
  constructor( world ) {
    this.w = world;
    this.step = this.w.unit / this.w.fps;
    this.pts = null;
    this.count = -1;
  }

  Init( ) {
    this.pts = this.w.pPath.slice( );
    this.count = this.w.pPath.length;
  }

  Update( ) {
    var loc = this.w.history;
    for( var i = 0; i < loc.length; i++ ) {
      for( var j = 0; j < this.pts.length; j++ ) {
        if( this.pts[ j ] ) {
          var distance = Math.hypot(
            this.pts[ j ].y - loc[ i ][ loc[ i ].length - 1 ].y,
            this.pts[ j ].x - loc[ i ][ loc[ i ].length - 1 ].x
          );
          if( distance <= this.step / 2 ) {
            this.pts[ j ] = null;
            this.count--;
          }
        }
      }
    }
    if( this.count < 1 ) {
      this.w.tTime = this.w.time;
    }
  }
}





//Looks at a bot going along arc and another along chord
class coSuMod {
  constructor( world, n, m, svg ) {
    this.w = world;
    this.n = n;
    this.m = m;
    this.svg = svg.append( "svg" ).attr( "viewBox", "0, 0, 100, 100" )
      .attr( "height", "100%" ).attr( "width", "100%" );
    this.sum = [ ];
    this.sumText;
  }

  Init( ) {
    this.sum = [ ];
  }

  Update( ) {
    var loc = this.w.history;
    if( loc[ this.n ].length < 2 ) {
      this.sum.push( 0 );
    } else {
      var n = {
        x:loc[ this.n ][ loc[ this.n ].length - 1 ].x - loc[ this.n ][ loc[ this.n ].length - 2 ].x,
        y:loc[ this.n ][ loc[ this.n ].length - 1 ].y - loc[ this.n ][ loc[ this.n ].length - 2 ].y
      }
      var m = {
        x:loc[ this.m ][ loc[ this.m ].length - 1 ].x - loc[ this.m ][ loc[ this.m ].length - 2 ].x,
        y:loc[ this.m ][ loc[ this.m ].length - 1 ].y - loc[ this.m ][ loc[ this.m ].length - 2 ].y
      }
      var o = {
        x:loc[ this.m ][ loc[ this.m ].length - 1 ].x - loc[ this.n ][ loc[ this.n ].length - 1 ].x,
        y:loc[ this.m ][ loc[ this.m ].length - 1 ].y - loc[ this.n ][ loc[ this.n ].length - 1 ].y
      }
      var lloll = Math.hypot( o.y, o.x );
      var cosn = ( n.x * o.x + n.y * o.y ) / ( Math.hypot( n.y, n.x ) * lloll );
      var cosm = -( m.x * o.x + m.y * o.y ) / ( Math.hypot( m.y, m.x ) * lloll );
      this.sum.push( Math.floor( 100 * ( cosn + cosm ) ) / 100 );
    }
  }

  VInit( ) {
    this.sumText = this.svg.append( "text" )
      .attr( "x", 50 ).attr( "y", 50 ).attr( "text-anchor", "middle" )
      .text( "0" );
  }

  VUpdate( ) {
    this.sumText.text( this.sum[ this.w.time ] );
  }
}





class visual {
  constructor( svg, world ) {
    this.svg = svg.append( "svg" ).attr( "viewBox", "0, 0, 100, 100" )
      .attr( "height", "100%" ).attr( "width", "100%" );
    this.w = world;
    this.visuals = [ ];
    this.Init( );
  }

  Init( ) {
    this.w.time = 0;
    var hold = '';
    for( var i = 0; i < this.w.path.length; i++ ) {
      var pt = this.w.path[ i ];
      hold += ( ( i == 0 ) ? ( 'M' ) : ( 'L' ) ) + pt.x + ',' + pt.y;
    }
    this.svg.append( "path" )
      .attr( "d", hold ).attr( "stroke-width", 1 )
      .style( "stroke", "00ff00" ).style( "fill", "000000ff" );

    for( var i = 0; i < this.w.history.length; i++ ) {
      this.visuals.push( this.svg.append( "circle" )
        .attr( "r", 3 ).attr( "stroke-width", 1 )
        .style( "fill", "#ff000033" ).style( "stroke", "#ffffff" )
      );
    }
    for( var i = 0; i < this.w.mods.length; i++ ) {
      if( this.w.mods[ i ].VInit ) {
        this.w.mods[ i ].VInit( );
      }
    }
  }

  static reEnact( ) {
    if( this.w.time < this.w.tTime ) {
      for( var i = 0; i < this.w.history.length; i++ ) {
        this.visuals[ i ].attr( "cx", this.w.history[ i ][ this.w.time ].x )
          .attr( "cy", this.w.history[ i ][ this.w.time ].y );
      }
      for( var i = 0; i < this.w.mods.length; i++ ) {
        if( this.w.mods[ i ].VUpdate ) {
          this.w.mods[ i ].VUpdate( );
        }
      }
      this.w.time++;
    }
  }
}
















