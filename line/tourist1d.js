
/*
Our formula for calculating the amount of time or distance to travel is

delta = (velocity * (distance / 60) * scale / distance)

the extra division by distance helps ensure that our delta is a consistent size.
perhaps we do not have to calculate the delta more than once, but we can simply start moving the
robot for the fixed amount of time.

~~TODO: make delta into an attribute and use it to simplify functions.~~
After considering it more, calculating the delta at the time of the function running is
probably better, as it will allow for the scale and velocity to change as they need.

TODO: make the functions to go Left, Right, Wait into simpler ones.
TODO: calculate if the current distance given will make the bot go off the line, and
adjust the delta accordingly to make it fit AT THE BEGINNING.
*/



class Tourist1D {
    constructor(vis) {
        //this.iclData = iclData;
        this.visual = vis;
        this.x = 450;
        this.target = null;
        this.velocity = 1;
        this.allowance = 0;
        this.tourPoints = [];
        // scale is essentially unit2Px.
        this.scale = 100;
        this.projector = null;
        console.log(this);
    }

    Wait(time) {
        var current = 0;
        var delta = (time / 60) * (this.scale) / time;
        while (current < time * this.scale){
            this.tourPoints.push(this.x);
            current += delta;
        }
    }

    GoRight(distance){
        var current = 0;
        var delta = this.velocity * (distance / 60) * (this.scale) / distance;
        while (current < distance * this.scale){
            this.x += delta;
            current += delta;
            this.tourPoints.push(this.x);
        }
    }

    GoLeft(distance){
        distance = -distance;
        var current = 0;
        var delta = this.velocity * (distance / 60) * (this.scale) / -distance;
        while (current > distance * this.scale){
            this.x += delta;
            current += delta;
            this.tourPoints.push(this.x);
        }
    }

    UpdateAnim(i){
        if (i < this.tourPoints.length){
            this.visual.attr("cx", this.tourPoints[i]);
        }
    }


}
console.log(d3.select("#anim"));
var v = d3.select("#anim").append("circle").attr("cx", 450).attr("cy", 225)
                 .attr("r", 10).style("fill", "lightblue").style("stroke", "black").style("stroke-width", 3);
d3.select(v.parentNode).append("line").attr("x1", v.attr("cx")).attr("y1", 150).attr("x2", v.attr("cx")).attr("y2", 200).style("stroke", "black");
var w = d3.select("#anim").append("circle").attr("cx", 450).attr("cy", 175)
                 .attr("r", 10).style("fill", "red").style("stroke", "black").style("stroke-width", 3);
var tourists = [];
tourists[0] = new Tourist1D(v);
tourists[1] = new Tourist1D(w);

tourists[0].Wait(2);
tourists[1].GoLeft(2);

tourists[0].GoLeft(1);
tourists[1].Wait(1);

tourists[0].GoRight(2);
tourists[1].GoRight(1);

tourists[1].GoLeft(3);

var count = 0
var m = setInterval(function(){
    for (var i = 0; i < tourists.length; i++){
        tourists[i].UpdateAnim(count);
    }
    count ++;
    console.log(count/60);
}, 1000/60);
