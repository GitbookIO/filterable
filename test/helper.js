var assert = require('assert');
var util = require('util');
var hash = require('object-hash');
var Filterable = require("../lib").Filterable;

global.assertObjects = function(o1, o2) {
    assert.equal(JSON.stringify(o1, null, 4), JSON.stringify(o2, null, 4))
    //assert.equal(hash.sha1(o1), hash.sha1(o2));
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
        },
        "language": {
            type: String,
            alias: ["settings_language", "detected_language"]
        },
        "views": {
            type: Number,
            alias: ["views1", "views2"]
        }
    }
});
