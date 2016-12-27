
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
    var vars = globalVars;
}

Globals.get = function (key) {
    return this.vars[key];
};

Globals.addValue = function (key, value) {
    this.vars[key] += value;
};

module.exports = Globals;