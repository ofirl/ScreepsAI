var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    GATHER : 1,
    BOOST : 2,
    ATTACK : 3,
    KITE : 4,
    FLEE : 5,
};

function creepSoldier(creep, defenseManager) {
    this.creep = creep;
    this.defenseManager = defenseManager;
}

creepSoldier.prototype.init = function () {
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.GATHER);
    if (!this.remember('heal-room'))
        this.remember('heal-room', this.creep.room.name);

    if (this.defenseManager && this.defenseManager.hostileCreeps.length > 0) {
        this.remember('last-action', ACTIONS.ATTACK);
        this.remember('targetRoom', false);
    }

    // must work, just spawned so the creep is adjacent to spawn
    if (!this.remember('spawn-id'))
        this.remember('spawn-id', this.creep.pos.findInRange(FIND_MY_SPAWNS, 1)[0].id);

    this.spawn = Game.getObjectById(this.remember('spawn-id'));

    if(this.moveToNewRoom() == true) {
        return;
    }

    this.act();
};

creepSoldier.prototype.act = function () {
    var healersInRange = this.creep.pos.findInRange(FIND_MY_CREEPS, 2,
        {
            filter : (c) => {
                return filterHealers(c, Constants.SOLDIER_MIN_TICKS_TO_ATTACK);
            }
        }
    );
    if (this.defenseManager.hostileCreeps.length > 0 && healersInRange.length > 1)
        this.remember('last-action', ACTIONS.ATTACK);
    if (this.creep.hits / this.creep.hitsMax < Constants.SOLDIER_FLEE_HP)
        this.remember('last-action', ACTIONS.FLEE);

    var lastAction = this.remember('last-action');

    // gathering
    if (lastAction == ACTIONS.GATHER) {
        if (this.creep.ticksToLive < Constants.SOLDIER_MIN_TICKS_TO_ATTACK) {
            if (this.spawn.renewCreep(this.creep) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(this.spawn);
        }
        else {
            if (!this.creep.pos.isNearTo(this.defenseManager.gatherPoint))
                this.creep.moveToIfAble(this.defenseManager.gatherPoint);
        }
    }
    // attacking
    else if (lastAction == ACTIONS.ATTACK) {

    }
    // flee
    else if (lastAction == ACTIONS.FLEE) {

    }
};

// private
function filterHealers (creep, remainingTicks) {
    if (!remainingTicks)
        remainingTicks = 0;

    return creep.memory.role == 'CreepHealer' && creep.ticksToLive > remainingTicks;
}

module.exports = creepSoldier;