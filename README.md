# Filterable

[![Build Status](https://travis-ci.org/SamyPesse/filterable.png?branch=master)](https://travis-ci.org/SamyPesse/filterable)
[![NPM version](https://badge.fury.io/js/filterable.svg)](http://badge.fury.io/js/filterable)

Filterable is a Node.JS module to parse [GitHub-like search queries](https://help.github.com/articles/search-syntax/), for example: `cats stars:>10`. It can generates MongoDB queries.

This module is perfect to integrates complex search (like GitHub) into your application. It integrates perfectly with MongoDB but can also easily be adapted to other databases.

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

Generate list of tags from a text content. You'll just need to index this array of string into the object.

```js
filterable.indexTags("Hello World");

["hello", "world"]
```

Generate list of tags using searchable fields:

```js
filterable.indexTags({
    name: "Samy",
    username: "SamyPesse",
    description: "This is my profile"
});

["samy", "samypesse", "this", "is", "my", "profile"]
```

