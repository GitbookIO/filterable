# Filterable

[![Build Status](https://travis-ci.org/SamyPesse/filterable.png?branch=master)](https://travis-ci.org/SamyPesse/filterable)
[![NPM version](https://badge.fury.io/js/filterable.svg)](http://badge.fury.io/js/filterable)

Filterable is a Node.JS module to parse [GitHub-like search queries](https://help.github.com/articles/search-syntax/), for example: `cats stars:>10`. It can generates MongoDB queries.

This module is perfect to integrates complex search (like GitHub) into your application. It integrates perfectly with MongoDB but can also easily be adapted to other databases.

### Queries

| Type | Example |
| ---- | ------- |
| Query for tags | `cat` |
| Query for multiple tags | `cat dog` |
| Exclude results containing a certain word | `cat NOT dog` |
| Query for equality | `username:Samypesse` |
| Query for values greater than another value | `stars:>10`, `stars:>=10` |
| Query for values less than another value | `stars:<100`, `stars:<=100` |
| Mix query for tags and condition | `cat stars:>10 stars:<100` |
| Filter qualifiers based on exclusion | `cats stars:>10 NOT language:javascript` |

### How to use it?

Install it using:

```
$ npm install filterable
```

Create a filterable type of object:

```js
var filterable = require("filterable");

var filterable = new filterable.Filterable({
    // Fields containing search tags (default is "tags")
    tags: "tags",

    // Fields to use for indexation, extend the Strign fields
    tagsFields: [ "description" ],

    // List of fields that are authorized
    fields: {
        name: {
            type: String
        },
        mail: {
            type: String,

            // In the MongoDB query, the field will be "email"
            alias: "email"
        },
        username: {
            type: String
        },
        followers: {
            type: Number
        }
    }
});
```

#### Queries

Generate a mongo query from a string:

```js
filterable.query("mail:samypesse@gmail.com");

{
    "email": {
        "$eq": "samypesse@gmail.com"
    }
}
```

```js
filterable.query("cats followers:>10");

{
    "tags": {
        "$in": ["cats"]
    },
    "followers": {
        "$gt": 10
    }
}
```

#### Tags

Generate list of tags from a text content. You'll just need to index this array of string into the object.

```js
filterable.tags("Hello World");

["hello", "world"]
```

Generate list of tags using searchable fields:

```js
filterable.tags({
    name: "Samy",
    username: "SamyPesse",
    description: "This is my profile"
});

["samy", "samypesse", "this", "is", "my", "profile"]
```

#### Mongoose

This module contains a plugin for [mongoose](https://github.com/LearnBoost/mongoose):

```js
userSchema.plugin(filterable.mongoose, {
    tags: "tags",
    fields: ["username", "name", "location"],
    tagsFields: [ "description" ]
    alias: {
        "username": "userId"
    }
});
```

