var _ = require("lodash");

var TYPES = {
    "=": "$eq",
    ">": "$gt",
    ">=": "$gte",
    "<": "$lt",
    "<=": "$lte",
    "AND": "$not"
};

var convert = function(query) {
    return _.map(query, function(group) {
        if (group.type == "NOT") return {};

        return _.object([
            TYPES[group.type]
        ],
        [
            _.object([
                group.field,
            ], [
                group.value
            ])
        ]);
    });
};

module.exports = {
    convert: convert
};
