describe('Queries', function() {
    it('can convert =', function() {
        assertObjects(filter.query("name:Samy"), { name: 'Samy' });
    });

    it('can convert NOT', function() {
        assertObjects(filter.query("NOT name:Samy"), { name: { '$ne': 'Samy' } });
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

    it('can convert tags', function() {
        assertObjects(filter.query("cat"), { tags: { '$in': ["cat"] } });
    });

    it('can invert tags', function() {
        assertObjects(filter.query("NOT cat"), { tags: { '$nin': ["cat"] } });
    });

    it('can handle tags and inverted tags', function() {
        assertObjects(filter.query("dogs NOT cat"), { tags: { '$in': ["dogs"], '$nin': ["cat"] } });
    });

    it('can handle tags and comparaison', function() {
        assertObjects(filter.query("cats followers:>10"), { tags: { '$in': [ 'cats' ] }, followers: { '$gt': 10 } });
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
});
