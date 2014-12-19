var _ = require("lodash");

var TYPES = {
    "!=": "$ne",
    "=": "",
    ">": "$gt",
    ">=": "$gte",
    "<": "$lt",
    "<=": "$lte",
    "AND": "$not"
};

var convert = function(query) {
    var mongoQ = {};

    _.each(query, function(group) {
        // Equals
        if (group.type == "=") {
            mongoQ[group.field] = group.value;
        }

        // in or nin
        else if (group.type == "in" || group.type == "nin") {
            var mType = "$"+group.type;
            mongoQ[group.field] = mongoQ[group.field] || {};
            mongoQ[group.field][mType] = mongoQ[group.field][mType] || [];
            mongoQ[group.field][mType].push(group.value);
            mongoQ[group.field][mType] = _.flatten(mongoQ[group.field][mType]);
        }

        // Other types
        else if (TYPES[group.type]) {
            mongoQ[group.field] = _.object([
                TYPES[group.type]
            ], [
                group.value
            ]);
        }

        // Invalid type
        else {
            throw ("Invalid type for mongo query: "+group.type);
        }
    });

    return mongoQ;
};

module.exports = {
    convert: convert
};
