var Constants = require('Constants');
var Cache = require('Cache');
var CONSTANTS = {
    PARALLEL_WALL_REPAIR : 3,
};
var ACTIONS = {
    DEPOSIT : 1,
    WITHDRAW : 2,
};

function creepCarrier(creep, constructionsManager, depositManager, defenseManager) {
    this.creep = creep;
    this.constructionsManager = constructionsManager;
    this.depositManager = depositManager;
    this.defenseManager = defenseManager;
};

creepCarrier.prototype.init = function() {
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
        droppedEnergy = null;
        if (droppedEnergy != null) {
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(droppedEnergy);
        }
        else {
            var source = this.depositManager.storage;
            if (!source)
                source = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToWithdraw());

            if (source && source.transfer(this.creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(source);
        }
    }
    // creep should deposit
    else {
        // find not full extensions/spawn
        var target = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToDeposit());
        if (target != null) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(target);

            return;
        }

        // find not full towers
        target = this.creep.pos.findClosestByPath(this.constructionsManager.getNotFullTowers());
        if (target != null) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(target);

                return;
        }

        // find damaged walls
        target = this.constructionsManager.getDamagedWalls();
        if (target != null) {
            var newWallNeeded = false;
            var wallId = this.remember('repair-wall');

            if (wallId != 0) {
                target = this.constructionsManager.getConstructionSiteById(wallId);
                if (target == null || (target && target.hits == target.hitsMax))
                    newWallNeeded = true;
            }
            else
                newWallNeeded = true;

            if (newWallNeeded) {
                var random = Math.floor(Math.random() * Math.min(CONSTANTS.PARALLEL_WALL_REPAIR, target.length));
                target = target[random];
                this.remember('repair-wall', target.id);
            }

            if (this.creep.repair(target) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(target);

            return;
        }

        // upgrade controller - if happens i'm in a very good shape
        if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.creep.room.controller);
    }
};

module.exports = creepCarrier;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepCarrier, 'CreepCarrier');