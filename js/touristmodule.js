'use strict';
/**
* @param {iclData} iclData Represents the data of the overall simulation, robots' tourlines and graphlines.
* @param {boolean} p True if bot is Priority Agents, false otherwise.
*/
class Tourist {

  constructor (iclData, x, y, num, icl, p) {
    /** Reference to a visual DOM element */
    this.visual = null;
    /** This holds all of what used to be global variables!  */
    this.iclData = iclData;
    /** The tourist's ID as an integer. */
    this.number = num;
    /** The tourist has learned of the exit on this frame. */
    this.knows = false;
    /** The tourist has known of the exit for more than one frame. */
    this.knew = false;
    /** Tourist's current goal according to its command. Can be a point on the shape or another tourist. */
    this.target = null;
    /** The tourist that is currently pursuing this one. */
    this.hunted = null;
    /** Speed of the tourist. */
    this.velocity = 1;
    /** How far the tourist can move in one frame. */
    this.allowance = 0;
    /** This tourist's current instruction function. */
    this.on = 1;
    /** Tourist's current angle. */
    this.a = 0;
    /** Tourist's current x position. */
    this.x = x;
    /** Tourist's current y position. */
    this.y = y;
    /** Whether or not the robot is a Priority Agent. */
    this.priority = p;
    /** Whether or not the robot is at the exit. */
    this.atExit = false;
    this.icl = icl;
  }

  /**
  *Calculates the wall position on the shape, given an angle.
  *
  * @param {float} angle Used to calculate the wall position of the shape.
  *
  * @return {Array} Array with x,y position of the wall relative to the shape.
  */
  wallAtAngle( deg, angle ) {
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

  /**
  *Send the robot to its next location (next frame) based on its current instruction or allowance.
  *
  * @param {Array} value [x,y] coordinates of the robot's next calculated location.
  *
  */
  DirectTo(value) {
    var dLoc = {x:value.x - this.x, y:value.y - this.y};
    var dist = Math.hypot(dLoc.y, dLoc.x);
    if (dist < this.allowance) {
      this.x = value.x;
      this.y = value.y;
      this.allowance -= dist;
    } else {
      var ang = Math.atan2(dLoc.y, dLoc.x);
      this.x += Math.cos(ang) * this.allowance;
      this.y += Math.sin(ang) * this.allowance;
      this.allowance = 0;
    }
  }

  wait( value ) {
    if( value[ 0 ] ) {
      if( this.target == null ) {
        this.target = value[ 0 ] * this.iclData.unit2Px;
      }
      if ( this.target < this.allowance ) {
        this.allowance -= this.target;
        this.on++;
        this.target = null;
      } else {
        this.target -= this.allowance;
        this.allowance = 0;
      }
    } else {
      this.allowance = 0;
    }
  }

  GoToMidPoint(value) {
      if (this.a > -1) {
          var pt = utils.midpoint(this.iclData.path[this.a], this.iclData.path[this.a+1]);
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
    if ( ( this.x == this.iclData.center.x ) && ( this.y == this.iclData.center.y ) ) {
      this.on++;
    } else {
      this.DirectTo( this.iclData.center );
    }
  }

  GoToWallFromCenter( value ) {
    if( !this.target ) {
      for( var i = 0; i < this.iclData.path.length - 1; i++ ) {
        var hold = utils.WhereLineSegsCross(
          this.iclData.center,
          {
            x:this.iclData.center.x + 8 * this.iclData.unit2Px * Math.cos( value[ 0 ] * Math.PI / 180 ),
            y:this.iclData.center.y - 8 * this.iclData.unit2Px * Math.sin( value[ 0 ] * Math.PI / 180 )
          },
          this.iclData.path[ i ],
          this.iclData.path[ i + 1 ]
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
        for( var i = 0; i < this.iclData.path.length - 1; i++ ) {
          var pts = {
            a:this,
            b:{
              x:this.x + 8 * this.iclData.unit2Px * Math.cos( value[ 0 ] * Math.PI / 180 ),
              y:this.y - 8 * this.iclData.unit2Px * Math.sin( value[ 0 ] * Math.PI / 180 )
            },
            c:this.iclData.path[ i ],
            d:this.iclData.path[ i + 1 ]
          }
          var hold = utils.WhereLineSegsCross( pts.a, pts.b, pts.c, pts.d );
          if( hold ) {
            if( Math.hypot( hold.y - this.y, hold.x - this.x ) > this.iclData.unit2Px / this.iclData.fps ) {
              this.a = i;
              this.target = hold;
              break;
            }
          }
        }
        if( i == this.iclData.path.length - 1 ) {
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

    FollowWall( value ) {
      if( this.a > -1 ) {
        var dir = ( value[ 0 ] == "left" ) ? ( 1 ) : ( -1 );
        if( !this.target ) {						//Create time and wall target
  	this.target = { a:null, t:-1 };
          if( dir > 0 ) {
            this.target.a = utils.AddAround( this.a, this.iclData.path.length - 1, dir );
          } else {
            this.target.a = this.a;
          }
          if( value[ 1 ] ) {						//Activate timer if given
            this.target.t = value[ 1 ] * this.iclData.unit2Px;
          }
        }
        if( utils.cmpXYPairs( this, this.iclData.path[ this.target.a ] ) ) {	//Update wall position and target
          this.a = this.target.a;
          this.target.a = utils.AddAround( this.a, this.iclData.path.length - 1, dir );
        }
        if( this.target.t == -1 ) {					//Endlessly follow wall
          this.DirectTo( this.iclData.path[ this.target.a ] );
        } else {
          var dis = utils.distance( this, this.iclData.path[ this.target.a ] );
          if( dis <= this.target.t ) {
              				//Reaches wall target before timer runs out
            var hold = this.allowance;
            //this.target.t -= this.allowance;
            this.DirectTo( this.iclData.path[ this.target.a ] );
            this.target.t -= hold - this.allowance;
          } else {							//Aim towards where the timer runs out
            var holdX = this.x + ( this.target.t / dis ) * ( this.iclData.path[ this.target.a ].x - this.x );
            var holdY = this.y + ( this.target.t / dis ) * ( this.iclData.path[ this.target.a ].y - this.y );
            this.DirectTo( { x:holdX, y:holdY } );

            if( utils.cmpXYPairs( this, { x:holdX, y:holdY } ) ) {	//Timer ended
              this.on++;
              this.target = null;
            }
          }
        }
      } else {								//Error
        console.log( "%cERROR: Can't follow wall, if not on it", "color:#ff0000" );
        this.on++;
      }
    }

/*
    FollowWall( value ) {//Only follows path for now
      if( this.a > -1 ) {
        var dir = ( value[ 0 ] == "left" ) ? ( 1 ) : ( -1 );
        if( !this.target ) {	//Get target relative to location and time

  	this.target = { a:null, t:-1 };
          if( dir > 0 ) {
            this.target.a = utils.AddAround( this.a, this.iclData.path.length, dir );
          } else {
            this.target.a = this.a;
          }
          if( value[ 1 ] ) {
            this.target.t = value[ 1 ] * this.iclData.unit2Px;
          }
        }
        if( utils.cmpXYPairs( this, this.iclData.path[ this.target.a ] ) ) {	//Check for point update
          this.a = utils.AddAround( this.a, this.iclData.path.length, dir );
          if( dir > 0 ) {
            this.target.a = utils.AddAround( this.a, this.iclData.path.length, dir );
          } else {
            this.target.a = this.a;
          }
        }
        if( this.target.t == -1 ) {	//Is there no time limit
          this.DirectTo( this.iclData.path[ this.target.a ] );
      } else if( this.target.t > this.allowance ) {	//If there is do I have plenty of time
          this.target.t -= this.allowance;
          this.DirectTo( this.iclData.path[ this.target.a ] );
        } else {		//Do I have more energy than time
          if( Math.hypot( this.iclData.path[ this.target.a ].y - this.y, this.iclData.path[ this.target.a ].x - this.x ) < this.allowance ) {	//Is the next vertex dist shorter than energy
            this.DirectTo( this.iclData.path[ this.target.a ] );
          } else {	//travel as far as the energy will take you to the next vert
            var holdX = ( this.target.t / this.allowance ) * ( this.iclData.path[ this.target.a ].x - this.x );
            var holdY = ( this.target.t / this.allowance ) * ( this.iclData.path[ this.target.a ].y - this.y );
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
    */

  /**
  * The robot will go to the center (origin) of the shape. Robot is not required to be at any specific position.
  *
  *@param {null} value null
  *
  *
  */
  GoToCenter(value) {
    if ((this.x == this.iclData.center.x) && (this.y == this.iclData.center.y)) {
      this.on++;
    } else {
      this.DirectTo(this.iclData.center);
    }
  }

  /**
  *
  * The robot will go to a point on the shape defined by cartesian coordinates (x, y)
  * Based on original center point defined in this.iclData (before visual scaling)
  *
  *@param {Array} value [float x position,  float y position]
  */
  GoToPoint(value) {
    if ((this.x == value.x) && (this.y == value.y)) {
      this.on++;
    } else {
      this.DirectTo(value);
    }
  }

  /**
  * Robot will go to the exit at cartestian coordinates (x, y).
  * This is not the same as exitAngle.
  *
  *@param {Array} value [float x position, float y position]
  */
  GoToExit(value) {
    if ((this.x == this.iclData.fieldExit.x) && (this.y == this.iclData.fieldExit.y)) {
      this.wait([]);
    } else {
      this.DirectTo(this.iclData.fieldExit);
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
          var pt = utils.midpoint(this.iclData.path[this.a], this.iclData.path[this.a+1]);
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

  /**
  * Robot will calculate the shortest to path to the closest targetable robot and
  * create a straight path to intercept it.
  * If there exist Priority Agents, the robot following this command will then target the
  * closest of them.
  * In case we ever use face-to-face priority algorithms.
  *
  *@param {null} value null
  */
  Intercept(value) {

    if ((this.target == null) && (!this.iclData.wireless)) {
      var holdTime = 0;
      var closest = Infinity;
      outer:
      for (var i = 0; i < this.iclData.instruBinder.length; i++) {
          console.log(i);
        if ((!this.iclData.tourists[i].knows)) {
          inner:
          for (var j = 0; j < 8 * this.iclData.unit2Px; j++) {
            if (this.iclData.time + j < this.iclData.timeMax) {
              var intercept = this.iclData.mods[0].premo[i][this.iclData.time + j - 2];
              var bVec = [intercept.x - this.x, intercept.y - this.y];
              var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
              if ((Math.abs(j * this.iclData.unit2Px / this.iclData.fps - botDist) <= this.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) && (botDist < closest)) {
                this.target = [i, intercept];
                console.log(this.target);
                if (value && value[0] == i){
                    console.log("DEBUG: Found Priority");
                    break outer;
                }
                closest = botDist;
              }
            }
          }
        }
      }
    }

    if (this.priority || this.target == null) {
      this.GoToExit(this.iclData.fieldExit);
    } else {
      //this.target[0].hunted = this.number;
      console.log(this.target);
      var pVec = [this.target[1].x - this.x, this.target[1].y - this.y];
      var pointDist = Math.sqrt(Math.pow(pVec[1], 2) + Math.pow(pVec[0], 2));
      //var pointDist = Math.hypot(this.target[1].y - this.y, this.target[1].x - this.x);
      if (pointDist <= this.velocity * this.iclData.unit2Px / (this.iclData.fps)) {
        this.iclData.exitAlert = this.iclData.tourists[this.target[0]].knows = true;
        this.iclData.exitFoundFrame = this.iclData.time;
        this.iclData.exitAllow = pointDist;
      }
      this.DirectTo({x:this.target[1].x, y:this.target[1].y});
      if (this.iclData.tourists[this.target[0]].knows) {
          console.log(this.target[0])
        this.iclData.tourists[this.target[0]].on = this.iclData.tourists[this.target[0]].icl.length - 1;
        this.iclData.tourists[this.target[0]].target = null;
        this.target = null;
        this.GoToExit(this.iclData.fieldExit);
      }
    }
  }
}
