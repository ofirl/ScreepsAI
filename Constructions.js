var CONST = {
    RAMPART_MAX: 1,
    RAMPART_FIX: 0.30,
    STANDARD_FIX: 0.90,
    STANDARD_MAX : 1,
};
var Cache = require('Cache');


//profiler setup
const profiler = require('profiler');
profiler.registerObject(Constructions.prototype, 'Constructions');

function Constructions(room, buildQueue) {
    this.room = room;
    this.buildQueue = buildQueue;
    this.buildQueueObjects = [];
    this.cache = new Cache();
    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.structures = this.room.find(FIND_MY_STRUCTURES);
    this.towers = this.room.find(FIND_STRUCTURES, { filter : (s) => s.structureType == STRUCTURE_TOWER});
    this.walls = this.room.find(FIND_STRUCTURES, { filter : (s) => s.structureType == STRUCTURE_WALL});
    this.damagedStructures = this.getDamagedStructures();
    if (this.damagedStructures.length > 0) {
        for (var i = 0; i < this.damagedStructures.length; i++)
            this.addToBuildQueue(this.damagedStructures[i].id);
    }
    for (var i = 0; i < this.buildQueue.length; i++) {
        var id = this.buildQueue[i];
        var changed = false;
        var object = Game.getObjectById(id);
        if (object == null || object.hits == object.hitsMax) {
            this.removeFromBuildQueue(id);
            changed = true;
        }
        else
            this.buildQueueObjects.push(object);
    }
    if (changed)
        this.saveBuildQueueToMemory();

    //this.upgradeableStructures = this.getUpgradeableStructures();
    this.controller = this.room.controller;
};

Constructions.prototype.getDamagedStructures = function() {
    return this.cache.remember(
        'damaged-structures',
        function() {
            return this.room.find(
                FIND_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if(targets.length != 0)
                            return false;

                        if (s.structureType == STRUCTURE_WALL)
                            return false;

                        if((s.hits / s.hitsMax < CONST.STANDARD_FIX && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits / s.hitsMax < CONST.RAMPART_FIX))
                            return true;
                    }
                }
            );
        }.bind(this)
    );
};

Constructions.prototype.getUpgradeableStructures = function() {
    return this.cache.remember(
        'upgradeable-structures',
        function() {
            return this.room.find(
                FIND_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if(targets.length != 0)
                            return false;

                        if (s.structureType == STRUCTURE_WALL)
                            return false;

                        if((s.hits / s.hitsMax < CONST.STANDARD_MAX && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits / s.hitsMax < CONST.RAMPART_MAX))
                            return true;
                    }
                }
            );
        }.bind(this)
    );
};

Constructions.prototype.getConstructionSiteById = function(id) {
    return this.cache.remember(
        'object-id-' + id,
        function() {
            return Game.getObjectById(id);
        }.bind(this)
    );
};

Constructions.prototype.getController = function() {
    return this.controller;
};

Constructions.prototype.getClosestConstructionSite = function(creep) {
    var site = false;
    if(this.sites.length != 0)
        site = creep.pos.findClosestByPath(this.sites);

    return site;
};


Constructions.prototype.constructStructure = function(creep) {
    var avoidArea = creep.getAvoidedArea();
    var site;
    var build = false;

    if(this.damagedStructures.length != 0) {
        site = creep.creep.pos.findClosestByPath(this.damagedStructures);
        //creep.creep.say('damaged');
    }
    else if(this.sites.length != 0) {
        site = creep.creep.pos.findClosestByPath(this.sites);
        build = true;
        //creep.creep.say('build');
    }
    else if(this.buildQueueObjects.length != 0) {
        site = creep.creep.pos.findClosestByPath(this.buildQueueObjects);
        //creep.creep.say('repair');
    }
    
    if (site != undefined) {
        if (build) {
            if (creep.creep.build(site) == ERR_NOT_IN_RANGE)
                creep.creep.moveTo(site);
                //creep.creep.moveTo(site, {avoid: avoidArea});
        }
        else {
            if (creep.creep.repair(site) == ERR_NOT_IN_RANGE)
                creep.creep.moveTo(site);
                //creep.creep.moveTo(site, {avoid: avoidArea});
        }
        
        return true;
    }

    return false;
};

Constructions.prototype.getNotFullTowers = function() {
    return this.cache.remember(
        'not-full-towers',
        function() {
            var towers = [];
            for (var i = 0; i < this.towers.length; i++) {
                var t = this.towers[i];
                if(t.energy < t.energyCapacity)
                    towers.push(t);
            }

            return towers;
        }.bind(this)
    );
};

Constructions.prototype.getDamagedWalls = function() {
    return this.cache.remember(
        'damaged-walls',
        function() {
            var walls = [];
            for (var i = 0; i < this.walls.length; i++) {
                var w = this.walls[i];
                if(w.hits < w.hitsMax)
                    walls.push(w);
            }

            walls.sort((a,b) => {
                return a.hits - b.hits
                }
            );
            return walls;
        }.bind(this)
    );
};

Constructions.prototype.addToBuildQueue = function(id) {
    if (this.buildQueue.indexOf(id) == -1) {
        this.buildQueue.push(id);
        this.saveBuildQueueToMemory();
    }
};

Constructions.prototype.removeFromBuildQueue = function(id) {
    var index = this.buildQueue.indexOf(id);
    if (index != -1) {
        this.buildQueue.splice(index, 1);
        this.saveBuildQueueToMemory();
    }
};

Constructions.prototype.saveBuildQueueToMemory = function(id) {
    for (let room in Memory.rooms) {
        if (room.name == this.room.name) {
            room.buildQueue = this.buildQueue;
        }
    }
};

module.exports = Constructions;
