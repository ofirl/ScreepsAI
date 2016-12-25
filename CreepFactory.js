var CreepBase = require('CreepBase');
var CreepBuilder = require('CreepBuilder');
var CreepMiner = require('CreepMiner');
var CreepLongDistanceMiner = require('CreepLongDistanceMiner');
var CreepLorry = require('CreepLorry');
var CreepScout = require('CreepScout');
var CreepHarvester = require('CreepHarvester');
var CreepCarrier = require('CreepCarrier');
//var CreepSoldier = require('CreepSoldier'); // TODO : implement soldier
//var CreepHealer = require('CreepHealer'); // TODO : implement healer
//var CreepShooter = require('CreepShooter'); // TODO : implement shooter

var generalFunctions = require('generalFunctions');
var Constants = require('Constants');

function creepFactory(depositManager, resourceManager, constructionsManager, defenseManager, population, roomHandler) {
    this.depositManager = depositManager;
    this.resourceManager = resourceManager;
    this.population = population;
    this.constructionsManager = constructionsManager;
    this.defenseManager = defenseManager;
    this.roomHandler = roomHandler;
};

creepFactory.prototype.load = function(creep) {
    var loadedCreep = null;
    var role = creep.memory.role;
    //should never happen
    if(!role)
        role = creep.name.split('-')[0];

        switch (role) {
            case Constants.ROLE_BUILDER:
                loadedCreep = new CreepBuilder(creep, this.constructionsManager, this.depositManager, this.resourceManager);
                break;
            case Constants.ROLE_MINER:
                loadedCreep = new CreepMiner(creep, this.resourceManager, this.depositManager);
                break;
            case Constants.ROLE_LORRY:
                loadedCreep = new CreepLorry(creep, this.depositManager, this.resourceManager);
                break;
            case Constants.ROLE_LONG_DISTANCE_MINER:
                loadedCreep = new CreepLongDistanceMiner(creep, this.depositManager, this.defenseManager);
                break;
            case Constants.ROLE_SCOUT:
                loadedCreep = new CreepScout(creep, this.defenseManager, this.depositManager);
                break;
            case Constants.ROLE_CARRIER:
                loadedCreep = new CreepCarrier(creep, this.constructionsManager, this.depositManager, this.defenseManager);
                break;
            case Constants.ROLE_HARVESTER:
                loadedCreep = new CreepHarvester(creep, this.resourceManager, this.depositManager);
                break;
            case Constants.ROLE_SOLDIER:
                //loadedCreep = new CreepSoldier(creep);
                break;
            case Constants.ROLE_HEALER:
                //loadedCreep = new CreepHealer(creep);
                break;
            case Constants.ROLE_SHOOTER:
                //loadedCreep = new CreepShooter(creep);
                break;
        }

    // a useless lazy bastard without a role - should never happen!
    //else
        //creep.memory.role = Constants.ROLE_DEFAULT;

    if(!loadedCreep)
        return false;

    generalFunctions.extend(loadedCreep, CreepBase);
    loadedCreep.init();

    return loadedCreep;
};

creepFactory.prototype.new = function(creepType, spawn) {
    return spawn.createCustomCreep(spawn.room.energyAvailable, creepType);
};

module.exports = creepFactory;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepFactory, 'CreepFactory');