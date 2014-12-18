var _ = require("lodash");
var query = require("./query");
var mongo = require("./mongo");

var Filterable = function(options) {
    this.options = _.defaults(options || {}, {

    });
};

// Return a query object from a string
Filterable.prototype.query = function(s) {
    var q = query.parse(s);
    q = mongo.convert(q);
    return q;
};

module.exports = Filterable;
