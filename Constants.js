const minHarvesters  = 3;
const minUpgraders = 3;
const minBuilders = 1;
const minRepairers = 3;
const minWallRepairers = 0;

const ROLE_MINER = 'CreepMiner';
const ROLE_LORRY = 'CreepLorry';
const ROLE_CARRIER = 'CreepCarrier';
const ROLE_BUILDER = 'CreepBuilder';
const ROLE_LONG_DISTANCE_MINER = 'CreepLongDistanceMiner';
const ROLE_SCOUT = 'CreepScout';
const ROLE_CLAIMER = 'CreepClaimer';
const ROLE_HARVESTER = 'CreepHarvester';
const ROLE_SOLDIER = 'CreepSoldier';
const ROLE_HEALER = 'CreepHealer';
const ROLE_SHOOTER = 'CreepShooter';

const ROLE_DEFAULT = ROLE_BUILDER;

const MAX_MINER_WORK_PARTS = 5;
const MAX_LORRY_CARRY_PARTS = 4;

const SCOUT_TOUGH_PARTS = 10;
const SCOUT_CARRY_PARTS = 2;
const SCOUT_ATTACK_PARTS = 5;
const SCOUT_MOVE_PARTS = 10;
const SCOUT_SPAWN_TICKS = 1000;

const CLAIMER_CARRY_PARTS = 1;
const CLAIMER_MOVE_PARTS = 2;
const CLAIMER_WORK_PARTS = 1;

const HARVESTER_WORK_PARTS = 5;
const HARVESTER_CARRY_PARTS = 5;
const HARVESTER_MOVE_PARTS = 5;

const minerSupplyStructures = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const depositsStructures = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
const energyDepositsStructures = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];

const maxCreepCost = 1200;
const minBuildersForUpgraders = 2;
const minBuildersForDedicatedBuilders = 4;
const numDedicatedBuilders = 1;
const numUpgraders = 1;

const MIN_ENERGY_TO_DEAL = 400000; // 400K
const MIN_MINERAL_TO_DEAL = 100000; // 100K
const MIN_ORDER_AMOUNT_TO_DEAL = 2000; // 2K
const MIN_DEAL_AMOUNT = 1000; //1K
const CHECK_MARKET_DELAY = 50;

const MINER_DEATH_SPAWN_TICKS = 50;

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
    minBuildersForDedicatedBuilders : minBuildersForDedicatedBuilders,
    numDedicatedBuilders : numDedicatedBuilders,

    ROLE_DEFAULT : ROLE_DEFAULT,
    ROLE_MINER : ROLE_MINER,
    ROLE_LORRY: ROLE_LORRY,
    ROLE_CARRIER : ROLE_CARRIER,
    ROLE_BUILDER : ROLE_BUILDER,
    ROLE_LONG_DISTANCE_MINER : ROLE_LONG_DISTANCE_MINER,
    ROLE_SCOUT : ROLE_SCOUT,
    ROLE_CLAIMER : ROLE_CLAIMER,
    ROLE_HARVESTER : ROLE_HARVESTER,
    ROLE_SOLDIER : ROLE_SOLDIER,
    ROLE_HEALER : ROLE_HEALER,
    ROLE_SHOOTER : ROLE_SHOOTER,

    MAX_MINER_WORK_PARTS : MAX_MINER_WORK_PARTS,
    MAX_LORRY_CARRY_PARTS : MAX_LORRY_CARRY_PARTS,

    SCOUT_TOUGH_PARTS : SCOUT_TOUGH_PARTS,
    SCOUT_CARRY_PARTS : SCOUT_CARRY_PARTS,
    SCOUT_ATTACK_PARTS : SCOUT_ATTACK_PARTS,
    SCOUT_MOVE_PARTS : SCOUT_MOVE_PARTS,
    SCOUT_SPAWN_TICKS : SCOUT_SPAWN_TICKS,

    CLAIMER_CARRY_PARTS : CLAIMER_CARRY_PARTS,
    CLAIMER_MOVE_PARTS : CLAIMER_MOVE_PARTS,
    CLAIMER_WORK_PARTS : CLAIMER_WORK_PARTS,

    HARVESTER_WORK_PARTS : HARVESTER_WORK_PARTS,
    HARVESTER_CARRY_PARTS : HARVESTER_CARRY_PARTS,
    HARVESTER_MOVE_PARTS : HARVESTER_MOVE_PARTS,

    MIN_ENERGY_TO_DEAL : MIN_ENERGY_TO_DEAL,
    MIN_MINERAL_TO_DEAL : MIN_MINERAL_TO_DEAL,
    MIN_ORDER_AMOUNT_TO_DEAL : MIN_ORDER_AMOUNT_TO_DEAL,
    MIN_DEAL_AMOUNT : MIN_DEAL_AMOUNT,
    CHECK_MARKET_DELAY : CHECK_MARKET_DELAY,

    MINER_DEATH_SPAWN_TICKS : MINER_DEATH_SPAWN_TICKS,
};
