var Cache = require('Cache');

function Population(room) {
	this.cache = new Cache();
	this.room = room;
	this.population = 0;
	this.populationLevelMultiplier = 8;
	this.typeDistribution = {
		CreepMiner: {
            type : 'CreepMiner',
			total: 0,
			goalPercentage: 0.2,
			currentPercentage: 0,
			max: 5,
			minExtensions: 0
		},
        CreepLorry: {
            type : 'CreepLorry',
            total: 0,
            goalPercentage: 0.25,
            currentPercentage: 0,
            max: 2,
            minExtensions: 0
        },
		CreepBuilder: {
            type : 'CreepBuilder',
			total: 0,
			goalPercentage: 0.25,
			currentPercentage: 0,
			max: 15,
			minExtensions: 0
		},
        CreepCarrier: {
            type : 'CreepCarrier',
            total: 0,
            goalPercentage: 0.3,
            currentPercentage: 0,
            max: 15,
            minExtensions: 0
        },/*
		CreepHealer: {
            type : 'CreepHealer',
			total: 0,
			goalPercentage: 0.25,
			currentPercentage: 0,
			max: 2,
			minExtensions: 2
		},
		CreepSoldier: {
            type : 'CreepSoldier',
			total: 0,
			goalPercentage: 0.25,
			currentPercentage: 0,
			max: 5,
			minExtensions: 2
		},
		CreepShooter: {
            type : 'CreepShooter',
			total: 0,
			goalPercentage: 0.2,
			currentPercentage: 0,
			max: 3,
			minExtensions: 10
		}*/
	};

    this.creeps = this.room.find(FIND_MY_CREEPS);
    for(var i = 0; i < this.creeps.length; i++) {
        var creep = this.creeps[i];
        var creepType = creep.memory.role;
        if(!this.typeDistribution[creepType]) {
            this.typeDistribution[creepType] = createTypeDistribution(creepType);
        }
        this.typeDistribution[creepType].total++;
    }

    for(var t in this.typeDistribution) {
        var curr = this.typeDistribution[t];
        this.typeDistribution[t].currentPercentage = curr.total / this.getTotalPopulation();
    }
};

Population.prototype.goalsMet = function() {
    for(var t in this.typeDistribution) {
        var type = this.typeDistribution[t];
        Memory.test2 = type;
		if((type.currentPercentage < (type.goalPercentage - type.goalPercentage/4) && type.total < type.max) || type.total == 0  || type.total < type.max*0.75) {
			return false;
		}
	}

	return true;
};

Population.prototype.getType = function(type) {
	return this.typeDistribution[type];
};

Population.prototype.getTypes = function() {
	var types = [];
    for(var t in this.typeDistribution)
		types.push(this.typeDistribution[t]);

	return types;
};

Population.prototype.getTotalPopulation = function() {
	return this.creeps.length;
};

Population.prototype.getMaxPopulation = function() {
	return this.cache.remember(
		'max-population',
		function() {
			var population = 0;
            for(var t in this.typeDistribution)
                population += this.typeDistribution[t].max;

			return population;
		}.bind(this)
	);
};

Population.prototype.getNextExpectedDeath = function() {
	return this.cache.remember(
		'creep-ttl',
		function() {
			var ttl = 100000;
			for(var i = 0; i < this.creeps.length; i++) {
                var creep = this.creeps[i];
                if (creep.ticksToLive < ttl)
                    ttl = creep.ticksToLive;
            }

			return ttl;
		}.bind(this)
	);
};

Population.prototype.spawnedAllEssentialRoles = function() {
    return this.cache.remember(
        'all-roles',
        function() {
            if (this.typeDistribution.CreepMiner.total == 0)
                return false;
            if (this.typeDistribution.CreepLorry.total == 0)
                return false
            if (this.typeDistribution.CreepCarrier.total == 0)
                return false;

            return true;
        }.bind(this)
    );
};
        
module.exports = Population;

// Private

function createTypeDistribution(creepType) {
	return {
        type : creepType,
		total: 0,
		goalPercentage: 0.1,
		currentPercentage: 0,
		max: 5
	};
};
