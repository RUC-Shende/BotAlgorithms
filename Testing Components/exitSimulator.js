var center = [380,380];
var unit2Px = 190;

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
        this.unit2Px = 180; //YAY
        this.center = [this.unit2Px * 2, this.unit2Px * 2];
        this.exitAngle = 345;
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

        this.distanceFromServant = [];

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


      for (var i = 0; i < this.tourPoints[1].length; i++) {
          this.distanceFromServant.push(this.unit2Px * 4 - (Math.sqrt(Math.pow(this.tourPoints[2][i].x - this.tourPoints[1][i].x, 2) + Math.pow(this.tourPoints[2][i].y - this.tourPoints[1][i].y, 2)) * (20 / 25)));
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

    //Create points {x:x', y:y'}, so intercept function knows where a mobile agent will be.
    LoadPoints(i) {
      var dista = this.unit2Px * 4 - (Math.sqrt(Math.pow(this.fieldExit[0] - this.tourists[i].x, 2) + Math.pow(this.fieldExit[1] - this.tourists[i].y, 2)) * (20 / 25));
      this.tourPoints[i].push({x:this.tourists[i].x, y:this.tourists[i].y});
      this.graphPoints[i].push({x:(this.unit2Px * (10 / 25) + (this.time / this.timeMax) * (80 / 25) * this.unit2Px), y:(dista - this.unit2Px * (10 / 25))});
    }

    AlterAnim() {
        var saveBuffer = [];
        var closest2exit = Infinity;
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
            var exitDist = Math.hypot(this.fieldExit[1] - saveBuffer[i][1], this.fieldExit[0] - saveBuffer[i][0]);
            if (exitDist <= who.velocity * this.unit2Px / (2 * this.fps) && (exitDist < closest2exit)) {
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
      var dista = this.unit2Px * 4 - (Math.hypot(this.fieldExit[0] - this.tourists[i].x, this.fieldExit[1] - this.tourists[i].y) * (20 / 25));
      this.tourPoints[i][this.time] = {x:this.tourists[i].x, y:this.tourists[i].y};
      this.graphPoints[i][this.time] = {x:(this.unit2Px * ((10 / 25) + (this.time / this.timeMax) * (80 / 25))), y:(dista - this.unit2Px * (10 / 25))};
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


var instruBinder = [
    [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]],
    [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 36.5]],
        ["GoToWallAtAngle", [350]], ["FollowWall", ["right"]]],
    [["Intercept", [null, false]], ["GoToWallAtAngle", [143.5]], ["FollowWall", ["right"]]]
]

var graph = new iclData(0, instruBinder, "2Q1S");


for (var i = 0; i < graph.distanceFromServant.length; i++){
    graph.distanceFromServant[i] = 1 -  (graph.distanceFromServant[i] / 720);
}

console.log(graph.distanceFromServant);


// 2. Use the margin convention practice
var margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = window.innerWidth - margin.left - margin.right // Use the window's width
  , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

// The number of datapoints
var n = 600;

// 5. X scale will use the index of our data
var xScale = d3.scaleLinear()
    .domain([0, n-1]) // input
    .range([0, width]); // output

// 6. Y scale will use the randomly generate number
var yScale = d3.scaleLinear()
    .domain([0, 1]) // input
    .range([height, 0]); // output

// 7. d3's line generator
var line = d3.line()
    .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
    .curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
var dataset = [];
for (var i = 0; i < graph.distanceFromServant.length; i++){
    dataset.push({"y" : graph.distanceFromServant[i]});
}

// 1. Add the SVG to the page and employ #2
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
svg.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line); // 11. Calls the line generator

// 12. Appends a circle for each datapoint
/*
svg.selectAll(".dot")
    .data(dataset)
  .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d, i) { return xScale(i) })
    .attr("cy", function(d) { return yScale(d.y) })
    .attr("r", 5)
      .on("mouseover", function(a, b, c) {
  			console.log(a)
        this.attr('class', 'focus')
		})
      .on("mouseout", function() {  })
*/
//       .on("mousemove", mousemove);

//   var focus = svg.append("g")
//       .attr("class", "focus")
//       .style("display", "none");

//   focus.append("circle")
//       .attr("r", 4.5);

//   focus.append("text")
//       .attr("x", 9)
//       .attr("dy", ".35em");

//   svg.append("rect")
//       .attr("class", "overlay")
//       .attr("width", width)
//       .attr("height", height)
//       .on("mouseover", function() { focus.style("display", null); })
//       .on("mouseout", function() { focus.style("display", "none"); })
//       .on("mousemove", mousemove);

//   function mousemove() {
//     var x0 = x.invert(d3.mouse(this)[0]),
//         i = bisectDate(data, x0, 1),
//         d0 = data[i - 1],
//         d1 = data[i],
//         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
//     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
//     focus.select("text").text(d);
//   }
