var _ = require("lodash");
var tags = require("./tags");
var mongo = require("./mongo");

/*
(?:         # non-capturing group
  [^\s"]+   # anything that's not a space or a double-quote
  |         #   or…
  "         # opening double-quote
    [^"]*   # …followed by zero or more chacacters that are not a double-quote
  "         # …closing double-quote
)+          # each mach is one or more of the things described in the group
*/
var GROUP_DELIMITER = /(?:[^\s"]+|"[^"]*")+/g;
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
var GROUP_TYPES = _.without(_.keys(INVERT), "in", "nin");


// Split a string into an array of string (groups)
var splitInGroup = function(s) {
    return s.match(GROUP_DELIMITER);
};

// Remove quotation marks
var removeQuotation = function(s) {
    return s.replace(/['"]+/g, '');
};

// Detect group type
var detectGroupType = function(group) {
    return _.find(GROUP_TYPES, function(type) {
        return group.indexOf(type) === 0;
    }) || "";
};

// Parse a group into an object representation
var parseGroup = function(group, options) {
    if (group == NOT_TYPE) {
        return {
            'type': NOT_TYPE
        };
    }


    var parts = group.split(FILTER_DELIMITER);
    var field = removeQuotation(parts[0]);
    var query = removeQuotation(parts.slice(1).join(FILTER_DELIMITER));
    var type = detectGroupType(query);
    var value = query.slice(type.length);
    type = type || "=";

    if (parts.length == 1) {
        type = "in";
        value = tags.extract(field);
        field = options.tags;
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

        if (invert) {
            group.type = INVERT[group.type];
            invert = false;
        }
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
            group.originalField = baseField;

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


// Query representation
var Query = function(q, options) {
    this.options = options;
    this.groups = [];
    this.complete = false;
    if (q) this.parse(q);
};

// Parse a query string
Query.prototype.parse = function(s) {
    // Split in groups
    var groups = splitInGroup(s);

    // Parse groups
    groups = _.map(groups, function(group) {
        return parseGroup(group, this.options);
    }.bind(this));

    // Eliminate not
    groups = eliminateNot(groups);

    // Filter and convert "fields"
    this.groups = filterFields(groups, this.options);
    this.complete = _.size(this.groups) > 0 && _.size(this.groups) == _.size(groups);

    return this.groups;
};

// Convert to mongo
Query.prototype.toMongo = function() {
    return mongo.convert(this.groups);
};

// Return true if a query is complete
Query.prototype.isComplete = function() {
    return this.complete;
};

module.exports = Query;
