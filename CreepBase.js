var CreepBase = {};
var Cache = require('Cache');
var universalCache = new Cache();
CreepBase.remember = function(key, value) {
    if(value === undefined) {
        return this.creep.memory[key];
    }

    this.creep.memory[key] = value;

    return value;
};

CreepBase.forget = function(key) {
    delete this.creep.memory[key];
};

CreepBase.moveToNewRoom = function() {
    var targetRoom = this.remember('targetRoom');

    if(targetRoom) {
        if(targetRoom != this.creep.room.name) {
            var exitDir = this.creep.room.findExitTo(targetRoom);
            var exit = this.creep.pos.findClosestByPath(exitDir);
            this.creep.moveTo(exit);
            return true;
        }
        else {
            //this.creep.moveTo(30,30);
            this.remember('targetRoom', false);
            this.remember('srcRoom', this.creep.room.name);
        }
    } else {
        return false;
    }

};

CreepBase.getAvoidedArea = function() {
    return true;
};

module.exports = CreepBase;