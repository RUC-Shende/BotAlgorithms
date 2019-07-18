//Class

//var worldo;
//var visuao;

class world {
  constructor( path, start, events, fps, deg ) {
    this.path = path;
    this.events = events;
    this.history = null;
    this.unit = 25;
    this.fps = fps;
    this.deg = deg;
    this.start = start;
    this.time = 0;
    this.tTime = 10 * this.fps;
    this.mobiles = [ ];
    this.pkg = [ ];
    this.Init( );
  }

  static main( ) {
    var SVG = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid red" );
    var SVG2 = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid green" );

    var event = [
      [
        [ "wait", [ ] ],
        [ "GoToWallAtAngle", [ 315 ] ],
        [ "FollowWall", [ "right" ] ]
      ],
      [ 
        [ "wait", [ ] ],
        [ "GoToWallAtAngle", [ 135 ] ],
        [ "FollowWall", [ "left" ] ]
      ],
      [
        [ "wait", [ ] ],
        [ "wait", [ 9 ] ],
        [ "GoToWallAtAngle", [ 315 ] ],
        [ "wait", [ ] ]
      ],
      [
        [ "wait", [ ] ],
        [ "GoToPoint", [ 25, 50 ] ],
        [ "GoToCenter", [ ] ],
        [ "GoOutAtAngle", [ 45, 1 ] ],
        [ "wait", [ ] ]
      ]
    ];
    var pathy = world.genPoly( { x:50, y:50 }, 25, 360 );

    var worldo = new world( pathy, { x:50, y:50 }, event, 60, 360 );

    worldo.pkg.push( new lineFill( worldo ) );
    worldo.pkg.push( new CAS( worldo, 0, 1, SVG2 ) );
    //worldo.pkg.push( new exitFind( worldo, { x:25, y:50 } ) );

    worldo.createHistory( );

    var visuao = new visual( SVG, worldo );
    var motor = setInterval( visual.reEnact.bind( visuao ), 1000 / worldo.fps );
  }

  static genPoly( c, r, n ) {
    var poly = [ ];
    for( var i = 0; i < n; i++ ) {
      var sumAng = ( i * 2 * Math.PI / n );
      poly.push( {
        x:c.x + r * Math.cos( sumAng ),
        y:c.y - r * Math.sin( sumAng )
      } );
    }
    poly.push( poly[ 0 ] );
    return( poly );
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
    for( var i = 0; i < this.events.length; i++ ) {
      this.mobiles.push( new mobile(
        this, this.start.x, this.start.y,
        this.mobiles.length, this.events[ this.mobiles.length ]
      ) );
    }
  }

  createHistory( ) {
    this.history = [ ];
    for( var i = 0; i < this.events.length; i++ ) {
      this.history.push( [ ] );
    }
    while( this.time < this.tTime ) {
      for( var i = 0; i < this.events.length; i++ ) {
        var who = this.mobiles[ i ];
        this.history[ i ].push( { x:who.x, y:who.y } );
        who.energy = who.vel * this.unit / this.fps;
        while( who.energy > 0 ) {
          who[ who.event[ who.on ][ 0 ] ]( who.event[ who.on ][ 1 ] );
        }
      }
      for( var j = 0; j < this.pkg.length; j++ ) {
        if( this.pkg[ j ].Update ) {
          this.pkg[ j ].Update( );
        }
      }
      this.time++;
    }
  }
}





class mobile {
  constructor( world, x, y, num, event ) {
    this.world = world;
    this.x = x;
    this.y = y;
    this.num = num;
    this.on = 1;
    this.event = event;
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
        this.target = value[ 0 ] * this.world.unit;
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
    if ( ( this.x == value[ 0 ] ) && ( this.y == value[ 1 ] ) ) {
      this.on++;
    } else {
      this.DirectTo( { x:value[ 0 ], y:value[ 1 ] } );
    }
  }

  GoToCenter( value ) {
    if ( ( this.x == this.world.start.x ) && ( this.y == this.world.start.y ) ) {
      this.on++;
    } else {
      this.DirectTo( this.world.start );
    }
  }

  GoToWallAtAngle( value ) {
    if ( this.target == null ) {
      this.target = world.wallAtAngle( this.world.deg, value[ 0 ] );
      this.target.x = this.world.start.x + this.world.unit * this.target.x;
      this.target.y = this.world.start.y + this.world.unit * this.target.y;
    }
    if ( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.a = value[ 0 ];
      this.on++;
    } else {
      this.DirectTo( this.target );
    }
  }

  GoOutAtAngle( value ) {
    if ( this.target == null ) {
      var angHold = value[ 0 ] * ( Math.PI / 180 );
      this.target = {
        x:this.x + value[ 1 ] * this.world.unit * Math.cos( angHold ),
        y:this.y - value[ 1 ] * this.world.unit * Math.sin( angHold )
      };
    }
    if ( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo( this.target );
    }
  }

  FollowWall( value ) {
    var dir = ( value[ 0 ] == "left" ) ? ( 1 ) : ( -1 );
    var del = ( this.world.unit / this.world.fps ) * dir;
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
    var hold = world.wallAtAngle( this.world.deg, this.a );
    hold.x = this.world.start.x + this.world.unit * hold.x;
    hold.y = this.world.start.y + this.world.unit * hold.y;
    this.DirectTo( hold );
  }
}





class exitFind {
  constructor( world, exit ) {
    this.w = world;
    this.step = this.w.unit / this.w.fps;
    this.premo = world.history;
    this.exit = exit;
    this.fTime = null;
  }

  Update( ) {
    var loc = this.w.history;
    for( var i = 0; i < loc.length; i++ ) {
      var distance = Math.hypot(
        this.exit.y - loc[ i ][ loc[ i ].length - 1 ].y,
        this.exit.x - loc[ i ][ loc[ i ].length - 1 ].x
      );
      
      if( distance <= this.step ) {
        console.log( distance + ", " + this.step / 2 );
      }
      
      if( distance <= this.step / 2 ) {
        this.w.mobiles[ i ].on = 0;
        this.w.mobiles[ i ].know = 1;
        continue;
      }
      break;
    }
    if( i == loc.length ) {
      this.w.tTime = this.w.time;
    }
  }
}





class lineFill {
  constructor( world ) {
    this.w = world;
    this.step = this.w.unit / this.w.fps;
    this.pPath = [ ];
    this.points = new Set( [ ] );
    this.wireless = true;
    this.Init( );
  }

  Init( ) {
    if( this.w.path[ 0 ].x != this.w.path[ this.w.path.length - 1 ].x ||
      this.w.path[ 0 ].y != this.w.path[ this.w.path.length - 1 ].y
    ) {
      console.log( "%cERROR: Must be a closed path", "color:#ff0000ff" );
      return null;
    }
    var curPt = null;
    for( var i = 0; i < this.w.path.length; i++ ) {
      var nextPt = this.w.path[ i ];
      if( curPt ) {
        var distance = Math.hypot( nextPt.y - curPt.y, nextPt.x - curPt.x );
        var totalSteps = Math.floor( distance / this.step ) + 1;
        for( var j = 0; j < totalSteps; j++ ) {
          var pt = {
            x:curPt.x + ( j / totalSteps ) * ( nextPt.x - curPt.x ),
            y:curPt.y + ( j / totalSteps ) * ( nextPt.y - curPt.y )
          };
          this.pPath.push( pt );
          this.points.add( pt );
        }
      }
      curPt = nextPt;
    }
  }

  Update( ) {
    var loc = this.w.history;
    for( var h = 0; h < loc.length; h++ ) {
      for( var i = 0; i < this.pPath.length; i++ ) {
        if( this.points.has( this.pPath[ i ] ) ) {
          var distance = Math.hypot(
            this.pPath[ i ].y - loc[ h ][ loc[ h ].length - 1 ].y,
            this.pPath[ i ].x - loc[ h ][ loc[ h ].length - 1 ].x
          );
          if( distance <= this.step / 2 ) {
              this.points.delete( this.pPath[ i ] );
          }
        }
      }
    }
    if( this.points.size == 0 ) {
      this.w.tTime = this.w.time;
    }
  }
}





//Looks at a bot going along arc and another along chord
class CAS {
  constructor( world, n, m, svg ) {
    this.w = world;
    this.n = n;
    this.m = m;
    this.svg = svg.append( "svg" ).attr( "viewBox", "0, 0, 100, 100" )
      .attr( "height", "100%" ).attr( "width", "100%" );
    this.sum = [ ];
    this.sumText;
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
      var llnll = Math.hypot( n.y, n.x );
      var llmll = Math.hypot( m.y, m.x );
      var lloll = Math.hypot( o.y, o.x );
      var cosn = ( n.x * o.x + n.y * o.y ) / ( llnll * lloll );
      var cosm = -( m.x * o.x + m.y * o.y ) / ( llmll * lloll );
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
    for( var i = 0; i < this.w.pkg.length; i++ ) {
      if( this.w.pkg[ i ].VInit ) {
        this.w.pkg[ i ].VInit( );
      }
    }
  }

  static reEnact( ) {
    if( this.w.time < this.w.tTime ) {
      for( var i = 0; i < this.w.history.length; i++ ) {
        this.visuals[ i ].attr( "cx", this.w.history[ i ][ this.w.time ].x )
          .attr( "cy", this.w.history[ i ][ this.w.time ].y );
      }
      for( var i = 0; i < this.w.pkg.length; i++ ) {
        if( this.w.pkg[ i ].VUpdate ) {
          this.w.pkg[ i ].VUpdate( );
        }
      }
      this.w.time++;
    }
  }
}
















