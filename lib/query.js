var _ = require("lodash");

// Split a string into an array of string (groups)
var splitInGroup = function(s) {
    var inparts;
    var parts = s.split(" ");
    var groups = [];
    var group = null;

    for (var i in parts) {
        inparts = parts[i].split(":");
        if (inparts.length > 1 && group) {
            groups.push(group);
            group = null;
        }

        group = _.compact([group, parts[i]]).join(" ");
    }

    groups.push(group);

    return groups;
};


module.exports = function(s) {
    var groups = splitInGroup(s);
    console.log(groups);

    return groups;
};
