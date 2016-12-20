var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    HARVEST: 1,
    DEPOSIT: 2
};

function creepMiner(creep, resourceManager, depositManager) {
    this.cache = new Cache();
    this.creep = creep;
    this.resourceManager = resourceManager;
    this.depositManager = depositManager;
    this.resource;
};

creepMiner.prototype.init = function() {
    this.remember('role', 'CreepMiner');

    if(!this.remember('source')) {
        var src = this.resourceManager.getAvailableResource();
        if (src)
            this.remember('source', src.id);
    }
    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.HARVEST);
    if(this.moveToNewRoom() == true) {
        return;
    }

    this.resource = this.resourceManager.getResourceById(this.remember('source'));

    this.act();
};

creepMiner.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.HARVEST && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep finished depositing
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.HARVEST);

    // creep should harvest
    if (this.remember('last-action') == ACTIONS.HARVEST) {
        if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.resource);
    }
    // creep should deposit
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
};

// private
function minerStructureFilter(structure) {
    return Constants.minerSupplyStructures.indexOf(structure.structureType) != -1
            && (structure.energy < structure.energyCapacity || (structure.store && structure.store.energy < structure.storeCapacity));
}

module.exports = creepMiner;