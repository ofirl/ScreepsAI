const minHarvesters  = 3;
const minUpgraders = 3;
const minBuilders = 1;
const minRepairers = 3;
const minWallRepairers = 0;

const ROLE_MINER = 'CreepMiner';
const ROLE_LORRY = 'CreepLorry';
const ROLE_CARRIER = 'CreepCarrier';
const ROLE_BUILDER = 'CreepBuilder';
const MAX_WORK_PARTS = 5;
const MAX_CARRY_PARTS = 3;

const minerSupplyStructures = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const depositsStructures = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
const energyDepositsStructures = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];

const maxCreepCost = 1200;
const minBuildersForUpgraders = 2;
const numUpgraders = 1;

module.exports = {
    minHarvesters : minHarvesters,
    minUpgraders : minUpgraders,
    minBuilders : minBuilders,
    minRepairers : minRepairers,
    minWallRepairers : minWallRepairers,

    minerSupplyStructures : minerSupplyStructures,
    depositsStructures : depositsStructures,
    energyDepositsStructures : energyDepositsStructures,

    maxCreepCost : maxCreepCost,
    minBuildersForUpgraders : minBuildersForUpgraders,
    numUpgraders : numUpgraders,

    ROLE_MINER : 'CreepMiner',
    ROLE_LORRY: 'CreepLorry',
    ROLE_CARRIER : 'CreepCarrier',
    ROLE_BUILDER : 'CreepBuilder',
    MAX_WORK_PARTS : 5,
    MAX_CARRY_PARTS : 2,
};
