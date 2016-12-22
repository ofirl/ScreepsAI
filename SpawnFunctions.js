var Constants= require('Constants');

module.exports = function() {

    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
            switch (roleName) {
                case Constants.ROLE_MINER :
                    this.spawnMiner(energy);
                    break;
                case Constants.ROLE_LORRY :
                    this.spawnLorry(energy);
                    break;
                case Constants.ROLE_CARRIER :
                    this.spawnCarrier(energy);
                    break;
                case Constants.ROLE_BUILDER :
                    this.spawnBuilder(energy);
                    break;
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

            logSpawn(this, body, roleName);
        };

    StructureSpawn.prototype.spawnLorry =
        function(energy) {
            var carryParts = Math.min(Math.floor((energy - 50) / 100), Constants.MAX_CARRY_PARTS);
            console.log(energy);
            console.log(carryParts);
            if (carryParts == 0)
                return ERR_NOT_ENOUGH_ENERGY;
            var body = [];
            var roleName = Constants.ROLE_LORRY;

            for (var i = 0; i < carryParts; i++)
                body.push(CARRY);
            body.push(MOVE);

            logSpawn(this, body, roleName);
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

            logSpawn(this, body, roleName);
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

            logSpawn(this, body, roleName);
        }
};

// private
function logSpawn(spawn, body, roleName) {
    var name = spawn.createCreep(body, roleName + " " + Math.floor(Math.random() * 100), {role: roleName})
    if (!(name < 0))
        console.log('Happy Birthday ' + name);

    return name;
}