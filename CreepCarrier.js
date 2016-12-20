var Constants = require('Constants');
var Cache = require('Cache');
var CONSTANTS = {
    PARALLEL_WALL_REPAIR : 3,
};
var ACTIONS = {
    DEPOSIT : 1,
    WITHDRAW : 2,
};

function creepCarrier(creep, constructionsManager, depositManager) {
    this.creep = creep;
    this.constructionsManager = constructionsManager;
    this.depositManager = depositManager;
};

creepCarrier.prototype.init = function() {
    this.remember('role', 'CreepCarrier');
    if (!this.remember('repair-wall'))
        this.remember('repair-wall', 0);

    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.WITHDRAW);
    if(this.moveToNewRoom() == true) {
        return;
    }

    //if(this.randomMovement() == false) {
    this.act();
    //}
};

creepCarrier.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.WITHDRAW && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep ran out of energy
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry.energy == 0) {
        this.remember('last-action', ACTIONS.WITHDRAW);
        this.remember('repair-wall', 0);
    }

    // creep should withdraw energy
    if (this.remember('last-action') == ACTIONS.WITHDRAW) {
        var droppedEnergy = this.creep.pos.findClosestByPath(this.depositManager.droppedEnergy);
        if (droppedEnergy != null) {
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(droppedEnergy);
        }
        else {
            var source = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToWithdraw());
            if (source && source.transfer(this.creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(source);
        }
    }
    // creep should deposit
    else {
        var target = this.creep.pos.findClosestByPath(this.constructionsManager.getNotFullTowers());
        if (target != null) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(target);
        }
        else {
            target = this.constructionsManager.getDamagedWalls();
            if (target != null) {
                var wallId = this.remember('repair-wall', target.id);
                if (wallId == 0) {
                    var random = Math.floor(Math.random() * Math.min(CONSTANTS.PARALLEL_WALL_REPAIR, target.length));
                    target = target[random];
                    this.remember('repair-wall', target.id);
                }
                else
                    target = this.constructionsManager.getConstructionSiteById(wallId);
                if (this.creep.repair(target) == ERR_NOT_IN_RANGE)
                    this.creep.moveTo(target);
            }
            else {
                if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                    this.creep.moveTo(this.creep.room.controller);
            }
        }
    }
};

module.exports = creepCarrier;