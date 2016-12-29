
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
    actionsQueue : 0,
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
        console.log(action.creep.name + ' (x : ' + action.nextPos.x + ', y : ' + action.nextPos.y + ')');
    }
}

function resolveMoveActions (moveActions) {
    // calculating nextPos
    for (var a in moveActions) {
        var action = moveActions[a];

        var creepPosX = action.creep.pos.x;
        var creepPosY = action.creep.pos.y;

        if (!action.creep.memory._move) {
            action.creep.memory._move =
            {
                dest : {
                    x : action.target.pos.x,
                    y : action.target.pos.y,
                    room : action.target.pos.roomName
                },
                time : Game.time,
                path : Room.serializePath(action.creep.pos.findPathTo(action.target, action.opts)),
                room : action.creep.room.name,
            };
        }

        var serializedPath = action.creep.memory._move.path;
        var deserializedPath = Room.deserializePath(serializedPath);
        var currentPathPos = deserializedPath.filter(
            (obj) =>
            {
                return obj.x == creepPosX && obj.y == creepPosY
            }
        );

        action.nextPos = currentPathPos.length > 0 ? getNextPos(currentPathPos[0]) : deserializedPath[0];
    }

    // going over the queue and resolving
    for (var a in moveActions) {
        var action = moveActions[a];
        if (action.accepted != undefined)
            continue;

        var conflicts = [];
        for (var c in moveActions) {
            var conflict = moveActions[c];
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
        if (i > 0)
            console.log('conflict avoided : ' + conflicts[i].creep.name);
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
executeMoveActions = profiler.registerFN(executeMoveActions, 'Globals.ExecuteMoveActions');
resolveMoveActions = profiler.registerFN(resolveMoveActions, 'Globals.ResolveMoveActions');
resolveMoveConflicts = profiler.registerFN(resolveMoveConflicts, 'Globals.ResolveMoveConflicts');
isConflictingMove = profiler.registerFN(isConflictingMove, 'Globals.IsConflictingMove');
getNextPos = profiler.registerFN(getNextPos, 'Globals.GetNextPos');

