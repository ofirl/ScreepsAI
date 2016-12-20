var Constants = require('Constants');

module.exports = function () {
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName) {
            if (energy < 200)
                return ERR_NOT_ENOUGH_ENERGY;
            
            energy = Math.min(Constants.maxCreepCost, energy);
            var numberOfParts = Math.floor(energy/200);
            var body = [];

            //body parts, by order
            for (let i = 0; i < numberOfParts; i++)
                body.push(WORK);
            for (let i = 0; i < numberOfParts; i++)
                body.push(CARRY);
            for (let i = 0; i < numberOfParts; i++)
                body.push(MOVE);

            var result = this.createCreep(body, roleName + " " + Math.floor(Math.random()*100), {role : roleName});
            return result;
        };
}