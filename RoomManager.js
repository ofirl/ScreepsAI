var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Resources = require('Resources');
var Constructions = require('Constructions');
var DefenseManager = require('DefenseManager');
var Constants = require('Constants');

function roomManager(room, roomHandler, buildQueue) {
    this.room = room;
    this.roomHandler = roomHandler;
    this.creeps = [];
    this.structures = [];

    this.population = new Population(this.room);
    this.depositManager = new Deposits(this.room);
    this.resourceManager = new Resources(this.room, this.population);
    this.constructionManager = new Constructions(this.room, buildQueue);
    this.defenseManager = new DefenseManager(this.room);
    this.population.typeDistribution.CreepBuilder.max = 4;
    if (this.room.storage)
        this.population.typeDistribution.CreepBuilder.max += Math.floor(this.room.storage.store.energy / 250000);
    this.population.typeDistribution.CreepMiner.max = this.resourceManager.getSources().length;
    this.population.typeDistribution.CreepLongDistanceMiner.max = 1;
    //this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
    this.population.typeDistribution.CreepCarrier.max = 2;
    if (this.room.storage)
        this.population.typeDistribution.CreepCarrier.max += Math.floor(this.room.storage.store.energy / 250000);
    this.population.typeDistribution.CreepLorry.max = this.resourceManager.getSources().length;
    this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.defenseManager, this.population, this.roomHandler);
}

roomManager.prototype.loadCreeps = function() {
    var creeps = this.room.find(FIND_MY_CREEPS);
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
        }
    }
    else {
        var c = 0;
        for(var i = 0; i < this.creeps.length; i++) {
            var creep = this.creeps[i];
            if(creep.remember('role') != 'CreepBuilder')
                continue;

            creep.remember('force-controller-upgrade', c > Constants.numUpgraders);
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
    if(this.depositManager.spawns.length == 0 && this.population.getTotalPopulation() < 10) {
        //this.askForReinforcements()
    }

    for(var i = 0; i < this.depositManager.spawns.length; i++) {
        if(this.depositManager.spawns[i].spawning)
            continue;

        if (this.population.typeDistribution.CreepMiner.total == 0)
            this.creepFactory.new(Constants.ROLE_MINER, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepLorry.total == 0 && this.room.storage)
            this.creepFactory.new(Constants.ROLE_LORRY, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepCarrier.total == 0 && this.room.storage)
            this.creepFactory.new(Constants.ROLE_CARRIER, this.depositManager.getSpawnDeposit());
        if (this.population.typeDistribution.CreepBuilder.total == 0)
            this.creepFactory.new(Constants.ROLE_MINER, this.depositManager.getSpawnDeposit());

        if(this.depositManager.energy() > 200) {
            var types = this.population.getTypes();
            for(var i = 0; i < types.length; i++) {
                var ctype = types[i];
                if(this.depositManager.deposits.length > ctype.minExtensions &&
                    (!ctype.requireStorage || ctype.requireStorage && this.room.storage != undefined) &&
                    (!ctype.requireContainer || ctype.requireContainer && this.depositManager.resourceContainers.length > 0)) {
                    if(ctype.total < ctype.max) {
                        this.creepFactory.new(ctype.type, this.depositManager.getSpawnDeposit());
                        break;
                    }
                }
            }
        }
    }
};

roomManager.prototype.defend = function() {
    this.defenseManager.operateTowers();
}

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
module.exports = roomManager;