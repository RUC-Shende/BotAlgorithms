class Tourist {

  constructor (iclData) {
    this.visual = null;
    /** This holds all of what used to be global variables!  */
    this.iclData = iclData;
    /** The tourist's ID as an integer. */
    this.number = this.iclData.touristNum;
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
    this.x = this.iclData.center[0];
    /** Tourist's current y position. */
    this.y = this.iclData.center[1];
  }

  WallAtAngle(angle) {
    var unitAngle = (2 * Math.PI) / this.iclData.degrees;										//Angle segment length.
    var angleUnit = Math.floor(angle / unitAngle);											//Which length of segment.
    var unitPos = [Math.cos(angle), -Math.sin(angle)];											//End point on unit circle segment
    var vertOne = [Math.cos(angleUnit * unitAngle), -Math.sin(angleUnit * unitAngle)];							//Start point of segment
    var vertTwo = [Math.cos((angleUnit + 1) * unitAngle), -Math.sin((angleUnit + 1) * unitAngle)];					//End point of segment
    var a2 = vertOne[1] - vertTwo[1];
    var b2 = vertTwo[0] - vertOne[0];
    var c2 = vertOne[1] * vertTwo[0] - vertOne[0] * vertTwo[1];
    var wallLoc = [this.iclData.center[0] + this.iclData.unit2Px * (unitPos[0] * c2) / (unitPos[1] * b2 + unitPos[0] * a2),
                   this.iclData.center[1] + this.iclData.unit2Px * (unitPos[1] * c2) / (unitPos[1] * b2 + unitPos[0] * a2)];		//Cramer's Law
    return(wallLoc);
  }

  DirectTo(value) {
    var dLoc = [value[0] - this.x, value[1] - this.y];
    var dist = Math.hypot(dLoc[1], dLoc[0]);
    if (dist < this.allowance) {
      this.x = value[0];
      this.y = value[1];
      this.allowance -= dist;
    } else {
      var ang = Math.atan2(dLoc[1], dLoc[0]);
      this.x += Math.cos(ang) * this.allowance;
      this.y += Math.sin(ang) * this.allowance;
      this.allowance = 0;
    }
  }

  /**
  * Makes a robot go to the wall at a specific angle on the shape.
  *
  *@param {Tourist} who Robot to follow command
  *@param {integer} value Angle on the shape of the perimeter
  *
  *
  */
  GoToWallAtAngle(value) {
    if (value[0] != null) {
      this.a = value[0] * (Math.PI / 180);
    }
    var hold = this.WallAtAngle(this.a);
    if ((this.x == hold[0]) && (this.y == hold[1])) {
      this.on++;
    } else {
      this.DirectTo(hold);
    }
  }

  /**
  * The robot will go from the interior of the object to an angle on the perimeter.
  * Robot is required to be in the interior (not in perimeter) of the object.
  *
  *@param {Tourist} who Robot to follow command
  *@param {integer} = [0] value Angle on the shape of the perimeter
  *@param {double} = [1] value Percent Distance of a radius
  *
  *
  */
  GoOutAtAngle(value) {
    if (this.target == null) {
      var hold = [value[1] * Math.cos(value[0] * (Math.PI / 180)), value[1] * Math.sin(value[0] * (Math.PI / 180))];
      this.target = [this.x + hold[0], this.y + hold[1]];
    }
    if ((this.x == this.target[0]) && (this.y == this.target[1])) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo(this.target);
    }
  }

  /**
  * A robot will wait for a time in seconds, or indefinitely if no time is specified.
  *
  *@param {Tourist} who Robot to follow command
  *@param {integer} value Time to wait for in seconds.
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
  *@param {Tourist} who Robot to follow command
  *@param {Array} value value[0]: Direction string 'left' or 'right' - value[1]: time to follow wall in seconds.
  *
  *
  */
  FollowWall(value) {
    var dir = (value[0] == "left") ? (1) : (-1);
    var del = (1 / (this.iclData.fps * this.iclData.unit2Px)) * dir;
    if (value[1] == null || isNaN(value[1])) {
      this.a += del;
    } else {
      if (this.target == null) {
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
    }
    this.DirectTo(this.WallAtAngle(this.a));
  }

  /**
  * The robot will go to the center (origin) of the shape. Robot is not required to be at any specific position.
  *
  *@param {Tourist} who Robot to follow command.
  *@param value null
  *
  *
  */
  GoToCenter(value) {
    if ((this.x == this.iclData.center[0]) && (this.y == this.iclData.center[1])) {
      this.on++;
    } else {
      this.DirectTo(this.iclData.center);
    }
  }

  /**
  * A robot will wait at the average position of all robots NOT doing the WaitAverage command.
  *
  *@param {Tourist} who Robot to follow command
  *@param value null
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
  *
  *@param {Tourist} who Robot to follow command.
  *@param {Array} value value[0]: float, x position -- value[1]: float, y position
  */
  GoToPoint(value) {
    if ((this.x == value[0]) && (this.y == value[1])) {
      this.on++;
    } else {
      this.DirectTo(value);
    }
  }

  /**
  *
  * Robot will go to the exit at cartestian coordinates (x, y).
  * This is not the same as exitAngle.
  *
  *@param {Tourist} who Robot to follow command.
  *@param {Array} value value[0]: float, x position -- value[1]: float, y positions
  */
  GoToExit(value) {
    if ((this.x == this.iclData.fieldExit[0]) && (this.y == this.iclData.fieldExit[1])) {
      this.Wait([null]);
      if (this.iclData.allExitedLine == null) {
        this.iclData.AllAtExit();
      }
    } else {
      this.DirectTo(this.iclData.fieldExit);
    }
  }

  /**
  *
  * Robot will continuously move in the direction of the target, until it catches it.
  *
  *@param {Tourist} who Robot to follow command.
  *@param value null
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
  *
  * Robot will calculate the shortest to path to the closest targetable robot and
  * create a straight path to intercept it.
  *
  *@param {Tourist} who Robot to follow command.
  *@param value null
  */
  Intercept(value) {
    if (((this.target == null) || !this.target) && (!this.iclData.wireless)) {
      var closest = Infinity;
      for (var i = 0; i < this.iclData.touristNum; i++) {
        if (this.iclData.instruBinder[i][this.iclData.tourists[i].on][0] == "WaitAverage") {
          continue;
        }
        if ((!this.iclData.tourists[i].knows) && (this.iclData.tourists[i].hunted == null)) {
          for (var j = 0; j < 8 * this.iclData.unit2Px; j++) {
            if (this.iclData.time + j < this.iclData.timeMax) {
              var intercept = this.iclData.tourPoints[i][this.iclData.time + j];
              var botDist = Math.hypot(intercept.y - this.y, intercept.x - this.x);
              if ((Math.abs(j - botDist * this.iclData.fps / this.iclData.unit2Px) <= this.velocity / 2) && (botDist < closest)) {
                this.target = [i, intercept];
                closest = botDist;
              }
            }
          }
        }
      }
    }
    if (this.target == null) {
      this.GoToExit(value);
    } else {
      this.iclData.tourists[this.target[0]].hunted = this.number;
      var pointDist = Math.hypot(this.target[1].y - this.y, this.target[1].x - this.x);
      if (pointDist <= this.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) {
        this.iclData.exitAlert = this.iclData.tourists[this.target[0]].knows = true;
        this.target = null;
        this.iclData.exitAllow = pointDist;
      } else {
        this.DirectTo([this.target[1].x, this.target[1].y]);
      }
    }
  }
}
