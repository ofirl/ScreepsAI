var Cache = require('Cache');

function DefenseManager(room) {
    this.room = room;
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
    else {
        // if damaged friendly creeps found
        if (this.damagedCreeps.length > 0) {
            for (let tower of this.towers) {
                var target = tower.pos.findClosestByRange(this.damagedCreeps);
                tower.heal(target);
            }
        }
    }
};

module.exports = DefenseManager;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(DefenseManager, 'DefenseManager');