# Filterable

Filterable is a Node.JS module to parse GitHub like queries, for example: `cats stars:>10`. It can generates mongodb queries.

### How to install it?

```
$ npm install filterable
```

### How to use it?

Create a filterable type of object:

```js
var Filterable = require("filterable");

var filterable = new Filterable({
    // Fields containing search tags (defaukt is "tags")
    tags: "tags",

    // List of fields that are authorized
    fields: {
        "name": {
            type: String
        },
        "mail": {
            type: String,

            // In the MongoDB query, the field will be "email"
            alias: "email"
        },
        "username": {
            type: String
        },
        "followers": {
            type: Number
        }
    }
});
```

Generate a mongo query from a string:

```js
filterable.query("mail:samypesse@gmail.com");

> {
    "email": {
        "$eq": "samypesse@gmail.com"
    }
}
```

```
filterable.query("cats followers:>10");

> {
    "tags": {
        "$in": ["cats"]
    },
    "followers": {
        "$gt": 10
    }
}
```
