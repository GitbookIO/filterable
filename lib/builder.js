var _ = require('lodash');
var Query = require('./query');

function QueryBuilder(opts) {
    if (!(this instanceof QueryBuilder)) return new QueryBuilder(opts);

    this.q = q;
    this.opts = _.defaults(opts || {}, {
        textField: 'tags',
        fields: {},
        rejected: {}
    });
}

// Define a field
QueryBuilder.prototype.field = function(key, def) {
    this.opts.fields[key] = def;
    return this;
};

// Reject a field
QueryBuilder.prototype.reject = function(key) {
    this.opts.rejected.push(key);
    this.opts.rejected = _.unique(this.opts.rejected);
    return this;
};

// Parse the query
QueryBuilder.prototype.parse = function(q) {
    return Query(q, this.opts);
};


module.exports = QueryBuilder;
