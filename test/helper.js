var Filterable = require("../lib");

global.filter = new Filterable({
    fields: {
        "name": {},
        "email": {},
        "username": {}
    }
});
