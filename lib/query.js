var _ = require("lodash");
var Q = require("q");
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

var splitGroup = function(group) {
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
var parseGroup = function(group, options) {
    if (group == NOT_TYPE) {
        return {
            'type': NOT_TYPE
        };
    }

    var parts = splitGroup(group);
    if (parts.field === 'is') {
      var isField = options.fields[parts.query];
      if (isField.query) {
        parts = splitGroup(isField.query);
      } else {
        parts = {
          field: parts.query,
          type: '=',
          value: true
        };
      }
    }

    if (parts.length == 1) {
        parts.type = "in";
        parts.value = tags.extract(parts.field);
        parts.field = options.tags;
    }

    return {
        'type': parts.type,
        'field': parts.field,
        'value': parts.value
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
// And apply middlewares to values
var filterFields = function(groups, options) {
    return _.reduce(groups, function(prev, group) {
        return prev.then(function(_groups) {
            // Eliminate if non existant field
            if (!options.fields[group.field] && options.tags != group.field) return _groups;

            var baseField = group.field;
            var fieldDef = options.fields[group.field];

            return Q()
            .then(function() {
                if (!fieldDef) return;

                group.originalField = baseField;

                // Convert field if alias
                group.field = fieldDef.alias || baseField;

                // Convert type
                var type = (fieldDef.type || String);
                group.value = type(group.value);

                // Use async midlleware
                if (fieldDef.value) {
                    return Q.nfcall(fieldDef.value, group.value)
                    .then(function(_value) {
                        group.value = _value;
                    });
                }
            })
            .then(function() {
                if (_.isArray(group.value)) {
                    if (group.type == "=") group.type = "in";
                    if (group.type == "!=") group.type = "nin";
                }
            })
            .then(function() {
                if (group) _groups.push(group);
                return _groups;
            });
        });
    }, Q([]));
};


// Query representation
var Query = function(s, options) {
    this.options = options;
    this.groups = [];
    this.allGroups = [];
    this.query = s;
};

// Parse a query string
Query.prototype.parse = function() {
    var that = this;

    return Q()

    // Split in groups
    .then(function() {
        return splitInGroup(that.query);
    })

    // Parse groups
    .then(function(groups) {
        return _.map(groups, function(group) {
            return parseGroup(group, that.options);
        });
    })

    // Eliminate not
    .then(function(groups) {
        return eliminateNot(groups);
    })

    // Filter and convert "fields"
    .then(function(groups) {
        that.allGroups = groups;
        return filterFields(groups, that.options);
    })

    // Results
    .then(function(groups) {
        that.groups = groups;

        return that;
    });
};

// Convert to mongo
Query.prototype.toMongo = function() {
    return mongo.convert(this.groups);
};

// Return true if a query is complete
Query.prototype.isComplete = function() {
    return _.size(this.groups) > 0 && _.size(this.groups) == _.size(this.allGroups);
};

module.exports = Query;
