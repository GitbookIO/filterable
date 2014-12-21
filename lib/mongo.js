var _ = require("lodash");

var TYPES = {
    "!=": "$ne",
    "=": "",
    ">": "$gt",
    ">=": "$gte",
    "<": "$lt",
    "<=": "$lte"
};

var convert = function(query) {
    var mongoQ = {};

    // Query apply to all
    var queryAll = {};

    // OR query
    var queryOr = {};

    // Append a group to the query
    var appendGroup = function(group, fn) {
        if (_.isArray(group.field)) {
            _.each(group.field, function(field) {
                var orId = field+group.type+group.value;
                queryOr[orId] = queryOr[orId] || {};
                queryOr[orId][field] = fn(queryOr[orId][field]);
            });
        } else {
            queryAll[group.field] = fn(queryAll[group.field]);
        }
    };

    // Convert all groups
    _.each(query, function(group) {
        // Equals
        if (group.type == "=") {
            appendGroup(group, _.constant(group.value));
        }

        // in or nin
        else if (group.type == "in" || group.type == "nin") {
            var mType = "$"+group.type;
            queryAll[group.field] = queryAll[group.field] || {};
            queryAll[group.field][mType] = queryAll[group.field][mType] || [];
            queryAll[group.field][mType].push(group.value);
            queryAll[group.field][mType] = _.flatten(queryAll[group.field][mType]);
        }

        // Other types
        else if (TYPES[group.type]) {
            appendGroup(group, function(value) {
                value = value || {};
                value[TYPES[group.type]] = group.value;
                return value;
            });
        }

        // Invalid type
        else {
            throw ("Invalid type for mongo query: "+group.type);
        }
    });

    // Apply queryAll to queryOr
    _.each(queryOr, function(or) {
        _.extend(or, queryAll);
    });

    mongoQ = queryAll;
    if (_.size(queryOr) > 0) mongoQ = {'$or': _.values(queryOr) };

    return mongoQ;
};

module.exports = {
    convert: convert
};
