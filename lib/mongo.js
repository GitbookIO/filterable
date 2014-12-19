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

        // in
        else if (group.type == "in") {
            mongoQ[group.field] = mongoQ[group.field] || {};
            mongoQ[group.field]["$in"] = mongoQ[group.field]["$in"] || [];
            mongoQ[group.field]["$in"].push(group.value);
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
            throw "Invaldi type";
        }
    });

    return mongoQ;
};

module.exports = {
    convert: convert
};
