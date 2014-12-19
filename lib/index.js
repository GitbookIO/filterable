var _ = require("lodash");
var query = require("./query");
var mongo = require("./mongo");

var Filterable = function(options) {
    this.options = _.defaults(options || {}, {
        'tags': "tags"
    });
};

// Return a query object from a string
Filterable.prototype.query = function(s) {
    var q = query.parse(s, this.options);
    q = mongo.convert(q);
    return q;
};

module.exports = Filterable;
