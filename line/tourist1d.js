'use strict';
/**
* @param {iclData} iclData Represents the data of the overall simulation, robots' tourlines and graphlines.
* @param {integer} x Tourist start x position, before visual scaling.
* @param {integer} y Tourist start y position, before visual scaling.
* @param {integer} num Tourist id number.
* @param {Array} icl Instruction checklist. Index 0 is info such as priority status and color.
* @param {boolean} p True if bot is Priority Agent, false otherwise.
*/
class Tourist {

  constructor (iclData, x, y, num, icl, p) {
    /** This holds all of what used to be global variables!  */
    this.iclData = iclData;
    /** The tourist's ID as an integer. */
    this.number = num;
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
    /** Tourist's current x position. */
    this.x = x;
    console.log(this.x);
    /** Tourist's current y position. */
    this.y = y;
    /** Whether or not the robot is at the exit. */
    this.atExit = false;
    /** Instruction checklist. Index 0 is info such as priority and color. */
    this.icl = icl;
  }

  /**
  *Send the robot to its next location (next frame) based on its current instruction or allowance.
  *
  * @param {Object} value {x,y} coordinates of the robot's next calculated location.
  *
  */
  DirectTo(value) {
      //console.log(this.allowance)
    var dLoc = {dist:Math.abs(value.x - this.x)};
    if (Math.abs(dLoc.dist) < Math.abs(this.allowance)) {
      this.x = value.x;
      this.allowance = 0;
      this.on++;
      this.target = null;
    } else {
        //console.log(this.allowance)
      this.x += value.direction * this.allowance;
      this.allowance = 0;
    }
  }

  /**
  * Instruct the robot to wait for a certain time <value>, or indefinitely.
  *
  * @param {Array} value [time] to wait for. If not specified or value[0] is null, wait indefinitely.
  */
  wait( value ) {
    if( value.time ) {
      if( this.target == null ) {
        this.target = value.time * this.iclData.unit2Px;
      }
      if ( this.target < this.allowance ) {
        this.allowance -= this.target;
        this.on++;
        this.target = null;
      } else {
        this.target -= this.allowance;
        this.allowance = 0;
      }
    } else {
      this.allowance = 0;
    }
  }

  Go(value){
      value.distance = value.distance * value.direction
      if (!this.target) {
          this.target = {x:this.x + (value.distance * this.iclData.unit2Px)};
      }
      this.allowance = this.iclData.step;
      this.DirectTo({x:this.target.x, direction:value.direction});
  }

  GoToExit(value) {
      this.target = {x:this.iclData.exitLoc.x};
      console.log(this.target);

      /*if (this.x = this.iclData.exitLoc.x) {
          this.target = null;
          this.allowance = 0;
          console.log(this.number + " waiting");
          this.wait([null]);
      }*/
      //else {
          this.allowance = this.iclData.step;
          console.log("UNITS: " + Math.floor(2 * Math.abs(this.target.x - this.x) / this.iclData.unit2Px));
          this.Go({distance:Math.floor(2 * Math.abs(this.target.x - this.x) / this.iclData.unit2Px), direction:(this.iclData.exit > 0) ? 1 : -1});
      //}
}

}

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

const EXIT = 2; // local exit
const SCALE = 100; // unit =>  px;
const GLOBAL_CENTER = [450, 200]; // center in pixels
const GLOBAL_EXIT = GLOBAL_CENTER[0] + (EXIT * SCALE); // exit in pixels


class Tourist1D {
    constructor(vis) {
        //this.iclData = iclData;
        this.visual = vis;
        this.x = 450;
        this.target = null;
        this.velocity = 1;
        this.allowance = 0;
        this.tourPoints = [];
        // tourist knows of the exit location.
        this.knows = false;
        // scale is essentially unit2Px.
        this.scale = SCALE;
        this.projector = null;
        this.done = false;
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
        if (!this.knows){
            var current = 0;
            var delta = this.velocity * (distance / 60) * (this.scale) / distance;
            update:
            while (current < distance * this.scale){
                this.x += delta;
                current += delta;
                this.tourPoints.push(this.x);
                // check for exit condition.
                if (this.x <= GLOBAL_EXIT + 0.1 && this.x >= GLOBAL_EXIT - 0.1){
                    this.knows = true;
                    console.log("Found exit.");
                    break update;
                }
            }
            // wait for the rest of the command.
            // temporary, until we make an interception function.
            this.Wait(distance - current);
        }
        else{
            // also temporary until we make an interception function.
            this.Wait(distance);
        }
    }

    GoLeft(distance){
        if (!this.knows){
            distance = -distance;
            var current = 0;
            var delta = this.velocity * (distance / 60) * (this.scale) / -distance;
            update:
            while (current > distance * this.scale){
                this.x += delta;
                current += delta;
                this.tourPoints.push(this.x);
                if (this.x >= GLOBAL_EXIT - 0.1 && this.x <= GLOBAL_EXIT + 0.1){
                    this.knows = true;
                    console.log("Found exit.");
                    break update;
                }
            }
        }
        else {
            this.Wait(distance);
        }
    }

    /**
    * Tells a robot to go in a direction.
    * -1 or 'left' for "Go Left"
    * 1 or 'right' for "Go Right"
    * Default: "Go Right".

    Go(direction, distance){
        var direct = (((direction == "left") || (direction == -1)) ? -1 : 1);
        distance *= direct;
        if (!this.knows){
            var current = 0;
            var delta = this.velocity * (distance / 60) * this.scale / (direct * distance);
            if (direct > 0){
                update:
                while(current < distance * this.scale){
                    this.x += delta;
                    current += delta;
                    this.tourPoints.push(this.x);
                    if (this.x <= GLOBAL_EXIT + 0.1 && this.x >= GLOBAL_EXIT - 0.1){
                        this.knows = true;
                        console.log("Found exit at " + this.x);
                        break update;
                    }
                }
            }
            else {
                update:
                while(current > distance * this.scale){
                    this.x += delta;
                    current += delta;
                    this.tourPoints.push(this.x);
                    if (this.x <= GLOBAL_EXIT + 0.1 && this.x >= GLOBAL_EXIT - 0.1){
                        this.knows = true;
                        console.log("Found exit.");
                        break update;
                    }
                }
            }
            // finish out your command while sitting on the exit.
            // temporary until we have "Intercept" in place.
            this.Wait((Math.abs(distance)) - current);
        }
        // finish out your command while sitting on the exit.
        // temporary until we have "Intercept" in place.
        else {
            this.Wait((Math.abs(distance)));
        }
    }
*/


    UpdateAnim(i){
        if (i < this.tourPoints.length) this.visual.attr("cx", this.tourPoints[i]);
        //d3.selectAll(".location").text("Current Location: " + this.tourPoints[i] + "px");
    }


}
/*
console.log(d3.select("#anim"));
var v = d3.select("#anim").append("circle").attr("cx", 450).attr("cy", 225)
                 .attr("r", 10).style("fill", "lightblue").style("stroke", "black").style("stroke-width", 3);
d3.select(v.parentNode).append("line").attr("x1", v.attr("cx")).attr("y1", 150).attr("x2", v.attr("cx")).attr("y2", 200).style("stroke", "black");
var w = d3.select("#anim").append("circle").attr("cx", 450).attr("cy", 175)
                 .attr("r", 10).style("fill", "red").style("stroke", "black").style("stroke-width", 3);
var tourists = [];

tourists[0] = new Tourist1D(v);
tourists[1] = new Tourist1D(w);

// instruBinder
tourists[0].Wait(2);
tourists[1].GoLeft(2);

tourists[0].GoLeft(1);
tourists[1].Wait(1);

tourists[0].GoRight(1);
tourists[1].GoRight(7);

tourists[1].GoLeft(1);

tourists[0].Wait(1);
tourists[1].Wait(1);



var frame = 0;

// now that we created our data we play our saved trajectories back.
var m = setInterval(function(){
    for (var i = 0; i < tourists.length; i++){
        tourists[i].UpdateAnim(frame);
    }
    frame ++;
    //console.log(frame/60);
}, 1000/60);
*/
