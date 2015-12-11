var assert = require('assert');
var filterable = require('../');

function assertQuery(q, opts, out) {
    if (!out) {
        out = opts;
        opts = null;
    }
    assert.deepEqual(filterable.Query(q, opts).parse().toMongo(), out);
}

describe('Query#toMongo', function() {

    it('can convert =', function() {
        assertQuery("name:Samy", { name: 'Samy' });
    });

    it('can convert = with quotation marks', function() {
        assertQuery('name:"Samy Pesse"', { name: 'Samy Pesse' });
    });

    it('can convert NOT', function() {
        assertQuery("NOT name:Samy", { name: { '$ne': 'Samy' } });
    });

    it('can convert NOT (only next condition)', function() {
        assertQuery("NOT name:Samy followers:10", { name: { '$ne': 'Samy' }, followers: 10 });
    });

    it('can convert >=', function() {
        assertQuery("followers:>=100", { followers: { '$gte': 100 } });
    });

    it('can convert <=', function() {
        assertQuery("followers:<=100", { followers: { '$lte': 100 } });
    });

    it('can convert >', function() {
        assertQuery("followers:>100", { followers: { '$gt': 100 } });
    });

    it('can convert <', function() {
        assertQuery("followers:<100", { followers: { '$lt': 100 } });
    });

    it('can mix < and >', function() {
        assertQuery("followers:<100 followers:>50", { followers: { '$lt': 100, '$gt': 50 } });
    });

    it('can convert tags', function() {
        assertQuery("cat", { tags: { '$in': ["cat"] } });
    });

    it('can convert tags with quotation', function() {
        assertQuery('"hello world"', { tags: { '$in': ["hello world"] } });
    });

    it('can convert multiple tags', function() {
        assertQuery("cat garfield", { tags: { '$in': ["cat", "garfield"] } });
    });

    it('can invert tags', function() {
        assertQuery("NOT cat", { tags: { '$nin': ["cat"] } });
    });

    it('can handle tags and inverted tags', function() {
        assertQuery("dogs NOT cat", { tags: { '$in': ["dogs"], '$nin': ["cat"] } });
    });

    it('can handle multiple tags and inverted tags', function() {
        assertQuery("dogs rataplan NOT cat NOT garfield", { tags: { '$in': ["dogs", "rataplan"], '$nin': ["cat", "garfield"] } });
    });

    it('can handle tags and comparaison', function() {
        assertQuery("followers:>10 cats", { followers: { '$gt': 10 }, tags: { '$in': [ 'cats' ] } });
    });

    it('can handle tags and comparaison (2)', function() {
        assertQuery("cats followers:>10", { tags: { '$in': [ 'cats' ] }, followers: { '$gt': 10 } });
    });

    it('can alias field', function() {
        assertQuery("mail:samypesse@gmail.com", { fields: { mail: { alias: 'email' } } }, { email: "samypesse@gmail.com" });
    });

    it("can't accept rejected fields", function() {
        assertQuery("followers:>=100 invalid:test", { rejected: ['invalid'] }, { followers: { '$gte': 100 } });
    });

    it('can handle multiples conditions', function() {
        assertQuery("followers:>=100 stars:<=200", {
            followers: {
                '$gte': 100
            },
            stars: {
                '$lte': 200
            }
        });
    });

    it('can handle multiples conditions and tags', function() {
        assertQuery("cat NOT dog followers:>=100 stars:<=200", {
            tags: { '$in': [ 'cat' ], '$nin': [ 'dog' ] },
            followers: { '$gte': 100 },
            stars: { '$lte': 200 }
        });
    });

    it('can handle multiple alias for equalities', function() {
        assertQuery("language:en", {
            fields: {
                language: {
                    alias: ['settings_language', 'detected_language']
                }
            }
        }, {
            '$or': [
                {
                    'settings_language': 'en'
                },
                {
                    'detected_language': 'en'
                }
            ]
        });
    });

    it('can handle multiple alias with other conditions', function() {
        assertQuery("language:en stars:100", {
            fields: {
                language: {
                    alias: ['settings_language', 'detected_language']
                }
            }
        }, {
            'stars': 100,
            '$or': [
                {
                    'settings_language': 'en'
                },
                {
                    'detected_language': 'en'
                }
            ]
        });
    });

    it('can handle multiple alias for > and <', function() {
        assertQuery("views:>10", {
            fields: {
                views: {
                    alias: ['views1', 'views2']
                }
            }
        }, {
            '$or': [
                {
                    'views1': {"$gt": 10}
                },
                {
                    'views2': {"$gt": 10}
                }
            ]
        });
    });

    it('can handle multiple condition for multiple alias for > and <', function() {
        assertQuery("views:>10 views:<100", {
            fields: {
                views: {
                    alias: ['views1', 'views2']
                }
            }
        }, {
            '$or': [
                {
                    'views1': {
                        "$gt": 10,
                        "$lt": 100
                    }
                },
                {
                    'views2': {
                        "$gt": 10,
                        "$lt": 100
                    }
                }
            ]
        });
    });

    it('can handle multiple fields with multiple alias', function() {
        assertQuery("views:>10 language:en", {
            fields: {
                views: {
                    alias: ['views1', 'views2']
                },
                language: {
                    alias: ['settings_language', 'detected_language']
                }
            }
        },
        {
            "$or":[
                {"views1":{"$gt":10},"settings_language":"en"},
                {"views1":{"$gt":10},"detected_language":"en"},
                {"views2":{"$gt":10},"settings_language":"en"},
                {"views2":{"$gt":10},"detected_language":"en"}
            ]
        });
    });

    it('can handle $in for array', function() {
        assertQuery("subjects:test", {
            fields: {
                subjects: {
                    type: Array
                }
            }
        },
        {
            "subjects": {
                "$in": ["test"]
            }
        });
    });

    it('can handle $nin for array', function() {
        assertQuery("NOT subjects:test", {
            fields: {
                subjects: {
                    type: Array
                }
            }
        },
        {
            "subjects": {
                "$nin": ["test"]
            }
        });
    });

    describe('with inverted operators', function() {
        it('can handle "NOT >"', function() {
            assertQuery('NOT stars:>10',
            {
                "stars": { "$lte": 10 }
            });
        });

        it('can handle "NOT <"', function() {
            assertQuery('NOT stars:<10',
            {
                "stars": { "$gte": 10 }
            });
        });

        it('can handle "NOT >="', function() {
            assertQuery('NOT stars:>=10',
            {
                "stars": { "$lt": 10 }
            });
        });

        it('can handle "NOT <="', function() {
            assertQuery('NOT stars:<=10',
            {
                "stars": { "$gt": 10 }
            });
        });
    });

    describe('with "is:" operator', function() {

        it('can handle "is:" for Booleans', function() {
            assertQuery('is:published', {
                fields: {
                    published: {
                        type: Boolean
                    }
                }
            },
            {
                "published": true
            });
        });

        it('can handle "NOT is:" for Booleans', function() {
            assertQuery('NOT is:published', {
                fields: {
                    published: {
                        type: Boolean
                    }
                }
            },
            {
                "published": false
            });
        });

        it('can handle "is:" for Booleans with "alias"', function() {
            assertQuery('is:admin', {
                fields: {
                    admin: {
                        alias: 'isAdmin',
                        type: Boolean
                    }
                }
            },
            {
                "isAdmin": true
            });
        });

        it('can handle "NOT is:" for Booleans with "alias"', function() {
            assertQuery('NOT is:admin', {
                fields: {
                    admin: {
                        alias: 'isAdmin',
                        type: Boolean
                    }
                }
            },
            {
                "isAdmin": false
            });
        });

        it('can handle "is:" with "query" (String)', function() {
            assertQuery('is:male', {
                fields: {
                    male: {
                        query: "gender:male",
                        type: Boolean
                    }
                }
            },
            {
                "gender": "male"
            });
        });

        it('can handle "NOT is:" with "query" (String)', function() {
            assertQuery('NOT is:male', {
                fields: {
                    male: {
                        query: "gender:male",
                        type: Boolean
                    }
                }
            },
            {
                "gender": { "$ne": "male" }
            });
        });

        it('can handle "is:" with "query" (Number)', function() {
            assertQuery('is:minor', {
                fields: {
                    minor: {
                        query: "age:<18",
                        type: Boolean
                    }
                }
            },
            {
                "age": { "$lt": 18 }
            });
        });

        it('can handle "NOT is:" with "query" (Number)', function() {
            assertQuery('NOT is:minor', {
                fields: {
                    minor: {
                        query: "age:<18",
                        type: Boolean
                    }
                }
            },
            {
                "age": { "$gte": 18 }
            });
        });

    });

});
