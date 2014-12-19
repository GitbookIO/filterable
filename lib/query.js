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
    "<": ">",
    "in": "nin",
    "nin": "in"
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
var parseGroup = function(group, options) {
    var parts = group.split(FILTER_DELIMITER);
    var field = parts[0];
    var query = parts.slice(1).join(FILTER_DELIMITER);
    var type = detectGroupType(query);
    var value = query.slice(type.length);
    type = type || "=";

    if (parts.length == 1) {
        type = "in";
        value = field;
        field = options.tags;
    }

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

// Filter groups to eliminate or convert fields (according to alias)
var filterFields = function(groups, options) {
    return _.chain(groups)
    .map(function(group) {
        // Eliminate if non existant field
        if (!options.fields[group.field] && options.tags != group.field) return null;

        var baseField = group.field;

        if (options.fields[group.field]) {
            // Convert field if alias
            group.field = options.fields[baseField].alias || baseField;

            // Convert type
            group.value = (options.fields[baseField].type || String)(group.value);
        }

        return group;
    })
    .compact()
    .value();
};

// Parse a query
var parse = function(s, options) {
    // Split in groups
    var groups = splitInGroup(s);

    // Parse groups
    groups = _.map(groups, function(group) {
        return parseGroup(group, options);
    });

    // Eliminate not
    groups = eliminateNot(groups);

    // Filter and convert "fields"
    groups = filterFields(groups, options);

    return groups;
};

module.exports = {
    'parse': parse
};
