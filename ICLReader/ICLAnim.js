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
var unit2Px = 25;
var center = [unit2Px * 2, unit2Px * 2];
var exitAngle = 0;
var fieldExit = [center[0] + unit2Px, center[1]];

var dataBox;
var lineFx = d3.line().x((d) => {return(d.x);}).y((d) => {return(d.y);});

var touristNum = 0;
var instruBinder = [
                    [["Intercept", [null]], ["Wait", []]],
                    [["Intercept", [null]], ["GoToPoint", [center[0] + .25, center[1] + .25]], ["Wait", []]],
                    [["Intercept", [null]], ["GoOutAtAngle", [135, .25]], ["Wait", []]],
                    [["Intercept", [null]], ["WaitAverage", []]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [270]], ["FollowWall", ["left"]]],
                    [["Intercept", [null]], ["Wait", [1]], ["GoToWallAtAngle", [0]], ["Wait", []]],
                    [["Intercept", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 30]], ["Wait", []]]
                   ];
var tourColors = [];

var fieldSVG = d3.select("#anim"); //0:Background - 1:Line - 2:Bots - 3:Overlay
var tourists = [];
var tourPoints = [];
var tourLine = [];

var graphSVG = d3.select("#graph"); //0:Background - 1:Line - 2:Bots - 3:Overlay
var graphDots = [];
var graphPoints = [];
var graphLine = [];
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
  d3.select("#timeText").text("Time: " + Math.floor((100 * time) / fps) / 100);
  d3.select("#frameText").text("Frame: " + Math.floor(time));
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
* @param {Circle} visual Represents the visual related to the bot.
*/
class Tourist {
  constructor (visual) {
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
  *@param value null
  */
  Pursue(value) {
    if ((this.target == null) && (!wireless)) {
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
  *@param value null
  */
  Intercept(value) {
    if ((this.target == null) && (!wireless)) {
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
  fieldSVG.select("#backGround").attr("height", "100%").attr("width", "100%");
  fieldSVG.select("#lines").attr("height", "100%").attr("width", "100%");
  fieldSVG.select("#bots").attr("height", "100%").attr("width", "100%");
  fieldSVG.select("#overLay").attr("height", "100%").attr("width", "100%");
  fieldSVG.select("#excess").attr("height", "100%").attr("width", "100%");
  graphSVG.select("#backGround").attr("height", "100%").attr("width", "100%");
  graphSVG.select("#lines").attr("height", "100%").attr("width", "100%");
  graphSVG.select("#bots").attr("height", "100%").attr("width", "100%");
  graphSVG.select("#overLay").attr("height", "100%").attr("width", "100%");
  graphSVG.select("#excess").attr("height", "100%").attr("width", "100%");
}

//Load visuals and bots.(Might be changed to its own script later, to split visual and functional)
function Load() {
  LoadField();
  LoadGraph();
  for (var i = 0; i < instruBinder.length; i++) {//Add bots, lines, and coordinate collectors.
    tourColors.push(RandomColor());
    tourists.push(new Tourist(fieldSVG.select("#bots").append("circle").attr("cx", center[0]).attr("cy", center[1])
                              .attr("data", touristNum).attr("r", unit2Px / 16).on("mouseover", MoveDataBox)
                              .on("mouseout", HideDataBox).style("fill", tourColors[i])
                              .style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px)));
    tourPoints.push([]);
    graphDots.push(graphSVG.select("#bots").append("circle").attr("cx", unit2Px * (10 / 25))
                   .attr("cy", unit2Px * 4 * (20 / 25) - unit2Px * (10 / 25)).attr("r", unit2Px / 16)
                   .style("fill", tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px));
    graphPoints.push([]);
    touristNum++;
  }
  dataBox = fieldSVG.select("#overLay").append("svg").attr("width", 2 * unit2Px).attr("height", unit2Px).attr("visibility", "hidden");
  while (time < timeMax) {//Load one run through.
    LoadAnim();
  }
  time = 0;
  for (var i = 0; i < touristNum; i++) {//Reset for next run through.
    tourists[i].on = 1;
    tourists[i].a = 0;
    tourists[i].x = center[0];
    tourists[i].y = center[1];
    tourLine[i] = fieldSVG.select("#lines").append("path").attr("d", lineFx(tourPoints[i]))
                  .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
    graphLine[i] = graphSVG.select("#lines").append("path").attr("d", lineFx(graphPoints[i]))
                   .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
  }
}

function LoadField() {
  var wire = (wireless) ? " Wireless" : " Non-Wireless";
  d3.select("#Desc").text(shapes[degrees - 1] + wire);
  if (degrees == 13) {//If circle, change to 360 degrees.
    degrees = 360;
  }
  var hold = "M75,50";
  for (var i = 1; i <= degrees; i++) {//Create the shape.
    var holdAng = ((360 / degrees) * i) * (Math.PI / 180);
    hold += 'L' + (50 + 25 * Math.cos(holdAng)) + ',' + (50 - 25 * Math.sin(holdAng));
  }
  fieldSVG.select("#overLay").append("path").attr("d", hold).style("fill", "none").style("stroke", "#000000").style("stroke-width", ".25");
  fieldSVG.select("#overLay").append("circle").attr("id", "exit").attr("cx", 50).attr("cy", 50).attr("r", .5)
          .style("fill", "#ffffff").style("stroke", "#000000").style("stroke-width", .1);
  if (degrees == 2) {//Add two distance numbers if a line.
    fieldSVG.select("#backGround").append("text").attr("x", 3.1 * unit2Px).attr("y", center[1])
            .attr("class", "left").style("text-anchor", "middle").style("font-size", unit2Px / 5).text("1");
    fieldSVG.select("#backGround").append("text").attr("x", .9 * unit2Px).attr("y", center[1])
            .attr("class", "right").style("text-anchor", "middle").style("font-size", unit2Px / 5).text("-1");
  } else {//Add two reference angles if not a line.
    fieldSVG.select("#backGround").append("text").attr("x", 3.1 * unit2Px).attr("y", center[1])
            .style("text-anchor", "start").style("font-size", unit2Px / 5).text("0");
    fieldSVG.select("#backGround").append("text").attr("x", center[0]).attr("y", .9 * unit2Px)
            .style("text-anchor", "middle").style("font-size", unit2Px / 5).text("90");
  }
}

function LoadGraph() {
  d3.select("#timeSlide").call(d3.drag().on("start", SSlide).on("drag", MSlide).on("end", ESlide));
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
  for (var i = 0; i < 3; i++) {//Create y-axis labels.
    graphSVG.select("#backGround").append("text").attr("x", unit2Px * (8 / 25))
            .attr("y", unit2Px * (90 / 25) - i * unit2Px * (20 / 25))
            .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
  }
  for (var i = 0; i < 11; i++) {//Create x-axis labels.
    graphSVG.select("#backGround").append("text").attr("x", unit2Px * (10 / 25) + i * unit2Px * (8 / 25))
            .attr("y", unit2Px * (94 / 25))
            .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
  }
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

function IncRight() {
  degrees++;if (degrees > 13) {degrees = 13;}d3.select("#shapeText").text(shapes[degrees - 1]);
}

function IncLeft() {
  degrees--;if (degrees < 1) {degrees = 1;}d3.select("#shapeText").text(shapes[degrees - 1]);
}

function ShapeChosen() {
  if (degrees == 1) {
    d3.select("#shapeText").text("Boring");
  } else if (degrees == 2) {
    d3.select("#shapeText").text("Not done");
  } else {
    fieldSVG.select("#excess").remove();
    graphSVG.select("#excess").remove();
    fieldSVG.on("mousemove", ChoosExit).on("click", exitChosen);
    Load();
  }
}

//Controls exit positioning for user's choice, relative to mouse and svg.
function ChoosExit() {
  exitAngle = Math.atan2(d3.mouse(this)[0] - d3.select("#center").attr("cx"), d3.mouse(this)[1] - d3.select("#center").attr("cy")) - (Math.PI / 2);
  if (exitAngle < 0) {exitAngle += 2 * Math.PI;}
  d3.select("#exitText").text("Left-Click to place exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
  if (degrees == 2) {//Choose exit relative to mouse position.
    fieldExit = [d3.event.x, center[1]];
  } else {//Choose exit relative to shape.
    fieldExit = tourists[0].WallAtAngle(exitAngle);
  }
  d3.select("#exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]);
}

//Turns off exit choosing events, and starts loading
function exitChosen() {
  d3.select(".exitText").remove();
  fieldSVG.on("mousemove", null).on("click", null);
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
        }
      }
    }
    if (exitAlert) {
      if (exitFoundLine == null) {
        var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);
        exitFoundLine = graphSVG.select("#overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                        .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                        .style("stroke-opacity", 0.5);
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
      d3.select("#timeSlide").attr("x", (time / timeMax) * (31 / 8) * unit2Px);
    }
  }
  d3.select("#timeText").text("Time: " + Math.floor((100 * time) / fps) / 100);
  d3.select("#frameText").text("Frame: " + time);
}

//Create lines, and update graph dot positions, as well as recreating image of path.
function AlterLines(i) {
  var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
  tourPoints[i][time] = {x:tourists[i].x, y:tourists[i].y};
  tourLine[i].remove();
  tourLine[i] = fieldSVG.select("#lines").append("path").attr("d", lineFx(tourPoints[i]))
                .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
  graphPoints[i][time] = {x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))};
  graphLine[i].remove();
  graphLine[i] = graphSVG.select("#lines").append("path").attr("d", lineFx(graphPoints[i]))
                 .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
}

//Determine if all at exit, O(n) time
function AllAtExit() {
  for (var j = 0; j < touristNum; j++) {//Check every mobile agent
    if ((tourists[j].x != fieldExit[0]) || (tourists[j].y != fieldExit[1])) {//check if not at exit
      return;
    }
  }
  var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);
  allExitedLine = graphSVG.select("#overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                  .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                  .style("stroke-opacity", 0.5);
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
    d3.select("#timeSlide").attr("x", (time / timeMax) * (31 / 8) * unit2Px);
    d3.select("#timeText").text("Time: " + Math.floor((100 * time) / fps) / 100);
    d3.select("#frameText").text("Frame: " + Math.floor(time));
  }
}

function UpdateVisuals() {
  for (var i = 0; i < touristNum; i++) {
    var who = tourists[i];
    who.visual.attr("cx", tourPoints[i][Math.floor(time)].x).attr("cy", tourPoints[i][Math.floor(time)].y);
    graphDots[i].attr("cx", graphPoints[i][Math.floor(time)].x).attr("cy", graphPoints[i][Math.floor(time)].y);
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
