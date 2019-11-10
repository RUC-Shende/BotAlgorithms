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
      this.groundCovered = [x,x]
      this.byz = this.icl[this.number][2]
      this.attendance = false
      this.voted = false
      this.claimInput = false

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
  }


class ReliableTourist extends Tourist{
    constructor(iclData, x, y, num, icl) {
      super(iclData, x,y,num, icl);
    }

    Amplify( value ) {
      if (this.OpenClaim() && this.activated){
        this.on = 2
        this.iclData.availableClaim = true
        this.iclData.claimLocation = {x: this.x, y: this.y}
        this.iclData.activated = false
        this.on = 3
      }else if(this.iclData.availableClaim){
        this.on = 3
      }
      else{
        this.on = 1
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
      this.Covered()
    }

    Covered(){
      if (this.x < this.groundCovered[0]){
        this.groundCovered[0] = this.x
      }else if (this.x > this.groundCovered[1]){
        this.groundCovered[1] = this.x
      }
    }

    OpenClaim(){
      return false
    }

    Vote(){
      if (Math.round(this.x * 100) != Math.round(this.iclData.exitLoc.x * 100) && !(this.voted)){
        this.iclData.vote[this.number] = 0
        this.iclData.voted0 += 1
        this.iclData.temp0.push(this.number)
        this.voted = true
      }else if (!(this.voted)){
        this.iclData.vote[this.number] = 1
        this.iclData.voted1 += 1
        this.iclData.temp1.push(this.number)
        this.voted = true
      }
    }

    ResolveClaim( value ){
      if ((Math.round(this.x * 100) == Math.round(this.iclData.claimLocation.x * 100))){ // Would like to add && !(this.claimInput) and the rest of the commented out code but, page doesn't load when I do.
        this.Wait({time:null})
        this.Vote()
        this.Decide()
        if(!(this.claimInput)){
          this.iclData.attendance += 1
        }
        this.claimInput = true
      }
      // Next step when claimInput has been recorded.
      // else if (this.claimInput && this.iclData.attendance != this.iclData.tourists.length){
      //   this.Wait({time:null})
      // }else if (this.iclData.testing == this.iclData.tourists.length){
      //   if (this.number in this.iclData.reliable){
      //     if (this.iclData.reliable.indexOf(this.number)%2){
      //       this.DirectTo({x: 50, y:35})
      //     }else{
      //       this.DirectTo({x:50, y:35})
      //     }
      //   }
      // }

      else{
        this.DirectTo( this.iclData.claimLocation )
      }
  

    }

    Decide(){
      if (Math.ceil(this.iclData.vote.length/2) == this.iclData.voted0){
        this.iclData.publicByzantineBots = this.iclData.temp1
        this.iclData.reliable = this.iclData.temp0
      } else {
        this.iclData.publicByzantineBots = this.iclData.temp0
        this.iclData.reliable = this.iclData.temp1
      }
    }
  }


class ByzantineTourist extends ReliableTourist{
  constructor(iclData, x, y, num, icl) {
    super(iclData, x,y,num, icl);
  }

  Vote(){
    if (Math.round(this.x * 100) != Math.round(this.iclData.exitLoc.x * 100) && !(this.voted)){
      this.iclData.vote[this.number] = 1
      this.iclData.voted1 += 1
      this.iclData.temp1.push(this.number)
      this.voted = true
    }else if (!(this.voted)){
      this.iclData.vote[this.number] = 0
      this.iclData.voted0 += 0
      this.iclData.temp0.push(this.number)
      this.voted = true
    }
  }

  OpenClaim(){
    if (this.byz && (this.x >= this.groundCovered[1] || this.x <= this.groundCovered[0])){
      if (Math.floor((Math.random() * 10000) + 1) > 9990){
        this.activated = true
        return true
      }
    }
    return false
  }
}