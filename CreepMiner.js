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

    if (!this.remember('source-container')) {
        var container = this.depositManager.getLonelyContainer(this.resourceManager.population.creeps, 'CreepMiner');
        if (container != undefined)
            this.remember('source-container', container.id);
    }

    this.container = Game.getObjectById(this.remember('source-container'));

    this.act();
};

creepMiner.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.HARVEST && this.creep.carry.energy == this.creep.carryCapacity &&
        (!this.resourceManager.population.spawnedAllEssentialRoles() || this.depositManager.room.storage == undefined ||
        (this.container != undefined && this.container.store.energy == this.container.storeCapacity)))
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep finished depositing
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.HARVEST);

    // creep should harvest
    if (this.remember('last-action') == ACTIONS.HARVEST) {
        if (this.container != undefined) {
            if (this.creep.pos.isEqualTo(this.container.pos))
                this.creep.harvest(this.resource);
            else
                this.creep.moveToIfAble(this.container);
        }
        else {
            if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(this.resource);
        }
    }
    // creep should deposit
    else {
        if (this.resourceManager.population.typeDistribution.CreepCarrier.total > 0) {
            var storage = this.creep.pos.findClosestByPath(this.depositManager.getAvailableContainersToDeposit());
            if (storage != undefined) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(storage);
            }
            else {
                if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(this.creep.room.controller);
            }
        }
        else {
            var storage = this.creep.pos.findClosestByPath(this.depositManager.extensions.concat(this.depositManager.spawns), {filter: minerStructureFilter});
            if (storage != undefined) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(storage);
            }
            else {
                storage = this.creep.room.controller;
                if (this.creep.upgradeController(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(storage);
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

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepMiner, 'CreepMiner');