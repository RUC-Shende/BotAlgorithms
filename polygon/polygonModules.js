//Class

//var worldo;
//var visuao;

//

class utils {
  constructor( ) {
  }

  static main( ) {
    var SVG = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid red" );
    var SVG2 = d3.select( "body" ).append( "svg" )
      .attr( "width", 500 ).attr( "height", 500 )
      .style( "border", "1px solid green" );

      var path = utils.genPoly({x:50,y:50}, 25, 0, 3)

    var icll = [
        /*
      [
        [ "info" ],
        //[ "GoToWallFromCenter", [ 225 ] ],
        [ "GoToWallFromCenter", [ 0 ] ],
        [ "GoToWallFromCenter", [ 45 ] ],
        [ "GoToWallFromCenter", [ 90 ] ],
        [ "GoToWallFromCenter", [ 135 ] ],
        [ "GoToWallFromCenter", [ 180 ] ],
        [ "GoToWallFromCenter", [ 225 ] ],
        [ "GoToWallFromCenter", [ 270 ] ],
        [ "GoToWallFromCenter", [ 315 ] ],
        [ "GoToWallFromCenter", [ 360 ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],
      */
      /*[
        [ "info" ],
        [ "GoToWallFromCenter", [ 270 ] ],
        //[ "GoToWallFromCenter", [ 135 ] ],
        //[ "GoToWallFromCenter", [ 225 ] ],
        //[ "GoToWallFromCenter", [ 315 ] ],
        //[ "GoToWallFromCenter", [ 45 ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],*/
      [
        [ "info" ],
        [ "GoToWallFromCenter", [ 220 ] ],
        [ "GoToMidPoint", [] ],
        [ "FollowWall", ["right"] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],
      /*[
        [ "info" ],
        [ "GoToWallFromTourist", [ 180 ] ],
        [ "GoToWallFromTourist", [ 315 ] ],
        [ "GoToWallFromTourist", [ 45 ] ],
        [ "GoToWallFromTourist", [ 135 ] ],
        //[ "GoToWallFromTourist", [ 225 ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],*/
      /*[
        [ "info" ],
        [ "GoToWallFromTourist", [ 225 ] ],
        [ "GoToWallFromTourist", [ 0 ] ],
        [ "GoToWallFromTourist", [ 90 ] ],
        [ "GoToWallFromTourist", [ 180 ] ],
        [ "GoToWallFromTourist", [ 270 ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ],*/
      [
        [ "info" ],
        [ "GoToWallFromCenter", [ 220 ] ],
        [ "GoToMidPoint", [ ] ],
        [ "FollowWall", [ "left" ] ],
        [ "wait", [ ] ],
        [ "wait", [ ] ]
      ]
    ];
/*
    var path = [
      { x:25, y:25 }, { x:30, y:30 }, { x:75, y:25 }, { x:60, y:40 }, { x:60, y:60 },
      { x:75, y:75 }, { x:25, y:75 }, { x:40, y:50 }, { x:25, y:25 }
    ];
*/
    window.worldo = new world(
      path,
      { x:50, y:50 },
      icll,
      100
    );

    //nothing									~36ms
    worldo.mods.push( new lineFillMod( worldo ) );//medium			~+66ms
    //worldo.mods.push( new coSuMod( worldo, 0, 1, SVG2 ) );//light		~+10ms
    var exit = utils.wallAtAngle(3, 340);
    exit.x = exit.x * worldo.unit;
    exit.y = exit.y * worldo.unit;
    worldo.mods.push( new exitFindMod( worldo, {x:75, y:50 } ) );//light	~+5ms

    console.log(exit);

    worldo.createHistory( );
    worldo.createHistory( );	//exitFindMod requires two createHistory's

    var visuao = new visual( SVG, worldo );
    var motor = setInterval( visual.reEnact.bind( visuao ), 1000 / worldo.fps );
  }

  static wallAtAngle(deg, angle) {
      var fa = Math.floor((angle / 360) * deg);
      var d2r = Math.PI / 180;
      var p12 = {
          x: Math.cos(angle * d2r),
          y: -Math.sin(angle * d2r)
      };
      var p21 = {
          x: Math.cos(fa * d2r),
          y: -Math.sin(fa * d2r)
      };
      var p22 = {
          x: Math.cos((fa + 1) * d2r),
          y: -Math.sin((fa + 1) * d2r)
      };
      var m1 = p12.y / p12.x;
      var m2 = (p22.y - p21.y) / (p22.x - p21.x);
      var c2 = p22.y - m2 * p22.x;
      var d = m2 - m1;
      return ({
          x: (-c2) / d,
          y: (-m1 * c2) / d
      });
  }

  static cmpXYPairs( v1, v2 ) {
    if( ( v1.x == v2.x ) && ( v1.y == v2.y ) ) {
      return( true );
    }
    return( false );
  }

  static AddAround( val, max, amt ) {
    if( max < 1 ) {
      console.log( "%cERROR: max must be positive", "color:#ff0000" );
      return( null );
    }
    if( !amt ) {
      console.log( "%cERROR: amt must be nonzero", "color:#ff0000" );
      return( null );
    }
    var hold = val + amt;
    while( 1 ) {
      if( hold < 0 ) {
        hold += max;
      } else if( hold >= max ) {
        hold -= max;
      } else {
        return( hold );
      }
    }
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

  static WhereLineSegsCross( pt1, pt2, pt3, pt4 ) {
    if( pt1.x > pt2.x ) {
      var hold = pt1;
      pt1 = pt2;
      pt2 = hold;
    }
    var a1 = ( pt2.y - pt1.y ) / ( pt2.x - pt1.x );	//slope
    var b1 = 1;
    if( pt2.x - pt1.x == 0 ) {	//Line one is vertical, change values to proper equation
      a1 = 1;
      b1 = 0;
    }
    var c1 = b1 * pt1.y - a1 * pt1.x;	//y-intercept

    if( pt3.x > pt4.x ) {
      var hold = pt3;
      pt3 = pt4;
      pt4 = hold;
    }
    var a2 = ( pt4.y - pt3.y ) / ( pt4.x - pt3.x );
    var b2 = 1;
    if( pt4.x - pt3.x == 0 ) {	//Line two is vertical, change values to proper equation
      a2 = 1;
      b2 = 0;
    }
    var c2 = b2 * pt3.y - a2 * pt3.x;

    var s1 = ( b1 * pt3.y - a1 * pt3.x - c1 ) * ( b1 * pt4.y - a1 * pt4.x - c1 );
    var s2 = ( b2 * pt1.y - a2 * pt1.x - c2 ) * ( b2 * pt2.y - a2 * pt2.x - c2 );

    if( s1 <= 0 && s2 <= 0 ) {
      var d = a1 * b2 - a2 * b1;
      if( d == 0 ) {
        return( null );
      }
      var dx = c1 * b2 - c2 * b1;
      var dy = a1 * c2 - a2 * c1;
      //console.log( pt1, pt2, pt3, pt4 );
      //console.log( "1: ", "a1:" + a1, "b1:" + b1, "c1:" + c1, "a2:" + a2, "b2:" + b2, "c2:" + c2 );
      //console.log( "2: ", "dx:" + dx, "dy:" + dy, "d:" + d, "dxld:" + dx / d, "dyld:" + dy / d );
      return( { x:-dx / d, y:dy / d } );
    }
    return( null );
  }

  static midpoint(pt1, pt2) {
      if (utils.cmpXYPairs(pt1, pt2)) {
          console.log("%cERROR: Must be different points.", "color:#ff0000ff");
          return null;
      }
      return {x:(pt1.x + pt2.x)/2, y:(pt1.y + pt2.y)/2};
  }
}

class world {
  constructor( path, start, icll, fps ) {
    this.unit = 25;
    this.path = path;
    this.start = start;
    this.icll = icll;
    this.fps = fps;
    this.history = null;
    this.time = 0;
    this.tTime = 10 * this.fps;
    this.mobiles = [ ];
    this.mods = [ ];
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
    this.a = -1;
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

  // Go to midpoint of current wall.
  GoToMidPoint(value) {
      if (this.a > -1) {
          var pt = utils.midpoint(this.w.path[this.a], this.w.path[this.a+1]);
          if (utils.cmpXYPairs(this, pt)) {
              this.on++;
          }
          else{
              this.DirectTo(pt);
          }
      }
      else {
          console.log( "%cERROR: Can't follow wall, if not on it", "color:#ff0000" );
          this.on++;
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

  GoToWallFromCenter( value ) {
    if( !this.target ) {
      for( var i = 0; i < this.w.path.length - 1; i++ ) {
        var hold = utils.WhereLineSegsCross(
          this.w.start,
          {
            x:this.w.start.x + 8 * this.w.unit * Math.cos( value[ 0 ] * Math.PI / 180 ),
            y:this.w.start.y - 8 * this.w.unit * Math.sin( value[ 0 ] * Math.PI / 180 )
          },
          this.w.path[ i ],
          this.w.path[ i + 1 ]
        );
        if( hold ) {
          this.a = i;
          //console.log( hold );
          this.target = hold;
          break;
        }
      }
    }
    if( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo( this.target );
    }
  }

  GoToWallFromTourist( value ) {
    if( !this.target ) {
      for( var i = 0; i < this.w.path.length - 1; i++ ) {
        var pts = {
          a:this,
          b:{
            x:this.x + 8 * this.w.unit * Math.cos( value[ 0 ] * Math.PI / 180 ),
            y:this.y - 8 * this.w.unit * Math.sin( value[ 0 ] * Math.PI / 180 )
          },
          c:this.w.path[ i ],
          d:this.w.path[ i + 1 ]
        }
        var hold = utils.WhereLineSegsCross( pts.a, pts.b, pts.c, pts.d );
        if( hold ) {
          if( Math.hypot( hold.y - this.y, hold.x - this.x ) > this.w.unit / this.w.fps ) {
            this.a = i;
            this.target = hold;
            break;
          }
        }
      }
      if( i == this.w.path.length - 1 ) {
        console.log( "No target found" );
      }
    }
    if( ( this.x == this.target.x ) && ( this.y == this.target.y ) ) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo( this.target );
    }
  }

  FollowWall( value ) {//Only follows path for now
    if( this.a > -1 ) {
      var dir = ( value[ 0 ] == "left" ) ? ( 1 ) : ( -1 );
      if( !this.target ) {	//Get target relative to location and time
	this.target = { a:null, t:-1 };
        if( dir > 0 ) {
          this.target.a = utils.AddAround( this.a, this.w.path.length, dir );
        } else {
          this.target.a = this.a;
        }
        if( value[ 1 ] ) {
          this.target.t = value[ 1 ] * this.w.unit;
        }
      }
      if( utils.cmpXYPairs( this, this.w.path[ this.target.a ] ) ) {	//Check for point update
        this.a = utils.AddAround( this.a, this.w.path.length, dir );
        if( dir > 0 ) {
          this.target.a = utils.AddAround( this.a, this.w.path.length, dir );
        } else {
          this.target.a = this.a;
        }
      }
      if( this.target.t == -1 ) {	//Is there no time limit
        this.DirectTo( this.w.path[ this.target.a ] );
      } else if( this.target.t > this.energy ) {	//If there is do I have plenty of time
        this.target.t -= this.energy;
        this.DirectTo( this.w.path[ this.target.a ] );
      } else {		//Do I have more energy than time
        if( Math.hypot( this.w.path[ this.target.a ].y - this.y, this.w.path[ this.target.a ].x - this.x ) < this.energy ) {	//Is the next vertex dist shorter than energy
          this.DirectTo( this.w.path[ this.target.a ] );
        } else {	//travel as far as the energy will take you to the next vert
          var holdX = ( this.target.t / this.energy ) * ( this.w.path[ this.target.a ].x - this.x );
          var holdY = ( this.target.t / this.energy ) * ( this.w.path[ this.target.a ].y - this.y );
          this.DirectTo( { x:holdX, y:holdY } );
          this.on++;
          this.target = null;
        }
      }
    } else {
      console.log( "%cERROR: Can't follow wall, if not on it", "color:#ff0000" );
      this.on++;
    }
  }
}





class exitFindMod {
  constructor( world, exit ) {
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
    this.pPath = this.genPath( );
    this.pts = null;
    this.count = -1;
  }

  genPath( ) {
    if( this.w.path[ 0 ].x != this.w.path[ this.w.path.length - 1 ].x ||
      this.w.path[ 0 ].y != this.w.path[ this.w.path.length - 1 ].y
    ) {
      this.w.path.push( this.w.path[ 0 ] );
    }
    var pPath = [ ];
    var curPt = null;
    for( var i = 0; i < this.w.path.length; i++ ) {
      var nextPt = this.w.path[ i ];
      if( curPt ) {
        var distance = Math.hypot( nextPt.y - curPt.y, nextPt.x - curPt.x );
        var totalSteps = Math.floor(distance / this.step ) + 1;
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

  Init( ) {
    this.pts = this.pPath.slice( );
    this.count = this.pPath.length;
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
