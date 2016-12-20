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
    for(var i = 0; i < Memory.rooms.length; i++){
        var n = Memory.rooms[i];
        var roomHandler = new RoomManager(Game.rooms[n], RoomHandler);
        RoomHandler.set(Game.rooms[n], roomHandler);
    }

    // Load rooms
    var rooms = RoomHandler.getRoomHandlers();
    for(var i = 0; i < Memory.rooms.length; i++){
        var n = Memory.rooms[i];
        var room = rooms[Game.rooms[n]];
        room.loadCreeps();
        room.populate();

        console.log(
            room.room.name + ' | ' +
            'goals met:' +
            room.population.goalsMet() +
            ', population: ' +
            room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
            ' (' + room.population.getType('CreepMiner').total + '/' +
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
    generalFunctions.operateTowers();
};