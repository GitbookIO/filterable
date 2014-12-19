var _ = require("lodash");
var assert = require('assert');

describe('Tags', function() {
    it('can generate tags from a string', function() {
        assert(
            _.contains(filter.tags("This is a test"), "this")
        );
    });

    it('can generate tags from an array', function() {
        assert(
            _.contains(filter.tags(["This is a", "test"]), "test")
        );
    });

    it('can generate tags from an object', function() {
        assert(
            _.contains(filter.tags({
                name: "Samy",
                username: "SamyPesse",
                description: "This is my profile"
            }), "samy")
        );
    });

    it('can generate tags using extra fields', function() {
        assert(
            _.contains(filter.tags({
                name: "Samy",
                username: "SamyPesse",
                description: "This is my profile"
            }), "profile")
        );
    });

    it('can generate tags using alias', function() {
        assert(
            _.contains(filter.tags({
                name: "Samy",
                email: "samypesse@gmail.com"
            }), "samypesse@gmail")
        );
    });
});
