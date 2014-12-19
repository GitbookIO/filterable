var assert = require('assert');
var hash = require('object-hash');
var Filterable = require("../lib").Filterable;

global.assertObjects = function(o1, o2) {
    //console.log(o1, o2);
    assert.equal(hash.sha1(o1), hash.sha1(o2));
};

global.filter = new Filterable({
    tagsFields: ["description"],
    fields: {
        "name": {
            type: String
        },
        "mail": {
            type: String,
            alias: "email"
        },
        "username": {
            type: String
        },
        "followers": {
            type: Number
        },
        "stars": {
            type: Number
        }
    }
});
