var _ = require("lodash");

var PREFIX = {
    "!=": "NOT ",
    "=": "",
    ">": "",
    ">=": "",
    "<": "",
    "<=": "",
    "in": "",
    "nin": "NOT "
};

var OPERATORS = {
    "!=": "",
    "=": "",
    ">": ">",
    ">=": ">=",
    "<": "<",
    "<=": "<=",
    "in": "",
    "nin": ""
};


function convert(query) {
    return _.map(query.groups, function(group) {
        var q = '';

        q += PREFIX[group.type];

        if (group.field != query.opts.textField) {
            q += group.field+ ':' + OPERATORS[group.type] + JSON.stringify(group.value);
        } else {
            q += group.value;
        }

        return q;
    }).join(' ');
}

module.exports = convert;
