var _ = require('lodash');

var TYPES = {
    '!=': '$ne',
    '=': '',
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    in: '$in',
    nin: '$nin'
};

function convert(query) {
    var mongoQ = {};

    // Query apply to all
    var queryAll = {};

    // OR query
    var queryOr = {};

    var queryAnd = [];

    var queryNot = [];

    // Append a group to the query
    function appendGroup(group, fn) {
        var obj = {};
        obj[group.field] = fn(group.value);
        queryAnd.push(obj);
    }

    // Convert all groups
    _.each(query.groups, function(group) {
        // Equals
        if (group.type == '=') {
            appendGroup(group, _.constant(group.value));
        } else if (group.type == 'in' || group.type == 'nin') {
            // in or nin
            var mType = '$' + group.type;
            // if (group.field === 'text') {
            //     group.value = new RegExp('\\b' + group.value, 'i')
            // }
            var obj = {};
            obj[group.field] = group.value;
            if (group.type == 'in') {
                queryAnd.push(obj);
            } else {
                queryNot.push(obj);
            }
        } else if (group.type === '!=' && group.value === true) {
            // simplify "!= true" to "= false"
            group.type = '=';
            group.value = false;
            appendGroup(group, _.constant(group.value));
        } else if (TYPES[group.type]) {
            // Other types
            appendGroup(group, function(value) {
                value2 = {};
                value2[TYPES[group.type]] = group.value;
                return value2;
            });
        } else {
            // Invalid type
            throw 'Invalid type for mongo query: ' + group.type;
        }
    });

    if (_.size(queryAnd) > 0) {
        mongoQ['$and'] = queryAnd;
    }

    if (_.size(queryNot) > 0) {
        mongoQ['$not'] = queryNot;
    }
    return mongoQ;
}

module.exports = convert;
