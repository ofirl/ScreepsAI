var Constants = require('Constants');
var RoomHandler = require('RoomHandler');
var Cache = require('Cache');
var ACTIONS = {
    HARVEST: 1,
    DEPOSIT: 2
};

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepLongDistanceMiner, 'CreepLongDistanceMiner');

function creepLongDistanceMiner(creep, depositManager) {
    this.cache = new Cache();
    this.creep = creep;

    //this.resourceManager = RoomHandler.get(Game.rooms[this.remember('targetRoom')]).resourceManager;
    this.depositManager = depositManager;
};

creepLongDistanceMiner.prototype.init = function() {
    /*if(!this.remember('targetRoom')) {
        this.remember('targetRoom', this.resourceManager.getLonelyLongDistanceMiningRoom());
    }*/
    /*if(!this.remember('source')) {
        var src = this.resourceManager.getAvailableResource();
        if (src)
            this.remember('source', src.id);
    }*/
    if (!this.remember('srcStorageRoom'))
        this.remember('srcStorageRoom', this.creep.room.name);

    if(!this.remember('targetResourceRoom')) {
        this.remember('targetResourceRoom', RoomHandler.get(Game.rooms[this.remember('srcStorageRoom')]).resourceManager.getLonelyLongDistanceMiningRoom());
    }

    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.HARVEST);
    if(this.moveToNewRoom() == true) {
        return;
    }

    //this.resource = this.resourceManager.getResourceById(this.remember('source'));
    this.resource = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    this.act();
};

// TODO : implement scout calling instead of timer
creepLongDistanceMiner.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.HARVEST && this.creep.carry.energy == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep finished depositing
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry.energy == 0)
        this.remember('last-action', ACTIONS.HARVEST);

    // creep should harvest
    if (this.remember('last-action') == ACTIONS.HARVEST) {
        if (this.creep.pos.roomName != this.remember('targetResourceRoom')) {
            var exitDir = this.creep.room.findExitTo(this.remember('targetResourceRoom'));
            var exit = this.creep.pos.findClosestByRange(exitDir);
            this.creep.moveTo(exit);
        }
        else if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.resource);
    }
    // creep should deposit
    else {
        if (this.creep.pos.roomName != this.remember('srcStorageRoom')) {
            var exitDir = this.creep.room.findExitTo(this.remember('srcStorageRoom'));
            var exit = this.creep.pos.findClosestByRange(exitDir);
            this.creep.moveTo(exit);
        }
        else {
            var storage = this.depositManager.room.storage;
            if (storage != undefined) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveTo(storage);
            }
            // should never happen - long distance mining = got storage already
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

// private
function minerStructureFilter(structure) {
    return Constants.minerSupplyStructures.indexOf(structure.structureType) != -1
        && (structure.energy < structure.energyCapacity || (structure.store && structure.store.energy < structure.storeCapacity));
}

module.exports = creepLongDistanceMiner;