var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    CLAIM : 1,
    BUILD : 2,
    WITHDRAW : 3,
};

function creepClaimer(creep) {
    this.creep = creep;
}

// TODO : check claimer
creepClaimer.prototype.init = function(constructionsManager, resourceManager) {
    this.constructionsManager = constructionsManager;
    this.resourceManager = resourceManager;

    if (!this.remeber('room-path')) {
        var targetRoom = Memory.claimRoom;
        if (targetRoom) {
            var route = Game.map.findRoute(this.creep.room.name, targetRoom);
            this.remember('room-path', route);
            Memory.claimRoom = false;
        }
    }

    if(this.moveToNewRoom() == true)
        return;

    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.CLAIM);

    //if(this.randomMovement() == false) {
    this.act();
    //}
};

creepClaimer.prototype.act = function() {
    if (this.remember('last-action') == ACTIONS.CLAIM) {
        if (this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.creep.room.controller);

        return;
    }

    // creep carry is full
    if (this.remember('last-action') == ACTIONS.WITHDRAW && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.BUILD);

    // creep ran out of energy
    if (this.remember('last-action') == ACTIONS.BUILD && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.WITHDRAW);

    if (this.remember('last-action') == ACTIONS.BUILD) {
        this.constructionsManager.constructStructure(this);
    }
    else {
        var resource = this.resourceManager.getAvailableResource();
        if (this.creep.harvest(resource) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(resource);
    }

    /*if (!this.remeber('targetRoom')) {
        var claimPath = this.remember('claimPath');
        var index = claimPath.indexOf(this.creep.room.name);
        if (index == claimPath.length - 1) {
            if (this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(this.creep.room.controller)
        }
        else
            this.remember('targetRoom', claimPath[index + 1]);
    }*/
};

module.exports = creepClaimer;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepClaimer, 'CreepClaimer');