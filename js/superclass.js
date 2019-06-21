/**
*Data necessary to run a simulation of a given algorithm, create visual paths, etc.
*Tourist == Agent == Robot.
*
* @param {integer} id Global identifier of this object.
* @param {Array} instruBinder Array of valid trajectories for Tourists to follow. Length of this is touristNum.
* @param {string} algorithmName Full clean name of the algorithm instruBinder is supposed to represent.
* @param {float} angle Angle of the exit location on the shape. Exit location will be at the wall of the shape.
* @param {boolean} wireless True if using Wireless communication model, false otherwise.4
*
*/
class iclData {
    constructor(id, instruBinder, algorithmName, angle, wireless) {
        /** Someone learned where the exit is. */
        this.exitAlert = false;
        /** How far into a frame the exit was found. */
        this.exitAllow = 0;
        /** Whether or not the simulation is using the wireless model. */
        this.wireless = wireless;
        /** Global identifier to this data structure. */
        this.id = id;
        /** Current time of the simulation (frames). */
        this.time = 0;
        /** Current velocity of the simulation. 1 - Forward. 0 - Stopped. -1 - Rewind. (0,1) - Slow */
        this.timeDirect = 0;
        /** Frames per second. Too high (> 100) == bad performance. */
        this.fps = 60;
        /** The maximum time before we stop the simulation for good. */
        this.timeMax = 10 * this.fps;
        /** Points of the equilateral shape to search. Ex. 3 = Triangle, 4 = square, 360 = circle */
        this.degrees = 3;
        /** 1 unit == 1 Radius. How many pixels per unit. */
        this.unit2Px = 25;
        /** Center of the current shape in {float}[x,y]. */
        this.center = [this.unit2Px * 2, this.unit2Px * 2];
        /** Angle of the exit to use for the sim. */
        this.exitAngle = angle;
        /** Exit to use for the sim in {float}[x,y]. */
        this.fieldExit = [this.center[0] + this.unit2Px * Math.cos(this.exitAngle * Math.PI / 180), this.center[1] - this.unit2Px * Math.sin(this.exitAngle * Math.PI / 180)];
        /** How many tourists this data structure is in control of. */
        this.touristNum = 0;
        /** Array of valid trajectories for robots. Length is how many tourists are being used. */
        this.instruBinder = instruBinder;
        /** Full clean name of algorithm. */
        this.algorithmName = algorithmName;
        /** Hex color values of robots. */
        this.tourColors = [];
        /** Array of {Tourist}s */
        this.tourists = [];
        /** Array of Arrays of {x:, y:} objects to represent points on the field. touristNum == number of inner arrays. */
        this.tourPoints = [];
        /** Array of touristNum strings, representing the current line left behind by a Tourist's trajectory. */
        this.tourLine = [];
        /** Array of touristNum visuals of the robots on the graph. */
        this.graphDots = [];
        /** Array of Arrays of {x:, y:} objects to represent points on the graph. touristNum == number of inner arrays. */
        this.graphPoints = [];
        /** Array of touristNum strings, representing the current line left behind by a Tourist's graph positions. */
        this.graphLine = [];
        /** Whether or not the exit has been found yet. Can represent a visual. */
        this.exitFoundLine = null;
        /** Whether or not all have exited. Can represent a visual. */
        this.allExitedLine = null;
        /** Frame on which the exit was found. */
        this.exitFoundFrame = 0;

        this.Start();
    }

    /**
    *Initializes the data structure, and runs a no-exit sim to initialize important values.
    *Create and initialize all Tourists.
    *Called from constructor.
    */
    Start() {
        this.degrees = 360; // Change shape. See "this.degrees" in the constructor.
        for (var i = 0; i < this.instruBinder.length; i++) { //Add bots, lines, and coordinate collectors.
            this.tourists.push(new Tourist(this, instruBinder[i][0][1][1]));
            this.tourPoints.push([]);
            this.graphPoints.push([]);
            this.touristNum++;
        }

        for (var i = 0; i < this.tourists.length; i++) {
            this.tourists[i].target = null;
        }
        while (this.time < this.timeMax) { //Load one run through.
            this.LoadAnim();
        }

        this.time = 0;

        for (var i = 0; i < this.touristNum; i++) { //Reset for next run through.
            this.tourists[i].on = 1;
            this.tourists[i].a = 0;
            this.tourists[i].x = this.center[0];
            this.tourists[i].y = this.center[1];

        }

        //while (this.time < this.timeMax) { //Load one run through.
        //    this.AlterAnim();
        //}
        this.time = this.timeMax;

        this.time = 0;

        for (var i = 0; i < this.touristNum; i++) { //Reset for next run through.
            this.tourists[i].on = 1;
            this.tourists[i].a = 0;
            this.tourists[i].x = this.center[0];
            this.tourists[i].y = this.center[1];

        }
    }

    /**
    *Load and calculate the entirety of the animation, until time runs out.
    *Used in the no-exit sim portion of this.Start().
    *Called from this.Start().
    */
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

    /**
    *Create points {x:x', y:y'}, so intercept function knows
    *where a mobile agent will be.
    *All agents will know others' trajectories during the sim,
    *this is a way of getting that info quickly.
    *Used in the no-exit sim portion of this.Start().
    *Called from this.LoadAnim().
    *
    * @param {integer} i Which frame of the sim we will be calculating for.
    */
    LoadPoints(i) {
        var dista = this.unit2Px * 4 - (Math.sqrt(Math.pow(this.fieldExit[0] - this.tourists[i].x, 2) + Math.pow(this.fieldExit[1] - this.tourists[i].y, 2)) * (20 / 25));
        this.tourPoints[i].push({
            x: this.tourists[i].x,
            y: this.tourists[i].y
        });
        this.graphPoints[i].push({
            x: (this.unit2Px * (10 / 25) + (this.time / this.timeMax) * (80 / 25) * this.unit2Px),
            y: (dista - this.unit2Px * (10 / 25))
        });
    }

    /**
    *Check to see that the exit conditions have been satisfied.
    *If so, modify this.time and this.timeMax to signal end of sim.
    *
    * Called from this.AlterAnim(), Tourist.DirectTo(), Tourist.GoToExit().
    */
    AllAtExit() {

        if (this.exitAlert){ // check to see if any priority have exited.
            for (var p = 0; p < this.touristNum; p++){
                if (this.tourists[p].priority && this.tourists[p].atExit){
                    this.allExitedLine = 1;
                    this.timeMax = this.time;
                }
            }
        }
      for (var j = 0; j < this.touristNum; j++) {//Check every mobile agent
        if ((this.tourists[j].x != this.fieldExit[0]) || (this.tourists[j].y != this.fieldExit[1])) {//check if not at exit
          return;
        }
        else if (!this.priorityExitedLine && this.tourists[j].priority){//assuming also at exit...
            var holdP = (this.unit2Px * (10 / 25) + ((this.time + this.exitAllow) / this.timeMax) * (80/25) * this.unit2Px);
            this.priorityExitedLine = 1;
                                /*graphSVG.select(".overLay").append("line").attr("x1", holdP).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                              .attr("x2", holdP).attr("y2", 1.75 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                              .style("stroke-opacity", 0.5);*/

            this.timeMax = this.time; //to account for the extra bot getting to its next point
        }
      }
      if (!this.allExitedLine){
        var holdX = (this.unit2Px * (10 / 25) + ((this.time + this.exitAllow) / this.timeMax) * (80 / 25) * this.unit2Px);

        this.allExitedLine = 1;
                        /*graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                      .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                      .style("stroke-opacity", 0.5);*/
        this.timeMax = this.time;
      }
    }


}

/**
*All visual updates and d3 calls for the sim happen in this.
*Rests on top of an instance of iclData.
*Field: The Shape, usually the left panel.
*Graph: The distance from exit graph, usually LoadPointsthe right panel.
*Multiple instances can and will be used for algorithm comparisons.
*
* @param {iclData} iclData The values necessary to update the visuals.
*
*/

class iclVisual {
    constructor(iclData) {
        /** An instance of iclData to use to update visuals */
        this.iclData = iclData;
        /** An array of hex color codes for Tourists */
        this.tourColors = [];
        /** A D3 reference to the Field. Contains 4 Layers - 1: BackGround, 2: Lines, 3: Bots, 4: OverLay */
        this.fieldSVG = d3.select("#anim" + this.iclData.id);
        /** A D3 reference to the Graph. Contains 4 Layers - 1: BackGround, 2: Lines, 3: Bots, 4: OverLay */
        this.graphSVG = d3.select("#graph" + this.iclData.id);
        /** A D3 reference to the movable time slider that appears at the end of a normal sim. */
        this.timeSlider;
        /** A D3 reference to the text which shows the current time in the sim (seconds). */
        this.timeText;
        /** A D3 reference to the text which shows the current time in the sim (frames). */
        this.frameText;
        /** A reference to a D3 line function to create valid lines out of strings. */
        this.lineFx = d3.line().x((d) => {
            return (d.x);
        }).y((d) => {
            return (d.y);
        });
        // Initialize.
        this.Start();
    }


    RandomColor() {
        var RGB = ["00", "00", "00"];
        RGB[0] = Math.floor(Math.random() * 256).toString(16);
        RGB[1] = Math.floor(Math.random() * 256).toString(16);
        RGB[2] = Math.floor(Math.random() * 256).toString(16);
        for (var j = 0; j < 3; j++) {
            if (RGB[j].length == 1) {
                RGB[j] = '0' + RGB[j];
            }
        } //Add a zero in front of single digit hex.
        return ('#' + RGB[0] + RGB[1] + RGB[2]);
    }

    /**
    *Helper function for time slider.
    *Initializes the slider to be moved.
    *Removes help text for visibility.
    *Called by anonymous function inside LoadGraph().
    */
    SSlide() {
      d3.select(this).style("fill", "orange");
      d3.select(this).classed("active", true);
      d3.selectAll(".sliderhelp").style("visibility", "hidden");
    }
    /**
    *Helper function for time slider.
    *Makes sure the slider stays within the bounds of timeMax.
    *Called by anonymous function inside LoadGraph().
    ***Relies on window.superlist**.
    */
    MSlide() {
      var mousePos = d3.event.x;
      if (mousePos < superlist[controllerID].iclData.unit2Px * (10/25)) {
        mousePos = superlist[controllerID].iclData.unit2Px * (10/25);
      } else if (mousePos > (71 / 20) * superlist[controllerID].iclData.unit2Px) {
        mousePos = (71 / 20) * superlist[controllerID].iclData.unit2Px;
      }
      d3.select(this).attr("x", mousePos);
      superlist[controllerID].iclData.time = Math.round(((mousePos - (superlist[controllerID].iclData.unit2Px * 10/25)) / ((63 / 20) * superlist[controllerID].iclData.unit2Px)) * superlist[controllerID].iclData.timeMax);
      superlist[controllerID].timeText.text("Time: " + Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100);
      superlist[controllerID].frameText.text("Frame: " + Math.floor(superlist[controllerID].iclData.time));
      superlist[controllerID].UpdateVisuals();
    }
    /**
    *Helper function for time slider.
    *Disables the slider and shows help text again.
    *Called by anonymous function inside LoadGraph().
    */
    ESlide() {
      d3.select(this).style("fill", "#888888");
      d3.select(this).classed("active", false);
      d3.selectAll(".sliderhelp").style("visibility", "visible");
    }

    /**
    *Initializes the layers and ensures they take up the whole of
    *the given SVG.
    *
    *Called by constructor.
    */
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

        // In case we want to re-implement the user being able to select an exit with the mouse.
        //this.fieldSVG.on("mousemove", this.ChoosExit.call(this, tmp)).on("click", exitChosen.call(this, tmp));

        this.Load();
    }

    /**
    *Create tourist graph and field visuals
    *Called by this.Start().
    */
    Load() {

        this.LoadField();
        var colorPalette = ["#ff0000", "#0000ff", "#00ff00",
                            "#654321", "#ff00ff", "#00ffff", "#3bc335",
                            "#7af5ca", "#448bff", "#101ab3", "#d645c8",
                            "#0afe15", "#0acdfe", "#ff9600", "#b21ca1"];

        d3.select("#exit").attr("cx", this.iclData.fieldExit[0]).attr("cy", this.iclData.fieldExit[1]);
        this.LoadGraph();
        for (var i = 0; i < this.iclData.instruBinder.length; i++) { //Add bots, lines, and coordinate collectors.
            this.tourColors.push(colorPalette[i]);
            this.iclData.tourists[i].visual = this.fieldSVG.select("#bots").append("circle").attr("cx", this.iclData.unit2Px * (10 / 25))
                .attr("cy", this.iclData.unit2Px * 4 * (20 / 25) - this.iclData.unit2Px * (10 / 25)).attr("r", this.iclData.unit2Px / 16)
                .style("fill", this.tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * this.iclData.unit2Px);
            this.iclData.graphDots.push(this.graphSVG.select("#bots").append("circle").attr("cx", this.iclData.unit2Px * (10 / 25))
                .attr("cy", this.iclData.unit2Px * 4 * (20 / 25) - this.iclData.unit2Px * (10 / 25)).attr("r", this.iclData.unit2Px / 16)
                .style("fill", this.tourColors[i]).style("stroke", "#ffffff").style("stroke-width", (1 / 100) * this.iclData.unit2Px));
        }
        for (var i = 0; i < this.iclData.touristNum; i++) { //Reset for next run through.

            this.iclData.tourLine[i] = this.fieldSVG.select(".lines").append("path").attr("d", this.lineFx(this.iclData.tourPoints[i]))
                .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
            this.iclData.graphLine[i] = this.graphSVG.select(".lines").append("path").attr("d", this.lineFx(this.iclData.graphPoints[i]))
                .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
        }

        var touristCount = 0;
        outer:
        for (var i = 0; i <= 2; i++){
            if (touristCount + 1 == this.iclData.instruBinder.length){
                break outer;
            }
            for (var j = 0; j <= 2; j++) {
                this.graphSVG.select("#overLay").append("circle")
                        .attr("cx", (2*this.iclData.unit2Px) + (j * (2/3 * this.iclData.unit2Px)))
                        .attr("cy", (this.iclData.unit2Px * 0.6) + (i * (1/4 * this.iclData.unit2Px)))
                        .attr("r", this.iclData.unit2Px / 16)
                        .style("fill", this.tourColors[touristCount])
                        .style("stroke", "#ffffff")
                        .style("stroke-width", (1/100 * this.iclData.unit2Px));
                this.graphSVG.select("#overLay").append("text")
                        .attr("x", (2*this.iclData.unit2Px) + (this.iclData.unit2Px / 15) + (j * (2/3 * this.iclData.unit2Px)))
                        .attr("y", (this.iclData.unit2Px * 0.6) + (this.iclData.unit2Px/32) +  (i * (1/4 * this.iclData.unit2Px)))
                        .style("font-size", this.iclData.unit2Px * (3/25))
                        .text("" + ((this.iclData.instruBinder[touristCount][0][1][1] == true) ? "Queen " + touristCount : " Bot " + touristCount));
                if (touristCount + 1 == this.iclData.instruBinder.length){
                    break outer;
                }
                touristCount ++;

            }
        }
    }

    /**
    *Create field visuals, including shape, reference angles and algorithm description.
    *Called by this.Load().
    */
    LoadField() {
        var wire = (this.iclData.wireless) ? " Wireless" : " Non-Wireless";
        d3.select("#Desc" + this.iclData.id).text(this.iclData.algorithmName + wire);
        if (this.iclData.degrees == 13) { //If circle, change to 360 degrees.
            thi.iclData.degrees = 360;
        }
        var hold = "M75,50";
        for (var i = 1; i <= this.iclData.degrees; i++) { //Create the shape.
            var holdAng = ((360 / this.iclData.degrees) * i) * (Math.PI / 180);
            hold += 'L' + (50 + 25 * Math.cos(holdAng)) + ',' + (50 - 25 * Math.sin(holdAng));
        }
        this.fieldSVG.select("#overLay").append("path").attr("d", hold).style("fill", "none").style("stroke", "#000000").style("stroke-width", ".25");
        this.fieldSVG.select("#overLay").append("circle").attr("id", "exit").attr("cx", 50).attr("cy", 50).attr("r", 0.8)
            .style("fill", "#ffffff").style("stroke", "#000000").style("stroke-width", .1);
        if (this.iclData.degrees == 2) { //Add two distance numbers if a line.
            this.fieldSVG.select("#backGround").append("text").attr("x", 3.1 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .attr("class", "left").style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("1");
            this.fieldSVG.select("#backGround").append("text").attr("x", .9 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .attr("class", "right").style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("-1");
        } else { //Add two reference angles if not a line.
            this.fieldSVG.select("#backGround").append("text").attr("x", 3.1 * this.iclData.unit2Px).attr("y", this.iclData.center[1])
                .style("text-anchor", "start").style("font-size", this.iclData.unit2Px / 5).text("0");
            this.fieldSVG.select("#backGround").append("text").attr("x", this.iclData.center[0]).attr("y", .9 * this.iclData.unit2Px)
                .style("text-anchor", "middle").style("font-size", this.iclData.unit2Px / 5).text("90");
        }
    }
    /**
    *Create graph visuals, including graph axes, labels, replay buttons, time/frame data and slider.
    *Called by this.Load().
    */
    LoadGraph() {
        var fo = this.graphSVG.append('foreignObject').attr('x', this.iclData.unit2Px * (1 / 25)).attr('y', this.iclData.unit2Px * (18 / 25)).attr('width', this.iclData.unit2Px * 1.5).attr('height', this.iclData.unit2Px * (18 / 25));

        for (var i = 0; i < 3; i++) { //Create y-axis labels.
            this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (90 / 25) - i * this.iclData.unit2Px * (20 / 25))
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
        }
        for (var i = 0; i < 11; i++) { //Create x-axis labels.
            this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (10 / 25) + i * this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (94 / 25))
                .attr("class", "graphnum")
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
        }

        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1/25)).attr("y", this.iclData.unit2Px * 1).text(' ▶▶ Play').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'green')
                  .attr('class', 'reveal play').style('box-sizing', 'border-box').attr('cursor', 'pointer').on('click', () => {this.iclData.timeDirect++;});
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1/25)).attr("y", this.iclData.unit2Px * 1.2).text(' ■ Stop').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'red')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect = 0;});
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1/25)).attr("y", this.iclData.unit2Px * 1.4).text(' ◀◀ Rewind').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'blue')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect--;});
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1/25)).attr("y", this.iclData.unit2Px * 1.6).text(' ◀ Slow ▶').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'cyan')
                  .attr('class', 'reveal play').on('click', () => {if (this.iclData.timeDirect == 0) {this.iclData.timeDirect += 0.5;} else {this.iclData.timeDirect/=2;}});

        /* Working frame advance and frame rewind buttons. Don't know if they're necessary but they work.
        // Just need to update timeText, frameText, and timeSlider during a visual update.
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * 1).attr("y", this.iclData.unit2Px * 1).text(' Frame Adv. ▶').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'purple')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect = 0; if (this.iclData.time >= this.iclData.timeMax) {this.iclData.time = this.iclData.timeMax;} else {this.iclData.time += 1;} this.UpdateVisuals();});
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * 1).attr("y", this.iclData.unit2Px * 1.2).text(' ◀ Frame Rew.').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'orange')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect = 0; if (this.iclData.time > 0) {this.iclData.time -= 1;} else {this.iclData.time == 0;} this.UpdateVisuals();});
        */

        this.timeText = this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (1/ 25)).attr("y", this.iclData.unit2Px * .6)
                   .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "start").text("Time: 0").attr("class", "timeText");
        this.frameText = this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (1/ 25)).attr("y", this.iclData.unit2Px * .8)
                    .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "start").text("Frame: 0").attr("class", "frameText");
        this.timeSlider = this.graphSVG.select("#backGround").append("rect").attr("width", this.iclData.unit2Px / 20).attr("height", this.iclData.unit2Px * (31/20))
                     .attr("y", this.iclData.unit2Px * 2).attr("x", this.iclData.unit2Px * (10/25))
                     .style("fill", "#888888").style("fill-opacity", .5)
                     .call(d3.drag().on("start", this.SSlide).on("drag", this.MSlide).on("end", this.ESlide)).attr("class", "timeSlide");
    }

    /**
    *The main function used to control an algorithm when it is running for the first time.
    *Recalculates all necessary points based on new exit location.
    * **Relies on window.superlist.**
    *This is due to the nature of calling AlterAnim from weird places, such as a time interval.
    *Does both data calculation and visual updates at once, so while it does not
    *really fit in either class, putting it in iclVisual was the best way to do it
    *because this class rests on iclData. The two are really meant to always work together.
    */
    AlterAnim() {
      // Reached the end of the sim.
      if (superlist[controllerID].iclData.time >= superlist[controllerID].iclData.timeMax) {
        superlist[controllerID].iclData.time = superlist[controllerID].iclData.timeMax;


        for (var i = 0; i < 11; i++) {//Remove x-axis labels 1-10, in order to scale graph.
          superlist[controllerID].graphSVG.selectAll(".graphnum").style("display", "none");
        }

        for (i = 0; i < superlist[controllerID].iclData.touristNum; i++){//One last call to AlterLines.
            superlist[controllerID].AlterLines(i);
        }

        for (var i = 0; i <= Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100; i++) {//Create new scaled x-axis labels.
          superlist[controllerID].graphSVG.select("#overLay").append("text")
                  .attr("x", (10/25 + (i / (Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100)) * 80/25) * superlist[controllerID].iclData.unit2Px)//unit2Px * (10 / 25) + ((Math.floor(timeMax) - i) * 80/25) * unit2Px)
                  .attr("y", superlist[controllerID].iclData.unit2Px * (94 / 25))
                  .style("font-size", superlist[controllerID].iclData.unit2Px * (4 / 25))
                  .style("text-anchor", "middle")
                  .text(i)
                  .attr("class","graphnum");
        }
        superlist[controllerID].graphSVG.select("#overLay").append("text")
                .attr("x", (superlist[controllerID].iclData.unit2Px * 65/25))
                .attr("y", superlist[controllerID].iclData.unit2Px * (1.7))
                .style("font-size", superlist[controllerID].iclData.unit2Px * (4/25))
                .text("End: " + Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100 + " sec");

        superlist[controllerID].graphSVG.select("#overLay").append('text')
                .attr("x", superlist[controllerID].iclData.unit2Px * 65/25)
                .attr("y", superlist[controllerID].iclData.unit2Px * 1.83)
                .attr("class", "sliderhelp")
                .style("font-size", superlist[controllerID].iclData.unit2Px * (3/25))
                .text("Click and drag gray bar")
                .style("fill", "#bbbbaa");

        superlist[controllerID].graphSVG.select("#overLay").append('text')
                .attr("x", superlist[controllerID].iclData.unit2Px * 65/25)
                .attr("y", superlist[controllerID].iclData.unit2Px * 1.95)
                .attr("class", "sliderhelp")
                .style("font-size", superlist[controllerID].iclData.unit2Px * (3/25))
                .text("to see the timeline")
                .style("fill", "#bbbbaa");

        superlist[controllerID].UpdateVisuals();
        clearInterval(theMotor);
        theMotor = setInterval(superlist[controllerID].PlayAnim, 1000 / superlist[controllerID].iclData.fps);
      }
      // Inside the sim.
      else {
        var saveBuffer = [];

        for (var i = 0; i < superlist[controllerID].iclData.tourists.length; i++) {
          superlist[controllerID].AlterLines(i);
          var who = superlist[controllerID].iclData.tourists[i];
          saveBuffer.push([who.x, who.y, who.a, who.on]);
          who.allowance = who.velocity * superlist[controllerID].iclData.unit2Px / superlist[controllerID].iclData.fps;
          while (who.allowance > 0) {
            if (who.knows) {
              who[instruBinder[i][0][0]](instruBinder[i][0][1]);
            } else {
              who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
            }
          }
          if (!who.knows) {
            var eVec = [superlist[controllerID].iclData.fieldExit[0] - saveBuffer[i][0], superlist[controllerID].iclData.fieldExit[1] - saveBuffer[i][1]];
            var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
            if (exitDist <= who.velocity * superlist[controllerID].iclData.unit2Px / (2 * superlist[controllerID].iclData.fps)) {
              superlist[controllerID].iclData.exitAlert = who.knows = true;
              //exitFoundFrame = time;
              if (who.priority){
                  break;
              }
              superlist[controllerID].iclData.exitAllow = exitDist;
            }
          }
        }

        if (superlist[controllerID].iclData.exitAlert) {
          if (superlist[controllerID].iclData.exitFoundLine == null) {
            var holdX = (superlist[controllerID].iclData.unit2Px * (10 / 25) + ((superlist[controllerID].iclData.time + superlist[controllerID].iclData.exitAllow) / superlist[controllerID].iclData.timeMax) * (80 / 25) * superlist[controllerID].iclData.unit2Px);
            superlist[controllerID].iclData.exitFoundLine = 1;

                            /*
                            graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                            .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                            .style("stroke-opacity", 0.5);
                            */
          }
          for (var i = 0; i < superlist[controllerID].iclData.tourists.length; i++) {//reset bots
            var who = superlist[controllerID].iclData.tourists[i];
            who.x = saveBuffer[i][0];
            who.y = saveBuffer[i][1];
            who.a = saveBuffer[i][2];
            who.on = saveBuffer[i][3];
            if (superlist[controllerID].iclData.wireless) {
              who.knows = true;
            }
            who.allowance = superlist[controllerID].iclData.exitAllow;
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
            who.allowance = (who.velocity * superlist[controllerID].iclData.unit2Px / superlist[controllerID].iclData.fps) - superlist[controllerID].iclData.exitAllow;
            while (who.allowance > 0) {
              if (who.knows) {//Proceed with exit procedures.
                who[instruBinder[i][0][0]](instruBinder[i][0][1]);
                who.knew = true;
              } else {//Still does not know.
                who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
              }
            }
          }
          superlist[controllerID].iclData.exitAlert = false;
        }
        superlist[controllerID].iclData.AllAtExit();
        superlist[controllerID].UpdateVisuals();
        superlist[controllerID].iclData.time++;
      }
      superlist[controllerID].timeText.text("Time: " + Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100);
      superlist[controllerID].frameText.text("Frame: " + superlist[controllerID].iclData.time);
      superlist[controllerID].timeSlider.attr("x", ((10/25) + (superlist[controllerID].iclData.time / superlist[controllerID].iclData.timeMax) * (63/20)) * superlist[controllerID].iclData.unit2Px);

    }

    /**
    *Calculates the a given tourist's current lines up to the current time.
    *Called from this.AlterAnim().
    *
    * @param {integer} i The given tourist id for which to calculate the path.
    */
    AlterLines(i) {
      var dista = this.iclData.unit2Px * 4 - Math.abs((Math.sqrt(Math.pow(this.iclData.fieldExit[0] - this.iclData.tourists[i].x, 2) + Math.pow(this.iclData.fieldExit[1] - this.iclData.tourists[i].y, 2)) * (20 / 25)));
      this.iclData.tourPoints[i][this.iclData.time] = {x:this.iclData.tourists[i].x, y:this.iclData.tourists[i].y};
      this.iclData.tourLine[i].remove();

      var holdA = 'M' + (this.iclData.tourPoints[i][0].x + ',' + (this.iclData.tourPoints[i][0].y));
      var holdG = 'M' + (10/25) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][0].y);
      for (var j = 1; j < this.iclData.time; j++) {
        holdA += 'L' + (this.iclData.tourPoints[i][j].x + ',' + (this.iclData.tourPoints[i][j].y));
        holdG += 'L' + ((10/25) + ((this.iclData.graphPoints[i][j].x / this.iclData.timeMax) * (63/20))) * this.iclData.unit2Px  + ',' + (this.iclData.graphPoints[i][j].y);
        //((10/25) + (graphPoints[i][j].x / timeMax) * (63/20)) * unit2Px)
      }

      this.iclData.tourLine[i] = this.fieldSVG.select("#lines").append("path")
            .attr("d", holdA)
            .style("stroke", this.tourColors[i])
            .style("stroke-width", this.iclData.unit2Px * (1 / 25))
            .style("stroke-opacity", 0.5)
            .style("fill", "none");

      this.iclData.graphPoints[i][this.iclData.time] = {x:this.iclData.time, y:(dista - this.iclData.unit2Px * (10 / 25))};

      this.iclData.graphLine[i].remove();

      this.iclData.graphLine[i] = this.graphSVG.select("#lines").append("path")
            .attr("d", holdG)
            .style("stroke", this.tourColors[i])
            .style("stroke-width", this.iclData.unit2Px * (1 / 25))
            .style("stroke-opacity", 0.5)
            .style("fill", "none");
    }

    /**
    *The post-run algorithm controller. Allows for playback.
    *timeDirect is defined in iclData.
    ***Relies on window.superlist** because the call is usually from an interval once
    *the sim has ended.
    */
    PlayAnim() {
      if (superlist[controllerID].iclData.timeDirect != 0) {
        superlist[controllerID].iclData.time += superlist[controllerID].iclData.timeDirect;
        if (superlist[controllerID].iclData.time < 0) {
          superlist[controllerID].iclData.time = 0;
          superlist[controllerID].iclData.timeDirect = 0;
        } else if (superlist[controllerID].iclData.time > superlist[controllerID].iclData.timeMax) {
          superlist[controllerID].iclData.time = superlist[controllerID].iclData.timeMax;
          superlist[controllerID].iclData.timeDirect = 0;
        }
        superlist[controllerID].UpdateVisuals();
        superlist[controllerID].timeSlider.attr("x", ((10/25) + (superlist[controllerID].iclData.time / superlist[controllerID].iclData.timeMax) * (63/20)) * superlist[controllerID].iclData.unit2Px);
        superlist[controllerID].timeText.text("Time: " + Math.floor((100 * superlist[controllerID].iclData.time) / superlist[controllerID].iclData.fps) / 100);
        superlist[controllerID].frameText.text("Frame: " + Math.floor(superlist[controllerID].iclData.time));
      }
    }

    /**
    *The last part that happens after data has been updated.
    *Redraws tourist visuals, usually in relation to current time.
    */
    UpdateVisuals() {
        for (var i = 0; i < this.iclData.touristNum; i++) {
          var who = this.iclData.tourists[i];
          who.visual.attr("cx", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].y);
          this.iclData.graphDots[i].attr("cx", ((10/25) + ((this.iclData.graphPoints[i][Math.floor(this.iclData.time)].x / this.iclData.timeMax) * (63/20))) * this.iclData.unit2Px).attr("cy", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].y);
        }
    }
}

/**
*Outside controller for letting the buttons choose timeDirect.
***Relies on window.superlist**.
*Called from the HTML <text>s relating to playback.
*
* @param {string} s The direction which to send the playback. Gotten from hardcoded method calls in HTML.
*/
function editAnims(s) {
    if (s == "play") {
        superlist[controllerID].iclData.timeDirect = 1;
    } else if (s == "rewind") {
        superlist[controllerID].iclData.timeDirect = -1;
    } else if (s == "slow") {
        superlist[controllerID].iclData.timeDirect /= 2;
    }
}

/**
*Unused function used to show two comparisons.
*Lets the user choose whether the want to see
*the graphs side by side, or the fields.
* **Relies on window.superlist**.
*
* @param {string} s The part of the animation to show side by side with another. Gotten from hardcoded method calls in HTML.
*/
function showAnims(s) {
    for (var i = 0; i < 2; i++) {
        if (s == "graph") {
            superlist[i].fieldSVG.attr('display', 'none');
            superlist[i].graphSVG.attr('display', 'inline-block');
        } else {
            superlist[i].graphSVG.attr('display', 'none');
            superlist[i].fieldSVG.attr('display', 'inline-block');
        }
    }
}

/**
*Unused function to swap instructions on the fly.
*Not really used anymore because we choose the algorithm based on the current #value in the URL,
*but I'll leave it here just in case.
*Works best when having the user select an alg from a <select> HTML element.
*
* @param {string} n Algorithm Shortname. Will be defined in the docs... somewhere.
*/
function changeInstructions(n) {
    var e = document.getElementById("alg" + n);
    var s = e.options[e.selectedIndex].value;
    switch (s) {
        case 'A':
            algorithmName = "Algorithm A ";
            instruBinder = [
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["right"]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["left"]]
                ]
            ];
            break;
        case 'B':
            algorithmName = "Algorithm B ";
            instruBinder = [
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["right", 120]],
                    ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]],
                    ["GoOutAtAngle", [330, 1]],
                    ["FollowWall", ["right"]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["left", 120]],
                    ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]],
                    ["GoOutAtAngle", [210, 1]],
                    ["FollowWall", ["left"]]
                ]
            ];
            break;
        case 'C':
            instruBinder = [
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["right", 120]],
                    ["GoToPoint", [superlist[n].iclData.center[0] + 15, superlist[n].iclData.center[1] + 10]],
                    ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]],
                    ["GoOutAtAngle", [330, 1]],
                    ["FollowWall", ["right"]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [90]],
                    ["FollowWall", ["left", 120]],
                    ["GoToPoint", [superlist[n].iclData.center[0] - 15, superlist[n].iclData.center[1] + 10]],
                    ["GoToPoint", [superlist[n].iclData.center[0], superlist[n].iclData.center[1] + 10]],
                    ["GoOutAtAngle", [210, 1]],
                    ["FollowWall", ["left"]]
                ]
            ];
            algorithmName = "Algorithm C ";
            break;
        case 'P1':
            instruBinder = [
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [180]],
                    ["FollowWall", ["right"]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [180]],
                    ["FollowWall", ["left", 114]],
                    ["GoToWallAtAngle", [347]],
                    ["FollowWall", ["right", 53]],
                    ["Wait", [null]]
                ]
            ];
            algorithmName = "Algorithm Priority 1 ";
            break;
        case 'P2':
            instruBinder = [
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [160]],
                    ["FollowWall", ["left", 20]],
                    ["GoToPoint", [superlist[n].iclData.center[0] + 10, superlist[n].iclData.center[1] + 10]],
                    ["GoToWallAtAngle", [320]],
                    ["Wait", [null]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [160]],
                    ["FollowWall", ["right"]]
                ],
                [
                    ["Intercept", [null]],
                    ["GoToWallAtAngle", [180]],
                    ["FollowWall", ["left"]]
                ]
            ];
            algorithmName = "Algorithm Priority 2 ";
            break;

    }

    superlist[n].fieldSVG.select("#lines").selectAll("path").remove();
    superlist[n].fieldSVG.select("#bots").selectAll("circle").remove();

    superlist[n].graphSVG.select("#lines").selectAll("path").remove();
    superlist[n].graphSVG.select("#bots").selectAll("circle").remove();

    superlist[1 - n].fieldSVG.select("#lines").selectAll("path").remove();
    superlist[1 - n].fieldSVG.select("#bots").selectAll("circle").remove();

    superlist[1 - n].graphSVG.select("#lines").selectAll("path").remove();
    superlist[1 - n].graphSVG.select("#bots").selectAll("circle").remove()


    var one = new iclData(n, instruBinder, algorithmName);

    var secondInstru = superlist[1 - n].iclData.instruBinder;
    var secondAlgName = superlist[1 - n].iclData.algorithmName;
    var two = new iclData(1 - n, secondInstru, secondAlgName);


    superlist[n] = new iclVisual(one);
    superlist[1 - n] = new iclVisual(two);

}

/**
*Unused function which lets a user choose the exit with a mouse.
*
*/
function ChoosExit() {
    var exitAngle = Math.atan2(d3.mouse(this)[0] - center[0], d3.mouse(this)[1] - center[1]) - (Math.PI / 2);
    if (exitAngle < 0) {
        exitAngle += 2 * Math.PI;
    }
    d3.select(".exitText").text("Left-Click to place exit at ~" + Math.floor(exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
    if (degrees == 2) { //Choose exit relative to mouse position.
        fieldExit = [d3.event.x, center[1]];
    } else { //Choose exit relative to shape.
        fieldExit = tourists[0].WallAtAngle(exitAngle);
    }
    d3.select(".exit").attr("cx", fieldExit[0]).attr("cy", fieldExit[1]);
}

/**
*Gets the current value of an <input type='number'> HTML element
*and displays the exit at that location for a preview.
***Relies on window.superlist**.
*Reuses code from Tourist.DirectTo().
*/
function exitPreview() {
    var exitAngle = d3.select("#exitAngle").node().value;
    exitAngle = exitAngle * Math.PI / 180;
    while(exitAngle > 2 * Math.PI) {
        exitAngle -= 2 * Math.PI;
    }
    while(exitAngle < 0){
        exitAngle += 2 * Math.PI;
    }
    var unitAngle = (2 * Math.PI) / 360;										//Angle segment length.
    var angleUnit = Math.floor(exitAngle / unitAngle);											//Which length of segment.
    var unitPos = [Math.cos(exitAngle), -Math.sin(exitAngle)];											//End point on unit circle segment
    var vertOne = [Math.cos(angleUnit * unitAngle), -Math.sin(angleUnit * unitAngle)];							//Start point of segment
    var vertTwo = [Math.cos((angleUnit + 1) * unitAngle), -Math.sin((angleUnit + 1) * unitAngle)];					//End point of segment
    var a2 = vertOne[1] - vertTwo[1];
    var b2 = vertTwo[0] - vertOne[0];
    var c2 = vertOne[1] * vertTwo[0] - vertOne[0] * vertTwo[1];
    var wallLoc = [superlist[controllerID].iclData.center[0] + superlist[controllerID].iclData.unit2Px * (unitPos[0] * c2) / (unitPos[1] * b2 + unitPos[0] * a2),
                   superlist[controllerID].iclData.center[1] + superlist[controllerID].iclData.unit2Px * (unitPos[1] * c2) / (unitPos[1] * b2 + unitPos[0] * a2)];		//Cramer's Law
    d3.select("#exit").attr("cx", wallLoc[0]).attr("cy", wallLoc[1]);
}

/**
*Starts up the interval after clearing the field and graph of debris.
*Any new elements that need to be cleared after a run and before a new one... do it here.
*When doing comparisons the 'theMotor = ... ' is the part we wanna change to
*use superlist and controllerID to update both one after another. Can't quite get it yet.
***Relies on window.superlist**.
*/
function exitChosen() {
    //clear motor
    clearInterval(theMotor);
    d3.selectAll("#bots").html(null);
    d3.selectAll("#lines").html(null);
    d3.selectAll("#overLay").html(null);
    d3.selectAll(".timeSlide").remove();
    d3.selectAll(".timeText").remove();
    d3.selectAll(".frameText").remove();
    leftSide = new iclData(0, instruBinder, algName, d3.select("#exitAngle").node().value, wireless);
    superlist[controllerID] = new iclVisual(leftSide);
    theMotor = setInterval(superlist[controllerID].AlterAnim, 1000 / 60);
    d3.select(".exitText").remove();
}

/**
*Select an algorithm or element description box to show based on current algorithm shortname.
*
* @param {string} s The id of the box to show. "steps" if you want to select an algorithm desc. box you've created based on shortname.
*/
function showHelp(s) {
    d3.selectAll(".w3-display-container").style("display", "none");
    switch (s) {
        case "steps":
            //document.getElementById(algShortName).style.display = "block";
            break;
        default:
            document.getElementById(s).style.display = "block";
            break;
    }
    return;
}

/**
*Contains the commands for all the algorithms. Give it a shortname and wireless true/false
*and it'll change the instrubinder to match. Used on page load.
*The color isn't really necessary.
*
* @param {string} s Algorithm shortname. Add 'wl' to shortnames where the algorithm has the potential to be f2f.
* @param {boolean} w Wireless true/false. A legacy value from before shortnames were more specific.
*/
function showAlgorithmDesc(s, w){
    switch(s){
        case 'A':
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algName = "Algorithm A ";
            break;
        case 'Awl':
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algName = "Algorithm A ";
            break;
        case 'B':
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm B ";
            break;
        case 'Bwl':
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm B ";
            break;
        case 'C':
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm C ";
            break;
        case 'Cwl':
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm C ";
            break;
        case 'Q1':
            instruBinder = [
                                 [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 114]], ["GoToWallAtAngle", [347]], ["FollowWall", ["right", 53]], ["Wait", [null]]],
                                 [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]]
                               ];
            algName = "Algorithm Priority 1 ";
            break;
        case 'Q2':
            instruBinder = [
                                  [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [144]], ["FollowWall", ["left", 36]], ["GoToPoint", [center[0] + (unit2Px * 0.65), center[1] + 30]], ["GoToWallAtAngle", [345]], ["FollowWall", ["left"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [144]], ["FollowWall", ["right"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]]
            ];
            algName = "Algorithm Priority 2 ";
            break;
        case 'Q2S1':
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
            algName = "2 Priority + 1 Servant (1) ";
            break;

        case 'Q1S1Q1':
            instruBinder = [
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]] ,["FollowWall", ["right"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right"]]],
                [["Wait", [null]], ["GoToWallAtAngle", 180], ["FollowWall", ["left"]]]
            ];
            algName = "2 Priority + 1 Servant (2) ";
            break;

        case 'Q1S4':
            instruBinder = [
                [["GoToExit", [null, true]], ["Wait", [(1 + (Math.PI / 2))]], ["GoToWallAtAngle", [180]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["left", 75]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right", 75]], ["Wait", [null]]],
                [["Wait", [null]], ["GoToWallAtAngle", [75]], ["FollowWall", ["left"]]],
                [["Wait", [null]], ["GoToWallAtAngle", [285]], ["FollowWall", ["right"]]]
            ];
            algName = "1 Priority + 4 Servants ";
            break;

        case 'Q1S8':
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
            algName = "1 Priority + 8 Servants ";
            break;
    }
    algShortName = s;
    wireless = w;

}

/////// GLOBAL VARIABLES ///////
var leftSide;
var theMotor;
var algSelector;
var instruBinder;
var algName;
var wireless;
var unit2Px = 25
var center = [2 * unit2Px, 2 * unit2Px];
var superlist = [];
var controllerID = 0;

/////// INITIALIZE ALGORITHM ///////
var algRequested = window.location.href.includes("#");
if (algRequested) {
    algSelector = window.location.href.indexOf("#");
    var l = window.location.href.length;
    console.log("DEBUG: Algorithm: " + window.location.href.slice(algSelector + 1, l));
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

console.log("DEBUG: Wireless: " + wireless);
leftSide = new iclData(0, instruBinder, algName, d3.select("#exitAngle").node().value, wireless);
superlist.push(new iclVisual(leftSide));
console.log("DEBUG: Ready to start simulation.")
