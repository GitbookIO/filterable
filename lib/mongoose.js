var _ = require("lodash");

var VALID_TYPES = ['String', 'Number', 'Array'];

module.exports = function FilterablePlugin(Filterable, schema, options) {
    options = _.defaults(options || {}, {
        // Default field name for tags
        tags: "tags",

        // List of fields to use for filtering
        fields: [],

        // Tags fields
        tagsFields: [],

        // Map of alias
        alias: {},

        // Map of values middleware
        middlewares: {}
    });

    var filter = new Filterable({
        tags: options.tags,
        tagsFields: options.tagsFields,
        fields: _.chain(options.fields)
        .map(function(field) {
            var alias = options.alias[field];
            if (_.isArray(alias)) alias = _.first(alias);

            var schemaField = alias || field;
            schemaField = schema.path(schemaField);
            if (!schemaField) throw "Invalid field: "+field;

            return [
                field,
                {
                    type: _.contains(VALID_TYPES, schemaField.instance)? schemaField.type : null,
                    alias: options.alias[field],
                    value: options.middlewares[field]
                }
            ];
        })
        .object()
        .value()
    })

    // Add field to schema to store tags
    schema.add(_.object(
        [options.tags],
        [{
            type: [String],
            default: []
        }]
    ));

    // Add static method to do a search
    schema.statics.search = function(query, options) {
        options = _.defaults(options || {}, {
            ignoreEmpty: true
        });

        var q = filter.querySync(query, {});

        return this.find(q.toMongo());
    };

    // Update the tags on save
    schema.pre('save', function(next) {
        this[options.tags] = filter.tags(this);
        next()
    });
};
