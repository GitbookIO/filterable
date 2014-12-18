var _ = require("lodash");

var GROUP_DELIMITER = " ";
var FILTER_DELIMITER = ":";
var NOT_TYPE = "NOT";
var INVERT = {
    "=": "!=",
    ">=": "<=",
    ">": "<",
    "!=": "=",
    "<=": ">=",
    "<": ">"
};
var GROUP_TYPES = _.keys(INVERT);

// Split a string into an array of string (groups)
var splitInGroup = function(s) {
    var inparts;
    var parts = s.split(GROUP_DELIMITER);
    var groups = [];
    var group = null;

    for (var i in parts) {
        inparts = parts[i].split(FILTER_DELIMITER);
        if (inparts.length > 1 && group) {
            groups.push(group);
            group = null;
        }

        group = _.compact([group, parts[i]]).join(" ");
    }

    groups.push(group);

    return groups;
};

// Detect group type
var detectGroupType = function(group) {
    return _.find(GROUP_TYPES, function(type) {
        return group.indexOf(type) === 0;
    }) || "";
};

// Parse a group into an object representation
var parseGroup = function(group) {
    var parts = group.split(FILTER_DELIMITER);
    var field = parts[0];
    var query = parts.slice(1).join(FILTER_DELIMITER);
    var type = detectGroupType(query);
    var value = query.slice(type.length);
    type = type || "=";

    if (group == NOT_TYPE) {
        type = NOT_TYPE;
        field = null;
        value = null;
    }

    return {
        'type': type,
        'field': field,
        'value': value
    };
};

// Eliminate 'not' from groups
var eliminateNot = function(groups) {
    var invert = false;
    return _.chain(groups)
    .map(function(group) {
        if (group.type == NOT_TYPE) {
            invert = true;
            return null;
        }

        if (invert) group.type = INVERT[group.type];
        return group;
    })
    .compact()
    .value();
};

// Parse a query
var parse = function(s) {
    // Split in groups
    var groups = splitInGroup(s);

    // Parse groups
    groups = _.map(groups, parseGroup);

    // Eliminate not
    groups = eliminateNot(groups);

    console.log(groups);
    return groups;
};

module.exports = {
    'parse': parse
};
