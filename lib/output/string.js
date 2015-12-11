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

function escape(str) {
    str = String(str);

    return [].map.call(str, function escapeSpecialCharacter(char){
        if (char === '+'
            || char === '-'
            || char === '&'
            || char === '|'
            || char === '!'
            || char === '('
            || char === ')'
            || char === '{'
            || char === '}'
            || char === '['
            || char === ']'
            || char === '^'
            || char === '"'
            || char === '~'
            || char === '*'
            || char === '?'
            || char === ':'
            || char === '/'
            || char === '\\'
        ) return '\\' + char
        else return char
    }).join('')
}

function convert(query) {
    return _.map(query.groups, function(group) {
        var q = '';
        var isString = _.isString(group.value);
        var value = escape(group.value);

        q += PREFIX[group.type];

        if (group.field != query.opts.textField) {
            q += group.field+ ':' + OPERATORS[group.type] + (isString? JSON.stringify(value) : value);
        } else {
            q += value;
        }

        return q;
    }).join(' ');
}

module.exports = convert;
