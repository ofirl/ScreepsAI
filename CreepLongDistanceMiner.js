var Constants = require('Constants');
var RoomHandler = require('RoomHandler');
var Cache = require('Cache');
var ACTIONS = {
    HARVEST: 1,
    DEPOSIT: 2
};

function creepLongDistanceMiner(creep, depositManager, defenseManager) {
    this.cache = new Cache();
    this.creep = creep;
    this.depositManager = depositManager;
    this.defenseManager = defenseManager;
}

creepLongDistanceMiner.prototype.init = function() {
    /*if(!this.remember('targetRoom')) {
        this.remember('targetRoom', this.resourceManager.getLonelyLongDistanceMiningRoom());
    }*/
    /*if(!this.remember('source')) {
        var src = this.resourceManager.getAvailableResource();
        if (src)
            this.remember('source', src.id);
    }*/

    // hostiles detected
    if (this.creep.room == this.remember('targetResourceRoom') && this.defenseManager.hostileCreeps.length > 0) {
        this.remember('previous-role', this.creep.memory.role);
        var safeRoom = this.remember('srcStorageRoom');
        this.defenseManager.callForScout(safeRoom);
        this.remember('targetRoom', safeRoom);
        this.remember('role', Constants.ROLE_CARRIER);

        return;
    }

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

creepLongDistanceMiner.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.HARVEST && this.creep.isFull())
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep finished depositing
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.isEmpty())
        this.remember('last-action', ACTIONS.HARVEST);

    // creep should harvest
    if (this.remember('last-action') == ACTIONS.HARVEST) {
        // found loot!
        if (this.depositManager.droppedEnergy.length > 0) {
            var droppedEnergy = this.creep.pos.findClosestByPath(this.depositManager.droppedEnergy);
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(droppedEnergy);

            return;
        }

        if (this.creep.pos.roomName != this.remember('targetResourceRoom')) {
            var exitDir = this.creep.room.findExitTo(this.remember('targetResourceRoom'));
            var exit = this.creep.pos.findClosestByRange(exitDir);
            this.creep.moveToIfAble(exit);
        }
        else if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.resource);
    }
    // creep should deposit
    else {
        if (this.creep.pos.roomName != this.remember('srcStorageRoom')) {
            var exitDir = this.creep.room.findExitTo(this.remember('srcStorageRoom'));
            var exit = this.creep.pos.findClosestByRange(exitDir);
            this.creep.moveToIfAble(exit);
        }
        else {
            var storage = this.depositManager.room.storage;
            if (storage != undefined) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(storage);
            }
            // should never happen - long distance mining = got storage already
            else {
                storage = this.creep.pos.findClosestByPath(this.depositManager.getAvailableContainersToDeposit());
                if (storage != undefined) {
                    if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        this.creep.moveToIfAble(storage);
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

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepLongDistanceMiner, 'CreepLongDistanceMiner');