var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Resources = require('Resources');
var Constructions = require('Constructions');
var DefenseManager = require('DefenseManager');
var MarketManager = require('MarketManager');
var Constants = require('Constants');
var generalFunctions = require('generalFunctions');

var globals = require('Globals');

function roomManager(room, roomHandler, roomMemoryObject) {
    this.room = room;
    this.roomHandler = roomHandler;
    this.creeps = [];
    this.structures = [];
    this.roomMemoryObject = roomMemoryObject;
    if (roomMemoryObject.ticksToScout && roomMemoryObject.ticksToScout > 0)
        generalFunctions.updateTicksToScout(roomMemoryObject);

    this.population = new Population(this.room);
    this.depositManager = new Deposits(this.room);
    this.resourceManager = new Resources(this.room, this.population, this.roomMemoryObject);
    this.constructionManager = new Constructions(this.room, roomMemoryObject);
    this.defenseManager = new DefenseManager(this.room, roomMemoryObject);
    this.population.typeDistribution.CreepBuilder.max = 3;
    if (this.room.controller.level < 3)
        this.population.typeDistribution.CreepBuilder.max += 1;
    if (this.room.controller.level < 4 || !this.room.storage)
        this.population.typeDistribution.CreepBuilder.max += 2;
    if (this.room.storage)
        this.population.typeDistribution.CreepBuilder.max += Math.floor(this.room.storage.store.energy / 250000);
    this.population.typeDistribution.CreepMiner.max = this.resourceManager.getSources().length;
    this.population.typeDistribution.CreepLongDistanceMiner.max =
        this.roomMemoryObject.longDistanceMining ? this.roomMemoryObject.longDistanceMining.length : 0;
    //this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
    this.population.typeDistribution.CreepCarrier.max = 2;
    if (this.room.controller.level < 4)
        this.population.typeDistribution.CreepCarrier.max += 1;
    if (this.room.storage)
        this.population.typeDistribution.CreepCarrier.max += Math.floor(this.room.storage.store.energy / 250000);
    this.population.typeDistribution.CreepLorry.max = this.resourceManager.getSources().length;
    this.population.typeDistribution.CreepHarvester.max =
        (this.resourceManager.mineral && this.resourceManager.mineral.mineralAmount > 0 && this.depositManager.storage.store['H'] < 250000) ? 1 : 0;
    this.marketManager = new MarketManager(this.room, this.depositManager, this.roomMemoryObject);
    this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.defenseManager, this.marketManager, this.population, this.roomHandler);
    
    // TODO : activate and check
    //this.marketManager.findOrder();
    

    //Memory.stats["room." + room.name + ".energyAvailable"] = room.energyAvailable;
    //Memory.stats["room." + room.name + ".energyCapacityAvailable"] = room.energyCapacityAvailable;
    //Memory.stats["room." + room.name + ".controllerProgress"] = room.controller.progress;

    /*
    var flag = this.room.find(FIND_FLAGS)[0];
    if (this.room.controller.level == 4 && this.room.lookForAt(LOOK_CONSTRUCTION_SITES, flag).length == 0)
        this.room.createConstructionSite(flag, STRUCTURE_STORAGE);*/
}

roomManager.prototype.loadCreeps = function() {
    var creeps = this.population.creeps;
    for(var i = 0; i < creeps.length; i++) {
        var c = this.creepFactory.load(creeps[i]);
        if(c)
            this.creeps.push(c);
    }

    this.distributeBuilders();
    //this.distributeResources('CreepMiner');
    //this.distributeResources('CreepCarrier');
    //this.distributeCarriers();
};

roomManager.prototype.distributeBuilders = function() {
    var builderStats = this.population.getType('CreepBuilder');
    // no spawns in room
    if(this.depositManager.spawns.length == 0 || builderStats.total <= Constants.minBuildersForUpgraders) {
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'CreepBuilder')
                continue;

            creep.remember('force-controller-upgrade', false);
            creep.remember('dedicated-builder', false);
        }
    }
    else {
        var dedicatedBuilders = builderStats.total > Constants.minBuildersForDedicatedBuilders;
        console.log(dedicatedBuilders);
        var c = 0;
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'CreepBuilder')
                continue;

            if (c < Constants.numUpgraders) {
                creep.remember('force-controller-upgrade', true);
                creep.remember('dedicated-builder', false);
            }
            else if (dedicatedBuilders && c < Constants.numDedicatedBuilders) {
                creep.remember('force-controller-upgrade', false);
                creep.remember('dedicated-builder', true);
                console.log('dedicated builder');
            }
            else {
                creep.remember('force-controller-upgrade', false);
                creep.remember('dedicated-builder', false);
            }

            c++;
        }
    }
};

roomManager.prototype.distributeResources = function(type) {
    var sources = this.resourceManager.getSources();
    var perSource = Math.ceil(this.population.getType(type).total/sources.length);
    var counter = 0;
    var source = 0;

    for(var i = 0; i < this.creeps.length; i++) {
        var creep = this.creeps[i];
        if(creep.remember('role') != type)
            continue;

        if(!sources[source])
            continue;

        creep.remember('source', sources[source].id);
        counter++;
        if(counter >= perSource) {
            counter = 0;
            source++;
        }
    }
};

roomManager.prototype.populate = function() {
    if (this.depositManager.spawns.length == 0 && this.population.getTotalPopulation() < 10) {
        //this.askForReinforcements()
    }

    for (var i = 0; i < this.depositManager.spawns.length; i++) {
        if (this.depositManager.spawns[i].spawning)
            continue;

        if (this.population.typeDistribution.CreepMiner.total == 0)
            this.creepFactory.new(Constants.ROLE_MINER, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepLorry.total == 0 && this.room.storage)
            this.creepFactory.new(Constants.ROLE_LORRY, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepCarrier.total == 0 && this.room.storage)
            this.creepFactory.new(Constants.ROLE_CARRIER, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepBuilder.total == 0)
            this.creepFactory.new(Constants.ROLE_MINER, this.depositManager.getSpawnDeposit());

        // can spawn
        if (this.depositManager.energy() > 200) {
            var spawnType = false;
            var types = this.population.getTypes();
            // normal spawns
            for (var i = 0; i < types.length; i++) {
                var ctype = types[i];
                if (ctype.total < ctype.max && this.depositManager.deposits.length > ctype.minExtensions &&
                    (!ctype.requireStorage || (ctype.requireStorage && this.room.storage != undefined)) &&
                    (!ctype.requireContainer || (ctype.requireContainer && this.depositManager.resourceContainers.length > 0))) {

                    if (ctype.type == Constants.ROLE_LONG_DISTANCE_MINER && !this.roomMemoryObject.scoutNeeded && (!this.roomMemoryObject.longDistanceMining ||
                        this.roomMemoryObject.longDistanceMining.length == 0))
                        continue;

                    if (ctype.total < ctype.max) {
                        this.creepFactory.new(ctype.type, this.depositManager.getSpawnDeposit());
                        spawnType = ctype.type;
                        break;
                    }
                }
            }

            // spawn scout
            if (!spawnType) {
                if (this.roomMemoryObject.scoutNeeded && this.roomMemoryObject.ticksToScout == 0) {
                    this.creepFactory.new(Constants.ROLE_SCOUT, this.depositManager.getSpawnDeposit());
                    generalFunctions.updateTicksToScout(this.roomMemoryObject, Constants.SCOUT_SPAWN_TICKS);
                    spawnType = Constants.ROLE_SCOUT;
                }
            }

            // spawn claimer
            if (!spawnType) {
                if (Memory.claimRoom && Memory.spawnClaimer == true) {
                    this.creepFactory.new(Constants.ROLE_CLAIMER, this.depositManager.getSpawnDeposit());
                    var roomObject = {
                        name : Memory.claimRoom,
                        longDistanceMining : [],
                        scoutNeeded : false,
                        ticksToScout : 0,
                        report : true,
                        buildQueue : [],
                    };
                    Memory.rooms.push(roomObject);
                }
            }
        }
    }
};

roomManager.prototype.defend = function() {
    var cpuTime = Game.cpu.getUsed();
    var cpuUsed = 0;

    this.defenseManager.operateTowers();

    cpuUsed = Game.cpu.getUsed() - cpuTime;
    globals.addValue('defend', cpuUsed);
};

/*
 Room.prototype.distributeCarriers = function() {
 var counter = 0;
 var builders = [];
 var carriers = [];
 for(var i = 0; i < this.creeps.length; i++) {
 var creep = this.creeps[i];
 if(creep.remember('role') == 'CreepBuilder') {
 builders.push(creep.creep);
 }
 if(creep.remember('role') != 'CreepCarrier') {
 continue;
 }
 carriers.push(creep);
 if(!creep.getDepositFor()) {
 if(counter%2) {
 // Construction
 creep.setDepositFor(1);
 } else {
 // Population
 creep.setDepositFor(2);
 }
 }

 counter++;
 }
 counter = 0;
 for(var i = 0; i < carriers.length; i++) {
 var creep = carriers[i];
 if(creep.remember('role') != 'CreepCarrier') {
 continue;
 }
 if(!builders[counter]) {
 continue;
 }
 var id = creep.remember('target-worker');
 if(!Game.getObjectById(id)) {
 creep.remember('target-worker', builders[counter].id);
 }
 counter++;
 if(counter >= builders.length) {
 counter = 0;
 }
 }
 };
 */

/*
 Room.prototype.askForReinforcements = function() {
 console.log(this.room.name + ': ask for reinforcements.');
 this.roomHandler.requestReinforcement(this);
 };

 Room.prototype.sendReinforcements = function(room) {
 if(!Memory[this.room.name]) {
 Memory[this.room.name] = {};
 }
 var alreadySending = false;
 for(var i = 0; i < this.population.creeps.length; i++) {
 var creep = this.population.creeps[i];
 if(creep.memory.targetRoom == room.room.name) {
 alreadySending = true;
 break;
 }
 }
 if(alreadySending) {
 console.log(this.room.name + ': already given reinforcements');
 return;
 }
 if(this.population.getTotalPopulation() < this.population.getMaxPopulation()*0.8) {
 console.log(this.room.name + ': Not enough resources ' + '(' + this.population.getTotalPopulation() + '/' + this.population.getMaxPopulation()*0.8 + ')');
 return;
 }

 var sentType = [];
 for(var i = 0; i < this.population.creeps.length; i++) {
 var creep = this.population.creeps[i];
 if(creep.ticksToLive < 1000) {
 continue;
 }
 if(sentType.indexOf(creep.memory.role) == -1) {
 sentType.push(creep.memory.role);
 console.log('sending: ' + creep.memory.role);
 creep.memory.targetRoom = room.room.name;
 }
 }
 }
 */

//profiler.addObjectToProfiler(roomManager, "RoomManager");

module.exports = roomManager;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(roomManager, 'RoomManager');