var _ = require("lodash");
var queryParser = require("./query");

var Filterable = function(options) {
    this.options = _.defaults(options || {}, {

    });
};

// Return a query object from a string
Filterable.prototype.query = function(s) {
    var query = queryParser(s);

    return query;
};

module.exports = Filterable;
