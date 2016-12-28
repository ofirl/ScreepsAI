require('SpawnFunctions')();
require('CreepFunctions')();

var globals = require('Globals');
var consts = require('Constants');
//var roleHarvester = require('role.harvester');
//var roleUpgrader = require('role.upgrader');
//var roleBuilder = require('role.builder');
var generalFunctions = require('generalFunctions');
var RoomHandler = require('RoomHandler');
var RoomManager = require('RoomManager');

// profiler setup
const profiler = require('profiler');
//profiler enable - comment out if not used
//profiler.enable();

// TODO : implement semi-automatic claiming - did : claimer will spawn, claim the room, and start....
// TODO : building the spawn(spawn will not be placed), need to do : send builders to complete the spawn (implement request for reinforcements)
// TODO : check pick up dropped energy
// TODO : implement attack/defense strategy
// TODO : pass memory parameter when spawning creeps
// TODO : implement lab workers (CreepChemist)

module.exports.loop = function  () {
    profiler.wrap(function() {
        // Main.js logic should go here.

        globals.reset();
        PathFinder.use(true);

        // clear memory
        generalFunctions.clearMemory();

        var cpuTime = Game.cpu.getUsed();
        var cpuUsed = 0;
        // init rooms
        for (let i in Memory.rooms) {
            //var n = Memory.rooms[room].name;
            var room = Memory.rooms[i];
            var n = room.name;
            if (Game.rooms[n] == undefined)
                continue;

            var roomHandler = new RoomManager(Game.rooms[n], RoomHandler, room);
            RoomHandler.set(Game.rooms[n], roomHandler);
        }

        cpuUsed = Game.cpu.getUsed() - cpuTime;
        globals.addValue('init', cpuUsed);

        // Load rooms
        var rooms = RoomHandler.getRoomHandlers();
        for (var room in Memory.rooms) {
            var roomMemoryObject = Memory.rooms[room];
            var n = roomMemoryObject.name;
            if (Game.rooms[n] == undefined)
                continue;

            var room = rooms[Game.rooms[n]];
            room.loadCreeps();
            room.populate();
            room.defend();

            if (!roomMemoryObject.report)
                continue;

            console.log(
                room.room.name + ' | ' +
                'goals met:' +
                room.population.goalsMet() +
                ', population: ' +
                room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
                ' (' + room.population.getType('CreepMiner').total + '/' +
                room.population.getType('CreepLorry').total + '/' +
                room.population.getType('CreepBuilder').total + '/' +
                room.population.getType('CreepCarrier').total + '/' +
                //room.population.getType('CreepSoldier').total +
                '), ' +
                'resources at: ' + parseInt((room.depositManager.energy() / room.depositManager.energyCapacity()) * 100) + '%, ' +
                'max resources: ' + room.depositManager.energyCapacity() + 'u, ' +
                'next death: ' + room.population.getNextExpectedDeath() + ' ticks'
            );
        }

        //move claim creeps
        for (let c in Game.creeps) {
            var creep = Game.creeps[c];

            switch (creep.memory.role) {
                case 'CreepClaimer' :
                    generalFunctions.runClaimers(creep);
                    break;
            }
        }

        require('stats')();

    });
};