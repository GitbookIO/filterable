var assert = require("assert");

describe('Queries', function() {
    it('can convert =', function(done) {
        assert.equal(filter.query("name:Samy").name, "Samy");
    });
    it('can convert NOT', function(done) {
        assert.equal(filter.query("NOT name:Samy").name, "Samy");
    });
    it('can convert >=', function(done) {
        assert.equal(filter.query("followers:>=100").name, "Samy");
    });
});
