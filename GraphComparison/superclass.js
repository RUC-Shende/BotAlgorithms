//////////----------Instantiate Variables----------//////////
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
    var unitAngle = (2 * Math.PI) / this.iclData.degrees;//Angle segment length.
    var angleUnit = Math.floor(angle / unitAngle);//Which length of segment.
    var unitPos = [this.iclData.unit2Px * Math.cos(angle), -this.iclData.unit2Px * Math.sin(angle)];//Point on unit circle
    var vertOne = [this.iclData.unit2Px * Math.cos(angleUnit * unitAngle), -this.iclData.unit2Px * Math.sin(angleUnit * unitAngle)];//Start point of segment
    var vertTwo = [this.iclData.unit2Px * Math.cos((angleUnit + 1) * unitAngle),
                  -this.iclData.unit2Px * Math.sin((angleUnit + 1) * unitAngle)];//End point of segment
    var a2 = vertOne[1] - vertTwo[1];
    var b2 = vertTwo[0] - vertOne[0];
    var c2 = vertOne[1] * vertTwo[0] - vertOne[0] * vertTwo[1];
    var wallLoc = [this.iclData.center[0] - (unitPos[0] * c2) / -(unitPos[1] * b2 + unitPos[0] * a2),
                   this.iclData.center[1] - (unitPos[1] * c2) / -(unitPos[1] * b2 + unitPos[0] * a2)];//Cramer's Law
    return(wallLoc);
  }

  DirectTo(value) {
    var dLoc = [value[0] - this.x, value[1] - this.y];
    var dist = Math.sqrt(Math.pow(dLoc[1], 2) + Math.pow(dLoc[0], 2));
    if (dist < this.velocity * this.iclData.unit2Px / this.iclData.fps) {
      this.x = value[0];
      this.y = value[1];
      this.allowance -= dist;
    } else {
      var ang = Math.atan2(dLoc[1], dLoc[0]);
      if (this.allowance < this.velocity * this.iclData.unit2Px / this.iclData.fps) {
        this.x = this.x + this.velocity * Math.cos(ang) * (this.allowance / (this.velocity * this.iclData.unit2Px / this.iclData.fps));
        this.y = this.y + this.velocity * Math.sin(ang) * (this.allowance / (this.velocity * this.iclData.unit2Px / this.iclData.fps));
      } else {
        this.x = this.x + (this.velocity * this.iclData.unit2Px / this.iclData.fps) * Math.cos(ang);
        this.y = this.y + (this.velocity * this.iclData.unit2Px / this.iclData.fps) * Math.sin(ang);
      }
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
    if (value[1] == null || isNaN(value[1])) {
      this.a += (1 / (this.iclData.fps * this.iclData.unit2Px)) * dir;
      this.DirectTo(this.WallAtAngle(this.a));
    } else {
      if (this.target == null) {
        this.target = this.a + value[1] * (Math.PI / 180) * dir;
      }
      var leftCondition = this.a + (1 / (this.iclData.fps * this.iclData.unit2Px)) * dir;
      var rightCondition = this.target;
      if (dir < 0) {
        leftCondition = this.target;
        rightCondition = this.a + (1 / (this.iclData.fps * this.iclData.unit2Px)) * dir;
      }
      if (leftCondition > rightCondition) {
        this.on++;
        this.a = this.target;
        this.target = null;
      } else {
        this.a += (1 / (this.iclData.fps * this.iclData.unit2Px)) * dir;
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
  PursueNonBeliever(value) {
    if ((this.target == null) && (!this.iclData.wireless)) {
      var closest = Infinity;
      for (var i = 0; i < this.iclData.touristNum; i++) {
        if ((!this.iclData.tourists[i].knows) && ((this.iclData.tourists[i].hunted == this.number) || (this.iclData.tourists[i].hunted == null))) {
          var eVec = [this.iclData.tourists[i].x - this.x, this.iclData.tourists[i].y - this.y];
          var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
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
      var bVec = [this.iclData.tourists[this.target].x - this.x, this.iclData.tourists[this.target].y - this.y];
      var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
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
  InterceptNonBeliever(value) {
    if (((this.target == null) || !this.target) && (!this.iclData.wireless)) {// this.target was being undefined, instead of null, so !this.target fixed it..... how do we explain this weird phenomenon
      var holdTime = 0;
      var closest = Infinity;
      for (var i = 0; i < this.iclData.touristNum; i++) {
        if ((!this.iclData.tourists[i].knows) && ((this.iclData.tourists[i].hunted == this.number) || (this.iclData.tourists[i].hunted == null))) {
          for (var j = 0; j < 8 * this.iclData.unit2Px; j++) {
            if (this.iclData.time + j < this.iclData.timeMax) {
              var intercept = this.iclData.tourPoints[i][this.iclData.time + j];
              var bVec = [intercept.x - this.x, intercept.y - this.y];
              var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
              if ((Math.abs(j * this.iclData.unit2Px / this.iclData.fps - botDist) <= this.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) && (botDist < closest)) {
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
      var pVec = [this.target[1].x - this.x, this.target[1].y - this.y];
      var pointDist = Math.sqrt(Math.pow(pVec[1], 2) + Math.pow(pVec[0], 2));
      if (pointDist <= this.velocity * this.iclData.unit2Px / this.iclData.fps) {
        this.iclData.exitAlert = this.iclData.tourists[this.target[0]].knows = true;
        this.iclData.exitAllow = pointDist;
      }
      this.DirectTo([this.target[1].x, this.target[1].y]);
      if (this.iclData.tourists[this.target[0]].knows) {
        this.target = null;
      }
    }
  }
}

class iclData{
    constructor(id, instruBinder, algorithmName){
        this.exitAlert = false;//Someone learned where the exit is.
        this.exitAllow = 0;//How far in a frame was the exit found.
        this.wireless = false;
        this.id = id;
        this.time = 0;
        this.timeDirect = 0;//After loading, play direction.
        this.fps = 60;
        this.timeMax = 10 * this.fps;
        this.timeSlider;

        this.projector;
        this.degrees = 3;
        this.unit2Px = 25; //YAY
        this.center = [this.unit2Px * 2, this.unit2Px * 2];
        this.exitAngle = 315;
        this.fieldExit = [this.center[0] + this.unit2Px * Math.cos(this.exitAngle * Math.PI / 180), this.center[1] - this.unit2Px * Math.sin(this.exitAngle * Math.PI / 180)];

        this.touristNum = 0;
        this.instruBinder = instruBinder;
        this.algorithmName = algorithmName;
        this.tourColors = [];

        this.fieldSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
        this.tourists = [];
        this.tourPoints = [];
        this.tourLine = [];

        this.graphSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
        this.graphDots = [];
        this.graphPoints = [];
        this.graphLine = [];
        this.exitFoundLine = null;
        this.allExitedLine = null;
        this.Start();
    }

    LoadAlgorithms(event) {
        javascript:void(0);
        var file = event.target.files[0]; //even though it only takes one file, the input type will still be a FileList.
        var fileName = document.getElementById('loadcommands').value;
        if (!fileName.includes('.icl')){
            alert('Please use a proper *.icl file to load your commands. If you think the file name is correct, then it might be corrupted.');
            return;
        }
        var fileReader = new FileReader();
        fileReader.onload = (function(file){
            var tempinstruBinder = [];
            var text = fileReader.result;
            var sText = text.split("\n");
            var numBots = sText.length - 1;
            for (i=0;i<numBots;i++) {
                tempinstruBinder.push([]);
                var exitProtocol = sText[i].split('#')[0];
                var commandProtocol = sText[i].split('#')[1];

                var exitComms = exitProtocol.split('*');
                var regularComms = commandProtocol.split('|');


                for (j=0;j<exitComms.length-1;j++){
                    var command = exitComms[j].split(' ')[0];
                    var args = [];
                    for (x=1;x<exitComms[j].split(' ').length;x++){

                        var val = exitComms[j].split(' ')[x];
                        var isnum = /^\d+$/.test(val);
                        if (isnum) {
                            val = parseInt(val);
                        }

                        args.push(val);
                    }

                    if (args.length == 0){
                        args.push(null);
                    }
                    tempinstruBinder[i].push([command, args]);
                }
                for (k=0;k<regularComms.length-1;k++){
                    var command = regularComms[k].split(' ')[0];
                    var args = [];
                    for (x=1;x<regularComms[k].split(' ').length;x++){

                        var val = regularComms[k].split(' ')[x];
                        var isnum = /^\d+$/.test(val);
                        if (isnum) {
                            val = parseInt(val);
                        }
                        else {
                        }

                        args.push(val);
                    }
                    if (args.length == 0){
                        args.push(null);
                    }
                    tempinstruBinder[i].push([command, args]);
                }
                this.instruBinder = tempinstruBinder.slice(0);
            }
            closeNav();
            this.wireless = true;
            Reset();
        });
        fileReader.readAsText(file);


    }

    Start() {
      this.degrees = 360;
      for (var i = 0; i < this.instruBinder.length; i++) {//Add bots, lines, and coordinate collectors.
        this.tourists.push(new Tourist(this));
        this.tourPoints.push([]);
        this.graphPoints.push([]);
        this.touristNum++;
      }

      for (var i = 0; i < this.tourists.length; i++){
          this.tourists[i].target = null;
      }
      while (this.time < this.timeMax) {//Load one run through.
        this.LoadAnim();
      }

      this.time = 0;

      for (var i = 0; i < this.touristNum; i++) {//Reset for next run through.
        this.tourists[i].on = 1;
        this.tourists[i].a = 0;
        this.tourists[i].x = this.center[0];
        this.tourists[i].y = this.center[1];

      }

      while (this.time < this.timeMax) {//Load one run through.
        this.AlterAnim();
      }
      this.time = this.timeMax;

      this.time = 0;

      for (var i = 0; i < this.touristNum; i++) {//Reset for next run through.
        this.tourists[i].on = 1;
        this.tourists[i].a = 0;
        this.tourists[i].x = this.center[0];
        this.tourists[i].y = this.center[1];

      }
    }

    LoadAnim() {
      for (var i = 0; i < this.tourists.length; i++) {
        this.LoadPoints(i);
        var who = this.tourists[i];
        who.allowance = who.velocity * this.unit2Px / this.fps;
        while (who.allowance > 0) {
          who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
        }
      }
      this.time++;
    }

    //Create points [x, y], so intercept function knows where a mobile agent will be.
    LoadPoints(i) {
      var dista = this.unit2Px * 4 - (Math.sqrt(Math.pow(this.fieldExit[0] - this.tourists[i].x, 2) + Math.pow(this.fieldExit[1] - this.tourists[i].y, 2)) * (20 / 25));
      this.tourPoints[i].push({x:this.tourists[i].x, y:this.tourists[i].y});
      this.graphPoints[i].push({x:(this.unit2Px * (10 / 25) + (this.time / this.timeMax) * (80 / 25) * this.unit2Px), y:(dista - this.unit2Px * (10 / 25))});
    }

    AlterAnim() {
        var saveBuffer = [];

        for (var i = 0; i < this.tourists.length; i++) {
          this.AlterLines(i);
          var who = this.tourists[i];
          saveBuffer.push([who.x, who.y, who.a, who.on]);
          who.allowance = who.velocity * this.unit2Px / this.fps;
          while (who.allowance > 0) {
            if (who.knows) {
              who[this.instruBinder[i][0][0]](this.instruBinder[i][0][1]);
            } else {
              who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
            }
          }
          if (!who.knows) {
            var eVec = [this.fieldExit[0] - saveBuffer[i][0], this.fieldExit[1] - saveBuffer[i][1]];
            var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
            if (exitDist <= who.velocity * this.unit2Px / (2 * this.fps)) {
              this.exitAlert = who.knows = true;
              this.exitAllow = exitDist;
            }
          }
        }
        if (this.exitAlert) {
          if (this.exitFoundLine == null) {
            var holdX = (this.unit2Px * (10 / 25) + ((this.time + this.exitAllow) / this.timeMax) * (80 / 25) * this.unit2Px);
            this.exitFoundLine = holdX;
          }
          for (var i = 0; i < this.tourists.length; i++) {//reset bots
            var who = this.tourists[i];
            who.x = saveBuffer[i][0];
            who.y = saveBuffer[i][1];
            who.a = saveBuffer[i][2];
            who.on = saveBuffer[i][3];
            if (this.wireless) {
              who.knows = true;
            }
            who.allowance = this.exitAllow;
            while (who.allowance > 0) {
              if (who.knew) {//Target already on exit procedures.
                who[this.instruBinder[i][0][0]](this.instruBinder[i][0][1]);
              } else {//Has not started exit procedures yet.
                who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
                if (who.knows) {//Clear target for bot if beginning exit procedures.
                  who.target = null;
                }
              }
            }
            who.allowance = (who.velocity * this.unit2Px / this.fps) - this.exitAllow;
            while (who.allowance > 0) {
              if (who.knows) {//Proceed with exit procedures.
                who[this.instruBinder[i][0][0]](this.instruBinder[i][0][1]);
                who.knew = true;
              } else {//Still does not know.
                who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
              }
            }
          }
          this.exitAlert = false;
        }
        this.time++;
    }

    //Create lines, and update graph dot positions, as well as recreating image of path.
    AlterLines(i) {
      var dista = this.unit2Px * 4 - Math.abs((Math.sqrt(Math.pow(this.fieldExit[0] - this.tourists[i].x, 2) + Math.pow(this.fieldExit[1] - this.tourists[i].y, 2)) * (20 / 25)));
      this.tourPoints[i][this.time] = {x:this.tourists[i].x, y:this.tourists[i].y};
      this.graphPoints[i][this.time] = {x:(this.unit2Px * (10 / 25) + (this.time / this.timeMax) * (80 / 25) * this.unit2Px), y:(dista - this.unit2Px * (10 / 25))};
    }

    PlayAnim() {
      if (this.timeDirect != 0) {
        this.time += this.timeDirect;
        if (this.time < 0) {
          this.time = 0;
          this.timeDirect = 0;
      } else if (this.time > this.timeMax - 1) {
          this.time = this.timeMax;
          this.timeDirect = 0;
        }
        //UpdateVisuals();
        //d3.select("#timeSlide").attr("x", (time / timeMax) * (31 / 8) * unit2Px);
        //d3.select("#timeText").text("Time: " + Math.floor((100 * time) / fps) / 100);
        //d3.select("#frameText").text("Frame: " + Math.floor(time));
      }
    }

    AllAtExit() {
      for (var j = 0; j < this.touristNum; j++) {//Check every mobile agent
        if ((this.tourists[j].x != this.fieldExit[0]) || (this.tourists[j].y != this.fieldExit[1])) {//check if not at exit
          return;
        }
      }
      var holdX = (this.unit2Px * (10 / 25) + ((this.time + this.exitAllow) / this.timeMax) * (80 / 25) * this.unit2Px);
      /*
      this.allExitedLine = graphSVG.select("#overLay").append("line").attr("x1", holdX).attr("y1", 4 * this.unit2Px - this.unit2Px * (10 / 25))
                      .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * this.unit2Px)
                      .style("stroke-opacity", 0.5);
      */
      //console.log(Math.floor((100 * this.time) / this.fps) / 100);
    }

}

class iclVisual {
    constructor(iclData){
        this.iclData = iclData;
        this.tourColors = [];

        this.fieldSVG = d3.select("#anim" + this.iclData.id);
        this.tourLine = iclData.tourLine;

        this.graphSVG = d3.select("#graph" + this.iclData.id);
        this.graphLine = iclData.graphLine;

        this.exitFoundLine = iclData.exitFoundLine;
        this.allExitedLine = iclData.allExitedLine;

        this.lineFx = d3.line().x((d) => {return(d.x);}).y((d) => {return(d.y);});


        this.Start();
    }

    RandomColor() {
      var RGB = ["00", "00", "00"];
      RGB[0] = Math.floor(Math.random() * 256).toString(16);
      RGB[1] = Math.floor(Math.random() * 256).toString(16);
      RGB[2] = Math.floor(Math.random() * 256).toString(16);
      for (var j = 0; j < 3; j++) {if (RGB[j].length == 1) {RGB[j] = '0' + RGB[j];}}//Add a zero in front of single digit hex.
      return('#' + RGB[0] + RGB[1] + RGB[2]);
    }

    Start() {

        this.fieldSVG.select("#backGround").attr("height", "100%").attr("width", "100%");
        this.fieldSVG.select("#lines").attr("height", "100%").attr("width", "100%");
        this.fieldSVG.select("#bots").attr("height", "100%").attr("width", "100%");
        this.fieldSVG.select("#overLay").attr("height", "100%").attr("width", "100%");
        this.fieldSVG.select("#excess").attr("height", "100%").attr("width", "100%");

        this.graphSVG.select("#backGround").attr("height", "100%").attr("width", "100%");
        this.graphSVG.select("#lines").attr("height", "100%").attr("width", "100%");
        this.graphSVG.select("#bots").attr("height", "100%").attr("width", "100%");
        this.graphSVG.select("#overLay").attr("height", "100%").attr("width", "100%");
        this.graphSVG.select("#excess").attr("height", "100%").attr("width", "100%");
        this.graphSVG.attr("display", "none");

        //var tmp = this;
        //this.fieldSVG.on("mousemove", this.ChoosExit.call(this, tmp)).on("click", exitChosen.call(this, tmp));

        this.Load();
    }

    Load() {

      this.LoadField();
      var t = this.iclData;
      d3.select("#exit").attr("cx", t.fieldExit[0]).attr("cy", t.fieldExit[1]);
      this.LoadGraph();
      for (var i = 0; i < this.iclData.instruBinder.length; i++) {//Add bots, lines, and coordinate collectors.
        this.tourColors.push(this.RandomColor());
        this.iclData.tourists[i].visual = this.fieldSVG.select("#bots").append("circle").attr("cx", this.iclData.unit2Px * (10 / 25))
                       .attr("cy", this.iclData.unit2Px * 4 * (20 / 25) - this.iclData.unit2Px * (10 / 25)).attr("r", this.iclData.unit2Px / 16)
                       .style("fill", this.tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * this.iclData.unit2Px);
        this.iclData.graphDots.push(this.graphSVG.select("#bots").append("circle").attr("cx", this.iclData.unit2Px * (10 / 25))
                       .attr("cy", this.iclData.unit2Px * 4 * (20 / 25) - this.iclData.unit2Px * (10 / 25)).attr("r", this.iclData.unit2Px / 16)
                       .style("fill", this.tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * this.iclData.unit2Px));
      }
      this.UpdateVisuals();

      //dataBox = fieldSVG.select("#overLay").append("svg").attr("width", 2 * unit2Px).attr("height", unit2Px).attr("visibility", "hidden");
      for (var i = 0; i < this.iclData.touristNum; i++) {//Reset for next run through.

        this.tourLine[i] = this.fieldSVG.select("#lines").append("path").attr("d", this.lineFx(this.iclData.tourPoints[i]))
                      .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");

        this.graphLine[i] = this.graphSVG.select("#lines").append("path").attr("d", this.lineFx(this.iclData.graphPoints[i]))
                       .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
      }
    }

    LoadField() {
      var wire = (this.iclData.wireless) ? " Wireless" : " Non-Wireless";
      d3.select("#Desc" + this.iclData.id).text(this.iclData.algorithmName + wire);
      if (this.iclData.degrees == 13) {//If circle, change to 360 degrees.
        thi.iclData.degrees = 360;
      }
      var hold = "M75,50";
      for (var i = 1; i <= this.iclData.degrees; i++) {//Create the shape.
        var holdAng = ((360 / this.iclData.degrees) * i) * (Math.PI / 180);
        hold += 'L' + (50 + 25 * Math.cos(holdAng)) + ',' + (50 - 25 * Math.sin(holdAng));
      }
      this.fieldSVG.select("#overLay").append("path").attr("d", hold).style("fill", "none").style("stroke", "#000000").style("stroke-width", ".25");
      this.fieldSVG.select("#overLay").append("circle").attr("id", "exit").attr("cx", 50).attr("cy", 50).attr("r", .5)
              .style("fill", "#ffffff").style("stroke", "#000000").style("stroke-width", .1);
      if (this.iclData.degrees == 2) {//Add two distance numbers if a line.
        this.fieldSVG.select("#backGround").append("text").attr("x", 3.1 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .attr("class", "left").style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("1");
        this.fieldSVG.select("#backGround").append("text").attr("x", .9 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .attr("class", "right").style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("-1");
      } else {//Add two reference angles if not a line.
        this.fieldSVG.select("#backGround").append("text").attr("x", 3.1 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .style("text-anchor", "start").style("font-size", this.iclData.unit2Px / 5).text("0");
        this.fieldSVG.select("#backGround").append("text").attr("x", this.iclData.center[0]).attr("y", .9 * this.iclData.unit2Px)
                .style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("90");
      }
    }

    LoadGraph() {
      d3.select("#timeSlide").call(d3.drag().on("start", this.SSlide).on("drag", this.MSlide).on("end", this.ESlide));
      var fo = this.graphSVG.append('foreignObject').attr('x', this.iclData.unit2Px * (1/25)).attr('y', this.iclData.unit2Px * (18/25)).attr('width', this.iclData.unit2Px * 1.5).attr('height', this.iclData.unit2Px * (18/25));

      for (var i = 0; i < 3; i++) {//Create y-axis labels.
        this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (90 / 25) - i * this.iclData.unit2Px * (20 / 25))
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
      }
      for (var i = 0; i < 11; i++) {//Create x-axis labels.
        this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (10 / 25) + i * this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (94 / 25))
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
      }
    }

    cleanUp(){
        this.tourColors = [];

        this.tourLine = [];

        this.graphLine = [];

        this.exitFoundLine = null;
        this.allExitedLine = null;
    }

    ChoosExit() {

      this.iclData.exitAngle = Math.atan2(d3.mouse(this)[0] - d3.select("#center").attr("cx"), d3.mouse(this)[1] - d3.select("#center").attr("cy")) - (Math.PI / 2);
      if (this.iclData.exitAngle < 0) {this.iclData.exitAngle += 2 * Math.PI;}
      d3.select("#exitText").text("Left-Click to place exit at ~" + Math.floor(this.iclData.exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
      if (this.iclData.degrees == 2) {//Choose exit relative to mouse position.
        this.iclData.fieldExit = [d3.event.x, this.iclData.center[1]];
      } else {//Choose exit relative to shape.
        this.iclData.fieldExit = this.iclData.tourists[0].WallAtAngle(this.iclData.exitAngle);
      }
      d3.select("#exit").attr("cx", this.iclData.fieldExit[0]).attr("cy", this.iclData.fieldExit[1]);
    }

    exitChosen() {
      d3.select(".exitText").remove();
      this.fieldSVG.on("mousemove", null).on("click", null);
      this.projector = setInterval(this.AlterAnim, 1000 / this.fps);
      this.Load();
    }

    UpdateVisuals() {
        for (var i = 0; i < this.iclData.touristNum; i++) {
            var who = this.iclData.tourists[i];
            if (this.iclData.time >= 600){
                break; //OwO - it works.
            }
            who.visual.attr("cx", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].y);
            this.iclData.graphDots[i].attr("cx", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].y);
        }
    }
}

function Interval(){
    for (var i = 0; i < 2; i++){
        if (superlist[i] != null){
            superlist[i].iclData.PlayAnim();
            superlist[i].UpdateVisuals();
        }
    }
}

function editAnims(s){
    for (var i = 0; i < 2; i++){
        if (superlist[i] != null){
            if (s == "play"){
                superlist[i].iclData.timeDirect = 1;
            }
            else if (s == "rewind"){
                superlist[i].iclData.timeDirect = -1;
            }
            else if (s == "slow"){
                superlist[i].iclData.timeDirect /= 2;
            }
        }
    }
}

function showAnims(s){
    for (var i = 0; i < 2; i++){
        if (s == "graph"){
            superlist[i].fieldSVG.attr('display', 'none');
            superlist[i].graphSVG.attr('display', 'inline-block');
        }
        else {
            superlist[i].graphSVG.attr('display', 'none');
            superlist[i].fieldSVG.attr('display', 'inline-block');
        }
    }
}

function changeInstructions(n){
    var e = document.getElementById("alg" + n);
    var s = e.options[e.selectedIndex].value;
    console.log(s, n);
    switch(s) {
        case 'A':
            algorithmName = "Algorithm A ";
            instruBinder = [
                        [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                        [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                    ];
            break;
        case 'B':
            algorithmName = "Algorithm B ";
            instruBinder = [
                                 [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            break;
        case 'C':
            instruBinder = [
                             [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [superlist[n].iclData.center[0] + 15, superlist[n].iclData.center[1]+10]], ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1]+10]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                             [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [superlist[n].iclData.center[0] - 15, superlist[n].iclData.center[1]+10]], ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1]+10]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                           ];
            algorithmName = "Algorithm C ";
            break;
        case 'P1':
            instruBinder = [
                             [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]],
                             [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 114]], ["GoToWallAtAngle", [347]], ["FollowWall", ["right", 53]], ["Wait", [null]]]
                           ];
            algorithmName = "Algorithm Priority 1 ";
            break;
        case 'P2':
            instruBinder = [
                              [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [160]], ["FollowWall", ["left", 20]], ["GoToPoint", [superlist[n].iclData.center[0] + 10, superlist[n].iclData.center[1] + 10]], ["GoToWallAtAngle", [320]], ["Wait", [null]]],
                              [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [160]], ["FollowWall", ["right"]]],
                              [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]]
                          ];
            algorithmName = "Algorithm Priority 2 ";
        break;

    }

    superlist[n].fieldSVG.select("#lines").selectAll("path").remove();
    superlist[n].fieldSVG.select("#bots").selectAll("circle").remove();

    superlist[n].graphSVG.select("#lines").selectAll("path").remove();
    superlist[n].graphSVG.select("#bots").selectAll("circle").remove();

    superlist[1-n].fieldSVG.select("#lines").selectAll("path").remove();
    superlist[1-n].fieldSVG.select("#bots").selectAll("circle").remove();

    superlist[1-n].graphSVG.select("#lines").selectAll("path").remove();
    superlist[1-n].graphSVG.select("#bots").selectAll("circle").remove()


    var one = new iclData(n, instruBinder, algorithmName);

    var secondInstru = superlist[1-n].iclData.instruBinder;
    var secondAlgName = superlist[1-n].iclData.algorithmName;
    var two = new iclData(1-n, secondInstru, secondAlgName);


    superlist[n] = new iclVisual(one);
    superlist[1-n] = new iclVisual(two);

}

var superlist = [null, null];
var theMotor = setInterval(Interval, 1000 / 60);

var instruBinder = [
                     [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]],
                     [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 114]], ["GoToWallAtAngle", [347]], ["FollowWall", ["right", 53]], ["Wait", [null]]]
                   ];
var leftSide = new iclData(0, instruBinder, "Priority 1");
superlist[0] = new iclVisual(leftSide);

instruBinder = [
                            [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
var rightSide = new iclData(1, instruBinder, "Algorithm A");
superlist[1] = new iclVisual(rightSide);
