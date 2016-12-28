
var globalVars = {
    //stats vars
    init: 0,
    creepsManagement: 0,
    rolesSetup : 0,
    creepFunc : 0,
    defend: 0,
    constructionManager: 0,
    depositManager: 0,
    resourceManager: 0,
    populationManager: 0,
    sumOfProfiler: 0,
};

var actionsQueue = [];
/*
{
    who
    what
    where
}
 */

function Globals() {
}

Globals.get = function (key) {
    return globalVars[key];
};

Globals.addValue = function (key, value) {
    globalVars[key] += value;
};

Globals.reset = function () {
    actionsQueue = [];

    for (var n in globalVars)
        globalVars[n] = 0;
};

module.exports = Globals;