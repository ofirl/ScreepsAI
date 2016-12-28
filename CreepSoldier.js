var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    GATHER : 1,
    ATTACK : 2,
    KITE : 3,
    FLEE : 4,
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

    if(this.moveToNewRoom() == true) {
        return;
    }

    this.act();
};

creepSoldier.prototype.act = function () {
    if (this.defenseManager.hostileCreeps.length > 0) // TODO : add condition related to gathering
        this.remember('last-action', ACTIONS.ATTACK);
    if (this.creep.hits / this.creep.hitsMax < Constants.SOLDIER_FLEE_HP)
        this.remember('last-action', ACTIONS.FLEE);
};

module.exports = creepSoldier;