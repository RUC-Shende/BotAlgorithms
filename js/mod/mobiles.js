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

  /**
  * Makes a robot go to the wall at a specific angle on the shape.
  *
  *@param {integer} value Angle on the shape of the perimeter
  *
  *
  */
  GoToWallAtAngle(value) {
    if ( this.target == null) {
      this.target = this.wallAtAngle( this.iclData.degrees, value[0]);
      this.target.x = this.iclData.center.x + this.iclData.unit2Px * this.target.x;
      this.target.y = this.iclData.center.y + this.iclData.unit2Px * this.target.y;
    }
    if ((this.x == this.target.x) && (this.y == this.target.y)) {
        this.a = value.d;
      this.on++;
    } else {
      this.DirectTo(this.target);
    }
  }

  /**
  * The robot will go from the interior of the object to an angle on the perimeter.
  * Robot is required to be in the interior (not in perimeter) of the object.
  *
  *@param {Array} value [angle on the shape of the perimeter, percent distance of a radius]
  *
  *
  */
  GoOutAtAngle(value) {
    if (this.target == null) {
      var angHold = value.d * (Math.PI / 180);
      this.target = {
          x:this.x + value.r * this.iclData.unit2Px * Math.cos(angHold),
          y:this.y - value.r * this.iclData.unit2Px * Math.sin(angHold)
      };
    }
    if ((this.x == this.target.x) && (this.y == this.target.y)) {
      this.a = value.d;
      this.on++;
      this.target = null;
    } else {
      this.DirectTo(this.target);
    }
  }

  /**
  * A robot will wait for a time in seconds, or indefinitely if no time is specified.
  *
  *@param {float} value Time to wait for in seconds.
  *
  *
  */
  Wait(value) {
    if (value[0] == null) {
      this.allowance = 0;
    } else {
      if (this.target == null) {
        this.target = this.iclData.time + value[0] * this.iclData.fps;
      }
      if (this.iclData.time >= this.target) {
        this.on++;
        this.allowance -= this.velocity * (this.iclData.unit2Px / this.iclData.fps) - (this.iclData.time - this.target);
        this.target = null;
      } else {
        this.allowance = 0;
      }
    }
  }

  /**
  * A robot will follow the perimeter for a certain number of seconds, or indefinitely if no time specified.
  * value[0] Will default to 'right' if no direction specified.
  * Robot is required to be at a position on the perimeter.
  *
  *@param {Array} value [Direction string 'left' or 'right', <Optional>time to follow wall in seconds]
  *
  *
  */
  FollowWall(value) {
    var dir = (value[0] == "left") ? (1) : (-1);
    var del = (this.iclData.unit2Px / this.iclData.fps) * dir;
    if (value[1]) {
        if (this.target == null){
            this.target = this.a + value[1] * (Math.PI / 180) * dir;
        }
        var leftCondition = this.a + del;
        var rightCondition = this.target;
        if (dir < 0) {
          rightCondition = leftCondition;
          leftCondition = this.target;
        }
        if (leftCondition > rightCondition) {
          this.on++;
          this.a = this.target;
          this.target = null;
        } else {
          this.a += del;
        }
    } else {
      this.a += del;
    }
    var hold = this.wallAtAngle(360, this.a);
    hold.x = this.iclData.center.x + this.iclData.unit2Px * hold.x;
    hold.y = this.iclData.center.y + this.iclData.unit2Px * hold.y;
    this.DirectTo(hold);
  }

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
  * A robot will wait at the average position of all robots NOT doing the WaitAverage command.
  *
  *@param {null} value null
  *
  *
  */
  WaitAverage(value) {
    var sumPosition = [0, 0];
    var totalNum = 0;
    for (var i = 0; i < this.iclData.tourists.length; i++) {
      if (this.iclData.instruBinder[i][this.iclData.tourists[i].on][0] != "WaitAverage") {
        totalNum++;
        sumPosition[0] += this.iclData.tourists[i].x;
        sumPosition[1] += this.iclData.tourists[i].y;
      }
    }
    sumPosition[0] /= totalNum;
    sumPosition[1] /= totalNum;
    if ((this.x == sumPosition[0]) && (this.y == sumPosition[1])) {
      this.allowance = 0;
    } else {
      this.DirectTo(sumPosition);
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

  /**
   * Robot will continuously move in the direction of the closest target, until it catches it.
   *
   *@param {null} value null
   */
  Pursue(value) {
      if ((this.target == null) && (!this.iclData.wireless)) {
          var closest = Infinity;
          for (var i = 0; i < this.iclData.touristNum; i++) {
              if (this.iclData.instruBinder[i][this.iclData.tourists[i].on][0] == "WaitAverage") {
                  continue;
              }
              if ((!this.iclData.tourists[i].knows) && (this.iclData.tourists[i].hunted == null)) {
                  var exitDist = Math.hypot(this.iclData.tourists[i].y - this.y, this.iclData.tourists[i].x - this.x);
                  if (exitDist < closest) {
                      this.target = i;
                      closest = exitDist;
                  }
              }
          }
      }
      if (this.target == null) {
          this.GoToExit(value);
      } else {
          this.iclData.tourists[this.target].hunted = this.number;
          var botDist = hypot(this.iclData.tourists[this.target].y - this.y, this.iclData.tourists[this.target].x - this.x);
          if (botDist <= this.velocity * this.iclData.unit2Px / this.iclData.fps) {
              this.iclData.exitAlert = this.iclData.tourists[this.target].knows = true;
              this.iclData.exitAllow = botDist;
          }
          this.DirectTo([this.iclData.tourists[this.target].x, this.iclData.tourists[this.target].y]);
          if (this.iclData.tourists[this.target].knows) {
              this.target = null;
          }
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
      console.log("inside intercept function......")
    if (((this.target == null) || !this.target) && (!this.iclData.wireless)) {
        console.log("in intercept if statment");
      var holdTime = 0;
      var closest = Infinity;
      outer:
      for (var i = 0; i < this.iclData.instruBinder.length; i++) {
          console.log(i);
        if ((!this.iclData.tourists[i].knows) && ((this.iclData.tourists[i].hunted == this.number) || (this.iclData.tourists[i].hunted == null))) {
          inner:
          console.log("INNER");
          for (var j = 0; j < 8 * this.iclData.unit2Px; j++) {
            if (this.iclData.time + j < this.iclData.timeMax) {
                console.log(this.iclData.history[i]);
              var intercept = this.iclData.mods[0].premo[i][this.iclData.time + j - 2];
              var bVec = [intercept.x - this.x, intercept.y - this.y];
              var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
              //var botDist = Math.hypot(intercept.y - this.y, intercept.x - this.x);
              if ((Math.abs(j * this.iclData.unit2Px / this.iclData.fps - botDist) <= this.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) && (botDist < closest)) {
                this.target = [i, intercept];
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
      this.iclData.tourists[this.target[0]].hunted = this.number;
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
        this.target = null;
        this.GoToExit(this.iclData.fieldExit);
      }
    }
  }
}
