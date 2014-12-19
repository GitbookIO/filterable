var _ = require("lodash");

var query = require("./query");
var mongo = require("./mongo");
var tags = require("./tags");
var mongoosePlugin = require("./mongoose");

var INDEXABLE_TYPES = [String, Array];

var Filterable = function(options) {
    this.options = _.defaults(options || {}, {
        'tags': "tags",
        'tagsFields': [],
        'fields': {}
    });
};

// Return a query object from a string
Filterable.prototype.query = function(s, options) {
    options = _.defaults(options || {}, {
        mongodb: true
    });

    var q = query.parse(s, this.options);
    if (options.mongodb) q = mongo.convert(q);

    return q;
};

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

module.exports = Filterable;
module.exports.mongoose = _.bind(mongoosePlugin, Filterable);
