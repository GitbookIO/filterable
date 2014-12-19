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
        if (TYPES[group.type]) {
            mongoQ[group.field] = _.object([
                TYPES[group.type]
            ], [
                group.value
            ]);
        } else {
            mongoQ[group.field] = group.value;
        }
    });

    return mongoQ;
};

module.exports = {
    convert: convert
};
