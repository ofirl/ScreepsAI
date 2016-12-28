
var globalVars = {
    //stats vars
    init: 0,
    creepsManagement: 0,
    rolesSetup : 0,
    creepFunc : 0,
    defenseManager: 0,
    constructionManager: 0,
    depositManager: 0,
    resourceManager: 0,
    populationManager: 0,
    sumOfProfiler: 0,
};

function Globals() {
    for (var n in globalVars)
        globalVars[n] = 0;
}

Globals.get = function (key) {
    return globalVars[key];
};

Globals.addValue = function (key, value) {
    globalVars[key] += value;
};

module.exports = Globals;