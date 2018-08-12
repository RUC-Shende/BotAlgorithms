
    //////////----------Instantiate Variables----------//////////
    var fxs = [GoOutAtAngle, Wait, FollowWall, WaitFor, FollowWallFor, GoToCenter, WaitAverage, GoToPoint];
    var efxs = [GoToExit];
    var shapes = ["Circle", "Will Crash", "Triangle", "Square", "Pentagon", "Hexagon",
                  "Heptagon", "Octagon", "Nonagon", "Decagon", "Undecagon", "Dodecagon"];

    var loading = true;
    var wireless = true;

    var time = 0;
    var timeDirect = 0;
    var fps = 60;
    var timeMax = 10 * fps;
    var timeBox;
    var timeSlide;

    var projector;
    var degrees = 1;
    var unit2Px = ((window.innerHeight <= window.innerWidth) ?
                  (window.innerHeight) : (window.innerWidth)) / 6;
    var center = [unit2Px * 2, unit2Px * 2];
    var exitAngle = 0;
    var fieldExit = [center[0] + unit2Px, center[1]];

    var selectText;
    var dataBox;
    var lineFx = d3.line().x((d) => {return(d.x);}).y((d) => {return(d.y);});

    var touristNum = 0;
    var instruBinder = [
                        [[0, [null]], [0, [45]], [3, [1]], [5, [null]], [0, [225]], [4, ["left", 90]], [2, ["right"]]],
                        [[0, [null]], [0, [-45]], [3, [1]], [5, [null]], [0, [135]], [4, ["right", 90]], [1, [null]]],
                        /*[[0, [null]], [0, [90]], [4, ["left", 180]], [1, [null]]],
                        [[0, [null]], [0, [90]], [4, ["right", 180]], [1, [null]]],*/
                        /*[[0, [null]], [0, [90]], [4, ["left", 120]], [7, [center[0], center[1] + unit2Px / 3]], [0, [null]], [4, ["left", 60]], [1, [null]]],
                        [[0, [null]], [0, [90]], [4, ["right", 120]], [7, [center[0], center[1] + unit2Px / 3]], [0, [null]], [4, ["right", 60]], [1, [null]]], */
                        /*[[0, [null]], [0, [90]], [4, ["left", 120]], [7, [center[0] - unit2Px / 3, center[1] + unit2Px / 3]],
                         [7, [center[0], center[1] + unit2Px / 3]], [0, [null]], [4, ["left", 60]], [1, [null]]],
                        [[0, [null]], [0, [90]], [4, ["right", 120]], [7, [center[0] + unit2Px / 3, center[1] + unit2Px / 3]],
                         [7, [center[0], center[1] + unit2Px / 3]], [0, [null]], [4, ["right", 60]], [1, [null]]],*/
                        [[0, [null]], [6, [null]]]
                       ];
    var tourColors = [];

    var fieldSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
    var tourists = [];
    var tourLines = [];
    var tourLine = [];

    var graphSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
    var graphDots = [];
    var graphLines = [];
    var graphLine = [];

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
      for (var i = 0; i < touristNum; i++) {
        var who = tourists[i];
        who.x = tourLines[i][time].x;
        who.y = tourLines[i][time].y;
        who.visual.attr("cx", who.x).attr("cy", who.y);
        graphDots[i].attr("cx", graphLines[i][time].x).attr("cy", graphLines[i][time].y);
      }
    }

    function ESlide() {
      d3.select(this).style("fill", "#888888");
      d3.select(this).classed("active", false);
    }

    //////////---------- Instantiate Classes ----------//////////
//Data holder, and loader update
    class Tourist {
      constructor (visual) {
        this.number = touristNum;
        this.visual = visual;
        this.knows = false;
        this.target = null;
        this.velocity = 1;
        this.allowance = 0;
        this.on = 1;
        this.a = 0;
        this.x = center[0];
        this.y = center[1];
      }
    }

    //////////----------Instantiate Functions----------//////////
    function WallAtAngle(angle) {
      var unitAngle = (2 * Math.PI) / degrees;//Angle segments
      var angleUnit = Math.floor(angle / unitAngle);//Which segment
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

    function DirectTo(who, value) {
      var dLoc = [value[0] - who.x, value[1] - who.y];
      var dist = Math.sqrt(Math.pow(dLoc[1], 2) + Math.pow(dLoc[0], 2));
      if (dist < who.velocity * unit2Px / fps) {
        who.x = value[0];
        who.y = value[1];
        who.allowance -= dist;
      } else {
        var ang = Math.atan2(dLoc[1], dLoc[0]);
        if (who.allowance < who.velocity * unit2Px / fps) {
          who.x = who.x + who.velocity * Math.cos(ang) * (who.allowance / (who.velocity * unit2Px / fps));
          who.y = who.y + who.velocity * Math.sin(ang) * (who.allowance / (who.velocity * unit2Px / fps));
          who.allowance = 0;
        } else {
          who.x = who.x + (who.velocity * unit2Px / fps) * Math.cos(ang);
          who.y = who.y + (who.velocity * unit2Px / fps) * Math.sin(ang);
          who.allowance = 0;
        }
      }
    }

//Requirements: At center	Params:	Angle(time)	Description: Goes to wall
    function GoOutAtAngle(who, value) {
      if (value[0] != null) {
        who.a = value[0] * (Math.PI / 180);
      }
      if (degrees == 1) {
        if ((who.x == center[0] + unit2Px * Math.cos(who.a)) && (who.y == center[1] - unit2Px * Math.sin(who.a))) {
          who.on++;
        } else {
          GoToPoint(who, [center[0] + unit2Px * Math.cos(who.a), center[1] - unit2Px * Math.sin(who.a)]);
        }
      } else {
        var hold = WallAtAngle(who.a);
        if ((who.x == hold[0]) && (who.y == hold[1])) {
          who.on++;
        } else {
          DirectTo(who, hold);
        }
      }
    }

//Requirements: None	Params: null	Description: Wait indefinitely
    function Wait(who, value) {
      who.allowance = 0;
    }

//Requirements: At wall		Params: direction	Description: Follows wall at direction indefinitely
    function FollowWall(who, value) {
      var dir = (value[0] == 'left') ? (1) : (-1);
      who.a += (1 / (fps * unit2Px)) * dir;
      var hold = [center[0] + unit2Px * Math.cos(who.a), center[1] - unit2Px * Math.sin(who.a)];
      if (degrees > 1) {
        hold = WallAtAngle(who.a);
      }
      DirectTo(who, hold);
    }

//Requirements: None	Params: time	Description: Wait for x time
    function WaitFor(who, value) {
      if (who.target == null) {
        who.target = time + value[0] * fps;
      }
      if (time >= who.target) {
        who.on++;
        who.allowance -= (unit2Px / fps) - (time - who.target);
        who.target = null;
      } else {
        who.allowance = 0;
      }
    }

//Requirements: At wall		Params: direction and angle(time)	Description: Follows wall at direction for x time
    function FollowWallFor(who, value) {
      var dir = (value[0] == 'left') ? (1) : (-1);
      if (who.target == null) {
        who.target = who.a + value[1] * (Math.PI / 180) * dir;
      }
      var leftCondition = who.a + (1 / (fps * unit2Px)) * dir;
      var rightCondition = who.target;
      if (dir < 0) {
        leftCondition = who.target;
        rightCondition = who.a + (1 / (fps * unit2Px)) * dir;
      }
      if (leftCondition > rightCondition) {
        who.on++;
        who.a = who.target;
        who.target = null;
      } else {
        who.a += (1 / (fps * unit2Px)) * dir;
      }
      var hold = [center[0] + unit2Px * Math.cos(who.a), center[1] - unit2Px * Math.sin(who.a)];
      if (degrees > 1) {
        var hold = WallAtAngle(who.a);
      }
      DirectTo(who, hold);
    }

//Requirements: At wall		Params: null	Description: Goes to center
    function GoToCenter(who, value) {
      if ((who.x == center[0]) && (who.y == center[1])) {
        who.on++;
      } else {
        DirectTo(who, center);
      }
    }

//Requirements: None	Params: null	Description: Goes to center of all bots
    function WaitAverage(who, value) {
      var sumPosition = [0, 0];
      var totalNum = 0;
      for (i = 0; i < tourists.length; i++) {
        if (instruBinder[i][tourists[i].on][0] != 6) {
          totalNum++;
          sumPosition[0] += tourists[i].x;
          sumPosition[1] += tourists[i].y;
        }
      }
      sumPosition[0] /= totalNum;
      sumPosition[1] /= totalNum;
      if ((who.x == sumPosition[0]) && (who.y == sumPosition[1])) {
        who.allowance = 0;
      } else {
        DirectTo(who, sumPosition);
      }
    }

//Requirements: None		Params: cartesian coordinates	Description: Goes to coordinates
    function GoToPoint(who, value) {
      if ((who.x == value[0]) && (who.y == value[1])) {
        who.on++;
      } else {
        DirectTo(who, value);
      }
    }






    function GoToExit(who, value) {
      if ((who.x == fieldExit[0]) && (who.y == fieldExit[1])) {
        Wait(who, [null]);
      } else {
        DirectTo(who, fieldExit);
      }
    }






    function Start() {
        degrees = 360;
        Load();
    }

    function Load() {
      //Primary and layered SVGs
      fieldSVG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                   .style("float", "left").style("border", "1px solid black")
                   .on("mousemove", ChoosExit).on("click", exitChosen);
      graphSVG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                   .style("float", "left").style("border", "1px solid black");
      var classes = ["backGround", "lines", "bots", "overLay"];
      for (var i = 0; i < classes.length; i++) {
        fieldSVG.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                     .attr("class", classes[i]);
        graphSVG.append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                     .attr("class", classes[i]);
      }
      LoadField();
      LoadGraph();
      //Tourist Visuals
      for (var i = 0; i < instruBinder.length; i++) {
        tourColors.push(RandomColor());
        tourists.push(new Tourist(fieldSVG.select(".bots").append("circle").attr("cx", center[0]).attr("cy", center[1])
                                  .attr("r", unit2Px / 16)//.on("mouseover", () => {alert("woo");})
                                  .style("fill", tourColors[i]), instruBinder[i]));
        touristNum++;
        tourLines.push([]);
        graphDots.push(graphSVG.select(".bots").append("circle").attr("cx", unit2Px * (10 / 25))
                       .attr("cy", unit2Px * 4 * (20 / 25) - unit2Px * (10 / 25)).attr("r", unit2Px / 16)
                       .style("fill", tourColors[i]));
        graphLines.push([]);
      }
    }

    function LoadField() {
      fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (1 / 5))
              .style("text-anchor", "middle").style("font-size", unit2Px * (1 / 5)).text("Search and Exit");
      fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (3 / 10))
              .style("text-anchor", "middle").style("font-size", unit2Px * (1 / 10)).text(shapes[degrees - 1] + " Wireless");
      fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (5 / 10)).attr("class", "exitText")
              .style("text-anchor", "middle").style("font-size", unit2Px * (2 / 10))
              .text("Left-Click, to choose exit location at ~" + 0 + " degrees");
      //Shape
      if (degrees == 1) {
        fieldSVG.select(".backGround").append("circle").attr("cx", center[0]).attr("cy", center[1]).attr("r", unit2Px)
                .style("fill-opacity", 0.0).style("stroke", "#000000");
      } else {
        var hold = 'M' + (center[0] + unit2Px) + ',' + center[1];
        for (var i = 1; i <= degrees; i++) {
          var holdAng = ((360 / degrees) * i) * (Math.PI / 180);
          hold += 'L' + (center[0] + unit2Px * Math.cos(holdAng)) + ',' + (center[1] - unit2Px * Math.sin(holdAng));
        }
        fieldSVG.select(".backGround").append("path").attr("d", hold).style("fill", "none").style("stroke", "#000000");
      }
      //Unit Circle Visuals
      fieldSVG.select(".backGround").append("circle").attr("cx", center[0]).attr("cy", center[1]).attr("r", 2).style("fill", "#000000");
      fieldSVG.select(".backGround").append("circle").attr("class", "exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]).attr("r", 2)
              .style("fill", "#000000");
      fieldSVG.select(".backGround").append("line").attr("x1", 2 * unit2Px).attr("y1", unit2Px).attr("x2",  2 * unit2Px).attr("y2", 3 * unit2Px)
              .style("stroke", "#000000").style("stroke-width", .5);
      fieldSVG.select(".backGround").append("line").attr("x1", unit2Px).attr("y1", 2 * unit2Px).attr("x2",  3 * unit2Px).attr("y2", 2 * unit2Px)
              .style("stroke", "#000000").style("stroke-width", .5);
      fieldSVG.select(".backGround").append("text").attr("x", 3.1 * unit2Px).attr("y", center[1])
              .style("text-anchor", "left").style("font-size", unit2Px / 5).text("0");
      fieldSVG.select(".backGround").append("text").attr("x", center[0]).attr("y", .9 * unit2Px)
              .style("text-anchor", "middle").style("font-size", unit2Px / 5).text("90");
    }

    function LoadGraph() {
      //Time Slider and Buttons
      timeText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * 1.1).attr("y", unit2Px * .4)
                 .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "right").text("0");
      frameText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * 1.1).attr("y", unit2Px * .7)
                  .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "right").text("0");
      timeBox = graphSVG.select(".backGround").append("rect").attr("width", 4 * unit2Px).attr("height", unit2Px / 8)
                        .attr("fill-opacity", 0.0).style("stroke", "#000000");
      timeSlide = graphSVG.select(".backGround").append("rect").attr("width", unit2Px / 8).attr("height", unit2Px / 8)
                  .attr("class", "reveal").style("fill", "#888888")
                  .call(d3.drag().on("start", SSlide).on("drag", MSlide).on("end", ESlide));
      graphSVG.select(".backGround").append("rect").attr("x", unit2Px * (19 / 25)).attr("y", unit2Px * (4 / 25)).attr("width", unit2Px / 4)
              .attr("class", "reveal").attr("height", unit2Px / 4).style("fill", "#00ff00")
              .on("click", () => {timeDirect++;});
      graphSVG.select(".backGround").append("rect").attr("x", unit2Px * (10 / 25)).attr("y", unit2Px * (4 / 25)).attr("width", unit2Px / 4).attr("height", unit2Px / 4)
              .attr("class", "reveal").style("fill", "#0000ff").on("click", () => {timeDirect = 0;});
      graphSVG.select(".backGround").append("rect").attr("x", unit2Px * (1 / 25)).attr("y", unit2Px * (4 / 25)).attr("width", unit2Px / 4).attr("height", unit2Px / 4)
              .attr("class", "reveal").style("fill", "#ff0000")
              .on("click", () => {timeDirect--;});
      //Tourist Info Visual
      graphSVG.select(".backGround").append("path").attr("d", 'M' + unit2Px * (1 / 25) + ',' + unit2Px * (16 / 25) + 'L' + unit2Px * (6 / 25) + ',' + unit2Px * (11 / 25)
                                              + 'L' + unit2Px * (6 / 25) + ',' + unit2Px * (21 / 25) + 'L' + unit2Px * (1 / 25) + ',' + unit2Px * (16 / 25))
                   .attr("class", "select").on("click", () => {UpdateInfo(-1);});
      selectText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (13 / 25)).attr("y", unit2Px * (18 / 25)).attr("text-anchor", "middle")
                   .attr("class", "select").style("font-size", unit2Px * (7 / 25)).text("0");
      graphSVG.select(".backGround").append("path").attr("d", 'M' + unit2Px * (25 / 25) + ',' + unit2Px * (16 / 25) + 'L' + unit2Px * (20 / 25) + ',' + unit2Px * (11 / 25)
                                                 + 'L' + unit2Px * (20 / 25) + ',' + unit2Px * (21 / 25) + 'L' + unit2Px * (25 / 25) + ',' + unit2Px * (16 / 25))
                 .attr("class", "select").on("click", () => {UpdateInfo(1);});
      graphSVG.select(".backGround").append("path").attr("d", 'M' + unit2Px * (10 / 25) + ',' + unit2Px * (50 / 25)
                                      + 'L' + unit2Px * (10 / 25) + ',' + unit2Px * (90 / 25)
                                      + 'L' + unit2Px * (90 / 25) + ',' + unit2Px * (90 / 25))
              .style("fill", "none").style("stroke", "#000000");
      for (var i = 0; i < 3; i++) {
        graphSVG.select(".backGround").append("text").attr("x", unit2Px * (8 / 25))
                .attr("y", unit2Px * (90 / 25) - i * unit2Px * (20 / 25))
                .style("font-size", unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
      }
      for (var i = 0; i < 11; i++) {
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
      var RGB = [];
      RGB[0] = Math.floor(Math.random() * 256).toString(16);
      RGB[1] = Math.floor(Math.random() * 256).toString(16);
      RGB[2] = Math.floor(Math.random() * 256).toString(16);
      for (j = 0; j < 3; j++) {if (RGB[j].length == 1) {RGB[j] = '0' + RGB[j];}}
      return('#' + RGB[0] + RGB[1] + RGB[2]);
    }

//Controls exit positioning for user's choice
    function ChoosExit() {
      exitAngle = Math.atan2(d3.event.x - center[0], d3.event.y - center[1]) - (Math.PI / 2);
      if (exitAngle < 0) {exitAngle += 2 * Math.PI;}
      d3.select(".exitText").text("Left-Click, to choose exit location at ~" + Math.floor(exitAngle * 180 / Math.PI) + " degrees");
      if (degrees == 1) {
        fieldExit = [center[0] + unit2Px * Math.cos(exitAngle), center[1] - unit2Px * Math.sin(exitAngle)];
      } else if (degrees == 2) {
        fieldExit = [d3.event.x, center[1]];
      } else {
        fieldExit = WallAtAngle(exitAngle);
      }
      d3.select(".exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]);
    }

//Turns off exit choosing events, and starts loading
    function exitChosen() {
      d3.select(".exitText").remove();
      fieldSVG.on("mousemove", null).on("click", null);
      projector = setInterval(LoadAnim, 1000 / fps);
    }

//Control times, and update bots
    function LoadAnim() {
      if (time > timeMax) {
        time = 0;
        for (var i = 0; i < touristNum; i++) {
          tourists[i].on = 1;
          tourists[i].a = 0;
          tourists[i].x = center[0];
          tourists[i].y = center[1];
        }
        clearInterval(projector);
        projector = setInterval(AlterAnim, 1000 / fps);
      } else {
        for (var i = 0; i < tourists.length; i++) {
          LoadLines(i);
          var who = tourists[i];
          who.allowance = who.velocity * unit2Px / fps;
          while (who.allowance > 0) {
            fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
            who.visual.attr("cx", who.x).attr("cy", who.y);
          }
        }
        time++;
        timeSlide.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
        timeBox.attr("width", (time / timeMax) * 4 * unit2Px);
      }
      timeText.text("Time: " + Math.floor((10000 * time) / fps) / 10000);
      frameText.text("Frame: " + time);
    }

//Create lines, and update graph dot positions, as well recreating image of path.
    function LoadLines(i) {
      var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
      graphDots[i].attr("cx", (unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px)).attr("cy", (dista - unit2Px * (10 / 25)));
      if (time > 0) {
        tourLines[i].push({x:tourists[i].x, y:tourists[i].y});
        tourLine[i].remove();
        tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", lineFx(tourLines[i]))
                      .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
        graphLines[i].push({x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))});
        graphLine[i].remove();
        graphLine[i] = graphSVG.select(".lines").append("path").attr("d", lineFx(graphLines[i]))
                       .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
      } else {
        tourLines[i].push({x:center[0], y:center[1]});
        tourLine.push(fieldSVG.select(".lines").append("path").attr("d", lineFx(tourLines[i]))
                      .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none"));
        graphLines[i].push({x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))});
        graphLine.push(graphSVG.select(".lines").append("path").attr("d", lineFx(graphLines[i]))
                       .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none"));
      }
    }

//Control times, and update bots
    function AlterAnim() {
      if (time > timeMax) {
        time = timeMax;
        UpdateInfo(0);
        clearInterval(projector);
        projector = setInterval(PlayAnim, 1000 / fps);
      } else {
        for (var i = 0; i < tourists.length; i++) {//Save previous frame
          AlterLines(i);
        }
        for (var i = 0; i < tourists.length; i++) {//Prepare next frame
          var who = tourists[i];
          who.allowance = who.velocity * unit2Px / fps;
          while (who.allowance > 0) {
            var dLoc = [fieldExit[0] - who.x, fieldExit[1] - who.y];
            var dist = Math.sqrt(Math.pow(dLoc[1], 2) + Math.pow(dLoc[0], 2));
            if (dist < who.velocity * unit2Px / fps) {
              who.knows = true;
            }
            if (who.knows) {
              efxs[instruBinder[i][0][0]](who, instruBinder[i][0][1]);
            } else {
              fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
            }
            who.visual.attr("cx", who.x).attr("cy", who.y);
          }
        }
        time++;
        timeSlide.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
      }
      timeText.text("Time: " + Math.floor((10000 * time) / fps) / 10000);
      frameText.text("Frame: " + time);
    }

//Create lines, and update graph dot positions, as well recreating image of path.
    function AlterLines(i) {
      var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
      graphDots[i].attr("cx", (unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px)).attr("cy", (dista - unit2Px * (10 / 25)));
      tourLines[i][time] = {x:tourists[i].x, y:tourists[i].y};
      tourLine[i].remove();
      tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", lineFx(tourLines[i]))
                    .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
      graphLines[i][time] = {x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))};
      graphLine[i].remove();
      graphLine[i] = graphSVG.select(".lines").append("path").attr("d", lineFx(graphLines[i]))
                     .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
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
        for (var i = 0; i < touristNum; i++) {
          var who = tourists[i];
          who.x = tourLines[i][time].x;
          who.y = tourLines[i][time].y;
          who.visual.attr("cx", who.x).attr("cy", who.y);
          graphDots[i].attr("cx", graphLines[i][time].x).attr("cy", graphLines[i][time].y);
        }
        timeSlide.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
        timeText.text("Time: " + Math.floor((10000 * time) / fps) / 10000);
        frameText.text("Frame: " + time);
      }
    }

    function UpdateInfo(delta) {
      if (selectText.text() != 0) {
        tourists[selectText.text() - 1].visual.attr("r", unit2Px / 16);
        graphDots[selectText.text() - 1].attr("r", unit2Px / 16);
        tourLine[selectText.text() - 1].style("stroke-opacity", 0.5);
        graphLine[selectText.text() - 1].style("stroke-opacity", 0.5);
      }
      delta += +selectText.text();
      if (delta < 0) {delta = tourists.length;}
      else if (delta > tourists.length) {delta = 0;}
      selectText.text(delta);
      if (delta != 0) {
        tourists[delta - 1].visual.attr("r", unit2Px / 8);
        graphDots[delta - 1].attr("r", unit2Px / 8);
        tourLine[delta - 1].style("stroke-opacity", 1).raise();
        graphLine[delta - 1].style("stroke-opacity", 1).raise();
        d3.selectAll(".select").style("fill", tourColors[delta - 1]);
      }
    }

    function showAlgorithmDesc(s){
        d3.selectAll('.desc').style('display', 'none');
        d3.select('#'+s).style('display', 'inline-block');
    }

    //////////----------Initial Function Call----------//////////
    Start();