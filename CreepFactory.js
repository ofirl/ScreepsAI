var CreepBase = require('CreepBase');
var CreepBuilder = require('CreepBuilder');
var CreepMiner = require('CreepMiner');
var CreepLongDistanceMiner = require('CreepLongDistanceMiner');
var CreepLorry = require('CreepLorry');
//var CreepSoldier = require('CreepSoldier');
//var CreepHealer = require('CreepHealer');
//var CreepScout = require('CreepScout');
var CreepCarrier = require('CreepCarrier');
//var CreepShooter = require('CreepShooter');
var generalFunctions = require('generalFunctions');

function creepFactory(depositManager, resourceManager, constructionsManager, population, roomHandler) {
    this.depositManager = depositManager;
    this.resourceManager = resourceManager;
    this.population = population;
    this.constructionsManager = constructionsManager;
    this.roomHandler = roomHandler;
};

creepFactory.prototype.load = function(creep) {
    var loadedCreep = null;
    var role = creep.memory.role;
    //should never happen
    if(!role)
        role = creep.name.split('-')[0];

    switch(role) {
        case 'CreepBuilder':
            loadedCreep = new CreepBuilder(creep, this.constructionsManager, this.depositManager, this.resourceManager);
            break;
        case 'CreepMiner':
            loadedCreep = new CreepMiner(creep, this.resourceManager, this.depositManager);
            break;
        case 'CreepLorry':
            loadedCreep = new CreepLorry(creep, this.depositManager, this.resourceManager);
            break;
        case 'CreepLongDistanceMiner':
            loadedCreep = new CreepLongDistanceMiner(creep, this.depositManager);
            break;
        case 'CreepSoldier':
            //loadedCreep = new CreepSoldier(creep);
            break;
        case 'CreepHealer':
            //loadedCreep = new CreepHealer(creep);
            break;
        case 'CreepCarrier':
            loadedCreep = new CreepCarrier(creep, this.constructionsManager, this.depositManager);
            break;
        case 'CreepShooter':
            //loadedCreep = new CreepShooter(creep);
            break;
    }

    if(!loadedCreep)
        return false;

    generalFunctions.extend(loadedCreep, CreepBase);
    loadedCreep.init();

    return loadedCreep;
};

creepFactory.prototype.new = function(creepType, spawn) {
    var name = spawn.createCustomCreep(spawn.room.energyAvailable, creepType);
    if (typeof name == 'string')
        console.log("Spawned new " + creepType + " : " + name);
};

module.exports = creepFactory;