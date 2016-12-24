var Constants = require('Constants');
var Cache = require('Cache');
var CONSTANTS = {
    PARALLEL_WALL_REPAIR : 3,
};

function creepClaimer(creep) {
    this.creep = creep;
}

creepClaimer.prototype.init = function() {
    if(this.moveToNewRoom() == true)
        return;

    //if(this.randomMovement() == false) {
    this.act();
    //}
};

creepClaimer.prototype.act = function() {
    if (!this.remeber('targetRoom')) {
        var claimPath = this.remember('claimPath');
        var index = claimPath.indexOf(this.creep.room.name);
        if (index == claimPath.length - 1) {
            if (this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(this.creep.room.controller)
        }
        else
            this.remember('targetRoom', claimPath[index + 1]);
    }
};

module.exports = creepClaimer;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepClaimer, 'CreepClaimer');