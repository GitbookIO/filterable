var assert = require('assert');

describe('Queries', function() {
    it('can convert =', function() {
        assertObjects(filter.query("name:Samy"), { name: 'Samy' });
    });

    it('can convert = with quotation marks', function() {
        assertObjects(filter.query('name:"Samy Pesse"'), { name: 'Samy Pesse' });
    });

    it('can convert NOT', function() {
        assertObjects(filter.query("NOT name:Samy"), { name: { '$ne': 'Samy' } });
    });

    it('can convert NOT (only next condition)', function() {
        assertObjects(filter.query("NOT name:Samy followers:10"), { name: { '$ne': 'Samy' }, followers: 10 });
    });

    it('can convert >=', function() {
        assertObjects(filter.query("followers:>=100"), { followers: { '$gte': 100 } });
    });

    it('can convert <=', function() {
        assertObjects(filter.query("followers:<=100"), { followers: { '$lte': 100 } });
    });

    it('can convert >', function() {
        assertObjects(filter.query("followers:>100"), { followers: { '$gt': 100 } });
    });

    it('can convert <', function() {
        assertObjects(filter.query("followers:<100"), { followers: { '$lt': 100 } });
    });

    it('can mix < and >', function() {
        assertObjects(filter.query("followers:<100 followers:>50"), { followers: { '$lt': 100, '$gt': 50 } });
    });

    it('can convert tags', function() {
        assertObjects(filter.query("cat"), { tags: { '$in': ["cat"] } });
    });

    it('can convert tags with quotation', function() {
        assertObjects(filter.query('"hello world"'), { tags: { '$in': ["hello", "world"] } });
    });

    it('can convert multiple tags', function() {
        assertObjects(filter.query("cat garfield"), { tags: { '$in': ["cat", "garfield"] } });
    });

    it('can invert tags', function() {
        assertObjects(filter.query("NOT cat"), { tags: { '$nin': ["cat"] } });
    });

    it('can handle tags and inverted tags', function() {
        assertObjects(filter.query("dogs NOT cat"), { tags: { '$in': ["dogs"], '$nin': ["cat"] } });
    });

    it('can handle multiple tags and inverted tags', function() {
        assertObjects(filter.query("dogs rataplan NOT cat NOT garfield"), { tags: { '$in': ["dogs", "rataplan"], '$nin': ["cat", "garfield"] } });
    });

    it('can handle tags and comparaison', function() {
        assertObjects(filter.query("cats followers:>10"), { tags: { '$in': [ 'cats' ] }, followers: { '$gt': 10 } });
        assertObjects(filter.query("followers:>10 cats"), { tags: { '$in': [ 'cats' ] }, followers: { '$gt': 10 } });
    });

    it('can alias field', function() {
        assertObjects(filter.query("mail:samypesse@gmail.com"), { email: "samypesse@gmail.com" });
    });

    it("can't accept invalid fields", function() {
        assertObjects(filter.query("followers:>=100 invalid:test"), { followers: { '$gte': 100 } });
    });

    it('can handle multiples conditions', function() {
        assertObjects(filter.query("followers:>=100 stars:<=200"), {
            followers: {
                '$gte': 100
            },
            stars: {
                '$lte': 200
            }
        });
    });

    it('can handle multiples conditions and tags', function() {
        assertObjects(filter.query("cat NOT dog followers:>=100 stars:<=200"), {
            tags: { '$in': [ 'cat' ], '$nin': [ 'dog' ] },
            followers: { '$gte': 100 },
            stars: { '$lte': 200 }
        });
    });

    it('can detect complete queries', function() {
        assert(filter.query("followers:>=100", {mongo: false}).isComplete());
    });

    it('can detect non-complete queries', function() {
        assert(!filter.query("followers:>=100 invalid:test", {mongo: false}).isComplete());
    });
});
