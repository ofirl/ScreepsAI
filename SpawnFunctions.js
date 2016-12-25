var Constants= require('Constants');

/*var roleSpawnFunctions = {
    [Constants.ROLE_MINER] : StructureSpawn.prototype.spawnMiner(),
    [Constants.ROLE_BUILDER] : StructureSpawn.prototype.spawnBuilder(),
    [Constants.ROLE_CARRIER] : StructureSpawn.prototype.spawnCarrier(),
    [Constants.ROLE_LORRY] : StructureSpawn.prototype.spawnLorry(),
    [Constants.ROLE_LONG_DISTANCE_MINER] : StructureSpawn.prototype.spawnLongDistanceMiner(),
    [Constants.ROLE_SCOUT] : StructureSpawn.prototype.spawnScout(),
};*/

module.exports = function() {

    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {

            // TODO : check spawning
            // roleName must start with 'Creep'
            //var funcName = 'spawn' + roleName.substring(5, roleName.length);
            //return StructureSpawn.prototype[funcName](energy).bind(this);

            switch (roleName) {
                case Constants.ROLE_MINER :
                    return this.spawnMiner(energy);
                case Constants.ROLE_LORRY :
                    return this.spawnLorry(energy);
                case Constants.ROLE_CARRIER :
                    return this.spawnCarrier(energy);
                case Constants.ROLE_BUILDER :
                    return this.spawnBuilder(energy);
                case Constants.ROLE_LONG_DISTANCE_MINER :
                    return this.spawnLongDistanceMiner(energy);
                case Constants.ROLE_SCOUT :
                    return this.spawnScout(energy);
                case Constants.ROLE_CLAIMER :
                    return this.spawnClaimer(energy);
            }
        };

    StructureSpawn.prototype.spawnMiner =
        function(energy) {
            var workParts = Math.min(Math.floor((energy - 150) / 100), Constants.MAX_WORK_PARTS);
            if (workParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;

            var body = [];
            var roleName = Constants.ROLE_MINER;

            for (var i = 0; i < workParts; i++)
                body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnLorry =
        function(energy) {
            var carryParts = Math.min(Math.floor((energy - 100) / 50), Constants.MAX_CARRY_PARTS);
            if (carryParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;
            var body = [];
            var roleName = Constants.ROLE_LORRY;

            for (var i = 0; i < carryParts; i++)
                body.push(CARRY);
            body.push(MOVE);
            body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnCarrier =
        function(energy) {
            energy = Math.min(Constants.maxCreepCost, energy);
            var numberOfParts = Math.floor(energy/200);
            if (numberOfParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;

            var body = [];
            var roleName = Constants.ROLE_CARRIER;

            for (let i = 0; i < numberOfParts; i++)
                body.push(WORK);
            for (let i = 0; i < numberOfParts; i++)
                body.push(CARRY);
            for (let i = 0; i < numberOfParts; i++)
                body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnBuilder =
        function(energy) {
            energy = Math.min(Constants.maxCreepCost, energy);
            var numberOfParts = Math.floor(energy/200);
            if (numberOfParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;

            var body = [];
            var roleName = Constants.ROLE_BUILDER;

            for (let i = 0; i < numberOfParts; i++)
                body.push(WORK);
            for (let i = 0; i < numberOfParts; i++)
                body.push(CARRY);
            for (let i = 0; i < numberOfParts; i++)
                body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnLongDistanceMiner =
        function(energy) {
            //energy = Math.min(Constants.maxCreepCost, energy);
            energy = Math.min(2000, energy);
            var numberOfParts = Math.floor(energy/200);
            if (numberOfParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;

            var body = [];
            var roleName = Constants.ROLE_LONG_DISTANCE_MINER;

            for (let i = 0; i < numberOfParts; i++)
                body.push(WORK);
            for (let i = 0; i < numberOfParts; i++)
                body.push(CARRY);
            for (let i = 0; i < numberOfParts; i++)
                body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnScout =
        function(energy) {
            //energy = Math.min(Constants.maxCreepCost, energy);
            var requiredEnergy = Constants.SCOUT_TOUGH_PARTS * 10 + Constants.SCOUT_CARRY_PARTS * 50 +
                Constants.SCOUT_ATTACK_PARTS * 80 + Constants.SCOUT_MOVE_PARTS * 50;
            if (energy < requiredEnergy)
                return ERR_NOT_ENOUGH_ENERGY;
            
            var body = [];
            var roleName = Constants.ROLE_SCOUT;

            for (let i = 0; i < Constants.SCOUT_TOUGH_PARTS; i++)
                body.push(TOUGH);
            for (let i = 0; i < Constants.SCOUT_CARRY_PARTS; i++)
                body.push(CARRY);
            for (let i = 0; i < Constants.SCOUT_ATTACK_PARTS; i++)
                body.push(ATTACK);
            for (let i = 0; i < Constants.SCOUT_MOVE_PARTS; i++)
                body.push(MOVE);

            return logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnClaimer =
        function(energy) {
            var requiredEnergy = 600 + 100 + 50 + 50; //800
            if (energy < requiredEnergy)
                return ERR_NOT_ENOUGH_ENERGY;
            
            var body = [];
            var roleName = Constants.ROLE_CLAIMER;
            
            for (let i = 0; i < Constants.CLAIMER_CARRY_PARTS; i++)
                body.push(CARRY);
            for (let i = 0; i < Constants.CLAIMER_WORK_PARTS; i++)
                body.push(WORK);
            for (let i = 0; i < Constants.CLAIMER_MOVE_PARTS; i++)
                body.push(MOVE);

            body.push(CLAIM);

            return logSpawn(this, body, roleName);
        }
};

// private
function logSpawn(spawn, body, roleName) {
    var name = spawn.createCreep(body, roleName + " " + Math.floor(Math.random() * 100), {role: roleName});
    if (!(name < 0))
        console.log("Spawned new " + roleName + " : " + name);

    return name;
}