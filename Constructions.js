var globals = require('Globals');

var CONST = {
    RAMPART_MAX: 1,
    RAMPART_FIX: 0.10,
    STANDARD_FIX: 0.50,
    STANDARD_MAX : 1,
};
var Cache = require('Cache');

function Constructions(room, roomMemoryObject) {
    //var cpuTime = Game.cpu.getUsed();

    this.room = room;
    this.buildQueue = roomMemoryObject.buildQueue;
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

    this.controller = this.room.controller;

    /*
    var cpuUsed = Game.cpu.getUsed() - cpuTime;
    globals.addValue('constructionManager', cpuUsed);*/
}

Constructions.prototype.getDamagedStructures = function() {
    return this.cache.remember(
        'damaged-structures',
        function() {
            return this.room.find(
                FIND_STRUCTURES,
                {
                    filter: function(s) {
                        // OPTIMIZATION : save the hostile creeps variable for reuse
                        /*var hostileCreeps = this.cache.remember(
                            'hostile-creeps-' + this.room.name,
                            function() {
                                return this.room.find(FIND_HOSTILE_CREEPS);
                            }.bind(this)
                        );
                        if (hostileCreeps) {
                            var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                            if (targets.length != 0)
                                return false;
                        }*/

                        if (s.structureType == STRUCTURE_WALL)
                            return false;

                        if (this.room.controller.level < 4 && s.structureType == STRUCTURE_ROAD && s.hits > 1999)
                            return false;

                        if((s.hits / s.hitsMax < CONST.STANDARD_FIX && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits / s.hitsMax < CONST.RAMPART_FIX))
                            return true;
                    }.bind(this)
                }
            );
        }.bind(this)
    );
};

// obsolete
Constructions.prototype.getUpgradeableStructures = function() {
    return this.cache.remember(
        'upgradeable-structures',
        function() {
            return this.room.find(
                FIND_STRUCTURES,
                {
                    filter: function(s) {
                        // OPTIMIZATION : save the hostile creeps variable for reuse
                        /*var hostileCreeps = this.cache.remember(
                            'hostile-creeps-' + this.room.name,
                            function() {
                                return this.room.find(FIND_HOSTILE_CREEPS);
                            }.bind(this)
                        );
                        if (hostileCreeps) {
                            var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                            if (targets.length != 0)
                                return false;
                        }*/

                        if (s.structureType == STRUCTURE_WALL)
                            return false;

                        if((s.hits / s.hitsMax < CONST.STANDARD_MAX && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits / s.hitsMax < CONST.RAMPART_MAX))
                            return true;
                    }.bind(this)
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

// obsolete
Constructions.prototype.getController = function() {
    return this.controller;
};

Constructions.prototype.getBestConstructionSiteFor = function(pos, filter = null) {
    let sites;
    if( filter ) sites = this.sites.filter(filter);
    else sites = this.sites;
    let siteOrder = [STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_LINK,STRUCTURE_STORAGE,STRUCTURE_TOWER,STRUCTURE_ROAD,STRUCTURE_CONTAINER,STRUCTURE_EXTRACTOR,STRUCTURE_WALL,STRUCTURE_RAMPART];
    let rangeOrder = site => {
        let order = siteOrder.indexOf(site.structureType);
        if( order < 0 ) return 100000 + pos.getRangeTo(site);
        return ((order - (site.progress / site.progressTotal)) * 100) + pos.getRangeTo(site);
    };
    return _.minBy(sites, rangeOrder);
};

Constructions.prototype.constructStructure = function(creep) {
    var avoidArea = creep.getAvoidedArea();
    var site;
    var build = false;
    var checkWalls = !creep.remember('dedicated-builder') || (creep.remember('dedicated-builder') && this.sites.length == 0);

    if (checkWalls && this.damagedStructures.length != 0) {
        site = creep.creep.pos.findClosestByPath(this.damagedStructures);
        //creep.creep.say('damaged');
    }
    else if(this.sites.length != 0) {
        site = this.getBestConstructionSiteFor(creep.creep.pos);
        //site = creep.creep.pos.findClosestByPath(this.sites);
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
                creep.creep.moveToIfAble(site);
                //creep.creep.moveToIfAble(site, {avoid: avoidArea});
        }
        else {
            if (creep.creep.repair(site) == ERR_NOT_IN_RANGE)
                creep.creep.moveToIfAble(site);
                //creep.creep.moveToIfAble(site, {avoid: avoidArea});
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

//profiler setup
const profiler = require('profiler');
profiler.registerObject(Constructions, 'Constructions');