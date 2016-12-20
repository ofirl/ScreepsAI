var Cache = require('Cache');
var Constants = require('Constants');
var CONSTS = {
	EMPTY_LEVEL: 0.5,
};

function Deposits(room) {
	this.cache = new Cache();
	this.room = room;
	this.deposits = this.room.find(
		FIND_MY_STRUCTURES,
		{
			filter: filterDeposits
		}
	);
    this.energyDeposits = this.room.find(
        FIND_STRUCTURES,
        {
            filter: filterEnergyContainers
        }
    );
    this.extensions = this.room.find(
        FIND_MY_STRUCTURES,
        {
            filter: filterExtensions
        }
    );
    this.droppedEnergy = this.room.find(FIND_DROPPED_ENERGY);
    this.droppedEnergy.concat(this.room.find(FIND_DROPPED_RESOURCES));
    
	this.spawns = [];
	for(var n in Game.spawns) {
		var s = Game.spawns[n];
		if(s.room == this.room)
			this.spawns.push(s);
	}
}

Deposits.prototype.getSpawnDeposit = function() {
	if(this.spawns.length != 0) {
		return this.spawns[0];
	}

	return false;
};

Deposits.prototype.getEmptyDeposits = function() {
	return this.cache.remember(
		'empty-deposits',
		function() {
			var empty = [];
            for(var i = 0; i < this.deposits.length; i++)
				if(this.isEmptyDeposit(this.deposits[i]))
					empty.push(this.deposits[i]);

			return empty;
		}.bind(this)
	);
};

Deposits.prototype.isEmptyDeposit = function(deposit) {
	if(deposit.energy / deposit.energyCapacity < CONSTS.EMPTY_LEVEL) {
		return true;
	}

	return false;
};

Deposits.prototype.getEmptyDepositOnId = function(id) {
	var resource = Game.getObjectById(id);

	if(resource && this.isEmptyDeposit(resource)) {
		return resource;
	}

	return false;
};

Deposits.prototype.getClosestEmptyDeposit = function(creep) {
	var emptyDeposits = this.getEmptyDeposits();
	var deposit = false;

	if(emptyDeposits.length != 0)
        deposit = creep.pos.findClosestByPath(emptyDeposits);

	if(!deposit)
        deposit = this.getSpawnDeposit();

	return deposit;
};

Deposits.prototype.energy = function() {
	return this.cache.remember(
		'deposits-energy',
		function() {
			var energy = 0;
			for(var i = 0; i < this.deposits.length; i++)
				energy += this.deposits[i].energy;

			for(var i = 0; i < this.spawns.length; i++)
				energy += this.spawns[i].energy;
            
			return energy;
		}.bind(this)
	);
};

Deposits.prototype.energyCapacity = function() {
	return this.cache.remember(
		'deposits-energy-capacity',
		function() {
			var energyCapacity = 0;
			for(var i = 0; i < this.deposits.length; i++)
				energyCapacity += this.deposits[i].energyCapacity;

			for(var i = 0; i < this.spawns.length; i++)
				energyCapacity += this.spawns[i].energyCapacity;

			return energyCapacity;
		}.bind(this)
	);
};

Deposits.prototype.getFullDeposits = function() {
	return this.cache.remember(
		'deposits-full',
		function() {
			var full = [];
			for(var i = 0; i < this.deposits.length; i++) {
				var deposit = this.deposits[i];
				if (deposit.energy == deposit.energyCapacity)
					full.push(deposit);
			}

			return full;
		}.bind(this)
	);
};

Deposits.prototype.getAvailableDepositsToWithdraw = function() {
    return this.cache.remember(
        'deposits-available-to-withdraw',
        function() {
            var full = [];
            
			for(var i = 0; i < this.energyDeposits.length; i++) {
				var deposit = this.energyDeposits[i];
				if (deposit.store.energy > 200)
					full.push(deposit);
			}

            return full;
        }.bind(this)
    );
};

Deposits.prototype.getAvailableExtensionsToWithdraw = function() {
    return this.cache.remember(
        'extensions-available-to-withdraw',
        function() {
            var full = [];

            for(var i = 0; i < this.extensions.length; i++) {
                var deposit = this.extensions[i];
                if (deposit.energy / deposit.energyCapacity > 0.2)
                    full.push(deposit);
            }

            return full;
        }.bind(this)
    );
};

Deposits.prototype.getAvailableContainersToDeposit = function() {
    return this.cache.remember(
        'containers-available-to-deposit',
        function() {
            var empty = [];
            for(var i = 0; i < this.energyDeposits.length; i++) {
                var deposit = this.energyDeposits[i];
                if (deposit.store.energy < deposit.storeCapacity)
                    empty.push(deposit);
            }

            return empty;
        }.bind(this)
    );
};

Deposits.prototype.getAvailableDepositsToDeposit = function() {
    return this.cache.remember(
        'deposits-available-to-deposit',
        function() {
            var empty = [];
			for(var i = 0; i < this.deposits.length; i++) {
				var deposit = this.deposits[i];
				if (deposit.energy < deposit.energyCapacity)
					empty.push(deposit);
			}

            return empty;
        }.bind(this)
    );
};

// PRIVATE
function filterDeposits(structure) {
	if(Constants.depositsStructures.indexOf(structure.structureType) != -1)
		return true;

	return false;
}

function filterEnergyContainers(structure) {
    if(Constants.energyDepositsStructures.indexOf(structure.structureType) != -1)
        return true;

    return false;
}

function filterExtensions(structure) {
    if(structure.structureType == STRUCTURE_EXTENSION)
        return true;

    return false;
}

module.exports = Deposits;
