'use strict';
/**
* @param {iclData} iclData Represents the data of the overall simulation, robots' tourlines and graphlines.
* @param {integer} x Tourist start x position, before visual scaling.
* @param {integer} y Tourist start y position, before visual scaling.
* @param {integer} num Tourist id number.
* @param {Array} icl Instruction checklist. Index 0 is info such as priority status and color.
* @param {boolean} p True if bot is Priority Agent, false otherwise.
*/
class Tourist {

  constructor (iclData, x, y, num, icl, p) {
    /** This holds all of what used to be global variables!  */
    this.iclData = iclData;
    /** The tourist's ID as an integer. */
    this.number = num;
    /** The tourist has learned of the exit on this frame. */

    this.knows = false;
    /** The tourist has known of the exit for more than one frame. */

    this.target = null;
    /** The tourist that is currently pursuing this one. */
    this.hunted = null;
    /** Speed of the tourist. */
    this.velocity = 1;
    /** How far the tourist can move in one frame. */
    this.allowance = 0;
    /** This tourist's current instruction function. */
    this.on = 1;
    /** Tourist's current angle or wall number in relation to shape. */
    this.a = 0;
    /** Tourist's current x position. */
    this.x = x;
    /** Tourist's current y position. */
    this.y = y;
    /** Whether or not the robot is a Priority Agent. */
    this.priority = p;
    /** Instruction checklist. Index 0 is info such as priority and color. */
    this.icl = icl;
  }

  /**
  *Send the robot to its next location (next frame) based on its current instruction or allowance.
  *
  * @param {Object} value {x,y} coordinates of the robot's next calculated location.
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

  /**
  * Instruct the robot to wait for a certain time <value>, or indefinitely.
  *
  * @param {Array} value [time] to wait for. If not specified or value[0] is null, wait indefinitely.
  */
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

  /**
  *Go to the point which is the midpoint of the current wall of the shape.
  *Current wall is defined by Tourist.a
  *
  *@param {Array} value value[0] is null. Done out of consistency with other functions.
  */
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
  *Given an Object with a .wall attribute, go to the midpoint of that wall number.
  *
  *@param {Object} value object with at the very least, a valid wall number on the shape.
  */
  GoToMidPointFromInterior(value) {
      this.a = value[0].wall;
      this.GoToMidPoint(value);
  }

  /**
  * Go to the iclData.center point.
  *
  *@param {Array} value [null].
  */
  GoToCenter( value ) {
    if ( ( this.x == this.iclData.center.x ) && ( this.y == this.iclData.center.y ) ) {
      this.on++;
    } else {
      this.DirectTo( this.iclData.center );
    }
  }

  /**
  *Instructions to go the wall at angle relative to the center point.
  *
  *@param {Array} value [angle] to go to wall at.
  */
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

    /**
    *Instructions to go the wall at angle relative to the tourists current point.
    *Useful in concave shape situations where there might be more than one wall reachable with the same given angle.
    *
    *@param {Array} value [angle] to go to wall at.
    */
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
    /**
    *Instructions to follow wall and search for a certain time or indefinitely.
    *
    *@param {Array} value [direction, time]. If time is null, follow forever.
    */
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

  /**
  *
  * The robot will go to a point on the shape defined by cartesian coordinates (x, y)
  * Based on original center point defined in this.iclData (before visual scaling)
  *
  *@param {Object} value {x:float x position,  y:float y position}
  */
  GoToPoint(value) {
    if ((this.x == value.x) && (this.y == value.y)) {
      this.on++;
    } else {
      this.DirectTo(value);
    }
  }

  /**
  * Robot will go to the exit at iclData.fieldExit.
  * This is not the same as exitAngle.
  *
  *@param {Array} value null
  */
  GoToExit(value) {
    if ((this.x == this.knows.x) && (this.y == this.knows.y)) {
      this.wait([]);
    } else {
      this.DirectTo(this.knows);
    }
  }

  /**
  * Robot will calculate the shortest to path to the closest targetable robot and
  * create a straight path to intercept it.
  * If there exist Priority Agents, the robot following this command will then target the
  * closest of them.
  * In case we ever use face-to-face priority algorithms.
  *
  *@param {null} value usually [null], however sometimes it is [priority robot id] in case of priority f2f algorithms.
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
              var intercept = this.iclData.hiscopy[i][this.iclData.time + j - 2];
              var bVec = [intercept.x - this.x, intercept.y - this.y];
              var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
              if ((Math.abs(j * this.iclData.unit2Px / this.iclData.fps - botDist) <= this.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) && (botDist < closest)) {
                this.target = [i, intercept];
                if (value && value[0] == i){
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
      this.GoToExit(this.knows);
    } else {
      var pointDist = Math.hypot(this.target[1].y - this.y, this.target[1].x - this.x);
      if (pointDist <= this.velocity * this.iclData.unit2Px / (this.iclData.fps)) {
        this.iclData.tourists[this.target[0]].knows = this.knows;
        this.iclData.exitFoundFrame = this.iclData.time;
      }
      this.DirectTo({x:this.target[1].x, y:this.target[1].y});
      if (this.iclData.tourists[this.target[0]].knows) {
          console.log(this.target[0])
        this.iclData.tourists[this.target[0]].on = this.iclData.tourists[this.target[0]].icl.length - 1;
        this.iclData.tourists[this.target[0]].target = null;
        this.target = null;
        this.GoToExit(this.knows);
      }
    }
  }
}
