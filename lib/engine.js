var _ = require('lodash');

var GROUP_DELIMITER = /(?:[^\s"]+|"[^"]*")+/g;
var FILTER_DELIMITER = ":";
var NOT_TYPE = "NOT";
var INVERT = {
    "=": "!=",
    ">=": "<",
    ">": "<=",
    "!=": "=",
    "<=": ">",
    "<": ">=",
    "in": "nin",
    "nin": "in"
};
var GROUP_TYPES = _.without(_.keys(INVERT), "in", "nin");


// Split a string into an array of string (groups)
function splitInGroup(s) {
    return s.match(GROUP_DELIMITER);
}

// Remove quotation marks
function removeQuotation(s) {
    return s.replace(/['"]+/g, '');
}

// Detect group type
function detectGroupType(group) {
    return _.find(GROUP_TYPES, function(type) {
        return group.indexOf(type) === 0;
    }) || "";
};

// Split a group in {field,query,type,value}
function splitGroup(group) {
    var parts = group.split(FILTER_DELIMITER);
    var field = removeQuotation(parts[0]);
    var query = removeQuotation(parts.slice(1).join(FILTER_DELIMITER));
    var type = detectGroupType(query);
    var value = query.slice(type.length);

    return {
        length: parts.length,
        field: field,
        query: query,
        type: type || "=",
        value: value
    };
};

// Parse a group into an object representation
function parseGroup(group, options) {
    if (group == NOT_TYPE) {
        return {
            "type": NOT_TYPE
        };
    }

    var parts = splitGroup(group);
    if (parts.field === "is") {
        var isField = options.fields[parts.query];
        if (isField.query) {
            parts = splitGroup(isField.query);
        } else {
            parts = {
                field: parts.query,
                type: "=",
                value: true
            };
        }
    }

    if (parts.length == 1) {
        parts.type = "in";
        parts.value = parts.field;
        parts.field = options.textField;
    }

    return {
        "type": parts.type,
        "field": parts.field,
        "value": parts.value
    };
}


// Eliminate 'not' from groups
// Reverse next group
function eliminateNot(groups) {
    var invert = false;

    return _.chain(groups)
    .map(function(group) {
        if (group.type == NOT_TYPE) {
            invert = true;
            return null;
        }

        if (invert) {
            group.type = INVERT[group.type];
            invert = false;
        }
        return group;
    })
    .compact()
    .value();
}


// Filter groups to eliminate or convert fields (according to alias)
// And apply middlewares to values
function filterFields(groups, options) {
    return _.reduce(groups, function(_groups, group) {
        // Eliminate if non existant field
        if (_.contains(options.rejected || [], group.field)) return _groups;

        var baseField = group.field;
        var fieldDef = options.fields[group.field] || {};

        group.originalField = baseField;

        // Convert field if alias
        group.field = fieldDef.alias || baseField;

        // Convert type
        var type = (fieldDef.type || String);
        group.value = type(group.value);

        if (_.isArray(group.value)) {
            if (group.type == "=") group.type = "in";
            if (group.type == "!=") group.type = "nin";
        }


        if (group) _groups.push(group);
        return _groups;
    }, []);
}

module.exports = {
    splitInGroup: splitInGroup,
    removeQuotation: removeQuotation,
    detectGroupType: detectGroupType,
    splitGroup: splitGroup,
    parseGroup: parseGroup,
    eliminateNot: eliminateNot,
    filterFields: filterFields
};
