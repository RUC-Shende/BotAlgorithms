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

    constructor(iclData, x, y, num, icl, p) {
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
       var dist = Math.abs(value.x- this.x);
       if (dist < this.allowance) {
         this.x = value.x;
         this.allowance -= dist;
       } else {
         this.x += value.direction * this.allowance;
         this.allowance = 0;
       }
     }

    /**
     * Instruct the robot to wait for a certain time <value>, or indefinitely.
     *
     * @param {Array} value [time] to wait for. If not specified or value[0] is null, wait indefinitely.
     */
    wait(value) {
        if (value.time) {
            if (this.target == null) {
                this.target = value.time * this.iclData.unit2Px;
            }
            if (this.target < this.allowance) {
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

    Go(value) {
        value.distance = value.distance * value.direction
        if (!this.target) {
            this.target = {
                x: this.x + (value.distance * this.iclData.unit2Px)
            };
        }
        this.DirectTo({
            x: this.target.x,
            direction:value.direction
        });
        if (!Math.abs(this.x - this.target.x)){
            this.on++;
            this.target=null;
        }
    }

    Amplify(value) {
        if (!this.target) {
            this.target = {
                level:1,
                x:this.x + (value.direction * this.iclData.unit2Px),
                direction:value.direction
            }
        }
        this.DirectTo(this.target);
        if (!Math.abs(this.x - this.target.x)) {
            this.target.level *= value.scale;
            this.target.direction *= -1;
            this.target.x = this.x + (this.target.direction * this.iclData.unit2Px
                      * this.target.level) + ((this.target.direction * this.iclData.unit2Px
                                * this.target.level / value.scale));
            console.log(this.target);
        }
    }



    GoToExit(value) {
        this.target = {
            x: this.iclData.exitLoc.x
        };
        //console.log(this.target);
        this.allowance = this.iclData.step;
        //console.log("UNITS: " + Math.floor(2 * Math.abs(this.target.x - this.x) / this.iclData.unit2Px));
        this.Go({
            distance: Math.floor(2 * Math.abs(this.target.x - this.x) / this.iclData.unit2Px),
            direction: (this.iclData.exit > 0) ? 1 : -1
        });
        //}
    }

}
