var _ = require("lodash");

// Extract tags from a string
var extractTags = function(field) {
    if (_.isString(field)) {
        return field.toLowerCase().split(/[\s,.!?\-_]+/);
    } else if (_.isArray(field)) {
        return _.chain(field)
        .map(extractTags)
        .concat()
        .flatten()
        .value();
    } else {
        return [];
    }
};

module.exports = {
    extract: extractTags
};
