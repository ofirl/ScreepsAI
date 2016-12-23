var Constants = require('Constants');
var Cache = require('Cache');
var CONSTANTS = {
    PARALLEL_WALL_REPAIR : 3,
};
var ACTIONS = {
    DEPOSIT : 1,
    WITHDRAW : 2,
};

function creepLorry(creep, depositManager, resourceManager) {
    this.creep = creep;
    this.depositManager = depositManager;
    this.resourceManager = resourceManager;
};

creepLorry.prototype.init = function() {
    if (!this.remember('source-container'))
        this.remember('source-container', this.depositManager.getLonelyContainer(this.resourceManager.population.creeps, 'CreepLorry').id);

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

creepLorry.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.WITHDRAW && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep ran out of energy
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.WITHDRAW);

    // creep should withdraw energy
    if (this.remember('last-action') == ACTIONS.WITHDRAW) {
        var droppedEnergy = this.creep.pos.findClosestByPath(this.depositManager.droppedEnergy);
        droppedEnergy = null;
        if (droppedEnergy != null) {
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(droppedEnergy);
        }
        else {
            var source = Game.getObjectById(this.remember('source-container'));
            //var source = this.creep.pos.findClosestByPath(this.depositManager.getResourceContainers());
            if (source && source.transfer(this.creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(source);
        }
    }
    // creep should deposit
    else {
        var target = this.depositManager.storage;
        // storage is built
        if (target) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(target);
        }
        // storage did not built yet
        else {
            var storage = this.creep.pos.findClosestByPath(this.depositManager.extensions.concat(this.depositManager.spawns), {filter: minerStructureFilter});
            if (storage != undefined) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveTo(storage);
            }
            else {
                storage = this.creep.pos.findClosestByPath(this.depositManager.getAvailableContainersToDeposit());
                if (storage != undefined) {
                    if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        this.creep.moveTo(storage);
                }
            }
        }
    }
};

module.exports = creepLorry;