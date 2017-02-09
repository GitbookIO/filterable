# Filterable

[![Build Status](https://travis-ci.org/GitbookIO/filterable.png?branch=master)](https://travis-ci.org/GitbookIO/filterable)
[![NPM version](https://badge.fury.io/js/filterable.svg)](http://badge.fury.io/js/filterable)

Filterable is a Node.JS module to parse [GitHub-like search queries](https://help.github.com/articles/search-syntax/), for example: `cats stars:>10`. It can generate MongoDB or Elasticsearch queries.

This module is perfect for integrating complex search (like GitHub search) into your application. It integrates perfectly with MongoDB but can also easily be adapted to other databases.

### Queries

| Type | Example |
| ---- | ------- |
| Query for tags | `cat` |
| Query for multiple tags | `cat dog`, `"Hello World"` |
| Exclude results containing a certain word | `cat NOT dog` |
| Query for equality | `username:Samypesse`, `name:"Samy Pesse"` |
| Query for values greater than another value | `stars:>10`, `stars:>=10` |
| Query for values less than another value | `stars:<100`, `stars:<=100` |
| Mix query for tags and condition | `cat stars:>10 stars:<100` |
| Filter qualifiers based on exclusion | `cats stars:>10 NOT language:javascript` |

### How to use it?

Install it using:

```
$ npm install filterable
```

Parse a query string:

```js
var filterable = require("filterable");

var query = filterable.Query('cats stars:>10')
    .parse();
```

Output query for a database:

```js
var mongQuery = query.toMongo();
```

Filter and customize queries using `QueryBuilder`:

```js
var builder = filterable.QueryBuilder({
    // Field using when quering with text
    textField: 'description'
});

// Define mapping, by default all fields are accepted and piped as string
builder.field('stars', {
    type: Number
});

// Reject a field
builder.reject('email');


// Parse queries (return a Query object)
var q1 = builder.parse('Hello world')
var q2 = builder.parse('cats stars:>10');
```
