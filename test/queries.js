describe('Queries', function() {
    it('can convert =', function() {
        assertObjects(filter.query("name:Samy"), { name: { '$eq': 'Samy' } });
    });
    it('can convert NOT', function() {
        assertObjects(filter.query("NOT name:Samy"), { name: { '$neq': 'Samy' } });
    });
    it('can convert >=', function() {
        assertObjects(filter.query("followers:>=100"), { followers: { '$gte': '100' } });
    });
});
