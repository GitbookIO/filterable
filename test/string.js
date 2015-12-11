var assert = require('assert');
var filterable = require('../');

function assertQuery(q, opts, out) {
    if (!out) {
        out = opts;
        opts = null;
    }
    assert.deepEqual(filterable.Query(q, opts).parse().toString(), out);
}

describe.only('Query#toString', function() {
    it('can convert =', function() {
        assertQuery("name:Samy", 'name:"Samy"');
    });

    it('can convert =', function() {
        assertQuery("NOT name:Samy", 'NOT name:"Samy"');
    });

    it('can convert text', function() {
        assertQuery("Hello", 'Hello');
    });

    it('can convert text (multiple)', function() {
        assertQuery("Hello World", 'Hello World');
    });

});
