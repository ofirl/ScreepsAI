var Cache = require('Cache');

function Resources(room, population, roomMemoryObject) {
	this.cache = new Cache();
	this.room = room;
	this.population = population;
    this.roomMemoryObject = roomMemoryObject;
}

Resources.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
    var sources = [];
    for (var i = 0 ; i < this.population.creeps.length; i++)
    {
        var creep = this.population.creeps[i];
        var source = creep.memory['source'];
        if (source) {
            sources.push(source);
            //console.log(creep.name);
        }
    }
    //console.log(sources);
    for (var i = 0; i < srcs.length; i++) {
        var source = srcs[i];
        if (sources.indexOf(source.id) == -1)
            return source;
    }

    return false;
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};

Resources.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};

Resources.prototype.getSources = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(
				FIND_SOURCES, {
					filter: function(src) {
						var targets = src.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length == 0) {
						    return true;
						}

						return false;
					}
				}
			);
		}.bind(this)
	);
};

Resources.prototype.getLonelyLongDistanceMiningRoom = function() {
    var rooms = this.roomMemoryObject.longDistanceMining;
    var taken = [];
    for (var i = 0 ; i < this.population.creeps.length; i++)
    {
        var creep = this.population.creeps[i];
        var roomTaken = creep.memory['targetResourceRoom'];
        if (roomTaken)
            taken.push(roomTaken);
    }
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (taken.indexOf(room) == -1)
            return room;
    }

    return false;
};

module.exports = Resources;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(Resources, 'Resources');
