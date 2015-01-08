var assert = require('assert');

var testQuery = function(query, expected, done) {
    filter.query(query, function(err, q) {
        if (err) return done(err);

        try {
            assertObjects(q.toMongo(), expected);
            done();
        } catch (e) {
            done(e);
        }
    });
};


describe('Queries', function(done) {
    it('can convert =', function(done) {
        testQuery("name:Samy", { name: 'Samy' }, done);
    });

    it('can convert = with quotation marks', function(done) {
        testQuery('name:"Samy Pesse"', { name: 'Samy Pesse' }, done);
    });

    it('can convert NOT', function(done) {
        testQuery("NOT name:Samy", { name: { '$ne': 'Samy' } }, done);
    });

    it('can convert NOT (only next condition)', function(done) {
        testQuery("NOT name:Samy followers:10", { name: { '$ne': 'Samy' }, followers: 10 }, done);
    });

    it('can convert >=', function(done) {
        testQuery("followers:>=100", { followers: { '$gte': 100 } }, done);
    });

    it('can convert <=', function(done) {
        testQuery("followers:<=100", { followers: { '$lte': 100 } }, done);
    });

    it('can convert >', function(done) {
        testQuery("followers:>100", { followers: { '$gt': 100 } }, done);
    });

    it('can convert <', function(done) {
        testQuery("followers:<100", { followers: { '$lt': 100 } }, done);
    });

    it('can mix < and >', function(done) {
        testQuery("followers:<100 followers:>50", { followers: { '$lt': 100, '$gt': 50 } }, done);
    });

    it('can convert tags', function(done) {
        testQuery("cat", { tags: { '$in': ["cat"] } }, done);
    });

    it('can convert tags with quotation', function(done) {
        testQuery('"hello world"', { tags: { '$in': ["hello", "world"] } }, done);
    });

    it('can convert multiple tags', function(done) {
        testQuery("cat garfield", { tags: { '$in': ["cat", "garfield"] } }, done);
    });

    it('can invert tags', function(done) {
        testQuery("NOT cat", { tags: { '$nin': ["cat"] } }, done);
    });

    it('can handle tags and inverted tags', function(done) {
        testQuery("dogs NOT cat", { tags: { '$in': ["dogs"], '$nin': ["cat"] } }, done);
    });

    it('can handle multiple tags and inverted tags', function(done) {
        testQuery("dogs rataplan NOT cat NOT garfield", { tags: { '$in': ["dogs", "rataplan"], '$nin': ["cat", "garfield"] } }, done);
    });

    it('can handle tags and comparaison', function(done) {
        testQuery("followers:>10 cats", { followers: { '$gt': 10 }, tags: { '$in': [ 'cats' ] } }, done);
    });

    it('can handle tags and comparaison (2)', function(done) {
        testQuery("cats followers:>10", { tags: { '$in': [ 'cats' ] }, followers: { '$gt': 10 } }, done);
    });

    it('can alias field', function(done) {
        testQuery("mail:samypesse@gmail.com", { email: "samypesse@gmail.com" }, done);
    });

    it("can't accept invalid fields", function(done) {
        testQuery("followers:>=100 invalid:test", { followers: { '$gte': 100 } }, done);
    });

    it('can handle multiples conditions', function(done) {
        testQuery("followers:>=100 stars:<=200", {
            followers: {
                '$gte': 100
            },
            stars: {
                '$lte': 200
            }
        }, done);
    });

    it('can handle multiples conditions and tags', function(done) {
        testQuery("cat NOT dog followers:>=100 stars:<=200", {
            tags: { '$in': [ 'cat' ], '$nin': [ 'dog' ] },
            followers: { '$gte': 100 },
            stars: { '$lte': 200 }
        }, done);
    });

    it('can detect complete queries', function(done) {
        filter.query("followers:>=100", function(err, q) {
            if (err) return done(err);
            if (!q.isComplete()) return done(new Error("Should be completed"));
            done();
        });
    });

    it('can detect non-complete queries', function(done) {
        filter.query("followers:>=100 invalid:test", function(err, q) {
            if (err) return done(err);
            if (q.isComplete()) return done(new Error("Should not be completed"));
            done();
        });
    });

    it('can handle multiple alias for equalities', function(done) {
        testQuery("language:en", {
            '$or': [
                {
                    'settings_language': 'en'
                },
                {
                    'detected_language': 'en'
                }
            ]
        }, done);
    });

    it('can handle multiple alias with other conditions', function(done) {
        testQuery("language:en stars:100", {
            'stars': 100,
            '$or': [
                {
                    'settings_language': 'en'
                },
                {
                    'detected_language': 'en'
                }
            ]
        }, done);
    });

    it('can handle multiple alias for > and <', function(done) {
        testQuery("views:>10", {
            '$or': [
                {
                    'views1': {"$gt": 10}
                },
                {
                    'views2': {"$gt": 10}
                }
            ]
        }, done);
    });

    it('can handle multiple condition for multiple alias for > and <', function(done) {
        testQuery("views:>10 views:<100", {
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
        }, done);
    });

    it('can handle multiple fields with multiple alias', function(done) {
        testQuery("views:>10 language:en",
        {
            "$or":[
                {"views1":{"$gt":10},"settings_language":"en"},
                {"views1":{"$gt":10},"detected_language":"en"},
                {"views2":{"$gt":10},"settings_language":"en"},
                {"views2":{"$gt":10},"detected_language":"en"}
            ]
        }, done);
    });

    it('can handle $in for array', function(done) {
        testQuery("subjects:test",
        {
            "subjects": {
                "$in": ["test"]
            }
        }, done);
    });

    it('can handle $nin for array', function(done) {
        testQuery("NOT subjects:test",
        {
            "subjects": {
                "$nin": ["test"]
            }
        }, done);
    });

    it('can handle values middlewares', function(done) {
        testQuery("cofounder:aaron",
        {
            "associate": "_aaron"
        }, done);
    });
});
