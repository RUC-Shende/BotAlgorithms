//////////----------Instantiate Variables----------//////////

/**
Currently there is a bug where the lines at the end get very confused
and look awful when the graph scaling to timeMax is supposed to occur.
I am in the process of fixing it.
*/

class iclData {
    constructor(id, instruBinder, algorithmName, angle, wireless) {
        this.exitAlert = false; //Someone learned where the exit is.
        this.exitAllow = 0; //How far in a frame was the exit found.
        this.wireless = wireless;
        this.id = id;
        this.time = 0;
        this.timeDirect = 0; //After loading, play direction.
        this.fps = 60;
        this.timeMax = 10 * this.fps;
        this.timeSlider;

        this.projector;
        this.degrees = 3;
        this.unit2Px = 25;
        this.center = [this.unit2Px * 2, this.unit2Px * 2];
        this.exitAngle = angle;
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
        this.exitFoundFrame = 0;
        this.Start();
    }

    LoadAlgorithms(event) {
        javascript: void(0);
        var file = event.target.files[0]; //even though it only takes one file, the input type will still be a FileList.
        var fileName = document.getElementById('loadcommands').value;
        if (!fileName.includes('.icl')) {
            alert('Please use a proper *.icl file to load your commands. If you think the file name is correct, then it might be corrupted.');
            return;
        }
        var fileReader = new FileReader();
        fileReader.onload = (function(file) {
            var tempinstruBinder = [];
            var text = fileReader.result;
            var sText = text.split("\n");
            var numBots = sText.length - 1;
            for (i = 0; i < numBots; i++) {
                tempinstruBinder.push([]);
                var exitProtocol = sText[i].split('#')[0];
                var commandProtocol = sText[i].split('#')[1];

                var exitComms = exitProtocol.split('*');
                var regularComms = commandProtocol.split('|');


                for (j = 0; j < exitComms.length - 1; j++) {
                    var command = exitComms[j].split(' ')[0];
                    var args = [];
                    for (x = 1; x < exitComms[j].split(' ').length; x++) {

                        var val = exitComms[j].split(' ')[x];
                        var isnum = /^\d+$/.test(val);
                        if (isnum) {
                            val = parseInt(val);
                        }

                        args.push(val);
                    }

                    if (args.length == 0) {
                        args.push(null);
                    }
                    tempinstruBinder[i].push([command, args]);
                }
                for (k = 0; k < regularComms.length - 1; k++) {
                    var command = regularComms[k].split(' ')[0];
                    var args = [];
                    for (x = 1; x < regularComms[k].split(' ').length; x++) {

                        var val = regularComms[k].split(' ')[x];
                        var isnum = /^\d+$/.test(val);
                        if (isnum) {
                            val = parseInt(val);
                        } else {}

                        args.push(val);
                    }
                    if (args.length == 0) {
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

        while (this.time < this.timeMax) { //Load one run through.
            this.AlterAnim();
        }
        this.time = this.timeMax;

        this.time = 0;

        for (var i = 0; i < this.touristNum; i++) { //Reset for next run through.
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
        this.tourPoints[i].push({
            x: this.tourists[i].x,
            y: this.tourists[i].y
        });
        this.graphPoints[i].push({
            x: (this.unit2Px * (10 / 25) + (this.time / this.timeMax) * (80 / 25) * this.unit2Px),
            y: (dista - this.unit2Px * (10 / 25))
        });
    }

    AlterAnim() {
        if (this.time > this.timeMax){
            this.time = this.timeMax;
            for (i = 0; i < this.touristNum; i++) {
                //this.AlterLines(i);
            }
        }
        else {
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
                for (var i = 0; i < this.tourists.length; i++) { //reset bots
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
                        if (who.knew) { //Target already on exit procedures.
                            who[this.instruBinder[i][0][0]](this.instruBinder[i][0][1]);
                        } else { //Has not started exit procedures yet.
                            who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
                            if (who.knows) { //Clear target for bot if beginning exit procedures.
                                who.target = null;
                            }
                        }
                    }
                    who.allowance = (who.velocity * this.unit2Px / this.fps) - this.exitAllow;
                    while (who.allowance > 0) {
                        if (who.knows) { //Proceed with exit procedures.
                            who[this.instruBinder[i][0][0]](this.instruBinder[i][0][1]);
                            who.knew = true;
                        } else { //Still does not know.
                            who[this.instruBinder[i][who.on][0]](this.instruBinder[i][who.on][1]);
                        }
                    }
                }
                this.exitAlert = false;
            }
            //this.AllAtExit();
            this.time++;
        }
    }

    //Create lines, and update graph dot positions, as well as recreating image of path.
    AlterLines(i) {
        var dista = this.unit2Px * 4 - (Math.hypot(this.fieldExit[0] - this.tourists[i].x, this.fieldExit[1] - this.tourists[i].y) * (20 / 25));
        this.tourPoints[i][this.time] = {
            x: this.tourists[i].x,
            y: this.tourists[i].y
        };
        this.graphPoints[i][this.time] = {
            x: (this.unit2Px * ((10 / 25) + (this.time / this.timeMax) * (80 / 25))),
            y: (dista - this.unit2Px * (10 / 25))
        };
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
        if (this.exitAlert) {
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
            } else if (!this.priorityExitedLine && this.tourists[j].priority) {
                this.priorityExitedLine = 1;
                this.timeMax = this.time;
            }
        }
        if (!this.allExitedLine) {
            this.allExitedLine = 1;
            this.timeMax = this.time;
        }
    }
}

class iclVisual {
    constructor(iclData) {
        this.iclData = iclData;
        this.tourColors = [];

        this.fieldSVG = d3.select("#anim" + this.iclData.id);
        this.tourLine = iclData.tourLine;

        this.graphSVG = d3.select("#graph" + this.iclData.id);
        this.graphLine = iclData.graphLine;

        this.exitFoundLine = iclData.exitFoundLine;
        this.allExitedLine = iclData.allExitedLine;

        this.lineFx = d3.line().x((d) => {
            return (d.x);
        }).y((d) => {
            return (d.y);
        });

        this.finished = false;


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

        //var tmp = this;
        //this.fieldSVG.on("mousemove", this.ChoosExit.call(this, tmp)).on("click", exitChosen.call(this, tmp));

        this.Load();
    }

    Load() {

        this.LoadField();
        var t = this.iclData;
        d3.select("#exit").attr("cx", t.fieldExit[0]).attr("cy", t.fieldExit[1]);
        this.LoadGraph();
        for (var i = 0; i < this.iclData.instruBinder.length; i++) { //Add bots, lines, and coordinate collectors.
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
        for (var i = 0; i < this.iclData.touristNum; i++) { //Reset for next run through.

            this.tourLine[i] = this.fieldSVG.select("#lines").append("path").attr("d", this.lineFx(this.iclData.tourPoints[i]))
                .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");

            this.graphLine[i] = this.graphSVG.select("#lines").append("path").attr("d", this.lineFx(this.iclData.graphPoints[i]))
                .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
        }
    }

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
        this.fieldSVG.select("#overLay").append("circle").attr("id", "exit").attr("cx", 50).attr("cy", 50).attr("r", .5)
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

    LoadGraph() {
        d3.select("#timeSlide").call(d3.drag().on("start", this.SSlide).on("drag", this.MSlide).on("end", this.ESlide));
        var fo = this.graphSVG.append('foreignObject').attr('x', this.iclData.unit2Px * (1 / 25)).attr('y', this.iclData.unit2Px * (18 / 25)).attr('width', this.iclData.unit2Px * 1.5).attr('height', this.iclData.unit2Px * (18 / 25));

        for (var i = 0; i < 3; i++) { //Create y-axis labels.
            this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (90 / 25) - i * this.iclData.unit2Px * (20 / 25))
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i + 'r');
        }
        for (var i = 0; i < 11; i++) { //Create x-axis labels.
            this.graphSVG.select("#backGround").append("text").attr("x", this.iclData.unit2Px * (10 / 25) + i * this.iclData.unit2Px * (8 / 25))
                .attr("y", this.iclData.unit2Px * (94 / 25))
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
        }
    }

    cleanUp() {
        this.tourColors = [];

        this.tourLine = [];

        this.graphLine = [];

        this.exitFoundLine = null;
        this.allExitedLine = null;
    }

    ChoosExit() {

        this.iclData.exitAngle = Math.atan2(d3.mouse(this)[0] - d3.select("#center").attr("cx"), d3.mouse(this)[1] - d3.select("#center").attr("cy")) - (Math.PI / 2);
        if (this.iclData.exitAngle < 0) {
            this.iclData.exitAngle += 2 * Math.PI;
        }
        d3.select("#exitText").text("Left-Click to place exit at ~" + Math.floor(this.iclData.exitAngle * 180 * 100 / Math.PI) / 100 + " degrees");
        if (this.iclData.degrees == 2) { //Choose exit relative to mouse position.
            this.iclData.fieldExit = [d3.event.x, this.iclData.center[1]];
        } else { //Choose exit relative to shape.
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
        if (this.iclData.timeMax < this.iclData.time){
            return;
            for (var i = 0; i < this.iclData.touristNum; i++) {
                this.tourLine[i].remove();

                var holdA = 'M' + (this.iclData.tourPoints[i][0].x + ',' + (this.iclData.tourPoints[i][0].y));
                var holdG = 'M' + (10 / 25) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][0].y);
                for (var j = 1; j < this.iclData.time; j++) {
                    holdA += 'L' + (this.iclData.tourPoints[i][j].x + ',' + (this.iclData.tourPoints[i][j].y));
                    holdG += 'L' + ((10 / 25) + ((this.iclData.graphPoints[i][j].x / this.iclData.timeMax) * (63 / 20))) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][j].y);
                    //((10/25) + (graphPoints[i][j].x / timeMax) * (63/20)) * unit2Px)
                }
                console.log("here");
                this.tourLine[i] = this.fieldSVG.select(".lines").append("path").attr("d", holdA)
                    .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
                console.log("did not draw line");
            }
        }
        for (var i = 0; i < this.iclData.touristNum; i++) {
            var who = this.iclData.tourists[i];
            if (this.iclData.time >= this.iclData.timeMax) {
                this.tourLine[i].remove();

                var holdA = 'M' + (this.iclData.tourPoints[i][0].x + ',' + (this.iclData.tourPoints[i][0].y));
                var holdG = 'M' + (10 / 25) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][0].y);
                for (var j = 1; j < this.iclData.time; j++) {
                    holdA += 'L' + (this.iclData.tourPoints[i][j].x + ',' + (this.iclData.tourPoints[i][j].y));
                    holdG += 'L' + ((10 / 25) + ((this.iclData.graphPoints[i][j].x / this.iclData.timeMax) * (63 / 20))) * this.iclData.unit2Px + ',' + (this.iclData.graphPoints[i][j].y);
                    //((10/25) + (graphPoints[i][j].x / timeMax) * (63/20)) * unit2Px)
                }
                console.log("here");
                this.tourLine[i] = this.fieldSVG.select(".lines").append("path").attr("d", holdA)
                    .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
                console.log("did not draw line");
                //break;
            }
            who.visual.attr("cx", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].y);
            this.iclData.graphDots[i].attr("cx", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].y);
        }
    }

}

function Interval() {
    if (leftVis.finished){
        return;
        ''
    }
    editAnims('play');
    leftVis.iclData.AlterAnim();
    console.log(leftVis.iclData.timeDirect);
    leftVis.UpdateVisuals();
    leftVis.iclData.AllAtExit();
}

function editAnims(s) {
    if (s == "play") {
        leftVis.iclData.timeDirect = 1;
    } else if (s == "rewind") {
        leftVis.iclData.timeDirect = -1;
    } else if (s == "slow") {
        leftVis.iclData.timeDirect /= 2;
    }
}

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

function changeInstructions(n) {
    var e = document.getElementById("alg" + n);
    var s = e.options[e.selectedIndex].value;
    console.log(s, n);
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

function exitChosen() {
    //clear motor
    clearInterval(theMotor);
    d3.selectAll("#bots").html(null);
    d3.selectAll("#lines").html(null);
    leftSide = new iclData(0, instruBinder, "Priority 1", d3.select("#exitAngle").node().value, true);
    leftVis = new iclVisual(leftSide);
    theMotor = setInterval(Interval, 1000 / 60);
    d3.select(".exitText").remove();
    d3.select("#anim0").on("mousemove", null).on("click", null);
}

var leftSide;
var leftVis;
var theMotor;

var instruBinder = [
    [
        ["GoToExit", [null, true]],
        ["GoToWallAtAngle", [213.8]],
        ["FollowWall", ["left"]]
    ],
    [
        ["GoToExit", [null, true]],
        ["GoToWallAtAngle", [0]],
        ["FollowWall", ["left"]]
    ],
    [
        ["Wait", [null, false]],
        ["GoToWallAtAngle", [213.8]],
        ["FollowWall", ["right"]]
    ]
];
