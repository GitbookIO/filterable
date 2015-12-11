var assert = require('assert');
var filterable = require('../');

function assertQuery(q, out) {
    assert.deepEqual(filterable.Query(q).parse().toJSON(), out);
}

describe('Query#parse', function() {

    it('can convert = with quotation marks', function() {
        assertQuery('name:"Samy Pesse"', [
            {
                type: '=',
                field: 'name',
                value: 'Samy Pesse',
                originalField: 'name'
            }
        ]);
    });

});
