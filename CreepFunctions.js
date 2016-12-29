var Constants= require('Constants');
var globals = rquire('Globals');

module.exports = function() {

    Creep.prototype.moveToIfAble =
        function(target, opts) {
            if (this.fatigue == 0)
                globals.addActionToQueue(this, globals.ACTIONS.MOVE, target, opts);
                //return this.moveTo(target, opts);

            return ERR_TIRED;
    };

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
        };

    Creep.prototype.isEmpty =
        function() {
            return _.sum(this.carry) == 0
        };

    Creep.prototype.isCarryResource =
        function() {
            return _.sum(this.carry) != this.carry.energy;
        };

    Creep.prototype.leaveBorder = function() {
        // if on border move away
        // for emergency case, Path not found
        if( this.pos.y == 0 ){
            this.move(BOTTOM);
        } else if( this.pos.x == 0  ){
            this.move(RIGHT);
        } else if( this.pos.y == 49  ){
            this.move(TOP);
        } else if( this.pos.x == 49  ){
            this.move(LEFT);
        }
        // TODO: add CORNER cases
    };

    Creep.partThreat = {
        'move': { common: 0, boosted: 0 },
        'work': { common: 1, boosted: 3 },
        'carry': { common: 0, boosted: 0 },
        'attack': { common: 2, boosted: 5 },
        'ranged_attack': { common: 2, boosted: 5 },
        'heal': { common: 4, boosted: 10 },
        'claim': { common: 1, boosted: 3 },
        'tough': { common: 1, boosted: 3 },
        tower: 25
    };

    Creep.bodyThreat = function(body) {
        let threat = 0;
        let evaluatePart = part => {
            threat += Creep.partThreat[part.type ? part.type : part][part.boost ? 'boosted' : 'common'];
        };
        body.forEach(evaluatePart);
        return threat;
    }
};