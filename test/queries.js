var assert = require("assert");

describe('Queries', function() {
    it('can convert equalities', function(done) {
        assert.equal(filter.query("name:Samy").name, "Samy");
    });
});
