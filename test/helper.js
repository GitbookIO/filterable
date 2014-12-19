var assert = require('assert');
var hash = require('object-hash');
var Filterable = require("../lib");

global.assertObjects = function(o1, o2) {
    assert.equal(hash.sha1(o1), hash.sha1(o2));
};

global.filter = new Filterable({
    fields: {
        "name": {
            type: String
        },
        "email": {
            type: String
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
