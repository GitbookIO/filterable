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
            queryOr[group.originalField] = queryOr[group.originalField] || {};

            _.each(group.field, function(field) {
                queryOr[group.originalField][field] = queryOr[group.originalField][field] || {};
                queryOr[group.originalField][field] = fn(queryOr[group.originalField][field]);
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

    mongoQ = queryAll;
    if (_.size(queryOr) == 1) {
        mongoQ["$or"] = _.chain(queryOr)
        .values()
        .first()
        .map(function(value, field) {
            return _.object([field], [value]);
        })
        .value();
    }

    if (_.size(queryOr) > 1) {
        var finalOr = [];
        var added = [];

        _.each(queryOr, function(alias, originalField) {
            if (_.contains(added, originalField)) return;

            _.each(alias, function(values, alia) {
                _.each(_.omit(queryOr, originalField), function(otherFields, otherBaseField) {
                    _.each(otherFields, function(otherValue, otherField) {
                        var nOr = {};
                        nOr[alia] = values;
                        nOr[otherField] = otherValue;
                        finalOr.push(nOr);
                    });
                    added.push(otherBaseField);
                });
            });
        });
        mongoQ["$or"] = finalOr;
    }

    return mongoQ;
};

module.exports = {
    convert: convert
};
