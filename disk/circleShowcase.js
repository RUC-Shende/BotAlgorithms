//////////----------Instantiate Variables----------//////////
var exitAlert = false;//Someone learned where the exit is.
var exitAllow = 0;//How far in a frame was the exit found.
var exitFoundFrame = 0;
var wireless = true;

var time = 0;
var timeDirect = 0; //After loading, play direction.
var fps = 100;
var timeMax = 10 * fps;
var timeSlider;

var projector;
var degrees = 3;
var unit2Px = ((window.innerHeight <= window.innerWidth) ?
                    (window.innerHeight) : (window.innerWidth)) / 5;
var center = [unit2Px * 2, unit2Px * 2];
var exitAngle = null;
var fieldExit = [1, 1];

var dataBox;
var touristNum = 0;

var firstTime = true;

var instruBinder = [];
var algorithmName = "";
var algShortName = "";

var tourColors = [];

var fieldSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
tourists = [];
tourPoints = [];
tourLine = [];

var graphSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
graphDots = [];
graphPoints = [];
graphLine = [];

var distanceFromSVGone;
var exitFoundLine = null;
var allExitedLine = null;
var priorityExitedLine = null;

var distanceFromServant = [];
var disGraphDrawn = false;

var b = d3.select('body').append('div');



//////////--------Instantiate Call Functions--------//////////
//Drag function, updates tourists and graph dots relative to lines
function SSlide() {
  d3.select(this).style("fill", "orange");
  d3.select(this).classed("active", true);
  d3.selectAll(".sliderhelp").style("visibility", "hidden");
}

function MSlide() {
  var mousePos = d3.event.x;
  if (mousePos < unit2Px * (10/25)) {
    mousePos = unit2Px * (10/25);
  } else if (mousePos > (71 / 20) * unit2Px) {
    mousePos = (71 / 20) * unit2Px;
  }
  d3.select(this).attr("x", mousePos);
  time = Math.round(((mousePos - (unit2Px * 10/25)) / ((63 / 20) * unit2Px)) * timeMax);
  timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
  frameText.text("Frame: " + Math.floor(time));
  UpdateVisuals();
}

function ESlide() {
  d3.select(this).style("fill", "#888888");
  d3.select(this).classed("active", false);
  d3.selectAll(".sliderhelp").style("visibility", "visible");
}

//////////---------- Instantiate Classes ----------//////////
//Data holder, and loader update

/**
* Represents a robot on the field searching for the exit.
*
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

//////////----------Instantiate Functions----------//////////
//Mostly self contained, only edits exit location outside of function.
function Start() {
  degrees = 360;
  Load();
}

//Load visuals and bots.(Might be changed to its own script later, to split visual and functional)
function Load() {
  fieldSVG = b.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
               .style("float", "left").style("border", "1px solid black")
               .on("mousemove", ChoosExit).on("click", exitChosen);
  graphSVG = b.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
               .style("float", "left").style("border", "1px solid black");
  distanceFromSVGone = b.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 3)
               .style("float", "left").style("border", "1px solid black").attr("class", "distanceFrom1").attr("display", "none");
  var classes = ["backGround", "lines", "bots", "overLay"];
  for (var i = 0; i < classes.length; i++) {//Create layers
    fieldSVG.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
            .attr("class", classes[i]);
    graphSVG.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
            .attr("class", classes[i]);
  }
  LoadField();
  LoadGraph();
  for (var i = 0; i < instruBinder.length; i++) {//Add bots, lines, and coordinate collectors.
    tourColors.push(RandomColor(i));
    console.log(touristNum);
    tourists.push(new Tourist(fieldSVG.select(".bots").append("circle").attr("cx", center[0]).attr("cy", center[1])
                              .attr("data", touristNum).attr("r", unit2Px / 16).on("mouseover", MoveDataBox)
                              .on("mouseout", HideDataBox).style("fill", tourColors[i])
                              .style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px), instruBinder[i][0][1][1]));
    tourPoints.push([]);
    graphDots.push(graphSVG.select(".bots").append("circle").attr("cx", unit2Px * (10 / 25))
                   .attr("cy", unit2Px * 4 * (20 / 25) - unit2Px * (10 / 25)).attr("r", unit2Px / 16)
                   .style("fill", tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px));
    graphPoints.push([]);
    touristNum++;

    if (instruBinder[i][0][1][1]){
        distanceFromServant.push([]);
    }
  }


  var touristCount = 0;
  outer:
  for (var i = 0; i <= 2; i++){
      if (touristCount + 1 == instruBinder.length){
          break outer;
      }
      for (var j = 0; j <= 2; j++) {
          graphSVG.select(".overLay").append("circle")
                  .attr("cx", (2*unit2Px) + (j * (2/3 * unit2Px)))
                  .attr("cy", (unit2Px * 0.6) + (i * (1/4 * unit2Px)))
                  .attr("r", unit2Px / 16)
                  .style("fill", tourColors[touristCount])
                  .style("stroke", "#ffffff")
                  .style("stroke-width", (1/100 * unit2Px));
          graphSVG.select(".overLay").append("text")
                  .attr("x", (2*unit2Px) + (unit2Px / 15) + (j * (2/3 * unit2Px)))
                  .attr("y", (unit2Px * 0.6) + (unit2Px/32) +  (i * (1/4 * unit2Px)))
                  .style("font-size", unit2Px * (3/25))
                  .text("" + ((instruBinder[touristCount][0][1][1] == true) ? "Queen " + touristCount : " Bot " + touristCount));
          if (touristCount + 1 == instruBinder.length){
              break outer;
          }
          touristCount ++;

      }
  }


  dataBox = fieldSVG.select(".overLay").append("svg").attr("width", 2 * unit2Px).attr("height", unit2Px).attr("visibility", "hidden");
  for (var i = 0; i < tourists.length; i++){
      tourists[i].target = null;
  }

  while (time < timeMax) {//Load one run through.
    LoadAnim();
  }

  console.log(distanceFromServant);


  time = 0;
  for (var i = 0; i < touristNum; i++) {//Reset for next run through.
    tourists[i].on = 1;
    tourists[i].a = 0;
    tourists[i].x = center[0];
    tourists[i].y = center[1];

    var holdA = 'M' + (tourPoints[i][0].x + ',' + (tourPoints[i][0].y));
    var holdG = 'M' + (graphPoints[i][0].x + ',' + (graphPoints[i][0].y));
    /*
    for (var j = 1; j < timeMax; j++) {
      holdA += 'L' + (tourPoints[i][j].x + ',' + (tourPoints[i][j].y));
      holdG += 'L' + (graphPoints[i][j].x + ',' + (graphPoints[i][j].y));

    }
    */
    tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", holdA)
                  .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
    graphLine[i] = graphSVG.select(".lines").append("path").attr("d", holdG)
                   .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");

  }


  var datasetone = [];
  var datasettwo = [];

  if (distanceFromServant[0].length > 0){
      for (var i = 0; i < distanceFromServant[0].length; i++){
        distanceFromServant[0][i] = 4 * (1 - (distanceFromServant[0][i] / (unit2Px * 4)));
        datasetone.push({"y" : distanceFromServant[0][i]});

      }
  if (distanceFromServant[1] && distanceFromServant[1].length > 0){
      for (var i = 0; i < distanceFromServant[1].length; i++){
        distanceFromServant[1][i] = 4 * (1 - (distanceFromServant[1][i] / (unit2Px * 4)));
        datasettwo.push({"y" : distanceFromServant[1][i]});

      }
  }
  console.log(datasetone);

  // 2. Use the margin convention practice
  var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = (unit2Px * 4) - margin.left - margin.right // Use the window's width
    , height = (unit2Px * 2) - margin.top - margin.bottom; // Use the window's height

  // The number of datapoints
  var n = (fps * 5);

  // 5. X scale will use the index of our data
  var xScale = d3.scaleLinear()
      .domain([0, n-1]) // input
      .range([0, width]); // output

  // 6. Y scale will use the randomly generate number
  var yScale = d3.scaleLinear()
      .domain([0, 2]) // input
      .range([height, 0]); // output

  // 7. d3's line generator
  var line = d3.line()
      .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
      .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

  if (tourists[0].priority){
      distanceFromSVGone.attr("display", "null");
  }

  // 1. Add the SVG to the page and employ #2
  distanceFromSVGone
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // 3. Call the x axis in a group tag
  distanceFromSVGone.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(75," + (height + 50) + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  distanceFromSVGone.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(75," + (height + 50) + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  distanceFromSVGone.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(75, 50)")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  distanceFromSVGone.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(75, 50)")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  distanceFromSVGone.append("text")
      .attr("class", "x axis label")
      .attr("text-align", "center")
      .attr("x", (2 * unit2Px) - 45)
      .attr("y", height + 90)
      .text("Time (Frames)");

  distanceFromSVGone.append("text")
      .attr("class", "y axis label")
      .attr("text-align", "center")
      .attr("x", -height)
      .attr("y", 25)
      .attr("transform", "rotate(-90)")
      .text("Distance From Servant (Units)");

  distanceFromSVGone.append("text")
      .attr("class", "distance from title")
      .attr("text-align", "center")
      .attr("x", (unit2Px))
      .attr("y", 30)
      .text("Priority Bots Distance From Helper 2 (No-Exit Simulation)")

  // 9. Append the path, bind the data, and call the line generator
  distanceFromSVGone.append("path")
      .datum(datasetone.slice(0, fps * 5)) // 10. Binds data to the line
      .attr("class", "line1") // Assign a class for styling
      .attr("transform", "translate(75, 50)")
      .attr("d", line); // 11. Calls the line generator

  distanceFromSVGone.append("path")
      .datum(datasettwo.slice(0, fps * 5)) // 10. Binds data to the line
      .attr("class", "line2") // Assign a class for styling
      .attr("transform", "translate(75, 50)")
      .attr("d", line); // 11. Calls the line generator

// Supposed to be an informational element, once it works
/*
  distanceFromSVGone.append("text")
      .attr("x", unit2Px * 3.8)
      .attr("y", 20)
      .attr("dy", ".5em")
      .attr("class", "tooltip")
      .text("🛈")
      .html("<span class='tooltiptext'>The values shown are: the current frame, the priority bot's distance from a servant, and the time it would take that bot to reach the exit if the servant found it on that frame.</span>");
*/

  distanceFromSVGone.append("text")
      .attr("x", 0.5 * unit2Px)
      .attr("y", 2.2 * unit2Px)
      .attr("dy", ".5em")
      .attr("class", "distext0")
      .text("");

  distanceFromSVGone.append("text")
      .attr("x", 0.5 * unit2Px)
      .attr("y", 2.5 * unit2Px)
      .attr("dy", ".5em")
      .attr("class", "distext1")
      .text("");

    for (var i = 0; i < tourists.length; i++){
        if (tourists[i].priority){
            distanceFromSVGone.append("circle")
                .attr("cx", 0.4 * unit2Px)
                .attr("cy", (2.2 + (0.3 * i)) * unit2Px)
                .attr("r", unit2Px / 16)
                .style("fill", tourColors[i])
                .style("stroke", "#ffffff")
                .style("stroke-width", (1 / 100) * unit2Px);
        }
    }


  var focusone = distanceFromSVGone.append("g")
      .attr("class", "envelope")
      .attr("transform", "translate(0, 50)")
      .attr("class", "focus0")
      .style("display", "none");

  var focustwo = distanceFromSVGone.append("g")
      .attr("class", "envelope")
      .attr("transform", "translate(0, 50)")
      .attr("class", "focus1")
      .style("display", "none");

  focusone.append("circle")
      .attr("r", 4.5);

  focustwo.append("circle")
      .attr("r", 4.5);

  focusone.append("text")
      .attr("class", "envelope")
      .attr("x", 9)
      .attr("dy", ".35em");

  focustwo.append("text")
      .attr("class", "envelope")
      .attr("x", 9)
      .attr("dy", ".35em");

  distanceFromSVGone.append("rect")
      .attr("class", "overlay")
      .attr("width", distanceFromSVGone.attr("width"))
      .attr("height", distanceFromSVGone.attr("height"))
      .attr("transform", "translate(75, 25)")
      .on("mouseover", function() {
          focusone.style("display", null);
          focustwo.style("display", null);
      })
      .on("mouseout", function() {
           focusone.style("display", "none");
           focustwo.style("display", "none");
       })
      .on("mousemove", mousemove);

  var formatValue = d3.format(",.3f");

  function mousemove() {
    var coords = d3.mouse(this);
    //var dataset = (d3.select(this.parentNode).attr("class") == "distanceFrom1" ? datasetone : datasettwo);
    console.log(d3.select(this.parentNode).attr("class"));
    //console.log(xScale.invert(coords[0]));
    var ds = [datasetone, datasettwo];
    for (var j = 0; j < 2; j++){
        var x0 = xScale.invert(coords[0]),
            i = Math.floor(x0)
            d0 = ds[j][i - 1],
            d1 = ds[j][i],
            d = x0 - d0 > d1 - x0 ? d1 : d0;
        var focus = d3.select(this.parentNode).select(".focus" + j);
        console.log(focus);
        console.log(j);

        if (i < 1 || i > fps * 5){
            focus.attr("display", "none");
        }
        else{
            focus.attr("display", "null");
            focus.attr("transform", "translate(" + (coords[0] + 75) + "," + (yScale(d.y) + 50) + ")");
            focus.select("text").text(i);
            d3.select(".distext" + j).text("Agent P" + (2-j) + ". --- Frame: " + i + ", Distance From Servant: " + formatValue(ds[j][i].y) + ", Time To Finish: " + formatValue((100 * i) / fps / 100 + ds[j][i].y));

            if (i > (fps * 5) - 50){
                focus.select("text").attr("x", (focus.attr("x") - (0.2 * unit2Px)));
            }
            else {
                focus.select("text").attr("x", (focus.attr("x") + (0.05 * unit2Px)));
            }
        }
    }


  }

  if (distanceFromServant[0].length < 1){
      distanceFromSVGone.attr("display", "null");
  }

  if (distanceFromServant[1].length < 1){
      distanceFromSVGone.attr("display", "null");
  }

}
}




function LoadField() {
  // decide how to display wireless status
  w = wireless ? "Wireless" : "Face-To-Face";
  // update subheader
  d3.select("#subheader").text(algorithmName + w);
  d3.select("#descriptiontitle").text(algorithmName + " Description:");
  fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (1 / 5))
          .style("text-anchor", "middle").style("font-size", unit2Px * (1 / 5)).text(algorithmName + w);
  fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (5 / 10)).attr("class", "exitText")
          .style("text-anchor", "middle").style("font-size", unit2Px * (2 / 10))
          .text("Left-Click to place exit at ~" + 0 + " degrees");
  if (degrees == 13) {//If circle, change to 360 degrees.
    degrees = 360;
  }
  var hold = 'M' + (center[0] + unit2Px) + ',' + center[1];
  for (var i = 1; i <= degrees; i++) {//Create the shape.
    var holdAng = ((360 / degrees) * i) * (Math.PI / 180);
    hold += 'L' + (center[0] + unit2Px * Math.cos(holdAng)) + ',' + (center[1] - unit2Px * Math.sin(holdAng));
  }
  fieldSVG.select(".overLay").append("path").attr("d", hold).style("fill", "none").style("stroke", "#000000");
  fieldSVG.select(".overLay").append("line").attr("x1", 2 * unit2Px).attr("y1", unit2Px).attr("x2",  2 * unit2Px).attr("y2", 3 * unit2Px)
          .style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px);
  fieldSVG.select(".overLay").append("line").attr("x1", unit2Px).attr("y1", 2 * unit2Px).attr("x2",  3 * unit2Px).attr("y2", 2 * unit2Px)
          .style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px);
  fieldSVG.select(".overLay").append("circle").attr("class", "center").attr("cx", center[0]).attr("cy", center[1]).attr("r", (1 / 50) * unit2Px)
          .style("fill", "#ffffff").style("stroke", "#000000").style("stroke-width", (1 / 200) * unit2Px);
  fieldSVG.select(".overLay").append("circle").attr("class", "exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]).attr("r", (1 / 50) * unit2Px)
          .style("fill", "#ffffff").style("stroke", "#000000").style("stroke-width", (1 / 200) * unit2Px);
  if (degrees == 2) {//Add two distance numbers if a line.
    fieldSVG.select(".backGround").append("text").attr("x", 3.1 * unit2Px).attr("y", center[1])
            .attr("class", "left").style("text-anchor", "middle").style("font-size", unit2Px / 5).text("1");
    fieldSVG.select(".backGround").append("text").attr("x", .9 * unit2Px).attr("y", center[1])
            .attr("class", "right").style("text-anchor", "middle").style("font-size", unit2Px / 5).text("-1");
  } else {//Add two reference angles if not a line.
    fieldSVG.select(".backGround").append("text").attr("x", 3.1 * unit2Px).attr("y", center[1])
            .style("text-anchor", "start").style("font-size", unit2Px / 5).text("0");
    fieldSVG.select(".backGround").append("text").attr("x", center[0]).attr("y", .9 * unit2Px)
            .style("text-anchor", "middle").style("font-size", unit2Px / 5).text("90");
  }
}

function LoadGraph() {
  w = wireless ? "Wireless" : "Face-To-Face";
  algNameText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (2)).attr("y", unit2Px * (1/5))
                .style("font-size", unit2Px * (1 / 5)).style("text-anchor", "start").style("text-anchor", "middle")
                .text(algorithmName + w);
  timeText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .6)
             .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "start").text("Time: 0");
  frameText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .8)
              .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "start").text("Frame: 0");
  timeSlider = graphSVG.select(".backGround").append("rect").attr("width", unit2Px / 20).attr("height", unit2Px * (31/20))
               .attr("y", unit2Px * 2).attr("x", unit2Px * (10/25))
               .style("fill", "#888888").style("fill-opacity", .5)
               .call(d3.drag().on("start", SSlide).on("drag", MSlide).on("end", ESlide));
  //var fo = graphSVG.append('foreignObject').attr('x', unit2Px * (1/25)).attr('y', unit2Px * (18/25)).attr('width', unit2Px * 1.5).attr('height', unit2Px * (18/25));
 // var timeButtons = fo.append('xhtml:div');
  graphSVG.select(".overLay").append('text').attr("x", unit2Px * (1/25)).attr("y", unit2Px * 1).text(' ▶▶ Play').style('font-size', unit2Px * 5/25).attr('fill', 'green')
            .attr('class', 'reveal play').style('box-sizing', 'border-box').attr('cursor', 'pointer').on('click', () => {timeDirect++;});
  graphSVG.select(".overLay").append('text').attr("x", unit2Px * (1/25)).attr("y", unit2Px * 1.2).text(' ■ Stop').style('cursor', 'pointer').style('font-size', unit2Px * 5/25).attr('fill', 'red')
            .attr('class', 'reveal play').on('click', () => {timeDirect = 0;});
  graphSVG.select(".overLay").append('text').attr("x", unit2Px * (1/25)).attr("y", unit2Px * 1.4).text(' ◀◀ Rewind').style('cursor', 'pointer').style('font-size', unit2Px * 5/25).attr('fill', 'blue')
            .attr('class', 'reveal play').on('click', () => {timeDirect--;});
  graphSVG.select(".overLay").append('text').attr("x", unit2Px * (1/25)).attr("y", unit2Px * 1.6).text(' ◀ Slow ▶').style('cursor', 'pointer').style('font-size', unit2Px * 5/25).attr('fill', 'cyan')
            .attr('class', 'reveal play').on('click', () => {if (timeDirect == 0) {timeDirect += 0.5;} else {timeDirect/=2;}});
/*
  timeButtons.append('input')
            .attr('class', 'reveal stop').attr('type', 'submit')
            .property('value', ' ■ Stop').on('click', () => {timeDirect = 0;});
  timeButtons.append('input')
            .attr('class', 'reveal rewind').attr('type', 'submit')
            .property('value', '◀◀ Rewind').on('click', () => {timeDirect--;});
  timeButtons.append('input')
            .attr('class', 'reveal slow').attr('type', 'submit')
            .property('value', '◀ Slow ▶').on('click', () => {if (timeDirect == 0) {timeDirect += 0.5;} else {timeDirect/=2;}});
*/
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
            .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i)
            .attr("class", "graphnum");
  }

  graphSVG.select(".backGround").append("text").attr("x", unit2Px * (5 / 25)).attr("y", unit2Px * (70 / 25)).attr("text-anchor", "middle")
          .attr("transform", "rotate(-90," + unit2Px * (5 / 25) + ',' + unit2Px * (70 / 25) + ')')
          .style("font-size", unit2Px * (5 / 25)).style("fill", "#000000").text("Distance from Exit");
  graphSVG.select(".backGround").append("text").attr("x", unit2Px * 2).attr("y", unit2Px * (395 / 100)).attr("text-anchor", "middle")
          .style("font-size", unit2Px * (5 / 25)).style("fill", "#000000").text("Time");

}

//Reset Animation.
function Reset() {


    //TODO: prevent reloading while loading anim.

    clearInterval(projector);

    exitAlert = false;//Someone learned where the exit is.
    exitAllow = 0;//How far in a frame was the exit found.
    exitFoundFrame = 0;

    time = 0;
    timeDirect = 0;//After loading, play direction.
    timeMax = 10 * fps;
    timeSlider = null;

    //projector = null;
    degrees = 360;
    unit2Px = ((window.innerHeight <= window.innerWidth) ?
                        (window.innerHeight) : (window.innerWidth)) / 5;
    center = [unit2Px * 2, unit2Px * 2];
    exitAngle = null;
    fieldExit = [1,1];

    dataBox = null;

    touristNum = 0;
    tourColors = [];

    //distanceFromSVG.selectAll('g').remove();
    distanceFromSVGone.remove();

    distanceFromServant = [];

    fieldSVG.selectAll('svg').remove();
    fieldSVG.remove();37, 0.000, 0.617
    tourists = [];
    tourPoints = [];
    tourLine = [];

    graphSVG.selectAll('svg').remove(); //0:Background - 1:Line - 2:Bots - 3:Overlay
    graphSVG.remove();
    graphDots = [];
    graphPoints = [];
    graphLine = [];
    exitFoundLine = null;
    allExitedLine = null;



    Start();

}

function RandomColor(i) {
    var colorPalette = ["#fe447d", "#f78f2e", "#fedc0c", "#fedc0c",
                        "#654321", "#ff0000", "#0e10e6", "#9208e7",
                        "#f84c00", "#f3f354", "#bff1e5", "#3bc335",
                        "#7af5ca", "#448bff", "#101ab3", "#d645c8",
                        "#0afe15", "#0acdfe", "#ff9600", "#b21ca1"];
    return colorPalette[(i + 4) % 20];
}

//Controls exit positioning for user's choice, relative to mouse and svg.
function ChoosExit() {
  exitAngle = Math.atan2(d3.mouse(this)[0] - center[0], d3.mouse(this)[1] - center[1]) - (Math.PI / 2);
  if (exitAngle < 0) {exitAngle += 2 * Math.PI;}
  d3.select(".exitText").text("Left-Click to place exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
  if (degrees == 2) {//Choose exit relative to mouse position.
    fieldExit = [d3.event.x, center[1]];
  } else {//Choose exit relative to shape.
    fieldExit = tourists[0].WallAtAngle(exitAngle);
  }
  d3.select(".exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]);
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
  if (i == 2 && tourists[0].priority){
      distanceFromServant[0].push(unit2Px * 4 - (Math.sqrt(Math.pow(tourPoints[2][tourPoints[2].length-1].x - this.tourPoints[0][tourPoints[0].length-1].x, 2) + Math.pow(tourPoints[2][tourPoints[2].length-1].y - tourPoints[0][tourPoints[0].length-1].y, 2))));
  }
  if (i == 2 && tourists[1].priority){
      distanceFromServant[1].push(unit2Px * 4 - (Math.sqrt(Math.pow(tourPoints[2][tourPoints[2].length-1].x - this.tourPoints[1][tourPoints[1].length-1].x, 2) + Math.pow(tourPoints[2][tourPoints[2].length-1].y - tourPoints[1][tourPoints[1].length-1].y, 2))));
  }
}

//Control times, and update bots.
function AlterAnim() {
  if (time > timeMax) {
    time = timeMax;
    clearInterval(projector);
    projector = setInterval(PlayAnim, 1000 / fps);

    for (var i = 0; i < 11; i++) {//Create x-axis labels.
      graphSVG.selectAll(".graphnum").style("display", "none");
    }

    for (i = 0; i < touristNum; i++){
        AlterLines(i);


    }

    for (var i = 0; i <= Math.floor((100 * time) / fps) / 100; i++) {//Create x-axis labels.
      graphSVG.select(".backGround").append("text").attr("x", (10/25 + (i / (Math.floor((100 * time) / fps) / 100)) * 80/25) * unit2Px)//unit2Px * (10 / 25) + ((Math.floor(timeMax) - i) * 80/25) * unit2Px)
              .attr("y", unit2Px * (94 / 25))
              .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
    }
    graphSVG.select(".backGround").append("text").attr("x", (unit2Px * 65/25)).attr("y", unit2Px * (1.7))
            .style("font-size", unit2Px * (4/25))
            .text("End: " + Math.floor((100 * time) / fps) / 100 + " sec");
    if (exitFoundFrame > 0){
        graphSVG.select(".backGround").append("text").attr("x", (unit2Px * 65/25)).attr("y", (unit2Px * (1.55)))
            .style("font-size", unit2Px * (2/25))
            .text("Exit found frame: " + exitFoundFrame);
    }
    graphSVG.select(".overLay").append('text').attr("x", unit2Px * 65/25).attr("y", unit2Px * 1.83)
            .attr("class", "sliderhelp").style("font-size", unit2Px * (3/25)).text("Click and drag gray bar")
            .style("fill", "#bbbbaa");
    graphSVG.select(".overLay").append('text').attr("x", unit2Px * 65/25).attr("y", unit2Px * 1.95)
            .attr("class", "sliderhelp").style("font-size", unit2Px * (3/25)).text("to see the timeline")
            .style("fill", "#bbbbaa");
  } else {
    var saveBuffer = [];

    for (var i = 0; i < tourists.length; i++) {
      AlterLines(i);
      var who = tourists[i];
      saveBuffer.push([who.x, who.y, who.a, who.on]);
      who.allowance = who.velocity * unit2Px / fps;
      while (who.allowance > 0) {
        if (who.knows) {
          who[instruBinder[i][0][0]](instruBinder[i][0][1]);
        } else {
          who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
        }
      }
      if (!who.knows) {
        var eVec = [fieldExit[0] - saveBuffer[i][0], fieldExit[1] - saveBuffer[i][1]];
        var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
        if (exitDist <= who.velocity * unit2Px / (2 * fps)) {
          exitAlert = who.knows = true;
          exitFoundFrame = time;
          //console.log(Math.floor((100 * time) / fps) / 100);
          if (who.priority){
              break;
          }
          exitAllow = exitDist;
        }
      }
    }

    if (exitAlert) {
      if (exitFoundLine == null) {
        var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);
        exitFoundLine = 1;

                        /*
                        graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                        .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                        .style("stroke-opacity", 0.5);
                        */
      }
      for (var i = 0; i < tourists.length; i++) {//reset bots
        var who = tourists[i];
        who.x = saveBuffer[i][0];
        who.y = saveBuffer[i][1];
        who.a = saveBuffer[i][2];
        who.on = saveBuffer[i][3];
        if (wireless) {
          who.knows = true;
          //console.log(Math.floor((100 * time) / fps) / 100);
        }
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
      }
      exitAlert = false;
    }
    AllAtExit();
    UpdateVisuals();
    time++;
    timeSlider.attr("x", ((10/25) + (time / timeMax) * (63/20)) * unit2Px);
  }
  timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
  frameText.text("Frame: " + time);
}

//Create lines, and update graph dot positions, as well as recreating image of path.
function AlterLines(i) {
  var dista = unit2Px * 4 - Math.abs((Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25)));
  tourPoints[i][time] = {x:tourists[i].x, y:tourists[i].y};
  tourLine[i].remove();

  var holdA = 'M' + (tourPoints[i][0].x + ',' + (tourPoints[i][0].y));
  var holdG = 'M' + (10/25) * unit2Px + ',' + (graphPoints[i][0].y);
  for (var j = 1; j < time; j++) {
    holdA += 'L' + (tourPoints[i][j].x + ',' + (tourPoints[i][j].y));
    holdG += 'L' + ((10/25) + ((graphPoints[i][j].x / timeMax) * (63/20))) * unit2Px  + ',' + (graphPoints[i][j].y);
    //((10/25) + (graphPoints[i][j].x / timeMax) * (63/20)) * unit2Px)
  }

  tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", holdA)
                .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
  graphPoints[i][time] = {x:time, y:(dista - unit2Px * (10 / 25))};
  graphLine[i].remove();
  graphLine[i] = graphSVG.select(".lines").append("path").attr("d", holdG)
                 .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
}

function AllAtExit() {

    if (exitAlert){ // check to see if any priority have exited.
        for (var p = 0; p < touristNum; p++){
            if (tourists[p].priority && tourists[p].atExit){
                allExitedLine = 1;
                timeMax = time;
            }
        }
    }
  for (var j = 0; j < touristNum; j++) {//Check every mobile agent
    if ((tourists[j].x != fieldExit[0]) || (tourists[j].y != fieldExit[1])) {//check if not at exit
      return;
    }
    else if (!priorityExitedLine && tourists[j].priority){//assuming also at exit...
        var holdP = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80/25) * unit2Px);
        priorityExitedLine = 1;
                            /*graphSVG.select(".overLay").append("line").attr("x1", holdP).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                          .attr("x2", holdP).attr("y2", 1.75 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                          .style("stroke-opacity", 0.5);*/

        timeMax = time; //to account for the extra bot getting to its next point
    }
  }
  if (!allExitedLine){
    var holdX = (unit2Px * (10 / 25) + ((time + exitAllow) / timeMax) * (80 / 25) * unit2Px);

    allExitedLine = 1;
                    /*graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                  .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                  .style("stroke-opacity", 0.5);*/
    timeMax = time;
  }
  //console.log(Math.floor((100 * time) / fps) / 100);
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
    timeSlider.attr("x", ((10/25) + (time / timeMax) * (63/20)) * unit2Px);
    timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
    frameText.text("Frame: " + Math.floor(time));
  }
}

function UpdateVisuals() {
  for (var i = 0; i < touristNum; i++) {
    var who = tourists[i];
    who.visual.attr("cx", tourPoints[i][Math.floor(time)].x).attr("cy", tourPoints[i][Math.floor(time)].y);
    graphDots[i].attr("cx", ((10/25) + ((graphPoints[i][Math.floor(time)].x / timeMax) * (63/20))) * unit2Px).attr("cy", graphPoints[i][Math.floor(time)].y);
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

function showAlgorithmDesc(s, w){
    var color;
    switch(s){
        case 'A':
            color = "#efe";
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algorithmName = "Algorithm A ";
            break;
        case 'Awl':
            color = "#efe";
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algorithmName = "Algorithm A ";
            break;
        case 'B':
            color = '#eef';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algorithmName = "Algorithm B ";
            break;
        case 'Bwl':
            color = '#eef';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algorithmName = "Algorithm B ";
            break;
        case 'C':
            color = '#fee';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 70, center[1]+40]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 70, center[1]+40]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algorithmName = "Algorithm C ";
            break;
        case 'Cwl':
            color = '#fee';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 70, center[1]+40]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 70, center[1]+40]], ["GoToPoint", [center[0], center[1]+40]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algorithmName = "Algorithm C ";
            break;
        case 'Q1':
            color = "#efe";
            instruBinder = [
                                 [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 114]], ["GoToWallAtAngle", [347]], ["FollowWall", ["right", 53]], ["Wait", [null]]],
                                 [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]]
                               ];
            algorithmName = "Algorithm Priority 1 ";
            break;
        case 'Q2':
            color = "#eef";
            instruBinder = [
                                  [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [144]], ["FollowWall", ["left", 36]], ["GoToPoint", [center[0] + (unit2Px * 0.65), center[1] + 30]], ["GoToWallAtAngle", [345]], ["FollowWall", ["left"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [144]], ["FollowWall", ["right"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]]
            ];
            algorithmName = "Algorithm Priority 2 ";
            break;
        case 'Q2S1':
            color = "#fee";
            instruBinder = [
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [213.8]], ["FollowWall", ["left"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [0]], ["FollowWall", ["left"]]],
                [["Wait", [null]], ["GoToWallAtAngle", [213.8]], ["FollowWall", ["right"]]]
                /*
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [0]], ["FollowWall", ["left"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [240]], ["FollowWall", ["left"]]],
                [["Intercept", [[0, 1], false]], ["GoToWallAtAngle", [240]], ["FollowWall", ["right"]]]
                */
                /*
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 36.5]], ["GoToWallAtAngle", [350]], ["Wait", [null]]],
                [["Intercept", [[0, 1], false]], ["GoToWallAtAngle", [143.5]], ["FollowWall", ["right"]]]
                */
                /*
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 45]], ["GoToWallAtAngle", [340]], ["FollowWall", ["left"]]],
                [["Intercept", [null, false]], ["GoToWallAtAngle", [135]], ["FollowWall", ["right"]]]
                */
                /*
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 45]], ["GoToPoint", [center[0] + (unit2Px * 0.65), center[1]]], ["GoToWallAtAngle", [337.5]], ["FollowWall", ["left"]]],
                [["Intercept", [null, false]], ["GoToWallAtAngle", [135]], ["FollowWall", ["right"]]]
                */
                /*
                [["GoToExit", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 65]], ["GoToPoint", [center[0], center[1]]], ["GoToWallAtAngle", [245]], ["FollowWall", ["left"]]],
                [["GoToExit", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right", 65]], ["GoToPoint", [center[0], center[1]]], ["GoToWallAtAngle", [115]], ["FollowWall", ["right"]]],
                [["Intercept", [null]], ["GoToWallAtAngle", [60]], ["FollowWall", ["right"]]]
                */
                /*
                [["GoToExit", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]],
                [["GoToExit", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]],

                [["Intercept", [null]], ["GoToWallAtAngle", [60]], ["FollowWall", ["right"]]]
                */

            ];
            algorithmName = "2 Priority + 1 Servant (1) ";
            break;

        case 'Q1S1Q1':
            color = "#efe";
            instruBinder = [
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]] ,["FollowWall", ["right"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right"]]],
                [["Wait", [null]], ["GoToWallAtAngle", 180], ["FollowWall", ["left"]]]
            ];
            algorithmName = "2 Priority + 1 Servant (2) ";
            break;

        case 'Q1S4':
            color = "#eef";
            instruBinder = [
                [["GoToExit", [null, true]], ["Wait", [(1 + (Math.PI / 2))]], ["GoToWallAtAngle", [180]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["left", 75]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right", 75]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [75]], ["FollowWall", ["left"]]],
                [["Wait", [null]], ["GoToWallAtAngle", [285]], ["FollowWall", ["right"]]]
            ];
            algorithmName = "1 Priority + 4 Servants ";
            break;

        case 'Q1S8':
            color = "#fee";
            instruBinder = [
                [["GoToExit", [null, true]], ["Wait", [(1+(Math.PI / 2))]], ["GoToWallAtAngle", [180]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["left", 60]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [60]], ["FollowWall", ["left", 30]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 30]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [120]], ["FollowWall", ["left"]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right", 60]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [300]], ["FollowWall", ["right", 30]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [270]], ["FollowWall", ["right", 30]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [240]], ["FollowWall", ["right"]], ["Wait", [null]]]
            ];
            algorithmName = "1 Priority + 8 Servants ";
            break;
    }
    algShortName = s;
    wireless = w;
    d3.selectAll('.desc').style('display', 'none');
    d3.select('.tabtxt').style('background-color', color);
    //d3.select('#'+s).style('display', 'inline-block');
    //closeNav();
    if (firstTime){
        firstTime = false;
    }
    else {
        Reset();
    }
}

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("backbutton").style.display = "none";
    document.getElementById("navdiv").style.display = "none";

}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("backbutton").style.display = "block";
    document.getElementById("navdiv").style.display = "block";


}

function showHelp(s) {
    d3.selectAll(".w3-display-container").style("display", "none");
    switch (s) {
        case "steps":
            document.getElementById(algShortName).style.display = "block";
            break;
        default:
            document.getElementById(s).style.display = "block";
            break;
    }
    return;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function LoadAlgorithms(event) {
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
        numBots = sText.length - 1;
        for (i=0;i<numBots;i++) {
            tempinstruBinder.push([]);
            //instruBinder[i].push([]);
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
            window.instruBinder = tempinstruBinder.slice(0);
        }
        //closeNav();
        wireless = true;
        Reset();
    });
    fileReader.readAsText(file);


}


//////////----------Initial Function Call----------//////////
var algSelector;
var algRequested = window.location.href.includes("#");
if (algRequested) {
    algSelector = window.location.href.indexOf("#");
    var l = window.location.href.length;
    console.log(window.location.href.slice(algSelector + 1, l));
    var wire = true;
    if (window.location.href.includes("wl") || window.location.href.includes("Q")){
        wire = true;
    }
    else {
        wire = false;
    }
    showAlgorithmDesc(window.location.href.slice(algSelector + 1, l), wire);
}
else {
    showAlgorithmDesc("A", false);
}
Start();
