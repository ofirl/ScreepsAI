var Cache = require('Cache');
var roomHandler = require('RoomHandler');
var generalFunctions = require('generalFunctions');

function DefenseManager(room, roomMemoryObject) {
    this.room = room;
    this.roomMemoryObject = roomMemoryObject;
    this.cache = new Cache();
    this.towers = this.room.find(
        FIND_STRUCTURES,
        {
            filter : (s) => s.structureType == STRUCTURE_TOWER
        }
    );

    this.hostileCreeps = this.getHostileCreeps();
    this.damagedCreeps = this.room.find(
        FIND_MY_CREEPS,
        {
            filter : (c) => c.hits < c.hitsMax
        }
    );

    // update counters
    if (roomMemoryObject.ticksToScout && roomMemoryObject.ticksToScout > 0)
        generalFunctions.updateTicksToScout(roomMemoryObject);
    if (roomMemoryObject.resetScout && roomMemoryObject.resetScout >= 0)
        roomMemoryObject.resetScout--;
    if (roomMemoryObject.resetScout == 0)
        roomMemoryObject.scoutNeeded = false;

    if (!roomMemoryObject.gatherPoint) {
        var gatherPoint = this.room.find(FIND_FLAGS,
            {
                filter : { name : 'Gathering Point ' + this.room.name}
            }
        );
        if (gatherPoint.length > 0)
            roomMemoryObject.gatherPoint = gatherPoint[0].pos;
    }
    this.gatherPoint = roomMemoryObject.gatherPoint;

    // stats collecting
    Memory.stats['room.' + room.name + '.defenderIndex'] = this.hostileCreeps.length;
}

DefenseManager.prototype.getHostileCreeps = function () {
    return this.cache.remember(
        'hostile-creeps-' + this.room.name,
        function() {
            return this.room.find(FIND_HOSTILE_CREEPS);
        }.bind(this)
    );
};

DefenseManager.prototype.operateTowers = function () {
    if (this.towers.length == 0)
        return;

    if (this.hostileCreeps.length > 0) {
        for (let tower of this.towers) {
            var target = tower.pos.findClosestByRange(this.hostileCreeps);
            if (target != undefined)
                tower.attack(target);
        }
    }
    // if damaged friendly creeps found
    else if (this.damagedCreeps.length > 0) {
        for (let tower of this.towers) {
            var target = tower.pos.findClosestByRange(this.damagedCreeps);
            tower.heal(target);
        }
    }
};

// TODO : check it's working
DefenseManager.prototype.callForScout = function (roomName) {
    // safety first - should always pass
    if (roomName) {
        for (var r in Memory.rooms) {
            var room = Memory.rooms[r];
            if (room.name != roomName)
                continue;

            room.scoutNeeded = true;
            room.resetScout = 1500; // life time of invaders
            return;
        }
    }
};

DefenseManager.prototype.isScoutNeeded = function () {
    return this.roomMemoryObject.scoutNeeded;
};

DefenseManager.prototype.roomCleared = function (roomName) {
    // safety first - should always pass
    if (roomName) {
        for (var r in Memory.rooms) {
            var room = Memory.rooms[r];
            if (room.name != roomName)
                continue;

            room.scoutNeeded = false;
            return;
        }
    }
};

module.exports = DefenseManager;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(DefenseManager, 'DefenseManager');