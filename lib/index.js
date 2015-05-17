var _ = require("lodash");

var Query = require("./query");
var tags = require("./tags");
var mongoosePlugin = require("./mongoose");
var deasync = require("deasync");

var INDEXABLE_TYPES = [String, Array];

var Filterable = function(options) {
    this.options = _.defaults(options || {}, {
        'tags': "tags",
        'tagsFields': [],
        'fields': {}
    });
};

// Return a query object from a string
Filterable.prototype.query = function(s, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    options = _.defaults(options || {}, {

    });

    var q = new Query(s, this.options);
    
    return q.parse()
    .nodeify(callback);
};

Filterable.prototype.querySync = deasync(Filterable.prototype.query);

// Return tags for an object or a string/array
Filterable.prototype.tags = function(source) {
    // Convert to array if object
    if (_.isObject(source) && !_.isArray(source)) {
        var fields = _.chain(this.options.fields)
            .keys()

            // Filter type is indexable
            .filter(function(field) {
                return _.contains(INDEXABLE_TYPES, this.options.fields[field].type || String);
            }.bind(this))

            // Concat with other fields
            .concat(this.options.tagsFields)

            // Map alias
            .map(function(field) {
                if (!this.options.fields[field]) return field;
                return this.options.fields[field].alias || field;
            }.bind(this))

            .unique()
            .value();

        source = _.chain(fields)
        .map(function(field) {
            return tags.extract(source[field]);
        })
        .flatten()
        .concat()
        .compact()
        .uniq()
        .value();
    }

    return tags.extract(source);
};

module.exports = {
    Filterable: Filterable,
    mongoose: _.partial(mongoosePlugin, Filterable)
};
