var _ = require('lodash');

var engine = require('./engine');
var toMongo = require('./output/mongo');
var toString = require('./output/string');

function Query(q, opts) {
    if (!(this instanceof Query)) return new Query(q, opts);

    this.querystring = q;

    this.allGroups = [];
    this.groups = [];

    this.opts = _.defaults(opts || {}, {
        textField: 'tags',
        fields: {},
        rejected: {}
    });
}

// Export the query as JSON
Query.prototype.toJSON = function() {
    return _.cloneDeep(this.groups);
};

// Export the query for MongoDB
Query.prototype.toMongo = function() {
    return toMongo(this);
};

// Export the query to Elastisearch
Query.prototype.toString = function() {
    return toString(this);
};

// Parse the query
Query.prototype.parse = function() {
    var that = this;

    this.allGroups = _.chain(engine.splitInGroup(that.querystring))
        .map(function(group) {
            return engine.parseGroup(group, that.opts);
        })
        .thru(engine.eliminateNot)
        .value();
    this.groups = engine.filterFields(this.allGroups, this.opts)

    return this;
};

// Return true if a query is complete
Query.prototype.isComplete = function() {
    return _.size(this.groups) > 0 && _.size(this.groups) == _.size(this.allGroups);
};

module.exports = Query;
