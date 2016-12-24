var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    BUILD: 1,
    WITHDRAW: 2
};

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepBuilder, 'CreepBuilder');

function creepBuilder(creep, constructionsManager, depositManager, resourceManager) {
    this.creep = creep;
    this.constructionsManager = constructionsManager;
    this.depositManager = depositManager;
    this.resourceManager = resourceManager;
};

creepBuilder.prototype.init = function() {
    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.WITHDRAW);
    if(this.moveToNewRoom() == true) {
        return;
    }

    this.forceControllerUpgrade = this.remember('force-controller-upgrade');

    //if(this.randomMovement() == false) {
    this.act();
    //}
};

creepBuilder.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.WITHDRAW && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.BUILD);

    // creep ran out of energy
    if (this.remember('last-action') == ACTIONS.BUILD && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.WITHDRAW);

    if (!this.remember('targetRoom')) {
        var claimPath = this.remember('claimPath');
        if (claimPath != undefined) {
            var index = claimPath.indexOf(this.creep.room.name);
            if (index == claimPath.length - 1)
                this.forget('claimPath');
            else {
                this.remember('targetRoom', claimPath[index + 1]);
                return;
            }
        }
    }

    // creep should withdraw energy
    if (this.remember('last-action') == ACTIONS.WITHDRAW) {
        var source = this.depositManager.storage;
        if (!source)
            source = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToWithdraw());
        
        if (source && source.transfer(this.creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(source);
        else if (!source || source  == null || source == undefined){
            source = this.creep.pos.findClosestByPath(this.resourceManager.getSources());
            if (this.creep.harvest(source) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(source);
        }
    }
    // creep should build
    else {
        if (this.forceControllerUpgrade || !this.constructionsManager.constructStructure(this)) {
            if (this.creep.upgradeController(this.constructionsManager.room.controller) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(this.constructionsManager.room.controller);
        }
    }
};

module.exports = creepBuilder;