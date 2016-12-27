
function Globals() {
    this.init = 0;
    this.creepsManagement = 0;
    // to make a diff
    this.defenseManager = 0;
    this.constructionManager = 0;
    this.depositManager = 0;
    this.resourceManager = 0;
    this.populationManager = 0;
    this.sumOfProfiler = 0;
}

Globals.prototype.get = function (key) {
    return this[key];
};

Globals.prototype.addValue = function (key, value) {
    this[key] += value;
};

module.exports = Globals;