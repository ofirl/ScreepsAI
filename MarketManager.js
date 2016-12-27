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
    this.checkMarketCounter = this.roomMemoryObject.checkMarketCounter;
    if (!this.checkMarketCounter)
        this.roomMemoryObject.checkMarketCounter = 0;
    else if (this.roomMemoryObject.checkMarketCounter > 0)
        this.roomMemoryObject.checkMarketCounter--;

    if (!this.roomMemoryObject.currentOrder)
        this.roomMemoryObject.currentOrder = false;

    if (this.room.terminal && this.checkMarketCounter == 0) {
        var bestProfitOrder = this.findBestCreditProfitOrder(RESOURCE_ENERGY);
        //console.log(JSON.stringify(bestProfitOrder));
        this.roomMemoryObject.checkMarketCounter = Constants.CHECK_MARKET_DELAY;
    }
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
        (order) => {
            return filterOrders(order, orderType, resourceType, remainingAmount);
        }
    );
};

// parameters are opts
MarketManager.prototype.getBuyOrders = function (resourceType, remainingAmount) {
    if (!remainingAmount)
        remainingAmount = Constants.MIN_ORDER_AMOUNT_TO_DEAL;

    return this.getOrders(CONSTS.BUY, resourceType, remainingAmount);
};

MarketManager.prototype.getSellOrders = function (resourceType, remainingAmount) {
    if (!remainingAmount)
        remainingAmount = Constants.MIN_ORDER_AMOUNT_TO_DEAL;

    return this.getOrders(CONSTS.SELL, resourceType, remainingAmount);
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
    if (this.availableResources.length == 0 || !this.needNewOrder() || !this.room.storage || !this.room.terminal)
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

MarketManager.prototype.findBestCreditProfitOrder = function (resourceType) {
    if (!resourceType)
        resourceType = RESOURCE_ENERGY;

    var buyOrders = this.getBuyOrders(resourceType);
    var sellOrders = this.getSellOrders(resourceType);

    var bestProfit = 1000000;
    var bestBuyId;
    var bestSellId;

    for (var i = 0; i < buyOrders.length; i++) {
        var buyOrder = buyOrders[i];
        for (var j = 0; j < sellOrders.length; j++) {
            var sellOrder = sellOrders[j];
            var energyPerCredit = this.checkEnergyPerCreditProfit(buyOrder, sellOrder);
            if (energyPerCredit > 0 && energyPerCredit < bestProfit) {
                bestProfit = energyPerCredit;
                bestBuyId = buyOrder.id;
                bestSellId = sellOrder.id;
            }
        }
    }

    if (bestProfit && bestProfit > 0)
        return {buyId : bestBuyId, sellId : bestSellId, energyPerCredit : bestProfit};

    return false;
};

MarketManager.prototype.checkEnergyPerCreditProfit = function (buyOrder, sellOrder) {
    var energyCost = 0;
    energyCost += Game.market.calcTransactionCost(1000, this.room.name, sellOrder.roomName);
    energyCost += Game.market.calcTransactionCost(1000, this.room.name, buyOrder.roomName);

    var creditProfit = 0;
    creditProfit -= sellOrder.price * 1000;
    creditProfit += buyOrder.price * 1000;

    return energyCost / creditProfit;
};

// private
function filterOrders(order, orderType, resourceType, remainingAmount) {
    if (orderType && order.type != orderType)
        return false;
    if (resourceType && order.resourceType != resourceType)
        return false;
    if (remainingAmount && order.remainingAmount < remainingAmount)
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