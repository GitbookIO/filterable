var _ = require("lodash");

module.exports = function filterable(Filterable, schema, options) {
    options = _.defaults(options || {}, {
        // Default field name for tags
        tags: "tags",

        // List of fields to use for filtering
        fields: [],

        // Tags fields
        tagsFields: [],

        // Map of alias
        alias: {}
    });

    var filter = new Filterable({
        tags: options.tags,
        tagsFields: options.tagsFields,
        fields: _.chain(options.fields)
        .map(function(field) {
            var schemaField = options.alias[field] || field;
            schemaField = schema.path(field);
            if (!schemaField) throw "Invalid field: "+field;

            return [
                field,
                {
                    type: schemaField.type,
                    alias: options.alias[field]
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
    schema.statics.search = function(query) {
        query = filter.query(query);
        return this.find(query);
    };

    // Update the tags on save
    schema.pre('save', function(next) {
        this[options.tags] = filter.tags(this);
        next()
    });
};
