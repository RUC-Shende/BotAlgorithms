
      //////////----------Instantiate Variables----------//////////
      var fxs = {"GoOutAtAngle":GoOutAtAngle, "GoToWallAtAngle":GoToWallAtAngle, "Wait":Wait, "FollowWall":FollowWall,
                 "GoToCenter":GoToCenter, "WaitAverage":WaitAverage, "GoToPoint":GoToPoint};
      var efxs = {"GoToExit":GoToExit, "PursueNonBeliever":PursueNonBeliever, "InterceptNonBeliever":InterceptNonBeliever};
      var shapes = ["Vertex", "Line", "Triangle", "Square", "Pentagon", "Hexagon", "Heptagon",
                    "Octagon", "Nonagon", "Decagon", "Undecagon", "Dodecagon", "Circle"];

      var exitAlert = false;//Someone learned where the exit is.
      var exitAllow = 0;//How far in a frame was the exit found.
      var wireless = true;

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
      var lineFx = d3.line().x((d) => {return(d.x);}).y((d) => {return(d.y);});

      var touristNum = 0;
      var instruBinder = [
                          [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]],
                          [["InterceptNonBeliever", [null]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]]
                         ];
      var tourColors = [];

      var fieldSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
      var tourists = [];
      var tourPoints = [];
      var tourLine = [];

      var graphSVG; //0:Background - 1:Line - 2:Bots - 3:Overlay
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
      * @param {Circle} visual Represents the visual related to the bot.
      */
      class Tourist {
        constructor (visual) {
          /** The robot's ID as an integer. */
          this.number = touristNum;
          this.visual = visual;
          /** The robot has learned of the exit on this frame. */
          this.knows = false;
          /** The robot has known of the exit for more than one frame. */
          this.knew = false;
          /** Robot's current goal according to its command. Can be a point on the shape or another robot. */
          this.target = null;
          /** The robot that is currently pursuing this. */
          this.hunted = null;
          /** Speed of the tourist. */
          this.velocity = 1;
          /** How far this can move in one frame. */
          this.allowance = 0;
          /** This tourist's current instruction function. */
          this.on = 1;
          /** tourist's current angle. */
          this.a = 0;
          /** tourist's current x position. */
          this.x = center[0];
          /** tourist's current y position. */
          this.y = center[1];
        }
      }

      //////////----------Instantiate Functions----------//////////
      function LineOverride(who, value) {//direction, time(in radiuses)
        if (value[1] == null) {
          if (who.target == null) {
            who.target = who.x + value[0] * value[1] * unit2Px;
          }
          var leftCondition = who.target;
          var rightCondition = who.x;
          if (value[0] < 0) {
            leftCondition = who.x;
            rightCondition = who.target;
          }
          if (leftCondition < rightCondition) {
            who.x = who.target;
            who.target = null;
            who.on++;
          } else {
            who.x += value[0] * unit2Px / fps;
          }
        } else {
          who.x += value[0] * unit2Px / fps;
        }
        DirectTo(who, [who.x, who.y]);
      }

      function WallAtAngle(angle) {
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
          } else {
            who.x = who.x + (who.velocity * unit2Px / fps) * Math.cos(ang);
            who.y = who.y + (who.velocity * unit2Px / fps) * Math.sin(ang);
          }
          who.allowance = 0;
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
      function GoToWallAtAngle(who, value) {
        if (value[0] != null) {
          who.a = value[0] * (Math.PI / 180);
        }
        var hold = WallAtAngle(who.a);
        if ((who.x == hold[0]) && (who.y == hold[1])) {
          who.on++;
        } else {
          DirectTo(who, hold);
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
      function GoOutAtAngle(who, value) {
        if (who.target == null) {
          var hold = [value[1] * Math.cos(value[0] * (Math.PI / 180)), value[1] * Math.sin(value[0] * (Math.PI / 180))];
          who.target = [who.x + hold[0], who.y + hold[1]];
        }
        if ((who.x == who.target[0]) && (who.y == who.target[1])) {
          who.on++;
          who.target = null;
        } else {
          DirectTo(who, who.target);
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
      function Wait(who, value) {
        if (value[0] == null) {
          who.allowance = 0;
        } else {
          if (who.target == null) {
            who.target = time + value[0] * fps;
          }
          if (time >= who.target) {
            who.on++;
            who.allowance -= who.velocity * (unit2Px / fps) - (time - who.target);
            who.target = null;
          } else {
            who.allowance = 0;
          }
        }
      }

//Requirements: At wall		Params: direction and time?	Description: Follows wall at direction

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
      function FollowWall(who, value) {
        var dir = (value[0] == 'left') ? (1) : (-1);
        if (value[1] == null) {
          who.a += (1 / (fps * unit2Px)) * dir;
          DirectTo(who, WallAtAngle(who.a));
        } else {
          if (who.target == null) {
            who.target = who.a + value[1] * (Math.PI / 180) * -dir;
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
          DirectTo(who, WallAtAngle(who.a));
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
      function GoToCenter(who, value) {
        if ((who.x == center[0]) && (who.y == center[1])) {
          who.on++;
        } else {
          DirectTo(who, center);
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
      function WaitAverage(who, value) {
        var sumPosition = [0, 0];
        var totalNum = 0;
        for (i = 0; i < tourists.length; i++) {
          if (instruBinder[i][tourists[i].on][0] != "WaitAverage") {
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

        /**
        *
        * The robot will go to a point on the shape defined by cartesian coordinates (x, y)
        *
        *@param {Tourist} who Robot to follow command.
        *@param {Array} value value[0]: float, x position -- value[1]: float, y position
        */
      function GoToPoint(who, value) {
        if ((who.x == value[0]) && (who.y == value[1])) {
          who.on++;
        } else {
          DirectTo(who, value);
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
      function GoToExit(who, value) {
        if ((who.x == fieldExit[0]) && (who.y == fieldExit[1])) {
          Wait(who, [null]);
          if (allExitedLine == null) {
            AllAtExit();
          }
        } else {
          DirectTo(who, fieldExit);
        }
      }

        /**
        *
        * Robot will continuously move in the direction of the target, until it catches it.
        *
        *@param {Tourist} who Robot to follow command.
        *@param value null
        */
      function PursueNonBeliever(who, value) {
        if (who.target == null) {
          var closest = Infinity;
          for (var i = 0; i < touristNum; i++) {
            if ((!tourists[i].knows) && ((tourists[i].hunted == who.number) || (tourists[i].hunted == null))) {
              var eVec = [tourists[i].x - who.x, tourists[i].y - who.y];
              var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
              if (exitDist < closest) {
                who.target = i;
                closest = exitDist;
              }
            }
          }
        }
        if (who.target == null) {
          GoToExit(who, value);
        } else {
          tourists[who.target].hunted = who.number;
          var bVec = [tourists[who.target].x - who.x, tourists[who.target].y - who.y];
          var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
          if (botDist <= who.velocity * unit2Px / fps) {
            exitAlert = tourists[who.target].knows = true;
            exitAllow = botDist;
          }
          DirectTo(who, [tourists[who.target].x, tourists[who.target].y]);
          if (tourists[who.target].knows) {
            who.target = null;
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
      function InterceptNonBeliever(who, value) {
        if (who.target == null) {
          var holdTime = 0;
          var closest = Infinity;
          for (var i = 0; i < touristNum; i++) {
            if ((!tourists[i].knows) && ((tourists[i].hunted == who.number) || (tourists[i].hunted == null))) {
              for (var j = 0; j < 2 * unit2Px; j++) {
                if (time + j < timeMax) {
                  var intercept = tourPoints[i][time + j];
                  var bVec = [intercept.x - who.x, intercept.y - who.y];
                  var botDist = Math.sqrt(Math.pow(bVec[1], 2) + Math.pow(bVec[0], 2));
                  if ((Math.abs(j * unit2Px / fps - botDist) <= who.velocity * unit2Px / (2 * fps)) && (botDist < closest)) {
                    who.target = [i, intercept];
                    closest = botDist;
                  }
                }
              }
            }
          }
        }
        if (who.target == null) {
          GoToExit(who, value);
        } else {
          tourists[who.target[0]].hunted = who.number;
          var pVec = [who.target[1].x - who.x, who.target[1].y - who.y];
          var pointDist = Math.sqrt(Math.pow(pVec[1], 2) + Math.pow(pVec[0], 2));
          if (pointDist <= who.velocity * unit2Px / fps) {
            exitAlert = tourists[who.target[0]].knows = true;
            exitAllow = pointDist;
          }
          DirectTo(who, [who.target[1].x, who.target[1].y]);
          if (tourists[who.target[0]].knows) {
            who.target = null;
          }
        }
      }





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
        fieldSVG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                     .style("float", "left").style("border", "1px solid black")
                     .on("mousemove", ChoosExit).on("click", exitChosen);
        graphSVG = d3.select("body").append("svg").attr("width", unit2Px * 4).attr("height", unit2Px * 4)
                     .style("float", "left").style("border", "1px solid black");
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
          tourColors.push(RandomColor());
          tourists.push(new Tourist(fieldSVG.select(".bots").append("circle").attr("cx", center[0]).attr("cy", center[1])
                                    .attr("data", touristNum).attr("r", unit2Px / 16).on("mouseover", MoveDataBox)
                                    .on("mouseout", HideDataBox).style("fill", tourColors[i])
                                    .style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px)));
          tourPoints.push([]);
          graphDots.push(graphSVG.select(".bots").append("circle").attr("cx", unit2Px * (10 / 25))
                         .attr("cy", unit2Px * 4 * (20 / 25) - unit2Px * (10 / 25)).attr("r", unit2Px / 16)
                         .style("fill", tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * unit2Px));
          graphPoints.push([]);
          touristNum++;
        }
        dataBox = fieldSVG.select(".overLay").append("svg").attr("width", 2 * unit2Px).attr("height", unit2Px).attr("visibility", "hidden");
        while (time < timeMax) {//Load one run through.
          LoadAnim();
        }
        time = 0;
        for (var i = 0; i < touristNum; i++) {//Reset for next run through.
          tourists[i].on = 1;
          tourists[i].a = 0;
          tourists[i].x = center[0];
          tourists[i].y = center[1];
          tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", lineFx(tourPoints[i]))
                        .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
          graphLine[i] = graphSVG.select(".lines").append("path").attr("d", lineFx(graphPoints[i]))
                         .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
        }
      }

      function LoadField() {
        fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (1 / 5))
                .style("text-anchor", "middle").style("font-size", unit2Px * (1 / 5)).text("Search and Exit");
        fieldSVG.select(".backGround").append("text").attr("x",  center[0]).attr("y", unit2Px * (3 / 10))
                .style("text-anchor", "middle").style("font-size", unit2Px * (1 / 10)).text(shapes[degrees - 1] + " Wireless");
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
        timeText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .4)
                   .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "start").text("Time: 0");
        frameText = graphSVG.select(".backGround").append("text").attr("x", unit2Px * (1/ 25)).attr("y", unit2Px * .7)
                    .style("font-size", unit2Px * (8 / 25)).style("text-anchor", "start").text("Frame: 0");
        graphSVG.select(".backGround").append("rect").attr("width", 4 * unit2Px).attr("height", unit2Px / 8)
                .attr("fill-opacity", 0.0).style("stroke", "#000000");
        timeSlider = graphSVG.select(".backGround").append("rect").attr("width", unit2Px / 8).attr("height", unit2Px / 8)
                    .attr("class", "reveal").style("fill", "#888888")
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
        var RGB = [];
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
        d3.select(".exitText").text("Left-Click to place exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
        if (degrees == 2) {//Choose exit relative to mouse position.
          fieldExit = [d3.event.x, center[1]];
        } else {//Choose exit relative to shape.
          fieldExit = WallAtAngle(exitAngle);
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
            fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
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
            who.allowance = who.velocity * unit2Px / fps;
            while (who.allowance > 0) {
              if (who.knows) {
                efxs[instruBinder[i][0][0]](who, instruBinder[i][0][1]);
              } else {
                fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
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
              exitFoundLine = graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
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
              who.allowance = exitAllow;
              while (who.allowance > 0) {
                if (who.knew) {//Target already on exit procedures.
                  efxs[instruBinder[i][0][0]](who, instruBinder[i][0][1]);
                } else {//Has not started exit procedures yet.
                  fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
                  if (who.knows) {//Clear target for bot if beginning exit procedures.
                    who.target = null;
                  }
                }
              }
              who.allowance = (who.velocity * unit2Px / fps) - exitAllow;
              while (who.allowance > 0) {
                if (who.knows) {//Proceed with exit procedures.
                  efxs[instruBinder[i][0][0]](who, instruBinder[i][0][1]);
                  who.knew = true;
                } else {//Still does not know.
                  fxs[instruBinder[i][who.on][0]](who, instruBinder[i][who.on][1]);
                }
              }
            }
            exitAlert = false;
          }
          UpdateVisuals();
          time++;
          timeSlider.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
        }
        timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
        frameText.text("Frame: " + time);
      }

//Create lines, and update graph dot positions, as well as recreating image of path.
      function AlterLines(i) {
        var dista = unit2Px * 4 - (Math.sqrt(Math.pow(fieldExit[0] - tourists[i].x, 2) + Math.pow(fieldExit[1] - tourists[i].y, 2)) * (20 / 25));
        tourPoints[i][time] = {x:tourists[i].x, y:tourists[i].y};
        tourLine[i].remove();
        tourLine[i] = fieldSVG.select(".lines").append("path").attr("d", lineFx(tourPoints[i]))
                      .style("stroke", tourColors[i]).style("stroke-width", unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
        graphPoints[i][time] = {x:(unit2Px * (10 / 25) + (time / timeMax) * (80 / 25) * unit2Px), y:(dista - unit2Px * (10 / 25))};
        graphLine[i].remove();
        graphLine[i] = graphSVG.select(".lines").append("path").attr("d", lineFx(graphPoints[i]))
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
        allExitedLine = graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
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
          timeSlider.attr("x", (time / timeMax) * (31 / 8) * unit2Px);
          timeText.text("Time: " + Math.floor((100 * time) / fps) / 100);
          frameText.text("Frame: " + Math.floor(time));
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

      //////////----------Initial Function Call----------//////////
      Start();
