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
        console.log(this.tourPoints);

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
      //console.log(Math.floor((100 * time) / fps) / 100);
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
        //this.UpdateVisuals();

        //dataBox = fieldSVG.select("#overLay").append("svg").attr("width", 2 * unit2Px).attr("height", unit2Px).attr("visibility", "hidden");
        for (var i = 0; i < this.iclData.touristNum; i++) { //Reset for next run through.

            this.iclData.tourLine[i] = this.fieldSVG.select(".lines").append("path").attr("d", this.lineFx(this.iclData.tourPoints[i]))
                .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");

            this.graphLine[i] = this.graphSVG.select(".lines").append("path").attr("d", this.lineFx(this.iclData.graphPoints[i]))
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
                .attr("class", "graphnum")
                .style("font-size", this.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i);
        }
    }

    cleanUp() {
        this.tourColors = [];

        this.iclData.tourLine = [];

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
        var visualReference = this;
        this.projector = setInterval(this.AlterAnim, 1000 / this.iclData.fps);
        this.Load();
    }

    AlterAnim() {
      if (this.leftVis.iclData.time >= this.leftVis.iclData.timeMax) {
        this.leftVis.iclData.time = this.leftVis.iclData.timeMax;


        for (var i = 0; i < 11; i++) {//Create x-axis labels.
          this.leftVis.graphSVG.selectAll(".graphnum").style("display", "none");
        }

        for (i = 0; i < this.leftVis.iclData.touristNum; i++){
            this.leftVis.AlterLines(i);
        }

        for (var i = 0; i <= Math.floor((100 * this.leftVis.iclData.time) / this.leftVis.iclData.fps) / 100; i++) {//Create x-axis labels.
          this.leftVis.graphSVG.select("#overLay").append("text")
                  .attr("x", (10/25 + (i / (Math.floor((100 * this.leftVis.iclData.time) / this.leftVis.iclData.fps) / 100)) * 80/25) * this.leftVis.iclData.unit2Px)//unit2Px * (10 / 25) + ((Math.floor(timeMax) - i) * 80/25) * unit2Px)
                  .attr("y", this.leftVis.iclData.unit2Px * (94 / 25))
                  .style("font-size", this.leftVis.iclData.unit2Px * (4 / 25)).style("text-anchor", "middle").text(i).attr("class","graphnum");
        }
        leftVis.graphSVG.select("#overLay").append("text").attr("x", (this.leftVis.iclData.unit2Px * 65/25)).attr("y", this.leftVis.iclData.unit2Px * (1.7))
                .style("font-size", this.leftVis.iclData.unit2Px * (4/25))
                .text("End: " + Math.floor((100 * this.leftVis.iclData.time) / this.leftVis.iclData.fps) / 100 + " sec");
        leftVis.graphSVG.select("#overLay").append('text').attr("x", this.leftVis.iclData.unit2Px * 65/25).attr("y", this.leftVis.iclData.unit2Px * 1.83)
                .attr("class", "sliderhelp").style("font-size", this.leftVis.iclData.unit2Px * (3/25)).text("Click and drag gray bar")
                .style("fill", "#bbbbaa");
        leftVis.graphSVG.select("#overLay").append('text').attr("x", this.leftVis.iclData.unit2Px * 65/25).attr("y", this.leftVis.iclData.unit2Px * 1.95)
                .attr("class", "sliderhelp").style("font-size", this.leftVis.iclData.unit2Px * (3/25)).text("to see the timeline")
                .style("fill", "#bbbbaa");
        this.leftVis.UpdateVisuals();
        clearInterval(theMotor);
        theMotor = setInterval(this.leftVis.PlayAnim, 1000 / this.leftVis.iclData.fps);
      } else {
        var saveBuffer = [];

        for (var i = 0; i < this.leftVis.iclData.tourists.length; i++) {
          this.leftVis.AlterLines(i);
          var who = this.leftVis.iclData.tourists[i];
          saveBuffer.push([who.x, who.y, who.a, who.on]);
          who.allowance = who.velocity * this.leftVis.iclData.unit2Px / this.leftVis.iclData.fps;
          while (who.allowance > 0) {
            if (who.knows) {
              who[instruBinder[i][0][0]](instruBinder[i][0][1]);
            } else {
              who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
            }
          }
          if (!who.knows) {
            var eVec = [this.leftVis.iclData.fieldExit[0] - saveBuffer[i][0], this.leftVis.iclData.fieldExit[1] - saveBuffer[i][1]];
            var exitDist = Math.sqrt(Math.pow(eVec[1], 2) + Math.pow(eVec[0], 2));
            if (exitDist <= who.velocity * this.leftVis.iclData.unit2Px / (2 * this.leftVis.iclData.fps)) {
              this.leftVis.iclData.exitAlert = who.knows = true;
              //exitFoundFrame = time;
              //console.log(Math.floor((100 * time) / fps) / 100);
              if (who.priority){
                  break;
              }
              this.leftVis.iclData.exitAllow = exitDist;
            }
          }
        }

        if (this.leftVis.iclData.exitAlert) {
          if (this.leftVis.iclData.exitFoundLine == null) {
            var holdX = (this.leftVis.iclData.unit2Px * (10 / 25) + ((this.leftVis.iclData.time + this.leftVis.iclData.exitAllow) / this.leftVis.iclData.timeMax) * (80 / 25) * this.leftVis.iclData.unit2Px);
            this.leftVis.iclData.exitFoundLine = 1;

                            /*
                            graphSVG.select(".overLay").append("line").attr("x1", holdX).attr("y1", 4 * unit2Px - unit2Px * (10 / 25))
                            .attr("x2", holdX).attr("y2", 2 * unit2Px).style("stroke", "#000000").style("stroke-width", (1 / 100) * unit2Px)
                            .style("stroke-opacity", 0.5);
                            */
          }
          for (var i = 0; i < this.leftVis.iclData.tourists.length; i++) {//reset bots
            var who = this.leftVis.iclData.tourists[i];
            who.x = saveBuffer[i][0];
            who.y = saveBuffer[i][1];
            who.a = saveBuffer[i][2];
            who.on = saveBuffer[i][3];
            if (this.leftVis.iclData.wireless) {
              who.knows = true;
              //console.log(Math.floor((100 * time) / fps) / 100);
            }
            who.allowance = this.leftVis.iclData.exitAllow;
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
            who.allowance = (who.velocity * this.leftVis.iclData.unit2Px / this.leftVis.iclData.fps) - this.leftVis.iclData.exitAllow;
            while (who.allowance > 0) {
              if (who.knows) {//Proceed with exit procedures.
                who[instruBinder[i][0][0]](instruBinder[i][0][1]);
                who.knew = true;
              } else {//Still does not know.
                who[instruBinder[i][who.on][0]](instruBinder[i][who.on][1]);
              }
            }
          }
          this.leftVis.iclData.exitAlert = false;
        }
        this.leftVis.iclData.AllAtExit();
        this.leftVis.UpdateVisuals();
        this.leftVis.iclData.time++;
        //timeSlider.attr("x", ((10/25) + (time / timeMax) * (63/20)) * unit2Px);
      }
      //timeText.text("Time: " + Math.floor((100 * this.leftVis.iclData.time) / this.leftVis.iclData.fps) / 100);
      //frameText.text("Frame: " + this.leftVis.iclData.time);
    }

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

      this.iclData.tourLine[i] = this.fieldSVG.select("#lines").append("path").attr("d", holdA)
                    .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
      this.iclData.graphPoints[i][this.iclData.time] = {x:this.iclData.time, y:(dista - this.iclData.unit2Px * (10 / 25))};
      this.iclData.graphLine[i].remove();
      this.iclData.graphLine[i] = this.graphSVG.select("#lines").append("path").attr("d", holdG)
                     .style("stroke", this.tourColors[i]).style("stroke-width", this.iclData.unit2Px * (1 / 25)).style("stroke-opacity", 0.5).style("fill", "none");
    }



    PlayAnim() {
      if (this.leftVis.iclData.timeDirect != 0) {
        this.leftVis.iclData.time += this.leftVis.iclData.timeDirect;
        if (this.leftVis.iclData.time < 0) {
          this.leftVis.iclData.time = 0;
          this.leftVis.iclData.timeDirect = 0;
        } else if (this.leftVis.iclData.time > this.leftVis.iclData.timeMax) {
          this.leftVis.iclData.time = this.leftVis.iclData.timeMax;
          this.leftVis.iclData.timeDirect = 0;
        }
        this.leftVis.UpdateVisuals();
        timeSlider.attr("x", ((10/25) + (this.leftVis.iclData.time / this.leftVis.iclData.timeMax) * (63/20)) * this.leftVis.iclData.unit2Px);
        timeText.text("Time: " + Math.floor((100 * this.leftVis.iclData.time) / this.leftVis.iclData.fps) / 100);
        frameText.text("Frame: " + Math.floor(this.leftVis.iclData.time));
      }
    }

    UpdateVisuals() {
        for (var i = 0; i < this.iclData.touristNum; i++) {
          var who = this.iclData.tourists[i];
          who.visual.attr("cx", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].x).attr("cy", this.iclData.tourPoints[i][Math.floor(this.iclData.time)].y);
          this.iclData.graphDots[i].attr("cx", ((10/25) + ((this.iclData.graphPoints[i][Math.floor(this.iclData.time)].x / this.iclData.timeMax) * (63/20))) * this.iclData.unit2Px).attr("cy", this.iclData.graphPoints[i][Math.floor(this.iclData.time)].y);
        }
    }

}

function Interval() {
    if (leftVis.finished){
        return;
    }
    editAnims('play');
    leftVis.iclData.AlterAnim();
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
    d3.selectAll("#overLay").html(null);
    leftSide = new iclData(0, instruBinder, algName, d3.select("#exitAngle").node().value, wireless);
    leftVis = new iclVisual(leftSide);
    theMotor = setInterval(leftVis.AlterAnim, 1000 / 60);
    d3.select(".exitText").remove();
    d3.select("#anim0").on("mousemove", null).on("click", null);
}

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

function showAlgorithmDesc(s, w){
    var color;
    switch(s){
        case 'A':
            color = "#efe";
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algName = "Algorithm A ";
            break;
        case 'Awl':
            color = "#efe";
            instruBinder = [
                            [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right"]]],
                            [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left"]]]
                        ];
            algName = "Algorithm A ";
            break;
        case 'B':
            color = '#eef';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm B ";
            break;
        case 'Bwl':
            color = '#eef';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0], center[1] + 5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm B ";
            break;
        case 'C':
            color = '#fee';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm C ";
            break;
        case 'Cwl':
            color = '#fee';
            instruBinder = [
                                 [["Intercept", [null, false, "#fe447d"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["right", 120]], ["GoToPoint", [center[0] + 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [330, 1]], ["FollowWall", ["right"]]],
                                 [["Intercept", [null, false, "#5cd05b"]], ["GoToWallAtAngle", [90]], ["FollowWall", ["left", 120]], ["GoToPoint", [center[0] - 4, center[1] + 5]], ["GoToPoint", [center[0], center[1]+5]], ["GoOutAtAngle", [210, 1]], ["FollowWall", ["left"]]]
                               ];
            algName = "Algorithm C ";
            break;
        case 'Q1':
            color = "#efe";
            instruBinder = [
                                 [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left", 114]], ["GoToWallAtAngle", [347]], ["FollowWall", ["right", 53]], ["Wait", [null]]],
                                 [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["right"]]]
                               ];
            algName = "Algorithm Priority 1 ";
            break;
        case 'Q2':
            color = "#eef";
            instruBinder = [
                                  [["GoToExit", [null, true, "#fe447d"]], ["GoToWallAtAngle", [144]], ["FollowWall", ["left", 36]], ["GoToPoint", [center[0] + (unit2Px * 0.65), center[1] + 30]], ["GoToWallAtAngle", [345]], ["FollowWall", ["left"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [144]], ["FollowWall", ["right"]]],
                                  [["Wait", [null]], ["GoToWallAtAngle", [180]], ["FollowWall", ["left"]]]
            ];
            algName = "Algorithm Priority 2 ";
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
            algName = "2 Priority + 1 Servant (1) ";
            break;

        case 'Q1S1Q1':
            color = "#efe";
            instruBinder = [
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [180]] ,["FollowWall", ["right"]]],
                [["GoToExit", [null, true]], ["GoToWallAtAngle", [0]], ["FollowWall", ["right"]]],
                [["Wait", [null]], ["GoToWallAtAngle", 180], ["FollowWall", ["left"]]]
            ];
            algName = "2 Priority + 1 Servant (2) ";
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
            algName = "1 Priority + 4 Servants ";
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
            algName = "1 Priority + 8 Servants ";
            break;
    }
    algShortName = s;
    wireless = w;
    console.log(w);

}

var leftSide;
var leftVis;
var theMotor;
var algSelector;
var instruBinder;
var algName;
var wireless;
var unit2Px = 25
var center = [2 * unit2Px, 2 * unit2Px];

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
    console.log(wire);
    showAlgorithmDesc(window.location.href.slice(algSelector + 1, l), wire);
}
else {
    showAlgorithmDesc("A", false);
}


console.log("WIRELESS: " + wireless);
leftSide = new iclData(0, instruBinder, algName, d3.select("#exitAngle").node().value, wireless);
leftVis = new iclVisual(leftSide);
