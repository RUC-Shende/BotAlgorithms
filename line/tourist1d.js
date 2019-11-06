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

    constructor(iclData, x, y, num, icl) {
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
        this.byz = (this.icl[0][2] == 2) ? true : false;
        this.faulty = false;
        this.byzantine = false;
    }

    work() {

        this.allowance = this.iclData.step;
        while (this.allowance > 0) {
            this[this.icl[this.on][0]](this.icl[this.on][1]);
        }

    }
    /**
     *Send the robot to its next location (next frame) based on its current instruction or allowance.
     *
     * @param {Object} value {x,y} coordinates of the robot's next calculated location.
     *
     */
     DirectTo( value ) {
       var dist = Math.abs( value.x - this.x );
       var dir = ( value.x - this.x > 0 ) ? 1 : -1;
       if( dist < this.allowance ) {
         this.x = value.x;
         this.allowance -= dist;
       } else {
         this.x += dir * this.allowance;
         this.allowance = 0;
       }
     }

   /**
    * Instruct the robot to wait for a certain time <value>, or indefinitely.
    *
    * @param {Array} value [time] to wait for. If not specified or value[0] is null, wait indefinitely.
    */
    Wait( value ) {
      if( value.time ) {
        if( this.target == null ) {
          this.target = value.time * this.iclData.unit2Px;
        }
        if( this.target < this.allowance ) {
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

    Go( value ) {
      if( value.distance ) {
        if( !this.target ) {
          value.distance = value.distance * value.direction;
          this.target = {
            x:( this.x + value.distance * this.iclData.unit2Px )
          };
        }
        this.DirectTo( this.target );
        if( !( this.x - this.target.x ) ) {
            this.on++;
            this.target = null;
        }
      } else {
        this.DirectTo( { x:( this.x + value.direction ) } );
      }
    }

    Amplify( value ) {
      if( !this.target ) {
        this.target = {
          amt:value.direction,
          x:( this.x + value.direction * this.iclData.unit2Px )
        }
      }
      this.DirectTo( this.target );
      if( !( this.x - this.target.x ) ) {
        var prev = -this.target.amt;
        this.target.amt *= -( value.scale );
        this.target.x = this.x + ( prev + this.target.amt ) * this.iclData.unit2Px;
      }
    }

    Increment( value ) {
      if( !this.target ) {
        this.target = {
          dir:value.direction,
          amt:value.scale,
          x:( this.x + value.scale * value.direction * this.iclData.unit2Px )
        }
      }
      this.DirectTo( this.target );
      if( !( this.x - this.target.x ) ) {
        this.target.dir *= -1;
        this.target.amt += value.scale;
        this.target.x = this.x + ( 2 * this.target.amt - value.scale ) * this.target.dir * this.iclData.unit2Px;
        console.log( this.d );
      }
    }

    GoToExit( value ) {
      if( this.iclData.exitLoc.x - this.x ) {
        this.DirectTo( this.iclData.exitLoc );
      } else {
        this.allowance = 0;
      }
    }


    Vote () {
      /* Reliable tourists always vote for the proper location,
      *  and identify faulty or byzantine if they are
      *  given a wrong claim.
      */
      if (this.byz){
        if (!(this.atExit)){
          this.iclData.claimList[this.number] = 1
          this.iclData.temp1.push([this.number])
        } else if ((this.atExit)){
          this.iclData.claimList[this.number] = 0
          this.iclData.temp2.push([this.number])
        }
      }else{
        if (!(this.atExit)){
          this.iclData.claimList[this.number] = 0
          this.iclData.temp2.push([this.number])
        }else if ((this.atExit)){
          this.iclData.claimList[this.number] = 1
          this.iclData.temp1.push([this.number])
        }
      }
    }

}

class ByzantineTourist extends Tourist{
    constructor(iclData, x, y, num, icl, faultID) {
        this.byz = (faultID == 2) ? true : false;
        super(iclData, x,y,num, icl);

    }
/*
    work() {
        return;
    }
*/

    Amplify (value) {
        /* Need to recreate amplify so that arguments
        * about where to stop or annouce false exits can be passed in.
        * added a value.stopat value, for the robot to stop and declare
        * an exit at.
        */

        return;
    }

    Vote (claimLocation) {
        return;
    }

    GoToExit( value ) {
        if( this.iclData.exitLoc.x - this.x ) {
            this.DirectTo( this.iclData.exitLoc );
        } else {
            this.allowance = 0;
        }
    }
}
