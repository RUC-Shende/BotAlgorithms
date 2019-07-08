'use strict';
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
        this.fps = 100;
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
        /** Interval for this iclData instance. Typically set to 1000/fps */
        this.motor = this.id;

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

        if (this.exitAlert) { // check to see if any priority have exited.
            for (var p = 0; p < this.touristNum; p++) {
                if (this.tourists[p].priority && this.tourists[p].atExit) {
                    this.allExitedLine = 1;
                    this.timeMax = this.time;
                }
            }
        }
        for (var j = 0; j < this.touristNum; j++) { //Check every mobile agent
            if ((this.tourists[j].x != this.fieldExit[0]) || (this.tourists[j].y != this.fieldExit[1])) { //check if not at exit
                return;
            } else if (!this.priorityExitedLine && this.tourists[j].priority) { //assuming also at exit...
                var holdP = (this.unit2Px * (10 / 25) + ((this.time + this.exitAllow) / this.timeMax) * (80 / 25) * this.unit2Px);
                this.priorityExitedLine = 1;
                /*graphSVG.select(".overLay").append("line").attr("x1", holdP).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                              .attr("x2", holdP).attr("y2", 1.75 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                              .style("stroke-opacity", 0.5);*/

                this.timeMax = this.time; //to account for the extra bot getting to its next point
            }
        }
        if (!this.allExitedLine) {
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
     */
    MSlide() {
        var mousePos = d3.event.x;
        if (mousePos < this.iclData.unit2Px * (10 / 25)) {
            mousePos = this.iclData.unit2Px * (10 / 25);
        } else if (mousePos > (71 / 20) * this.iclData.unit2Px) {
            mousePos = (71 / 20) * this.iclData.unit2Px;
        }
        d3.select(".timeSlide" + this.iclData.id).attr("x", mousePos);
        this.iclData.time = Math.round(((mousePos - (this.iclData.unit2Px * 10 / 25)) / ((63 / 20) * this.iclData.unit2Px)) * this.iclData.timeMax);
        this.timeText.text("Time: " + Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100);
        this.frameText.text("Frame: " + Math.floor(this.iclData.time));
        this.UpdateVisuals();
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
            "#0afe15", "#0acdfe", "#ff9600", "#b21ca1"
        ];

        d3.select("#exit" + this.iclData.id).attr("cx", this.iclData.fieldExit[0]).attr("cy", this.iclData.fieldExit[1]);
        this.LoadGraph();
        for (var i = 0; i < this.iclData.instruBinder.length; i++) { //Add bots, lines, and coordinate collectors.
            this.tourColors.push(colorPalette[i]);
            this.iclData.tourists[i].visual = this.fieldSVG.select("#bots").append("circle").attr("cx", this.iclData.center[0])
                .attr("cy", this.iclData.center[1]).attr("r", this.iclData.unit2Px / 16)
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
            for (var i = 0; i <= 2; i++) {
                if (touristCount + 1 == this.iclData.instruBinder.length) {
                    break outer;
                }
                for (var j = 0; j <= 2; j++) {
                    this.graphSVG.select("#overLay").append("circle")
                        .attr("cx", (2 * this.iclData.unit2Px) + (j * (2 / 3 * this.iclData.unit2Px)))
                        .attr("cy", (this.iclData.unit2Px * 0.6) + (i * (1 / 4 * this.iclData.unit2Px)))
                        .attr("r", this.iclData.unit2Px / 16)
                        .style("fill", this.tourColors[touristCount])
                        .style("stroke", "#ffffff")
                        .style("stroke-width", (1 / 100 * this.iclData.unit2Px));
                    this.graphSVG.select("#overLay").append("text")
                        .attr("x", (2 * this.iclData.unit2Px) + (this.iclData.unit2Px / 15) + (j * (2 / 3 * this.iclData.unit2Px)))
                        .attr("y", (this.iclData.unit2Px * 0.6) + (this.iclData.unit2Px / 32) + (i * (1 / 4 * this.iclData.unit2Px)))
                        .style("font-size", this.iclData.unit2Px * (3 / 25))
                        .text("" + ((this.iclData.instruBinder[touristCount][0][1][1] == true) ? "Queen " + touristCount : " Bot " + touristCount));
                    if (touristCount + 1 == this.iclData.instruBinder.length) {
                        break outer;
                    }
                    touristCount++;

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
        this.fieldSVG.select("#overLay").append("circle").attr("id", "exit" + this.iclData.id).attr("cx", 50).attr("cy", 50).attr("r", 0.8)
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

        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * 1).text(' ▶▶ Play').style('font-size', this.iclData.unit2Px * 5 / 25).attr('fill', 'green')
            .attr('class', 'reveal play').style('box-sizing', 'border-box').attr('cursor', 'pointer').on('click', () => {
                this.iclData.timeDirect++;
            });
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * 1.2).text(' ■ Stop').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5 / 25).attr('fill', 'red')
            .attr('class', 'reveal play').on('click', () => {
                this.iclData.timeDirect = 0;
            });
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * 1.4).text(' ◀◀ Rewind').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5 / 25).attr('fill', 'blue')
            .attr('class', 'reveal play').on('click', () => {
                this.iclData.timeDirect--;
            });
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * 1.6).text(' ◀ Slow ▶').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5 / 25).attr('fill', 'cyan')
            .attr('class', 'reveal play').on('click', () => {
                if (this.iclData.timeDirect == 0) {
                    this.iclData.timeDirect += 0.5;
                } else {
                    this.iclData.timeDirect /= 2;
                }
            });

        /* Working frame advance and frame rewind buttons. Don't know if they're necessary but they work.
        // Just need to update timeText, frameText, and timeSlider during a visual update.
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * 1).attr("y", this.iclData.unit2Px * 1).text(' Frame Adv. ▶').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'purple')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect = 0; if (this.iclData.time >= this.iclData.timeMax) {this.iclData.time = this.iclData.timeMax;} else {this.iclData.time += 1;} this.UpdateVisuals();});
        this.graphSVG.select("#overLay").append('text').attr("x", this.iclData.unit2Px * 1).attr("y", this.iclData.unit2Px * 1.2).text(' ◀ Frame Rew.').style('cursor', 'pointer').style('font-size', this.iclData.unit2Px * 5/25).attr('fill', 'orange')
                  .attr('class', 'reveal play').on('click', () => {this.iclData.timeDirect = 0; if (this.iclData.time > 0) {this.iclData.time -= 1;} else {this.iclData.time == 0;} this.UpdateVisuals();});
        */

        this.timeText = this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * .6)
            .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "start").text("Time: 0").attr("class", "timeText");
        this.frameText = this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (1 / 25)).attr("y", this.iclData.unit2Px * .8)
            .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "start").text("Frame: 0").attr("class", "frameText");
        this.timeSlider = this.graphSVG.select("#backGround").append("rect").attr("width", this.iclData.unit2Px / 15).attr("height", this.iclData.unit2Px * (31 / 20))
            .attr("y", this.iclData.unit2Px * 2).attr("x", this.iclData.unit2Px * (10 / 25))
            .style("fill", "#888888").style("fill-opacity", .5)
            .call(d3.drag().on("start", this.SSlide).on("drag", (function(self) {
                return function() {
                    self.MSlide();
                }
            })(this)).on("end", this.ESlide)).attr("class", "timeSlide" + this.iclData.id);
    }

    /**
     *The main function used to control an algorithm when it is running for the first time.
     *Recalculates all necessary points based on new exit location.
     *This is due to the nature of calling AlterAnim from weird places, such as a time interval.
     *Does both data calculation and visual updates at once, so while it does not
     *really fit in either class, putting it in iclVisual was the best way to do it
     *because this class rests on iclData. The two are really meant to always work together.
     */
    AlterAnim() {
        // Reached the end of the sim.
        if (this.iclData.time >= this.iclData.timeMax) {
            this.iclData.time = this.iclData.timeMax;


            for (var i = 0; i < 11; i++) { //Remove x-axis labels 1-10, in order to scale graph.
                this.graphSVG.selectAll(".graphnum").style("display", "none");
            }

            for (i = 0; i < this.iclData.touristNum; i++) { //One last call to AlterLines.
                this.AlterLines(i);
            }

            for (var i = 0; i <= Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100; i++) { //Create new scaled x-axis labels.
                this.graphSVG.select("#overLay").append("text")
                    .attr("x", (10 / 25 + (i / (Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100)) * 80 / 25) * this.iclData.unit2Px) //unit2Px * (10 / 25) + ((Math.floor(timeMax) - i) * 80/25) * unit2Px)
                    .attr("y", this.iclData.unit2Px * (94 / 25))
                    .style("font-size", this.iclData.unit2Px * (4 / 25))
                    .style("text-anchor", "middle")
                    .text(i)
                    .attr("class", "graphnum");
            }
            this.graphSVG.select("#overLay").append("text")
                .attr("x", (this.iclData.unit2Px * 65 / 25))
                .attr("y", this.iclData.unit2Px * (1.7))
                .style("font-size", this.iclData.unit2Px * (4 / 25))
                .text("End: " + Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100 + " sec");

            this.graphSVG.select("#overLay").append('text')
                .attr("x", this.iclData.unit2Px * 65 / 25)
                .attr("y", this.iclData.unit2Px * 1.83)
                .attr("class", "sliderhelp")
                .style("font-size", this.iclData.unit2Px * (3 / 25))
                .text("Click and drag gray bar")
                .style("fill", "#bbbbaa");

            this.graphSVG.select("#overLay").append('text')
                .attr("x", this.iclData.unit2Px * 65 / 25)
                .attr("y", this.iclData.unit2Px * 1.95)
                .attr("class", "sliderhelp")
                .style("font-size", this.iclData.unit2Px * (3 / 25))
                .text("to see the timeline")
                .style("fill", "#bbbbaa");

            this.UpdateVisuals();
            var tmp = this;

            clearInterval(this.iclData.motor);

            this.iclData.motor = setInterval((function(self) {
                return function() {
                    self.PlayAnim();
                }
            })(this), 1000 / this.iclData.fps);
        }
        // Inside the sim.
        else {
            var saveBuffer = [];

            for (var i = 0; i < this.iclData.tourists.length; i++) {
                this.AlterLines(i);
                var who = this.iclData.tourists[i];
                saveBuffer.push([who.x, who.y, who.a, who.on]);
                who.allowance = who.velocity * this.iclData.unit2Px / this.iclData.fps;
                while (who.allowance > 0) {
                    if (who.knows) {
                        who[this.iclData.instruBinder[i][0][0]](this.iclData.instruBinder[i][0][1]);
                    } else {
                        who[this.iclData.instruBinder[i][who.on][0]](this.iclData.instruBinder[i][who.on][1]);
                    }
                }
                if (!who.knows) {
                    var eVec = [this.iclData.fieldExit[0] - saveBuffer[i][0], this.iclData.fieldExit[1] - saveBuffer[i][1]];
                    var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
                    if (exitDist <= who.velocity * this.iclData.unit2Px / (2 * this.iclData.fps)) {
                        this.iclData.exitAlert = who.knows = true;
                        //exitFoundFrame = time;
                        if (who.priority) {
                            break;
                        }
                        this.iclData.exitAllow = exitDist;
                    }
                }
            }

            if (this.iclData.exitAlert) {
                if (this.iclData.exitFoundLine == null) {
                    var holdX = (this.iclData.unit2Px * (10 / 25) + ((this.iclData.time + this.iclData.exitAllow) / this.iclData.timeMax) * (80 / 25) * this.iclData.unit2Px);
                    this.iclData.exitFoundLine = 1;

                    /*
                    graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                    .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                    .style("stroke-opacity", 0.5);
                    */
                }
                for (var i = 0; i < this.iclData.tourists.length; i++) { //reset bots
                    var who = this.iclData.tourists[i];
                    who.x = saveBuffer[i][0];
                    who.y = saveBuffer[i][1];
                    who.a = saveBuffer[i][2];
                    who.on = saveBuffer[i][3];
                    if (this.iclData.wireless) {
                        who.knows = true;
                    }
                    who.allowance = this.iclData.exitAllow;
                    while (who.allowance > 0) {
                        if (who.knew) { //Target already on exit procedures.
                            who[this.iclData.instruBinder[i][0][0]](this.iclData.instruBinder[i][0][1]);
                        } else { //Has not started exit procedures yet.
                            who[this.iclData.instruBinder[i][who.on][0]](this.iclData.instruBinder[i][who.on][1]);
                            if (who.knows) { //Clear target for bot if beginning exit procedures.
                                who.target = null;
                            }
                        }
                    }
                    who.allowance = (who.velocity * this.iclData.unit2Px / this.iclData.fps) - this.iclData.exitAllow;
                    while (who.allowance > 0) {
                        if (who.knows) { //Proceed with exit procedures.
                            who[this.iclData.instruBinder[i][0][0]](this.iclData.instruBinder[i][0][1]);
                            who.knew = true;
                        } else { //Still does not know.
                            who[this.iclData.instruBinder[i][who.on][0]](this.iclData.instruBinder[i][who.on][1]);
                        }
                    }
                }
                this.iclData.exitAlert = false;
            }
            this.iclData.AllAtExit();
            this.UpdateVisuals();
            this.iclData.time++;
        }
        this.timeText.text("Time: " + Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100);
        this.frameText.text("Frame: " + this.iclData.time);
        this.timeSlider.attr("x", ((10 / 25) + (this.iclData.time / this.iclData.timeMax) * (63 / 20)) * this.iclData.unit2Px);

    }

    /**
     *Calculates the a given tourist's current lines up to the current time.
     *Called from this.AlterAnim().
     *
     * @param {integer} i The given tourist id for which to calculate the path.
     */
    AlterLines(i) {
        var dista = this.iclData.unit2Px * 4 - Math.abs((Math.sqrt(Math.pow(this.iclData.fieldExit[0] - this.iclData.tourists[i].x, 2) + Math.pow(this.iclData.fieldExit[1] - this.iclData.tourists[i].y, 2)) * (20 / 25)));
        this.iclData.tourPoints[i][this.iclData.time] = {
            x: this.iclData.tourists[i].x,
            y: this.iclData.tourists[i].y
        };
        this.iclData.tourLine[i].remove();

        var holdA = 'M' + (this.iclData.tourPoints[i][0].x + ',' + (this.iclData.tourPoints[i][0].y));
        var holdG = 'M' + (10 / 25) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][0].y);
        for (var j = 1; j < this.iclData.time; j++) {
            holdA += 'L' + (this.iclData.tourPoints[i][j].x + ',' + (this.iclData.tourPoints[i][j].y));
            holdG += 'L' + ((10 / 25) + ((this.iclData.graphPoints[i][j].x / this.iclData.timeMax) * (63 / 20))) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][j].y);
            //((10/25) + (graphPoints[i][j].x / timeMax) * (63/20)) * unit2Px)
        }

        this.iclData.tourLine[i] = this.fieldSVG.select("#lines").append("path")
            .attr("d", holdA)
            .style("stroke", this.tourColors[i])
            .style("stroke-width", this.iclData.unit2Px * (1 / 25))
            .style("stroke-opacity", 0.5)
            .style("fill", "none");

        this.iclData.graphPoints[i][this.iclData.time] = {
            x: this.iclData.time,
            y: (dista - this.iclData.unit2Px * (10 / 25))
        };

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
     */
    PlayAnim() {
        if (this.iclData.timeDirect != 0) {
            this.iclData.time += this.iclData.timeDirect;
            if (this.iclData.time < 0) {
                this.iclData.time = 0;
                this.iclData.timeDirect = 0;
            } else if (this.iclData.time > this.iclData.timeMax) {
                this.iclData.time = this.iclData.timeMax;
                this.iclData.timeDirect = 0;
            }
            this.UpdateVisuals();
            this.timeSlider.attr("x", ((10 / 25) + (this.iclData.time / this.iclData.timeMax) * (63 / 20)) * this.iclData.unit2Px);
            this.timeText.text("Time: " + Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100);
            this.frameText.text("Frame: " + Math.floor(this.iclData.time));
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
            this.iclData.graphDots[i].attr("cx", ((10 / 25) + ((this.iclData.graphPoints[i][Math.floor(this.iclData.time)].x / this.iclData.timeMax) * (63 / 20))) * this.iclData.unit2Px).attr("cy", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].y);
        }
    }
}
