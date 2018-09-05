//////////----------Instantiate Variables----------//////////
var shapes = ["Vertex", "Line", "Triangle", "Square", "Pentagon", "Hexagon", "Heptagon",
              "Octagon", "Nonagon", "Decagon", "Undecagon", "Dodecagon", "Circle"];

var exitAlert = false;//Someone learned where the exit is.
var exitAllow = 0;//How far in a frame was the exit found.
var wireless = false;

var time = 0;
var timeDirect = 0;//After loading, play direction.
var fps = 60;
var timeMax = 10 * fps;
var timeSlider;

var projector;
var degrees = 3;
var unit2Px = ((window.innerHeight <= window.innerWidth) ?
                    (window.innerHeight) : (window.innerWidth)) / 5;
var center = [unit2Px * 2, unit2Px * 2];
var exitAngle = 0;
var fieldExit = [center[0] + unit2Px, center[1]];

var dataBox;

var touristNum = 0;
var instruBinder = [
                    /*[["Intercept", [null]], ["Wait", []]],
                    [["Intercept", [null]], ["GoToPoint", [center[0] + .25, center[1] + .25]], ["Wait", []]],
                    [["Intercept", [null]], ["GoOutAtAngle", [135, .25]], ["Wait", []]],
                    [["Intercept", [null]], ["WaitAverage", []]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [270]], ["FollowWall", ["left"]]],
                    [["Intercept", [null]], ["Wait", [1]], ["GoToWallAtAngle", [0]], ["Wait", []]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 30]], ["Wait", []]]*/
                   ];
var numBot = 360;
for (var i = 0; i < numBot; i++) {
  instruBinder.push([["Intercept", [null]], ["GoToWallAtAngle", [i * 360 / numBot]], ["FollowWall", ["right"]]]);
}

var tourColors = [];

var tourists = [];
var tourPoints = [];

var graphSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
var graphPoints = [];

var exitFoundLine = null;
var allExitedLine = null;

//////////--------Instantiate Call Functions--------//////////
//Drag function, updates tourists and graph dots relative to lines
function SSlide() {
  d3.select(this).style("fill", "orange");
  d3.select(this).classed("active", true);
}

function MSlide() {
  var mousePos = d3.event.x;
  if (mousePos < 0) {
    mousePos = 0;
  } else if (mousePos > (31 / 8) * unit2Px) {
    mousePos = (31 / 8) * unit2Px;
  }
  d3.select(this).attr("x", mousePos);
  time = Math.round((mousePos / ((31 / 8) * unit2Px)) * timeMax);
  timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
  frameText.text("Frame: " + Math.floor(time));
  UpdateVisuals();
}

function ESlide() {
  d3.select(this).style("fill", "#888888");
  d3.select(this).classed("active", false);
}

//////////---------- Instantiate Classes ----------//////////
//Data holder, and loader update

/**
* Represents a robot on the field searching for the exit.
*
*
*/
class Tourist {
  constructor () {
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
  }

  /**
  * Makes a robot go to the wall at a specific angle on the shape.
  *
  *@param {float} value Angle on the shape of the perimeter
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
  * The robot will go from its location to some polar coordinate relative to itself.
  *
  *@param {float} value Angle in degrees
  *@param {float} value Distance measured in radiuses
  *
  *
  */
  GoOutAtAngle(value) {
    if (this.target == null) {
      var hold = [value[1] * Math.cos(value[0] * (Math.PI / 180)), value[1] * -Math.sin(value[0] * (Math.PI / 180))];
      this.target = [this.x + unit2Px * hold[0], this.y + unit2Px * hold[1]];
    }
    if ((this.x == this.target[0]) && (this.y == this.target[1])) {
      this.on++;
      this.target = null;
    } else {
      this.DirectTo(this.target);
    }
  }

  /**
  * The robot will go one 2d vector relative to itself.
  *
  *@param {Array} value value[0]: float, x position -- value[1]: float, y position => Both measured in Radiuses
  *
  *
  */
  GoOutAtVector(value) {
    if (this.target == null) {
      this.target = [this.x + unit2Px * value[0], this.y + unit2Px * value[1]];
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
  *@param {float} value Time to wait for in seconds.
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
  *@param {Array} value value[0]: Direction string 'left' or 'right' - value[1]: time to follow wall in seconds.
  *
  *
  */
  FollowWall(value) {
    var dir = (value[0] == "left") ? (1) : (-1);
    if (value[1] == null) {
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
  *@param {Array} value value[0]: float, x position -- value[1]: float, y position
  *
  *
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
  *@param {Array} value value[0]: float, x position -- value[1]: float, y positions
  *
  *
  */
  GoToExit(value) {
    if ((this.x == fieldExit[0]) && (this.y == fieldExit[1])) {
      this.Wait([null]);
      if (allExitedLine == null) {
        AllAtExit();
      }
    } else {
      this.DirectTo(fieldExit);
    }
  }

  /**
  *
  * Robot will continuously move in the direction of the target, until it catches it.
  *
  *@param {integer} value robot number
  *
  *
  */
  Pursue(value) {
    if ((this.target == null) && (!wireless)) {
      if (value[0] == null) {
        var closest = Infinity;
        for (var i = 0; i < touristNum; i++) {
          if ((!tourists[i].knows) && (tourists[i].hunted == null)) {
            var eVec = [tourists[i].x - this.x, tourists[i].y - this.y];
            var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
            if (exitDist < closest) {
              this.target = i;
              closest = exitDist;
            }
          }
        }
      } else {
        this.target = value[0];
      }
    }
    if (this.target == null) {
      this.GoToExit(value);
    } else {
      tourists[this.target].hunted = this.number;
      var bVec = [tourists[this.target].x - this.x, tourists[this.target].y - this.y];
      var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
      if (botDist <= this.velocity * unit2Px / fps) {
        exitAlert = tourists[this.target].knows = true;
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
  *@param {integer} value robot number
  *
  *
  */
  Intercept(value) {
    if ((this.target == null) && (!wireless)) {
      if (value[0] == null) {
        var holdTime = 0;
        var closest = Infinity;
        for (var i = 0; i < touristNum; i++) {
          if ((!tourists[i].knows) && (tourists[i].hunted == null)) {
            for (var j = 0; j < 2 * unit2Px; j++) {
              if (time + j < timeMax) {
                var intercept = tourPoints[i][time + j];
                var bVec = [intercept.x - this.x, intercept.y - this.y];
                var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
                if ((Math.abs(j * unit2Px / fps - botDist) <= this.velocity * unit2Px / (2 * fps)) && (botDist < closest)) {
                  this.target = [i, intercept];
                  closest = botDist;
                }
              }
            }
          }
        }
      } else {
        this.target = value[0];
      }
    }
    if (this.target == null) {
      this.GoToExit(value);
    } else {
      tourists[this.target[0]].hunted = this.number;
      var pVec = [this.target[1].x - this.x, this.target[1].y - this.y];
      var pointDist = Math.sqrt(Math.pow(pVec[1], 2) + Math.pow(pVec[0], 2));
      if (pointDist <= this.velocity * unit2Px / fps) {
        exitAlert = tourists[this.target[0]].knows = true;
        exitAllow = pointDist;
      }
      this.DirectTo([this.target[1].x, this.target[1].y]);
      if (tourists[this.target[0]].knows) {
        this.target = null;
      }
    }
  }
}

//////////----------Instantiate Functions----------//////////
//Mostly self contained, only edits exit location outside of function.
function Start() {
  var holdG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
              .style("float", "left").style("border", "1px solid black");
  holdG.append("text").attr("x", 2 * unit2Px).attr("y", unit2Px)
       .style("text-anchor", "middle").style("font-size", unit2Px * (5 / 25)).text("What room shape?");
  var holdT = holdG.append("text").attr("class", "numbah").attr("x", 2 * unit2Px).attr("y", unit2Px * (40 / 25))
              .style("text-anchor", "middle").style("font-size", unit2Px * (10 / 25)).text(shapes[degrees - 1]);
  holdG.append("path").attr("d", 'M' + unit2Px * (80 / 25) + ',' + unit2Px * (36 / 25) + 'L' + unit2Px * (75 / 25) + ',' + unit2Px * (31 / 25)
                               + 'L' + unit2Px * (75 / 25) + ',' + unit2Px * (41 / 25) + 'L' + unit2Px * (80 / 25) + ',' + unit2Px * (36 / 25))
       .on("click", () => {degrees++;if (degrees > 13) {degrees = 13;}holdT.text(shapes[degrees - 1]);});
  holdG.append("path").attr("d", 'M' + unit2Px * (20 / 25) + ',' + unit2Px * (36 / 25) + 'L' + unit2Px * (25 / 25) + ',' + unit2Px * (31 / 25)
                               + 'L' + unit2Px * (25 / 25) + ',' + unit2Px * (41 / 25) + 'L' + unit2Px * (20 / 25) + ',' + unit2Px * (36 / 25))
       .on("click", () => {degrees--;if (degrees < 1) {degrees = 1;}holdT.text(shapes[degrees - 1]);});
  holdG.append("text").attr("x", 2 * unit2Px).attr("y", unit2Px * (60 / 25))
       .style("text-anchor", "middle").style("font-size", unit2Px * (5 / 25)).text("Press this when done")
       .on("click", () => {
         if (degrees == 1) {
           holdT.text("Boring");
         } else if (degrees == 2) {
           holdT.text("Not done");
         } else {
           holdG.remove();
           Load();
         }
       });
}

//Load visuals and bots.(Might be changed to its own script later, to split visual and functional)
function Load() {
  var fieldDiv = d3.select("body").append("div").attr("position", "relative");
  fieldDiv.append("canvas").style("position", "absolute").style("left", "0").style("top", "0").style("z-index", "0")
           .attr("id", "aLv0").attr("width", unit2Px * 4).attr("height", unit2Px * 4);
  fieldDiv.append("canvas").style("position", "absolute").style("left", "0").style("top", "0").style("z-index", "1")
           .attr("id", "aLv1").attr("width", unit2Px * 4).attr("height", unit2Px * 4);
  fieldDiv.append("canvas").style("position", "absolute").style("left", "0").style("top", "0").style("z-index", "2")
           .attr("id", "aLv2").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
           .on("mousemove", ChoosExit).on("click", exitChosen);
  var graphDiv = d3.select("body").append("div").attr("position", "relative");
  graphDiv.append("canvas").style("position", "absolute").style("left", 4 * unit2Px + 10).style("top", "0").style("z-index", "0")
           .attr("id", "gLv0").attr("width", unit2Px * 4).attr("height", unit2Px * 4);
  graphDiv.append("canvas").style("position", "absolute").style("left", 4 * unit2Px + 10).style("top", "0").style("z-index", "1")
           .attr("id", "gLv1").attr("width", unit2Px * 4).attr("height", unit2Px * 4);
  graphSVG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
               .style("position", "absolute").style("left", 4 * unit2Px + 10).style("top", "0").style("z-index", "2");
  
  drawALv0();
  if (degrees == 13) {//If circle, change to 360 degrees.
    degrees = 360;
  }
  drawALv2();

  var classes = ["backGround", "lines", "bots", "overLay"];
  for (var i = 0; i < classes.length; i++) {//Create layers
    graphSVG.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4).attr("class", classes[i]);
  }
  LoadGraph();
  for (var i = 0; i < instruBinder.length; i++) {//Add bots, lines, and coordinate collectors.
    tourColors.push(RandomColor());
    tourists.push(new Tourist());
    tourPoints.push([]);
    graphPoints.push([]);
    touristNum++;
  }
  while (time < timeMax) {//Load one run through.
    LoadAnim();
  }
  time = 0;
  for (var i = 0; i < touristNum; i++) {//Reset for next run through.
    tourists[i].on = 1;
    tourists[i].a = 0;
    tourists[i].x = center[0];
    tourists[i].y = center[1];
  }
}

function LoadGraph() {
  timeText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .4)
             .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "start").text("Time: 0");
  frameText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .7)
              .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "start").text("Frame: 0");
  graphSVG.select(".backGround").append("rect").attr("width", 4 * unit2Px).attr("height", unit2Px / 8)
          .attr("fill-opacity", 0.0).style("stroke", "#000000");
  timeSlider = graphSVG.select(".backGround").append("rect").attr("width", unit2Px / 8).attr("height", unit2Px / 8)
               .style("fill", "#888888")
               .call(d3.drag().on("start", SSlide).on("drag", MSlide).on("end", ESlide));
  var fo = graphSVG.append('foreignObject').attr('x', unit2Px * (1/25)).attr('y', unit2Px * (18/25)).attr('width', unit2Px * 1.5).attr('height', unit2Px * (18/25));
  var timeButtons = fo.append('xhtml:div');
  timeButtons.append('input').attr('type', 'submit').property('value', ' ▶▶ Play')
             .attr('class', 'reveal play').on('click', () => {timeDirect++;});
  timeButtons.append('input')
            .attr('class', 'reveal stop').attr('type', 'submit')
            .property('value', ' ■ Stop').on('click', () => {timeDirect = 0;});
  timeButtons.append('input')
            .attr('class', 'reveal rewind').attr('type', 'submit')
            .property('value', '◀◀ Rewind').on('click', () => {timeDirect--;});
  timeButtons.append('input')
            .attr('class', 'reveal slow').attr('type', 'submit')
            .property('value', '◀ Slow ▶').on('click', () => {if (timeDirect == 0) {timeDirect += 0.5;} else {timeDirect/=2;}});
  graphSVG.select(".backGround").append("path").attr("d", 'M' + unit2Px * (10 / 25) + ',' + unit2Px * (50 / 25)
                                                        + 'L' + unit2Px * (10 / 25) + ',' + unit2Px * (90 / 25)
                                                        + 'L' + unit2Px * (90 / 25) + ',' + unit2Px * (90 / 25))
          .style("fill", "none").style("stroke", "#000000");
  for (var i = 0; i < 3; i++) {//Create y-axis labels.
    graphSVG.select(".backGround").append("text").attr("x", unit2Px * (8 / 25))
            .attr("y", unit2Px * (90 / 25) - i * unit2Px * (20 / 25))
            .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
  }
  for (var i = 0; i < 11; i++) {//Create x-axis labels.
    graphSVG.select(".backGround").append("text").attr("x", unit2Px * (10 / 25) + i * unit2Px * (8 / 25))
            .attr("y", unit2Px * (94 / 25))
            .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
  }
  graphSVG.select(".backGround").append("text").attr("x", unit2Px * (5 / 25)).attr("y", unit2Px * (70 / 25)).attr("text-anchor", "middle")
          .attr("transform", "rotate(-90," + unit2Px * (5 / 25) + ',' + unit2Px * (70 / 25) + ')')
          .style("font-size", unit2Px * (5 / 25)).style("fill", "#000000").text("Distance from Exit");
  graphSVG.select(".backGround").append("text").attr("x", unit2Px * 2).attr("y", unit2Px * (395 / 100)).attr("text-anchor", "middle")
          .style("font-size", unit2Px * (5 / 25)).style("fill", "#000000").text("Time");
}

//Create a random hexadecimal color
function RandomColor() {
  var RGB = ["00", "00", "00"];
  RGB[0] = Math.floor(Math.random() * 256).toString(16);
  RGB[1] = Math.floor(Math.random() * 256).toString(16);
  RGB[2] = Math.floor(Math.random() * 256).toString(16);
  for (j = 0; j < 3; j++) {if (RGB[j].length == 1) {RGB[j] = '0' + RGB[j];}}//Add a zero in front of single digit hex.
  return('#' + RGB[0] + RGB[1] + RGB[2]);
}

//Controls exit positioning for user's choice, relative to mouse and svg.
function ChoosExit() {
  exitAngle = Math.atan2(d3.mouse(this)[0] - center[0], d3.mouse(this)[1] - center[1]) - (Math.PI / 2);
  if (exitAngle < 0) {exitAngle += 2 * Math.PI;}
  if (degrees == 2) {//Choose exit relative to mouse position.
    fieldExit = [d3.event.x, center[1]];
  } else {//Choose exit relative to shape.
    fieldExit = tourists[0].WallAtAngle(exitAngle);
  }
  drawALv2();
  var canvas = document.getElementById("aLv2");
  var ctx = canvas.getContext("2d");
  ctx.font = unit2Px * (1 / 5) +"px Roboto Condensed";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("Left-Click to place exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees",
               center[0], unit2Px * (5 / 10));
}

//Turns off exit choosing events, and starts loading
function exitChosen() {
  var canvas = document.getElementById("aLv2");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, unit2Px * (3 / 10), 4 * unit2Px, unit2Px * (5 / 10));
  ctx.font = unit2Px * (1 / 5) +"px Roboto Condensed";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("With exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees",
               center[0], unit2Px * (5 / 10));
  d3.select("#aLv2").on("mousemove", null).on("click", null);
  projector = setInterval(AlterAnim, 1000 / fps);
}

//Simulate bots in a "no-exit" environment.
function LoadAnim() {
  for (var i = 0; i < tourists.length; i++) {
    LoadPoints(i);
    var who = tourists[i];
    who.allowance = who.velocity * unit2Px / fps;
    while (who.allowance > 0) {
      who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
    }
  }
  time++;
}

//Create points [x, y], so intercept function knows where a mobile agent will be.
function LoadPoints(i) {
  var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
  tourPoints[i].push({x:tourists[i].x, y:tourists[i].y});
  graphPoints[i].push({x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))});
}

//Control times, and update bots.
function AlterAnim() {
  if (time > timeMax) {
    time = timeMax;
    clearInterval(projector);
    projector = setInterval(PlayAnim, 1000 / fps);
  } else {
    var saveBuffer = [];
    for (var i = 0; i < tourists.length; i++) {
      AlterLines(i);
      var who = tourists[i];
      saveBuffer.push([who.x, who.y, who.a, who.on]);
      who.allowance = exitAllow;
      while (who.allowance > 0) {
        if (who.knew) {//Target already on exit procedures.
          who[instruBinder[i][0][0]](instruBinder[i][0][1]);
        } else {//Has not started exit procedures yet.
          who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
          if (who.knows) {//Clear target for bot if beginning exit procedures.
            who.target = null;
          }
        }
      }
      who.allowance = (who.velocity * unit2Px / fps) - exitAllow;
      while (who.allowance > 0) {
        if (who.knows) {//Proceed with exit procedures.
          who[instruBinder[i][0][0]](instruBinder[i][0][1]);
          who.knew = true;
        } else {//Still does not know.
          who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
        }
      }
      if (!who.knows) {
        var eVec = [fieldExit[0] - saveBuffer[i][0], fieldExit[1] - saveBuffer[i][1]];
        var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
        if (exitDist <= who.velocity * unit2Px / (2 * fps)) {
          exitAlert = who.knows = true;
          exitAllow = exitDist;
          break;
        }
      }
    }
    if (exitAlert) {
      if (exitFoundLine == null) {
        var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);
        exitFoundLine = graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                        .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#00000080").style("stroke-width", (1 / 100) * unit2Px);
      }
      for (var i = 0; i < tourists.length; i++) {//reset bots
        var who = tourists[i];
        who.x = saveBuffer[i][0];
        who.y = saveBuffer[i][1];
        who.a = saveBuffer[i][2];
        who.on = saveBuffer[i][3];
        if (wireless) {
          who.knows = true;
        }
      }
      exitAlert = false;
      exitAllow = 0;
    } else {
      UpdateVisuals();
      time++;
      timeSlider.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
    }
  }
  timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
  frameText.text("Frame: " + time);
}

//Create lines, and update graph dot positions, as well as recreating image of path.
function AlterLines(i) {
  tourPoints[i][time] = {x:tourists[i].x, y:tourists[i].y};
  var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
  graphPoints[i][time] = {x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))};
}

//Determine if all at exit, O(n) time
function AllAtExit() {
  for (var j = 0; j < touristNum; j++) {//Check every mobile agent
    if ((tourists[j].x != fieldExit[0]) || (tourists[j].y != fieldExit[1])) {//check if not at exit
      return;
    }
  }
  var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);
  allExitedLine = graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                  .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#00000080").style("stroke-width", (1 / 100) * unit2Px);
  console.log(Math.floor((100 * time) / fps) / 100);
}

function PlayAnim() {
  if (timeDirect != 0) {
    time += timeDirect;
    if (time < 0) {
      time = 0;
      timeDirect = 0;
    } else if (time > timeMax) {
      time = timeMax;
      timeDirect = 0;
    }
    UpdateVisuals();
    timeSlider.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
    timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
    frameText.text("Frame: " + Math.floor(time));
  }
}

function UpdateVisuals() {
  drawALv1();
  drawGLv1();
}

function drawALv0() {
  var canvas = document.getElementById("aLv0");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 4 * unit2Px, 4 * unit2Px);
  ctx.font = unit2Px * (1 / 5) +"px Roboto Condensed";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("Search and Exit", center[0], unit2Px * (1 / 5));

  ctx.font = unit2Px * (1 / 10) + "px Roboto Condensed";
  ctx.fillText(shapes[degrees - 1] + " Wireless", center[0], unit2Px * (3 / 10));

  ctx.font = unit2Px * (1 / 5) +"px Roboto Condensed";
  if (degrees == 2) {
    ctx.fillText("1", 3.1 * unit2Px, center[1]);
    ctx.fillText("-1", .9 * unit2Px, center[1]);
  } else {
    ctx.fillText("0", 3.1 * unit2Px, center[1]);
    ctx.fillText("90", center[0], .9 * unit2Px);
  }
}

function drawALv1() {
  var canvas = document.getElementById("aLv1");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 4 * unit2Px, 4 * unit2Px);
  for (var i = 0; i < touristNum; i++) {
    ctx.beginPath();
    ctx.moveTo(tourPoints[i][0].x, tourPoints[i][0].y);
    for (var j = 0; j < time; j++) {
      ctx.lineTo(tourPoints[i][j].x, tourPoints[i][j].y);
    }
    ctx.lineWidth = unit2Px * (1 / 25);
    ctx.strokeStyle = tourColors[i] + "80";
    ctx.stroke();
  }

  ctx.lineWidth = (1 / 100) * unit2Px;
  ctx.strokeStyle = "#ffffff";
  for (var i = 0; i < touristNum; i++) {
    ctx.beginPath();
    ctx.arc(tourPoints[i][Math.floor(time)].x, tourPoints[i][Math.floor(time)].y, unit2Px / 16, 0, 2 * Math.PI);
    ctx.fillStyle = tourColors[i];
    ctx.fill();
    ctx.stroke();
  }
}

function drawALv2() {
  var canvas = document.getElementById("aLv2");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 4 * unit2Px, 4 * unit2Px);
  ctx.beginPath();
  ctx.moveTo(center[0] + unit2Px, center[1]);
  for (var j = 0; j <= degrees; j++) {
    var holdAng = ((360 / degrees) * j) * (Math.PI / 180);
    ctx.lineTo(center[0] + unit2Px * Math.cos(holdAng), center[1] - unit2Px * Math.sin(holdAng));
  }
  ctx.lineWidth = unit2Px * (1 / 100);
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2 * unit2Px, unit2Px);
  ctx.lineTo(2 * unit2Px, 3 * unit2Px);  //ctx.lineWidth = unit2Px * (1 / 100);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(unit2Px, 2 * unit2Px);
  ctx.lineTo(3 * unit2Px, 2 * unit2Px);  //ctx.lineWidth = unit2Px * (1 / 100);
  ctx.stroke();

  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = unit2Px * (1 / 200);

  ctx.beginPath();
  ctx.arc(center[0], center[1], (1 / 50) * unit2Px, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fieldExit[0], fieldExit[1], (1 / 50) * unit2Px, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

function drawGLv0() {
  var canvas = document.getElementById("gLv0");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 4 * unit2Px, 4 * unit2Px);
}

function drawGLv1() {
  var canvas = document.getElementById("gLv1");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 4 * unit2Px, 4 * unit2Px);
  for (var i = 0; i < touristNum; i++) {
    ctx.beginPath();
    ctx.moveTo(graphPoints[i][0].x, graphPoints[i][0].y);
    for (var j = 0; j < time; j++) {
      ctx.lineTo(graphPoints[i][j].x, graphPoints[i][j].y);
    }
    ctx.lineWidth = unit2Px * (1 / 25);
    ctx.strokeStyle = tourColors[i] + "80";
    ctx.stroke();
  }

  ctx.lineWidth = (1 / 100) * unit2Px;
  ctx.strokeStyle = "#ffffff";
  for (var i = 0; i < touristNum; i++) {
    ctx.beginPath();
    ctx.arc(graphPoints[i][Math.floor(time)].x, graphPoints[i][Math.floor(time)].y, unit2Px / 16, 0, 2 * Math.PI);
    ctx.fillStyle = tourColors[i];
    ctx.fill();
    ctx.stroke();
  }
}

function MoveDataBox() {
  var hold = d3.select(this);
  dataBox.attr("visibility", "visible").attr("x", 0).attr("y", (1 / 2) * unit2Px);
  dataBox.attr("height", instruBinder[+hold.attr("data")].length * unit2Px / 4);
  for (var i = 0; i < instruBinder[+hold.attr("data")].length; i++) {//Add instructions as text
    dataBox.append("text").attr("x", (1 / 10) * unit2Px).attr("y", (1 + i) * (3 / 20) * unit2Px)
           .style("font-size", (3 / 20) * unit2Px)
           .text(instruBinder[+hold.attr("data")][i]);
  }
  var num = hold.attr("data");
  tourists[num].visual.attr("r", unit2Px / 8);
  graphDots[num].attr("r", unit2Px / 8);
  tourLine[num].style("stroke-opacity", 1).style("stroke-width", unit2Px * (2 / 25)).raise();
  graphLine[num].style("stroke-opacity", 1).style("stroke-width", unit2Px * (2 / 25)).raise();
}

function HideDataBox() {
  dataBox.attr("visibility", "hidden");
  dataBox.selectAll("text").remove();
  for (var i = 0; i < touristNum; i++) {//Change all lines and circles back to normal.
    tourists[i].visual.attr("r", unit2Px / 16);
    graphDots[i].attr("r", unit2Px / 16);
    tourLine[i].style("stroke-opacity", 0.5).style("stroke-width", unit2Px * (1 / 25));
    graphLine[i].style("stroke-opacity", 0.5).style("stroke-width", unit2Px * (1 / 25));
  }
}