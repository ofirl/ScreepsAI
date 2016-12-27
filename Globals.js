
var globalVars = {
    //stats vars
    init: 0,
    creepsManagement: 0,
    rolesSetup : 0,
    defenseManager: 0,
    constructionManager: 0,
    depositManager: 0,
    resourceManager: 0,
    populationManager: 0,
    sumOfProfiler: 0,
};

function Globals() {
    this.vars = globalVars;
}

Globals.prototype.get = function (key) {
    return this.vars[key];
};

Globals.prototype.addValue = function (key, value) {
    this.vars[key] += value;
};

module.exports = Globals;