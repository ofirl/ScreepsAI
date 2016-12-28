
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

/*
    dupes snippet
 const names = ['Mike', 'Matt', 'Nancy', 'Adam', 'Jenny', 'Nancy', 'Carl']

 const count = names =>
 names.reduce((a, b) => 
 Object.assign(a, {[b]: (a[b] || 0) + 1}), {})

 const duplicates = dict =>
 Object.keys(dict).filter((a) => dict[a] > 1)

 console.log(count(names)) // { Mike: 1, Matt: 1, Nancy: 2, Adam: 1, Jenny: 1, Carl: 1 }
 console.log(duplicates(count(names))) // [ 'Nancy' ]
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