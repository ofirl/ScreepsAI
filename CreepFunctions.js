var Constants= require('Constants');

module.exports = function() {

    Creep.prototype.moveToIfAble =
        function(target, opts) {
            if (this.fatigue == 0)
                return this.moveTo(target, opts);

            return ERR_TIRED;
    }

    Creep.prototype.emptyCarry =
        function(target) {
            if (_.sum(this.carry) == 0)
                return ERR_NOT_ENOUGH_RESOURCES;

            for (var resourceType in this.carry) {
                var result = false;
                if (this.carry[resourceType] != 0)
                    result = this.transfer(target, resourceType);
                if (result && result != OK)
                    return result;
            }

            return OK;
        };

    Creep.prototype.isFull =
        function() {
            return _.sum(this.carry) == this.carryCapacity;
        };

    Creep.prototype.isFullOfEnergy =
        function() {
            return this.carry.energy == this.carryCapacity;
        }

    Creep.prototype.isEmpty =
        function() {
            return _.sum(this.carry) == 0
        }
};