'use strict';

var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
var filterable = require('../../lib');

describe('FilterablePlugin', function () {

    before(function() {
        // this.uri = 'mongodb://localhost/filterable_test';
        // this.db = mongoose.createConnection(this.uri);
        this.init = function(options) {
            this.schema = mongoose.Schema({
                name: String,
                email: String,
                followers: Number,
                stars: Number,
                settings_language: String,
                detected_language: String,
                tags: [String],
                created: Date
            });

            if (options) {
                this.schema.plugin(filterable.mongoose, options);
            }
            this.Test = mongoose.model('test', this.schema);
        };

        this.cleanup = function() {
            // remove local references
            this.schema = null;
            this.test = null;

            // remove model from mongoose
            delete mongoose.models['test'];
            delete mongoose.modelSchemas['test'];
        };

    });

    describe('schema changes', function () {

      before(function() {
          this.init({
              fields: ['name']
          });
      });

      after(function () {
          this.cleanup();
      });

      it('should add a static .search() method to the schema', function() {
          expect(this.schema.statics.search).to.be.a('function');
      });

      it('should add a "tags" array to the schema, with default "[]"', function() {
          expect(this.schema.paths.tags).to.be.an('object');
          expect(this.schema.paths.tags.instance).to.equal('Array');
          expect(this.schema.paths.tags.options.default).to.deep.equal([]);
      });

    });

    describe('with invalid options', function () {

        before(function() {
            this.init();
        });

        after(function () {
            this.cleanup();
        });

        it('should detect invalid fields and throw an error', function () {
            expect(function() {
                this.schema.plugin(filterable.mongoose, {
                    fields: ["invalid"]
                });
            }.bind(this)).to.throw(/Invalid field: invalid/);
        });

    });

    describe('with fields only', function() {

        before(function() {
            this.init({
                fields: ['name', 'email', 'stars', 'created']
            });
        });

        after(function () {
            this.cleanup();
        });

        it('should handle single queries', function() {
            var query = this.Test.search('name:Sammy');
            expect(query._conditions).to.deep.equal({ name: 'Sammy' });
        });

        it('should handle multiple queries', function() {
            var query = this.Test.search('name:Sammy email:sammy@pesse.com');
            expect(query._conditions)
              .to.deep.equal({ name: 'Sammy', email: 'sammy@pesse.com' });
        });

        it('should handle negated queries', function() {
            var query = this.Test.search('NOT name:Sammy');
            expect(query._conditions)
              .to.deep.equal({ name: { '$ne': 'Sammy' } });
        });

        it('should gracefully ignore invalid fields', function() {
            var query = this.Test.search('name:Sammy invalid:value');
            expect(query._conditions).to.deep.equal({ name: 'Sammy' });
        });

    });

    describe('with fields and aliases', function() {

        before(function() {
            this.init({
                fields: ['mail', 'language'],
                alias: {
                  mail: 'email',
                  language: ['settings_language', 'detected_language']
                }
            });
        });

        after(function () {
            this.cleanup();
        });

        it('should handle a single alias', function() {
            var query = this.Test.search('mail:sammy@pesse.com');
            expect(query._conditions)
              .to.deep.equal({ email: 'sammy@pesse.com' });
        });

        it('should handle multiple aliases', function() {
            var query = this.Test.search('language:french');
            expect(query._conditions)
              .to.deep.equal({ '$or': [
                { settings_language: 'french' },
                { detected_language: 'french' }
              ]});
        });

    });

    describe('with field and middlewares', function() {

        before(function() {
            this.init({
                fields: ['email'],
                middlewares: {
                  email: function(value, next) {
                    setTimeout(function() {
                      next(null, value + '@pesse.com');
                    }, 10);
                  }
                }
            });
        });

        after(function () {
            this.cleanup();
        });

        it('should handle field with middleware', function() {
            var query = this.Test.search('email:sammy');
            expect(query._conditions)
              .to.deep.equal({ email: 'sammy@pesse.com' });
        });

    });

});
