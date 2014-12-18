var _ = require("lodash");

var TYPES = {
    "!=": "$neq",
    "=": "$eq",
    ">": "$gt",
    ">=": "$gte",
    "<": "$lt",
    "<=": "$lte",
    "AND": "$not"
};

var convert = function(query) {
    var mongoQ = {};

    _.each(query, function(group) {
        mongoQ[group.field] = _.object([
            TYPES[group.type]
        ], [
            group.value
        ]);
    });

    return mongoQ;
};

module.exports = {
    convert: convert
};
