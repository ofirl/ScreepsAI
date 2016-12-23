require('SpawnFunctions')();
var CreepClaimer = require('CreepClaimer');
var CreepBase = require('CreepBase');
//var consts = require('Constants');
//var roleHarvester = require('role.harvester');
//var roleUpgrader = require('role.upgrader');
//var roleBuilder = require('role.builder');
//var roleRepairer = require('role.repairer');
//var roleWallRepairer = require('role.wallRepairer');

var generalFunctions = {};

generalFunctions.extend = function(target, source) {
    for(var n in source) {
        if(!source.hasOwnProperty(n)) {
            continue;
        }
        if(target.hasOwnProperty(n)) {
            continue;
        }

            target[n] = source[n];
    }
};

//clears the memory
generalFunctions.clearMemory = function() {
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
            console.log(name + " died");
        }
    }
};

// operate towers
generalFunctions.operateTowers = function () {
    var towers = Game.rooms.W2N5.find(FIND_STRUCTURES, {
        filter : (s) => s.structureType == STRUCTURE_TOWER
    });
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined)
            tower.attack(target);
    }
};

// operate claimers
generalFunctions.runClaimers = function (creep) {
    var claimer = new CreepClaimer(creep);
    generalFunctions.extend(claimer, CreepBase);
    
    claimer.init();
};

module.exports = generalFunctions;

/*
module.exports = {

    //run the creeps
    runCreeps: function () {
        //go over the creeps
        for (let name in Game.creeps) {
            //get the creep
            var creep = Game.creeps[name];

            //check his role and run him accordingly
            switch (creep.memory.role) {
                case "harvester" :
                    roleHarvester.run(creep);
                    break;
                case "upgrader" :
                    roleUpgrader.run(creep);
                    break;
                case "builder" :
                    roleBuilder.run(creep);
                    break;
                case "repairer" :
                    roleRepairer.run(creep);
                    break;
                case "wall repairer" :
                    roleWallRepairer.run(creep);
                    break;
            }
        }
    },

    // spawn new creeps
    spawnCreeps: function () {
        //create creeps
        var currNumHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
        var currNumUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var currNumBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
        var currNumRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
        var currNumWallRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'wall repairer');
        //console.log(numHarvesters);

        // variables
        var needCreep = false;
        var role = "builder";

        // check for harvesters
        if (currNumHarvesters < consts.minHarvesters) {
            role = "harvester";
            needCreep = true;
        }
        // check for upgraders
        else if (currNumUpgraders < consts.minUpgraders) {
            role = "upgrader";
            needCreep = true;
        }
        //check for repairers
        else if (currNumRepairers < consts.minRepairers) {
            role = "repairer";
            needCreep = true;
        }
        else if (currNumWallRepairers < consts.minWallRepairers) {
            role = "wall repairer";
            needCreep = true;
        }
        // check for builders - redundant
        else if (currNumBuilders < consts.minBuilders) {
            role = "builder";
            needCreep = true;
        }

        // do the spawning
        if (needCreep) {
            var name = Game.spawns.MainSpawn.createCustomCreep(Game.spawns.MainSpawn.room.energyCapacityAvailable, role);
            //var name = Game.spawns.MainSpawn.createCreep(body, undefined, {
             //working: false,
             //role: role
             //});
            if (typeof name == 'string')
                console.log("Spawned new " + role + " : " + name);
        }
    },


}
*/