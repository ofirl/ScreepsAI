const minHarvesters  = 3;
const minUpgraders = 3;
const minBuilders = 1;
const minRepairers = 3;
const minWallRepairers = 0;

const harvesterBody = [WORK, WORK, CARRY, MOVE];
const upgraderBody = [WORK,CARRY,MOVE, MOVE];
const builderBody = [WORK, WORK, CARRY, MOVE];
const repairerBody = [WORK, WORK, CARRY, MOVE];

const minerSupplyStructures = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const depositsStructures = [STRUCTURE_CONTAINER, STRUCTURE_EXTENSION];
const energyDepositsStructures = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];

const maxCreepCost = 2400;
const minBuildersForUpgraders = 2;
const numUpgraders = 1;

module.exports = {
    minHarvesters : minHarvesters,
    minUpgraders : minUpgraders,
    minBuilders : minBuilders,
    minRepairers : minRepairers,
    minWallRepairers : minWallRepairers,

    harvesterBody : harvesterBody,
    upgraderBody : upgraderBody,
    builderBody : builderBody,
    repairerBody : repairerBody,

    minerSupplyStructures : minerSupplyStructures,
    depositsStructures : depositsStructures,
    energyDepositsStructures : energyDepositsStructures,

    maxCreepCost : maxCreepCost,

    minBuildersForUpgraders : minBuildersForUpgraders,
    numUpgraders : numUpgraders,
};
