var Cache = require('Cache');
var Constants = require('Constants');

var CONSTS = {
    BUY : "buy",
    SELL : "sell",
};

// TODO : check marketManager

function MarketManager(room, depositManager, roomMemoryObject) {
    this.room = room;
    this.depositManager = depositManager;
    this.storage = this.depositManager.storage;
    this.roomMemoryObject = roomMemoryObject;
    this.availableResources = this.getAvailableResources();

    if (!this.roomMemoryObject.currentOrder)
        this.roomMemoryObject.currentOrder = false;
}

MarketManager.prototype.getAvailableResources = function () {
    var resources = [];
    if (!this.depositManager.storage)
        return resources;

    for (var r in this.storage.store) {
        var resourceAmount = this.getAvailableResourceAmount(r);

        if (resourceAmount > Constants.MIN_DEAL_AMOUNT)
            resources.push(r);
    }

    return resources;
};

MarketManager.prototype.getAvailableResourceAmount = function (resource) {
    var enoughResource = Constants.MIN_MINERAL_TO_DEAL;
    if (resource == RESOURCE_ENERGY)
        enoughResource = Constants.MIN_ENERGY_TO_DEAL;

    return this.storage.store[resource] - enoughResource;
};

// parameters are opts
MarketManager.prototype.getOrders = function (orderType, resourceType, remainingAmount) {
    return Game.market.getAllOrders(
        {
            filter : (order) => {
                return filterOrders(order, orderType, resourceType, remainingAmount);
            }
        }
    );
};

// parameters are opts
MarketManager.prototype.getBuyOrders = function (resourceType, remainingAmount) {
    if (!remainingAmount)
        remainingAmount = Constants.MIN_ORDER_AMOUNT_TO_DEAL;

    return this.getOrders(CONSTS.BUY, resourceType, remainingAmount);
};

// parameters is opts
MarketManager.prototype.findBestBuyOrder = function (resourceType) {
    var buyOrders = [];

    var types = this.availableResources;
    if (resourceType) {
        types = [];
        types.push(resourceType);
    }

    for (var resource in types) {
        var orders = buyOrders.push(this.getBuyOrders(resource));
        if (orders.length > 0) {
            orders.sort(sortOrderByPrice);
            buyOrders.push(orders[0]);
        }
    }

    if (buyOrders.length > 0)
        buyOrders.sort(sortOrderByPrice);

    return buyOrders;
};

MarketManager.prototype.findOrder = function () {
    if (this.availableResources.length == 0 || !this.needNewOrder() || !this.room.storage)
        return false;

    var bestOrder = this.findBestBuyOrder();
    if (bestOrder.length == 0)
        return false;

    // TODO : check if it works like that
    var dealAmount = Math.max(Constants.MIN_DEAL_AMOUNT, this.getAvailableResourceAmount(bestOrder[0].resourceType));
    var cost = Game.market.calcTransactionCost(dealAmount, this.room.name, bestOrder[0].roomName);
    this.roomMemoryObject.currentOrder =
    {
        id : bestOrder.id,
        transferCost : cost
    };

    return bestOrder[0];
};

MarketManager.prototype.getOrderById = function (id) {
    return Game.market.getOrderById(id);
};

MarketManager.prototype.needNewOrder = function () {
    if (!this.room.storage) {
        this.roomMemoryObject.currentOrder = false;
        return false;
    }

    return this.roomMemoryObject.currentOrder == false;
};

MarketManager.prototype.getCurrentOrderTransferCost = function () {
    return this.roomMemoryObject.currentOrder.transferCost;
};

MarketManager.prototype.getCurrentOrder = function () {
    return this.getOrderById(this.roomMemoryObject.currentOrder.id);
};

MarketManager.prototype.deal = function () {
    var order = this.getCurrentOrder();
    var energyCost = 0;
    var resourceCost = 0;

    if (order.resourceType == RESOURCE_ENERGY)
        energyCost += Constants.MIN_DEAL_AMOUNT;
    else
        resourceCost += Constants.MIN_DEAL_AMOUNT;

    var terminal = this.room.terminal;
    if (terminal.store.energy >= this.getCurrentOrderTransferCost() + energyCost &&
        (resourceCost == 0 || (resourceCost > 0 && terminal.store[order.resourceType] >= resourceCost))) {
        if (Game.market.deal(order.id, Constants.MIN_DEAL_AMOUNT, this.room.name) == OK)
            this.roomMemoryObject.currentOrder = false;
    }
};

// private
function filterOrders(order, orderType, resourceType, remainingAmount) {
    if (orderType && order.type != orderType)
        return false;
    if (resourceType && order.resourceType != resourceType)
        return false;
    if (remainingAmount && order.remainingAmount != remainingAmount)
        return false;

    return true;
}

function sortOrderByPrice (order1, order2) {
    // order2 should be before order1 if it's price is higher - inverted sort
    return order2.price - order1.price;
}

module.exports = MarketManager;

//profiler setup
const profiler = require('profiler');
profiler.registerObject(MarketManager, 'MarketManager');