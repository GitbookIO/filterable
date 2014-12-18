


### How to use it?

Create a filterable type of object:

```
var Filterable = require("filterable");

var filterable = new Filterable({
    // List of fields that are authorized
    fields: {
        "name": {},
        "email": {},
        "username": {}
    }
});
```

Generate a query from a string:

```
var query = filterable.query("email:samypesse@gmail.com ");
```
