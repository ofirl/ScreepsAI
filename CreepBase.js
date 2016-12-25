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
    var roomPath = this.remember('room-path');
    
    if (!targetRoom && roomPath)
        this.remember('targetRoom', roomPath[0]);

    // if i had a targetRoom
    if(targetRoom) {
        var moveRoom = false;
        // still not there
        if(targetRoom != this.creep.room.name) {
            moveRoom = true;
        }
        // got to targetRoom
        else {
            //this.creep.moveTo(30,30);
            var clearMemory = false;

            // don't have roomPath
            if (!roomPath) {
                clearMemory = true;
            }
            // have roomPath
            else {
                var index = roomPath.indexOf(this.creep.room.name);
                // got to the end of the path
                if (index == roomPath.length - 1) {
                    clearMemory = true;
                }
                // there is still a way to go
                else {
                    this.remember('targetRoom', roomPath[index + 1]);
                    moveRoom = true;
                }
            }

            // need to clear memory because i got to my destination
            if (clearMemory) {
                this.remember('targetRoom', false);
                this.remember('room-path', false);
                this.remember('srcRoom', this.creep.room.name);
                return false;
            }
        }

        // need to move to a new room
        if (moveRoom) {
            var exitDir = this.creep.room.findExitTo(targetRoom);
            var exit = this.creep.pos.findClosestByPath(exitDir);
            this.creep.moveToIfAble(exit);
            return true;
        }
    }
    else
        return false;
};

CreepBase.getAvoidedArea = function() {
    return true;
};

module.exports = CreepBase;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(CreepBase, 'CreepBase');