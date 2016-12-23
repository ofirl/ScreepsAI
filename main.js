var consts = require('Constants');
//var roleHarvester = require('role.harvester');
//var roleUpgrader = require('role.upgrader');
//var roleBuilder = require('role.builder');
var generalFunctions = require('generalFunctions');
var RoomHandler = require('RoomHandler');
var RoomManager = require('RoomManager');

module.exports.loop = function  () {
    // clear memory
    generalFunctions.clearMemory();
    
    // init rooms
    for(let i in Memory.rooms){
        //var n = Memory.rooms[room].name;
        var room = Memory.rooms[i];
        var n = room.name;
        if (Game.rooms[n] == undefined)
            continue;
        
        var roomHandler = new RoomManager(Game.rooms[n], RoomHandler, room.buildQueue);
        RoomHandler.set(Game.rooms[n], roomHandler);
    }

    // Load rooms
    var rooms = RoomHandler.getRoomHandlers();
    for(var room in Memory.rooms){
        var n = Memory.rooms[room].name;
        if (Game.rooms[n] == undefined)
            continue;

        var room = rooms[Game.rooms[n]];
        room.loadCreeps();
        room.populate();
        room.defend();

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
            'resources at: ' + parseInt( (room.depositManager.energy() / room.depositManager.energyCapacity())*100) +'%, ' +
            'max resources: ' + room.depositManager.energyCapacity() +'u, ' +
            'next death: ' + room.population.getNextExpectedDeath() +' ticks'
        );
    };

    //operate towers
    //generalFunctions.operateTowers();

    //move claim creeps
    for (let c in Game.creeps) {
        var creep = Game.creeps[c];
        if (creep.memory.role != 'CreepClaimer')
            continue;

        generalFunctions.runClaimers(creep);
    }
};