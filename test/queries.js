describe('Queries', function() {
    it('can convert =', function() {
        assertObjects(filter.query("name:Samy"), { name: { '$eq': 'Samy' } });
    });

    it('can convert NOT', function() {
        assertObjects(filter.query("NOT name:Samy"), { name: { '$neq': 'Samy' } });
    });

    it('can convert >=', function() {
        assertObjects(filter.query("followers:>=100"), { followers: { '$gte': 100 } });
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
