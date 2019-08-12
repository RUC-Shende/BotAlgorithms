'use strict';
var worldo;

class utils {

    constructor() {}

    static wallAtAngle(path, center, angle) {
        var unit2Px = 25;
        for( var i = 0; i < path.length - 1; i++ ) {
          var hold = utils.WhereLineSegsCross(
            center,
            {
              x:center.x + 8 * unit2Px * Math.cos( angle * Math.PI / 180 ),
              y:center.y - 8 * unit2Px * Math.sin( angle * Math.PI / 180 )
            },
            path[ i ],
            path[ i + 1 ]
          );
          if( hold ) {
            return hold;
          }
        }
        return null;
    }

    static genPoly(c, r, a, n) {
        var poly = [];
        for (var i = 0; i < n; i++) {
            var sumAng = (a * Math.PI / 180) + (i * 2 * Math.PI / n);
            poly.push({
                x: c.x + r * Math.cos(sumAng),
                y: c.y - r * Math.sin(sumAng)
            });
        }
        poly.push(poly[0]);
        return (poly);
    }

    static midpoint(pt1, pt2) {
        if (pt1.x == pt2.x && pt1.y == pt2.y) {
            console.log("%cERROR: Must be different points.", "color:#ff0000ff");
            return null;
        }
        return {x:(pt1.x + pt2.x)/2, y:(pt1.y + pt2.y)/2};
    }

    static cmpXYPairs( v1, v2 ) {
      if( ( v1.x == v2.x ) && ( v1.y == v2.y ) ) {
        return( true );
      }
      return( false );
    }

    static AddAround( val, max, amt ) {
      if( max < 1 ) {
        console.log( "%cERROR: max must be positive", "color:#ff0000" );
        return( null );
      }
      if( !amt ) {
        console.log( "%cERROR: amt must be nonzero", "color:#ff0000" );
        return( null );
      }
      var hold = val + amt;
      while( 1 ) {
        if( hold < 0 ) {
          hold += max;
        } else if( hold >= max ) {
          hold -= max;
        } else {
          return( hold );
        }
      }
    }

    static WhereLineSegsCross( pt1, pt2, pt3, pt4 ) {
      if( pt1.x > pt2.x ) {
        var hold = pt1;
        pt1 = pt2;
        pt2 = hold;
      }
      var a1 = ( pt2.y - pt1.y ) / ( pt2.x - pt1.x );	//slope
      var b1 = 1;
      if( pt2.x - pt1.x == 0 ) {	//Line one is vertical, change values to proper equation
        a1 = 1;
        b1 = 0;
      }
      var c1 = b1 * pt1.y - a1 * pt1.x;	//y-intercept

      if( pt3.x > pt4.x ) {
        var hold = pt3;
        pt3 = pt4;
        pt4 = hold;
      }
      var a2 = ( pt4.y - pt3.y ) / ( pt4.x - pt3.x );
      var b2 = 1;
      if( pt4.x - pt3.x == 0 ) {	//Line two is vertical, change values to proper equation
        a2 = 1;
        b2 = 0;
      }
      var c2 = b2 * pt3.y - a2 * pt3.x;

      var s1 = ( b1 * pt3.y - a1 * pt3.x - c1 ) * ( b1 * pt4.y - a1 * pt4.x - c1 );
      var s2 = ( b2 * pt1.y - a2 * pt1.x - c2 ) * ( b2 * pt2.y - a2 * pt2.x - c2 );

      if( s1 <= 0 && s2 <= 0 ) {
        var d = a1 * b2 - a2 * b1;
        if( d == 0 ) {
          return( null );
        }
        var dx = c1 * b2 - c2 * b1;
        var dy = a1 * c2 - a2 * c1;
        //console.log( pt1, pt2, pt3, pt4 );
        //console.log( "1: ", "a1:" + a1, "b1:" + b1, "c1:" + c1, "a2:" + a2, "b2:" + b2, "c2:" + c2 );
        //console.log( "2: ", "dx:" + dx, "dy:" + dy, "d:" + d, "dxld:" + dx / d, "dyld:" + dy / d );
        return( { x:-dx / d, y:dy / d } );
      }
      return( null );
    }

}

/**
 *Data necessary to run a simulation of a given algorithm, create visual paths, etc.
 *Tourist == Agent == Robot.
 *
 * @param {integer} id Global identifier of this object.
 * @param {Array} instruBinder Array of valid trajectories for Tourists to follow. Length of this is touristNum.
 * @param {string} algorithmName Full clean name of the algorithm instruBinder is supposed to represent.
 * @param {float} angle Angle of the exit location on the shape. Exit location will be at the wall of the shape.
 * @param {boolean} wireless True if using Wireless communication model, false otherwise.
 * @param {Array} path An array of points with which to create the target shape.
 *
 */
class iclData {
    constructor(id, instruBinder, algorithmName, angle, wireless, path) {
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
        this.degrees = path.length - 1;
        /** 1 unit == 1 Radius. How many pixels per unit. */
        this.unit2Px = 25;
        /** Center of the current shape in {float}[x,y]. */
        this.center = {
            x: this.unit2Px * 2,
            y: this.unit2Px * 2
        };
        /** Angle of the exit to use for the sim. */
        this.exitAngle = angle;
        /** Exit to use for the sim in {float}[x,y]. */
        this.fieldExit = utils.wallAtAngle(path, this.center, angle);
        /** How many tourists this data structure is in control of. */
        this.touristNum = 0;
        /** Array of valid trajectories for robots. Length is how many tourists are being used. */
        this.instruBinder = instruBinder;
        /** Full clean name of algorithm. */
        this.algorithmName = algorithmName;
        /** Array of {Tourist}s */
        this.tourists = [];

        /** Interval for this iclData instance. Typically set to 1000/fps. Initialized to just a number.*/
        this.motor = this.id;

        this.path = path;

        this.pPath = this.genPath();

        this.history = null;

        this.mods = [];


        //this.Start();
    }

    genPath() {
        if (this.path[0].x != this.path[this.path.length - 1].x ||
            this.path[0].y != this.path[this.path.length - 1].y
        ) {
            console.log("%cERROR: Must be a closed path", "color:#ff0000ff");
            return null;
        }
        var pPath = [];
        var curPt = null;
        for (var i = 0; i < this.path.length; i++) {
            var nextPt = this.path[i];
            if (curPt) {
                var distance = Math.hypot(nextPt.y - curPt.y, nextPt.x - curPt.x);
                var totalSteps = Math.floor(this.fps * distance / this.unit2Px) + 1;
                for (var j = 0; j < totalSteps; j++) {
                    var pt = {
                        x: curPt.x + (j / totalSteps) * (nextPt.x - curPt.x),
                        y: curPt.y + (j / totalSteps) * (nextPt.y - curPt.y)
                    };
                    pPath.push(pt);
                }
            }
            curPt = nextPt;
        }
        return (pPath);
    }

    Init() {
        this.time = 0; //Reset time
        this.tourists = []; //Reset mobiles for run
        var p = [true, true, false]
        for (var i = 0; i < this.instruBinder.length; i++) { //Refill mobiles for run

            this.tourists.push(new Tourist(
                this, this.center.x, this.center.y, i, this.instruBinder[i], p[i]));
        }
        for (var j = 0; j < this.mods.length; j++) { //Reset modules
            if (this.mods[j].Init) {
                this.mods[j].Init();
            }
        }

    }

    createHistory() {
        this.Init();
        this.history = []; //Reset History
        for (var i = 0; i < this.instruBinder.length; i++) {
            this.history.push([]);
        }
        while (this.time < this.timeMax) {
            for (var i = 0; i < this.instruBinder.length; i++) {
                var who = this.tourists[i];
                this.history[i].push({
                    x: who.x,
                    y: who.y
                });
                who.allowance = who.velocity * this.unit2Px / this.fps;
                while (who.allowance > 0) {
                    who[who.icl[who.on][0]](who.icl[who.on][1]);
                }
            }
            for (var j = 0; j < this.mods.length; j++) {
                if (this.mods[j].Update) {
                    this.mods[j].Update();
                }
            }
            this.time++;
        }
    }

}

class exitFindMod {
    constructor(iclData, exit, field, graph) {
        this.iclData = iclData;
        this.step = this.iclData.unit2Px / this.iclData.fps;
        this.premo = null;
        this.exit = exit;
        this.fTime = null;
        this.exitDistances = [];
        this.fieldSVG = field;
        this.graphSVG = graph;
        this.graphLines = [];
    }

    Init() {
        if (this.iclData.history) {
            this.premo = this.iclData.history;
        }
        for (var i = 0; i < this.iclData.tourists.length; i++) {
            this.exitDistances.push([]); // Add each array for tourists.
        }
    }

    Update() {
        if (this.premo) {
            var loc = this.iclData.history,
                j = 0;
            for (var i = 0; i < this.iclData.tourists.length; i++) {

                var distance = Math.hypot(
                    this.exit.y - loc[i][loc[i].length - 1].y,
                    this.exit.x - loc[i][loc[i].length - 1].x
                );
                this.exitDistances[i].push(distance);
                if (distance <= this.step / 2) {
                    // If tourist is priority and at exit end alg by time = timeMax
                    if (this.iclData.tourists[i].priority) {
                        this.iclData.allExitedLine = 1;
                        this.iclData.timeMax = this.iclData.time;
                    }
                    if (!this.iclData.tourists[i].knows) {
                        this.iclData.tourists[i].on = this.iclData.tourists[i].icl.length - 1;
                        this.iclData.tourists[i].knows = true;
                        j++;
                    }
                    // Send out exit alert
                    if (this.iclData.wireless) {
                        for (var m = 0; m < this.iclData.tourists.length; m++) {
                            this.iclData.tourists[m].on = this.iclData.tourists[m].icl.length - 1;
                            this.iclData.tourists[m].knows = true;
                        }
                    }
                }

            }
            var allKnowing = false;
            for (var t = 0; t < this.iclData.tourists.length; t ++ ) {
                allKnowing = utils.cmpXYPairs(this.iclData.tourists[t], this.iclData.fieldExit);
                if (!allKnowing){
                    break;
                }
            }
            if (allKnowing) {
                this.iclData.timeMax = this.iclData.time;
            }
        }
    }

    VReset() {
        this.graphSVG.select("#backGround").html(null);
        this.graphSVG.select("#lines").html(null);
        this.graphSVG.select("#bots").html(null);
        this.graphSVG.select("#overLay").html(null);
    }

    VInit() { // draw initial graph.
        //this.VReset();
        for (var i = 0; i < this.iclData.tourists.length; i++) {
            this.graphLines.push([]);
        }
        this.fieldSVG.select("#lines").append("circle")
            .attr("cx", this.iclData.fieldExit.x)
            .attr("cy", this.iclData.fieldExit.y)
            .attr("r",  1)
            .attr("id", "exit")
            .style("fill", "#ffffff")
            .style("stroke", "#000000")
            .style("stroke-width", "0.1");

        this.graphSVG.select("#backGround").append("path")
            .attr("d", "M" + (0.4 * this.iclData.unit2Px) + "," + (1.5 * this.iclData.unit2Px) +
                       "L" + (0.4 * this.iclData.unit2Px) + "," + (3.5 * this.iclData.unit2Px) +
                       "L" + (3.5 * this.iclData.unit2Px) + "," + (3.5 * this.iclData.unit2Px))
            .style("stroke", "#000000")
            .style("stroke-width", 1)
            .style("fill", "none");

        for (var i = 1; i < 3; i++) { //Create y-axis labels.
            this.graphSVG.select("#backGround").append("text")
                .attr("x", (0.3 * this.iclData.unit2Px))
                .attr("y", ((3.5 * this.iclData.unit2Px) - (i * this.iclData.unit2Px)))
                .style("font-size", this.iclData.unit2Px * (4 / 25))
                .style("text-anchor", "middle").text(i + 'r');
        }

        var mtime = Math.floor((100 * this.iclData.timeMax) / this.iclData.fps) / 100;

        for (var i = 0; i <= mtime; i++) { //Create new scaled x-axis labels.
            this.graphSVG.select("#backGround").append("text")
                .attr("x", (0.5 * this.iclData.unit2Px + i / mtime * 3 * this.iclData.unit2Px))
                .attr("y", this.iclData.unit2Px * 3.7)
                .style("font-size", this.iclData.unit2Px * (4 / 25))
                .style("text-anchor", "middle")
                .text(i)
                .attr("class", "graphnum");
        }
    }

    VUpdate() {
        var formatvalue = d3.format(",.3f");

        var hold = '';
        for (var i = 0; i < this.iclData.tourists.length; i++) {
            var hold = '';

            if (this.iclData.time > 0) {
                this.graphLines[i].remove();
            }
            for (var j = 0; j < this.iclData.time; j++) {
                var pt = {
                    x: (0.5 * this.iclData.unit2Px) + (3 * this.iclData.unit2Px * (j / this.iclData.timeMax)),
                    y: (3.5 * this.iclData.unit2Px) - this.exitDistances[i][j]
                };
                hold += ((j == 0) ? ('M') : ('L')) + pt.x + ',' + pt.y;

            }
            this.graphLines[i] = this.graphSVG.select("#lines").append("path")
                .attr("d", hold).attr("stroke-width", 1)
                .style("stroke", this.iclData.tourists[i].icl[0][0] ).style("fill", "none");
        }
        if (this.iclData.time == this.iclData.timeMax - 1) {
            var exitMax = this.graphSVG.select("#backGround").append("text")
                .attr("x", this.iclData.unit2Px * 2)
                .attr("y", this.iclData.unit2Px)
                .style("font-size", 0.2 * this.iclData.unit2Px)
                .style("text-anchor", "middle")
                .text("Time taken this run: " + formatvalue((Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100)));
            var worstPlacement = this.graphSVG.select("#backGround").append("text")
                .attr("x", this.iclData.unit2Px * 2)
                .attr("y", this.iclData.unit2Px * 1.2)
                .style("font-size", 0.2 * this.iclData.unit2Px)
                .style("text-anchor", "middle")
                .text("Exit Placement: " + this.iclData.exitAngle + "°");
        }


    }
}

class lineFillMod {
    constructor(iclData, exitEnvelopeGraph) {
        this.iclData = iclData;
        this.step = this.iclData.unit2Px / this.iclData.fps;
        this.pts = null;
        this.count = -1;

        this.exitTimes = [];
        this.exitEnvelopeGraph = exitEnvelopeGraph;
        this.exitEnvelopeLine = null;
        this.hold = null;
    }

    Init() {
        this.pts = this.iclData.pPath.slice();
        this.count = this.iclData.pPath.length;
        for (var p = 0; p < this.pts.length; p++) {
            this.exitTimes.push(0);
        }
    }

    Update() {
        var loc = this.iclData.history;
        for (var i = 0; i < loc.length; i++) {
            for (var j = 0; j < this.pts.length; j++) {
                if (this.pts[j]) {
                    var distance = Math.hypot(
                        this.pts[j].y - loc[i][loc[i].length - 1].y,
                        this.pts[j].x - loc[i][loc[i].length - 1].x
                    );
                    if (distance <= this.step / 2) {
                        this.pts[j] = null;
                        this.count--;
                        this.exitDistChecker(i, j);
                    }
                }
            }
        }
        if (this.count < 1) {
            this.iclData.timeMax = this.iclData.time;
        }
    }

    // For checking priority end times only. Does not work on normal or F2F algorithms!
    exitDistChecker(i, j){
        if (this.iclData.tourists[i].priority) {
            this.exitTimes[j] = (Math.floor((1000 * this.iclData.time) / this.iclData.fps) / 1000);
        }
        else {
            // Helper is tourist i
            var posHold = [];
            var distHold = [];
            for (var t = 0; t < this.iclData.tourists.length; t++) {
                if (t != i) {
                    posHold.push({x:this.iclData.tourists[t].x, y:this.iclData.tourists[t].y});
                    var dVec = {
                        x:Math.abs(this.iclData.tourists[i].x - this.iclData.tourists[t].x),
                        y:Math.abs(this.iclData.tourists[i].y - this.iclData.tourists[t].y)
                    }
                    distHold.push(Math.hypot(dVec.y, dVec.x));
                }
            }
            this.exitTimes[j] = (Math.floor((100 * this.iclData.time) / this.iclData.fps) / 100) + (Math.min(...distHold) / this.iclData.unit2Px);

        }
    }

    VReset() {
        this.exitEnvelopeGraph.select("#backGround").html(null);
        this.exitEnvelopeGraph.select("#lines").html(null);
        this.exitEnvelopeGraph.select("#bots").html(null);
        this.exitEnvelopeGraph.select("#overLay").html(null);
    }

    VInit() {
        //this.VReset();
        this.exitEnvelopeGraph.select("#lines").append("path")
            .attr("d", "M" + (0.4 * this.iclData.unit2Px) + "," + (1.5 * this.iclData.unit2Px) +
                       "L" + (0.4 * this.iclData.unit2Px) + "," + (3.5 * this.iclData.unit2Px) +
                       "L" + (3.5 * this.iclData.unit2Px) + "," + (3.5 * this.iclData.unit2Px))
            .style("stroke", "#000000")
            .style("stroke-width", 1)
            .style("fill", "none");

        for (var i = 0; i < (Math.floor((100 * this.iclData.timeMax) / this.iclData.fps) / 100)+1; i++) { //Create y-axis labels.
            this.exitEnvelopeGraph.select("backGround").append("text")
                .attr("x", (0.3 * this.iclData.unit2Px))
                .attr("y", ((3.5 * this.iclData.unit2Px) - (i * 0.5 *this.iclData.unit2Px)))
                .style("font-size", this.iclData.unit2Px * (4 / 25))
                .style("text-anchor", "middle").text(i + 's');
        }

        for (var i = 0; i < 7; i ++){
            this.exitEnvelopeGraph.select("#backGround").append("text")
                .attr("x", (0.5 * this.iclData.unit2Px) + (3 * this.iclData.unit2Px * ((i * 60) / 360)))
                .attr("y", (3.7 * this.iclData.unit2Px))
                .style("font-size", this.iclData.unit2Px * (4 / 25))
                .text((i * 60) + "°");

        }
        var graphName = this.exitEnvelopeGraph.select("#backGround").append("text")
            .attr("x", this.iclData.unit2Px * 2)
            .attr("y", this.iclData.unit2Px * 0.5)
            .style("font-size", 0.15 * this.iclData.unit2Px)
            .style("text-anchor", "middle")
            .text("Time until evacuation condition for each exit placement");
    }

    VUpdate() {
        var formatvalue = d3.format(",.3f");
        var hold = '';
        if (this.iclData.time > 0) {
            this.exitEnvelopeLine.remove();
        }
        for (var j = 0; j < this.exitTimes.length - 1; j++) {
            var pt = {
                x: (0.5 * this.iclData.unit2Px) + (3 * this.iclData.unit2Px * (j / this.exitTimes.length)),
                y: (3.5 * this.iclData.unit2Px) - (this.exitTimes[j] * 0.5  *this.iclData.unit2Px)
            };
            hold += ((j == 0) ? ('M') : ('L')) + pt.x + ',' + pt.y;

        }
        if (this.iclData.time == this.iclData.timeMax - 1){
            var exitMax = this.exitEnvelopeGraph.select("backGround").append("text")
                .attr("x", this.iclData.unit2Px * 2)
                .attr("y", this.iclData.unit2Px)
                .style("font-size", 0.2 * this.iclData.unit2Px)
                .style("text-anchor", "middle")
                .text("Max time taken: " + formatvalue(Math.max(...this.exitTimes)));
            var worstPlacement = this.exitEnvelopeGraph.select("backGround").append("text")
                .attr("x", this.iclData.unit2Px * 2)
                .attr("y", this.iclData.unit2Px * 1.2)
                .style("font-size", 0.2 * this.iclData.unit2Px)
                .style("text-anchor", "middle")
                .text("Worst Exit Placement: " + (this.exitTimes.indexOf(Math.max(...this.exitTimes))) / 2 + "°");
        }

        this.exitEnvelopeLine = this.exitEnvelopeGraph.select("#lines").append("path")
            .attr("d", hold)
            .attr("stroke-width", 1)
            .style("stroke", "00ff00")
            .style("fill", "none");


    }

}

/*
Module to graph the upper bound of exit times based on algorithm.
*/

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
    constructor(iclData, field, graph) {
        /** An instance of iclData to use to update visuals */
        this.iclData = iclData;
        /** A D3 reference to the Field. Contains 4 Layers - 1: BackGround, 2: Lines, 3: Bots, 4: OverLay */
        this.fieldSVG = field;
        //this.fieldSVG = d3.select("#anim" + this.iclData.id);
        /** A D3 reference to the Graph. Contains 4 Layers - 1: BackGround, 2: Lines, 3: Bots, 4: OverLay */
        this.graphSVG = graph;
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
        this.visuals = [];
        this.Init();
        // Initialize.
        //this.Start();
    }

    Init() {
        this.iclData.time = 0;
        var hold = '';
        for (var i = 0; i < this.iclData.path.length; i++) {
            var pt = this.iclData.path[i];
            hold += ((i == 0) ? ('M') : ('L')) + pt.x + ',' + pt.y;
        }
        this.fieldSVG.select("#lines").append("path")
            .attr("d", hold).attr("stroke-width", 0.25)
            .style("stroke", "000000").style("fill", "none");

        //var colors = ["#ff0000", "00ff00", "0000ff"];

        for (var i = 0; i < this.iclData.history.length; i++) {
            this.visuals.push(this.fieldSVG.select("#bots").append("circle")
                .attr("r", 3)
                .attr("cx", this.iclData.center.x)
                .attr("cy", this.iclData.center.y)
                .attr("stroke-width", 0.25)
                .style("fill", this.iclData.tourists[i].icl[0][0] ).style("stroke", "none")
            );
        }
        for (var i = 0; i < this.iclData.mods.length; i++) {
            if (this.iclData.mods[i].VInit) {
                this.iclData.mods[i].VInit();
            }
        }
    }

    static reEnact() {
        if (this.iclData.time <= this.iclData.timeMax) {
            for (var i = 0; i < this.iclData.history.length; i++) {
                this.visuals[i].attr("cx", this.iclData.history[i][this.iclData.time].x)
                    .attr("cy", this.iclData.history[i][this.iclData.time].y);
            }
            for (var i = 0; i < this.iclData.mods.length; i++) {
                if (this.iclData.mods[i].VUpdate) {
                    this.iclData.mods[i].VUpdate();
                }
            }
            this.iclData.time++;
        }
    }



}
