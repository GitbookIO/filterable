var _ = require("lodash");

module.exports = function FilterablePlugin(Filterable, schema, options) {
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
            var alias = options.alias[field];
            if (_.isArray(alias)) alias = _.first(alias);

            var schemaField = alias || field;
            schemaField = schema.path(schemaField);
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
    schema.statics.search = function(query, options) {
        options = _.defaults(options || {}, {
            ignoreEmpty: true
        });

        var mq = this.find({});

        var wrapQuery = function(func) {
            var _func = mq[func];

            mq[func] = function (conditions, callback) {
                var that = this;

                if ('function' == typeof conditions) {
                    callback = conditions;
                    conditions = {};
                } else if (conditions instanceof Document) {
                    conditions = conditions.toObject();
                }

                if (!callback) return _func.apply(this, arguments);

                filter.query(query, {}, function(err, q) {
                    if (err) return callback(err);

                    // if query is empty, return no results
                    if (!q.isComplete() && options.ignoreEmpty) return mq.find({'_id': {"$exists": false}});
                    else mq.find(q.toMongo());

                    _func.apply(that, arguments);
                });
            };
        };

        wrapQuery("find");
        wrapQuery("count");
        wrapQuery("exec");

        return mq;
    };

    // Update the tags on save
    schema.pre('save', function(next) {
        this[options.tags] = filter.tags(this);
        next()
    });
};
