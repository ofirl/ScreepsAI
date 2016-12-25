var Constants = require('Constants');
var Cache = require('Cache');
var ACTIONS = {
    HARVEST: 1,
    DEPOSIT: 2
};

function creepHarvester(creep, resourceManager, depositManager) {
    this.cache = new Cache();
    this.creep = creep;
    this.resourceManager = resourceManager;
    this.depositManager = depositManager;
    this.resource;
};

creepHarvester.prototype.init = function() {
    if(!this.remember('source')) {
        var src = this.resourceManager.mineral;
        if (src)
            this.remember('source', src.id);
    }
    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.HARVEST);

    if(this.moveToNewRoom() == true) {
        return;
    }

    this.resource = this.resourceManager.getResourceById(this.remember('source'));
    this.storage = this.depositManager.storage;
    if (this.resource)
        this.mineralType = this.resource.mineralType;

    this.act();
};

creepHarvester.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.HARVEST && this.creep.carry[this.mineralType] == this.creep.carryCapacity)
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep finished depositing
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.carry[this.mineralType] == undefined)
        this.remember('last-action', ACTIONS.HARVEST);

    // creep should harvest
    if (this.remember('last-action') == ACTIONS.HARVEST) {
        if (this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.resource);
    }
    // creep should deposit
    else {
        if (this.creep.transfer(this.storage, this.mineralType) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(this.storage);
    }
};

module.exports = creepHarvester;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepHarvester, 'CreepHarvester');