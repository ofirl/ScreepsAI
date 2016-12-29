
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

var actionsQueue =
{
    move : [],
};
/*
{
    creep (=who) - creep object
    type (=what) - move/attack/heal/...
    target - if exists / needed
    opts - options for API method call
    room - room name
    accepted - true\false - by the resolver
}
 */

function Globals() {
}

Globals.ACTIONS = {
    MOVE : "move",
};

Globals.get = function (key) {
    return globalVars[key];
};

Globals.addValue = function (key, value) {
    globalVars[key] += value;
};

Globals.reset = function () {
    for (var a in actionsQueue)
        actionsQueue[a] = [];

    for (var n in globalVars)
        globalVars[n] = 0;
};

Globals.addActionToQueue = function (creep, type, target, opts) {
    actionsQueue[type].push(
        {
            creep : creep,
            target : target,
            room : creep.room.name,
            opts : opts,
        }
    );
};

Globals.resolveActionsQueue = function () {
    // resolve move actions
    resolveMoveActions(actionsQueue.move);
    // (later on) resolve other actions here
};

Globals.executeActionsQueue = function () {
    // resolve queue before execution
    Globals.resolveActionsQueue();

    // execute move actions
    executeMoveActions(actionsQueue.move);
    // (later on) execute other actions here
};

// private
function executeMoveActions (actions) {
    for (var a in actions) {
        var action = actions[a];
        action.creep.moveTo(action.target, action.opts);
    }
}

function resolveMoveActions (moveActions) {
    // calculating nextPos
    for (var a in moveActions) {
        var action = moveActions[a];

        var creepPosX = action.creep.pos.x;
        var creepPosY = action.creep.pos.y;

        var serializedPath = action.creep.memory._move.path;
        var deserializedPath = Room.deserializePath(serializedPath);
        var currentPathPos = deserializedPath.filter(
            (obj) =>
            {
                return obj.x == creepPosX && obj.y == creepPosY
            }
        );
        action.nextPos = getNextPos(currentPathPos);
    }

    // going over the queue and resolving
    for (var a in moveActions) {
        var action = moveActions[a];
        if (action.accepted != undefined)
            continue;

        var conflicts = [];
        for (var conflict in moveActions) {
            if (conflict.accepted != undefined)
                continue;

            if (isConflictingMove(action.nextPos, action.creep.room.name, conflict))
                conflicts.push(conflict);
        }

        resolveMoveConflicts(conflicts);
    }
}

// TODO : proper conflict resolver
function resolveMoveConflicts (conflicts){
    // accept the first one only
    for (var i = 0; i < conflicts.length; i++) {
        conflicts[i].accepted = i > 0;
    }
}

function isConflictingMove (masterPos, masterRoom, currentAction) {
    if (masterRoom != currentAction.creep.room.room)
        return false;

    return masterPos.x == currentAction.nextPos.x && masterPos.y == currentAction.nextPos.y;
}

// current = path object {x , y, dx, dy, direction}
function getNextPos (current) {
    var newX = current.x;
    var newY = current.y;

    switch (current.direction) {
        case TOP :
            newY--;
            break;
        case TOP_RIGHT :
            newY--;
            newX++;
            break;
        case RIGHT :
            newX++;
            break;
        case BOTTOM_RIGHT :
            newY++;
            newX++;
            break;
        case BOTTOM :
            newY++;
            break;
        case BOTTOM_LEFT :
            newY++;
            newX--;
            break;
        case LEFT :
            newX--;
            break;
        case TOP_LEFT :
            newY--;
            newX--;
            break;
    }

    return {x : newX, y : newY};
}

// TODO : add to profiler if used
function findDupes () {
    const names = ['Mike', 'Matt', 'Nancy', 'Adam', 'Jenny', 'Nancy', 'Carl'];

    const count = names =>
        names.reduce((a, b) =>
            Object.assign(a, {[b]: (a[b] || 0) + 1}), {});

    const duplicates = dict =>
        Object.keys(dict).filter((a) => dict[a] > 1);

    console.log(count(names)); // { Mike: 1, Matt: 1, Nancy: 2, Adam: 1, Jenny: 1, Carl: 1 }
    console.log(duplicates(count(names))); // [ 'Nancy' ]
}

module.exports = Globals;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(Globals, 'Globals');
profiler.registerFN(executeMoveActions, "Globals.ExecuteMoveActions");
profiler.registerFN(resolveMoveActions, "Globals.ResolveMoveActions");
profiler.registerFN(resolveMoveConflicts, "Globals.ResolveMoveConflicts");
profiler.registerFN(isConflictingMove, "Globals.IsConflictingMove");
profiler.registerFN(getNextPos, "Globals.GetNextPos");

