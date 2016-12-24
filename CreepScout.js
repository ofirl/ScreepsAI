var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    SCOUT: 1,
    HEAL: 2,
    ATTACK: 3,
};

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepScout, 'CreepScout');

function creepScout(creep, defenseManager, depositManager) {
    this.creep = creep;
    this.defenseManager = defenseManager;
    this.depositManager = depositManager;
}

creepScout.prototype.init = function() {
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.SCOUT);
    if (!this.remember('heal-room'))
        this.remember('heal-room', this.creep.room.name);

    if(this.moveToNewRoom() == true) {
        return;
    }

    if (!this.remember('scouting-route')) {
        for (let r in Memory.scoutingRoutes) {
            var route = Memory.scoutingRoutes[r];
            if (route[0] == this.creep.room.name) {
                this.remember('scouting-route', route.splice(0, 1));
                break;
            }
        }
    }

    this.scoutingRoute = this.remember('scouting-route');

    this.act();
};

creepScout.prototype.act = function() {
    if (this.defenseManager && this.defenseManager.hostileCreeps.length > 0)
        this.remember('last-action', ACTIONS.ATTACK);
    else if (this.creep.hits < this.creep.hitsMax)
        this.remember('last-action', ACTIONS.HEAL);
    else
        this.remember('last-action', ACTIONS.SCOUT);

    // hostiles detected
    if (this.remember('last-action') == ACTIONS.ATTACK) {
        var target = this.creep.pos.findClosestByRange(this.defenseManager.hostileCreeps);
        //this.creep.say('EXTERMINATE!');
        if (this.creep.attack(target) == ERR_NOT_IN_RANGE)
            this.creep.move(target);

        return;
    }
    // normal scouting
    if (this.remember('last-action') == ACTIONS.SCOUT) {
        var index = this.scoutingRoute.indexOf(this.creep.room.name);
        index++;

        if (index == this.scoutingRoute.length)
            index = 0;

        this.remember('targetRoom', this.scoutingRoute[index]);

        return;
    }
    // needs healing
    else {
        // got in a fight, won, take loot
        if (this.depositManager.droppedEnergy.length > 0) {
            var droppedEnergy = this.depositManager.droppedEnergy[0];
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(droppedEnergy);

            return;
        }

        if (this.creep.room != this.remember('heal-room')) {
            this.remember('targetRoom', this.remember('heal-room'));

            return;
        }

        var tower = this.creep.pos.findClosestByPath(this.defenseManager.towers);
        this.creep.move(tower);
    }
};

module.exports = creepScout;