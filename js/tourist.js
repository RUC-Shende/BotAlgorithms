/**
* @param {Circle} visual Represents the visual related to the bot.
*/
class Tourist {
  constructor (visual, p) {
    this.visual = visual;
    /** The tourist's ID as an integer. */
    this.number = touristNum;
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
    this.x = center[0];
    /** Tourist's current y position. */
    this.y = center[1];

    this.priority = p;
    this.atExit = false;
  }

  WallAtAngle(angle) {
    var unitAngle = (2 * Math.PI) / degrees;//Angle segment length.
    var angleUnit = Math.floor(angle / unitAngle);//Which length of segment.
    var unitPos = [unit2Px * Math.cos(angle), -unit2Px * Math.sin(angle)];//Point on unit circle
    var vertOne = [unit2Px * Math.cos(angleUnit * unitAngle), -unit2Px * Math.sin(angleUnit * unitAngle)];//Start point of segment
    var vertTwo = [unit2Px * Math.cos((angleUnit + 1) * unitAngle),
                  -unit2Px * Math.sin((angleUnit + 1) * unitAngle)];//End point of segment
    var a2 = vertOne[1] - vertTwo[1];
    var b2 = vertTwo[0] - vertOne[0];
    var c2 = vertOne[1] * vertTwo[0] - vertOne[0] * vertTwo[1];
    var wallLoc = [center[0] - (unitPos[0] * c2) / -(unitPos[1] * b2 + unitPos[0] * a2),
                   center[1] - (unitPos[1] * c2) / -(unitPos[1] * b2 + unitPos[0] * a2)];//Cramer's Law
    return(wallLoc);
  }

  DirectTo(value) {
    var dLoc = [value[0] - this.x, value[1] - this.y];
    var dist = Math.sqrt(Math.pow(dLoc[1], 2) + Math.pow(dLoc[0], 2));
    if (dist < this.velocity * unit2Px / fps) {
      this.x = value[0];
      this.y = value[1];
      this.allowance -= dist;
    } else {
      var ang = Math.atan2(dLoc[1], dLoc[0]);
      if (this.allowance < this.velocity * unit2Px / fps) {
        this.x = this.x + this.velocity * Math.cos(ang) * (this.allowance / (this.velocity * unit2Px / fps));
        this.y = this.y + this.velocity * Math.sin(ang) * (this.allowance / (this.velocity * unit2Px / fps));
      } else {
        this.x = this.x + (this.velocity * unit2Px / fps) * Math.cos(ang);
        this.y = this.y + (this.velocity * unit2Px / fps) * Math.sin(ang);
      }
      this.allowance = 0;
    }
    if (this.x == fieldExit[0] && this.y == fieldExit[1] && !this.atExit) {

        console.log("Robot " + this.number + " exits at " + (Math.floor((100 * time) / fps) / 100) + (this.priority ? " (Priority)" : ""));
        this.atExit = true;
        /*
        graphSVG.select(".overLay").append("line").attr("x1", graphDots[this.number].attr("cx")).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                      .attr("x2", graphDots[this.number].attr("cx")).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                      .style("stroke-opacity", 0.5);
        */
        if (this.priority){
            AllAtExit();
        }
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
  *@param {integer} value Angle on the shape of the perimeter
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
        this.target = time + value[0] * fps;
      }
      if (time >= this.target) {
        this.on++;
        this.allowance -= this.velocity * (unit2Px / fps) - (time - this.target);
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
    if (value[1] == null || isNaN(value[1])) {
      this.a += (1 / (fps * unit2Px)) * dir;
      this.DirectTo(this.WallAtAngle(this.a));
    } else {
      if (this.target == null) {
        this.target = this.a + value[1] * (Math.PI / 180) * dir;
      }
      var leftCondition = this.a + (1 / (fps * unit2Px)) * dir;
      var rightCondition = this.target;
      if (dir < 0) {
        leftCondition = this.target;
        rightCondition = this.a + (1 / (fps * unit2Px)) * dir;
      }
      if (leftCondition > rightCondition) {
        this.on++;
        this.a = this.target;
        this.target = null;
      } else {
        this.a += (1 / (fps * unit2Px)) * dir;
      }
      this.DirectTo(this.WallAtAngle(this.a));
    }
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
    if ((this.x == center[0]) && (this.y == center[1])) {
      this.on++;
    } else {
      this.DirectTo(center);
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
    for (var i = 0; i < tourists.length; i++) {
      if (instruBinder[i][tourists[i].on][0] != "WaitAverage") {
        totalNum++;
        sumPosition[0] += tourists[i].x;
        sumPosition[1] += tourists[i].y;
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
    if ((this.x == fieldExit[0]) && (this.y == fieldExit[1])) {
      this.Wait([null]);
      this.atExit = true;
      if (allExitedLine == null) {
        AllAtExit();
      }
    } else {
      this.DirectTo(fieldExit);
      //console.log(Math.floor((100 * time) / fps) / 100);
    }
    //console.log(Math.floor((100 * time) / fps) / 100);
  }

  /**
  *
  * Robot will continuously move in the direction of the target, until it catches it.
  *
  *@param {Tourist} who Robot to follow command.
  *@param value null
  */
  Pursue(value) {
    if ((this.target == null) && (!wireless)) {
      var closest = Infinity;
      for (var i = 0; i < touristNum; i++) {
        if ((!tourists[i].knows) && ((tourists[i].hunted == this.number) || (tourists[i].hunted == null))) {
          var eVec = [tourists[i].x - this.x, tourists[i].y - this.y];
          var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
          if (exitDist < closest) {
            this.target = i;
            closest = exitDist;
          }
        }
      }
    }
    if (this.priority || this.target == null) {
      this.GoToExit(value);
    } else {
      tourists[this.target].hunted = this.number;
      var bVec = [tourists[this.target].x - this.x, tourists[this.target].y - this.y];
      var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
      if (botDist <= this.velocity * unit2Px / fps) {
        exitAlert = tourists[this.target].knows = true;
        exitFoundFrame = time;
        exitAllow = botDist;
      }
      this.DirectTo([tourists[this.target].x, tourists[this.target].y]);
      if (tourists[this.target].knows) {
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
    if (((this.target == null) || !this.target) && (!wireless)) {// this.target was being undefined, instead of null, so !this.target fixed it..... how do we explain this weird phenomenon
      var holdTime = 0;
      var closest = Infinity;
      outer:
      for (var i = 0; i < touristNum; i++) {
        if ((!tourists[i].knows) && ((tourists[i].hunted == this.number) || (tourists[i].hunted == null))) {
          inner:
          for (var j = 0; j < 2 * unit2Px; j++) {
            if (time + j < timeMax) {
              var intercept = tourPoints[i][time + j];
              var bVec = [intercept.x - this.x, intercept.y - this.y];
              var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
              if ((Math.abs(j * unit2Px / fps - botDist) <= this.velocity * unit2Px / (2 * fps)) && (botDist < closest)) {
                this.target = [i, intercept];
                if (value && value[0] == i){
                    console.log("found priorityy");
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
      this.GoToExit(value);

    } else {
      tourists[this.target[0]].hunted = this.number;
      var pVec = [this.target[1].x - this.x, this.target[1].y - this.y];
      var pointDist = Math.sqrt(Math.pow(pVec[1], 2) + Math.pow(pVec[0], 2));
      if (pointDist <= this.velocity * unit2Px / fps) {
        exitAlert = tourists[this.target[0]].knows = true;
        exitFoundFrame = time;
        //console.log(Math.floor((100 * time) / fps) / 100);
        exitAllow = pointDist;
      }
      this.DirectTo([this.target[1].x, this.target[1].y]);
      if (tourists[this.target[0]].knows) {
        this.target = null;
      }
    }
  }

  SetVelocity(value){
      if (value){
          this.velocity = value[0];
      }
  }

}
