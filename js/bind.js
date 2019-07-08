class Timer {
    constructor(){
        this.time = 0;
    }

    updateTime(){
        this.time ++;
        console.log(this.time);
    }

    getTime(){
        console.log("THE TIME IS: " + this.time);
    }
}

var t = new Timer();

var unbound = t.updateTime;
var bound   = unbound.bind(t);

interval = setInterval(bound, 1000);
// Will increment the time attribute of the variable t every 2 seconds.

var boundGetTime = t.getTime.bind(t);

anotherInterval = setInterval(boundGetTime, 5000);
