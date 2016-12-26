var Constants = require('Constants');
var Cache = require('Cache');
var CONSTANTS = {
    PARALLEL_WALL_REPAIR : 3,
};
var ACTIONS = {
    DEPOSIT : 1,
    WITHDRAW : 2,
};

function creepCarrier(creep, constructionsManager, depositManager, defenseManager, marketManager) {
    this.creep = creep;
    this.constructionsManager = constructionsManager;
    this.depositManager = depositManager;
    this.defenseManager = defenseManager;
    this.marketManager = marketManager;
    this.currentOrder = this.marketManager.getCurrentOrder();
};

creepCarrier.prototype.init = function() {
    if (this.remember('previous-role')) {
        if (!this.defenseManager.isScoutNeeded()) {
            this.remember('role', this.remember('previous-role'));
            this.remember('previous-role', false);

            return;
        }
    }

    if (!this.remember('repair-wall'))
        this.remember('repair-wall', 0);

    if(!this.remember('srcRoom')) {
        this.remember('srcRoom', this.creep.room.name);
    }
    if (!this.remember('last-action'))
        this.remember('last-action', ACTIONS.WITHDRAW);
    if(this.moveToNewRoom() == true) {
        return;
    }

    //if(this.randomMovement() == false) {
    this.act();
    //}
};

creepCarrier.prototype.act = function() {
    // creep carry is full
    if (this.remember('last-action') == ACTIONS.WITHDRAW && this.creep.isFull())
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep ran out of energy
    if (this.remember('last-action') == ACTIONS.DEPOSIT && this.creep.isEmpty()) {
        this.remember('last-action', ACTIONS.WITHDRAW);
        this.remember('repair-wall', 0);
    }

    // picked up a resource, not energy
    if (this.creep.carry.energy != _.sum(this.creep.carry))
        this.remember('last-action', ACTIONS.DEPOSIT);

    // creep should withdraw energy
    if (this.remember('last-action') == ACTIONS.WITHDRAW) {
        // check for dropped energy
        var droppedEnergy = this.creep.pos.findClosestByPath(this.depositManager.droppedEnergy);
        if (droppedEnergy != null) {
            if (this.creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(droppedEnergy);

            return;
        }

        var resourceType = RESOURCE_ENERGY;
        if (this.currentOrder) {
            if (this.depositManager.terminal.store.energy >= this.marketManager.getCurrentOrderTransferCost())
                resourceType = this.currentOrder.resourceType;
        }
        else {
            var terminalResource = this.depositManager.getTerminalNotEnergyResource(); 
            if (terminalResource != RESOURCE_ENERGY) {
                target = this.creep.room.terminal;
                if (this.creep.withdraw(target, terminalResource) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(target);

                return;
            }
        }
        
        // creep not full withdraw energy
        var source = this.depositManager.storage;
        if (!source)
            source = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToWithdraw());

        if (source && this.creep.withdraw(source, resourceType) == ERR_NOT_IN_RANGE)
            this.creep.moveToIfAble(source);
    }
    // creep should deposit
    else {
        // creep carry energy
        if (this.creep.isFullOfEnergy()) {

            // find not full extensions/spawn
            var target = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToDeposit());
            if (target != null) {
                if (this.creep.emptyCarry(target) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(target);

                return;
            }

            // find not full towers
            target = this.creep.pos.findClosestByPath(this.constructionsManager.getNotFullTowers());
            if (target != null) {
                if (this.creep.emptyCarry(target) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(target);

                return;
            }

            // find damaged walls
            target = this.constructionsManager.getDamagedWalls();
            if (target != null) {
                var newWallNeeded = false;
                var wallId = this.remember('repair-wall');

                if (wallId != 0) {
                    target = this.constructionsManager.getConstructionSiteById(wallId);
                    if (target == null || (target && target.hits == target.hitsMax))
                        newWallNeeded = true;
                }
                else
                    newWallNeeded = true;

                if (newWallNeeded) {
                    var random = Math.floor(Math.random() * Math.min(CONSTANTS.PARALLEL_WALL_REPAIR, target.length));
                    target = target[random];
                    this.remember('repair-wall', target.id);
                }

                if (this.creep.repair(target) == ERR_NOT_IN_RANGE)
                    this.creep.moveToIfAble(target);

                return;
            }

            // upgrade controller - if happens i'm in a very good shape
            if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(this.creep.room.controller);
        }
        // creep carry resource
        else {
            var source = this.depositManager.storage;
            if (!source)
                source = this.creep.pos.findClosestByPath(this.depositManager.getAvailableDepositsToWithdraw());

            if (source && this.creep.emptyCarry(source) == ERR_NOT_IN_RANGE)
                this.creep.moveToIfAble(source);
        }
    }
};

module.exports = creepCarrier;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(creepCarrier, 'CreepCarrier');