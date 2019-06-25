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
    for (var i = 0; i < superlist.length; i++){
        var wallLoc = [superlist[controllerID].iclData.center[0] + superlist[controllerID].iclData.unit2Px * (unitPos[0] * c2) / (unitPos[1] * b2 + unitPos[0] * a2),
                       superlist[controllerID].iclData.center[1] + superlist[controllerID].iclData.unit2Px * (unitPos[1] * c2) / (unitPos[1] * b2 + unitPos[0] * a2)];		//Cramer's Law
        d3.select("#exit" + superlist[controllerID].iclData.id).attr("cx", wallLoc[0]).attr("cy", wallLoc[1]);

    }
}
https://www.youtube.com/watch?list=PLOTst296c70GAI54YXkkL6BQ4pAiV6DMO&v=wpXM8bOV_Bs
/**
*Starts up the interval after clearing the field and graph of debris.
*Any new elements that need to be cleared after a run and before a new one... do it here.
***Relies on window.superlist**.
*/
function exitChosen() {
    //clear motor
    d3.selectAll("#bots").html(null);
    d3.selectAll("#lines").html(null);
    d3.selectAll("#overLay").html(null);
    d3.selectAll(".timeSlide0").remove();
    d3.selectAll(".timeSlide1").remove();

    d3.selectAll(".timeText").remove();
    d3.selectAll(".frameText").remove();
    leftSide = new iclData(0, instruBinder, algName, d3.select("#exitAngle").node().value, wireless);
    superlist[controllerID] = new iclVisual(leftSide);
    clearInterval(superlist[controllerID].iclData.motor);
    superlist[controllerID].iclData.motor = setInterval(function() {
        superlist[controllerID].AlterAnim();
    }
    , 1000 / 60);
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
var algSelector;
var instruBinder;
var algName;
var algShortName;
var wireless;
var unit2Px = 25
var center = [2 * unit2Px, 2 * unit2Px];
var superlist = [];
var controllerID = 0;

/////// INITIALIZE ALGORITHM ///////
if (window.location.href.includes("#")) {
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
