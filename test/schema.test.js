var assert = require("assert");
var indexesOfSchema = require("../index").indexesOfSchema;
describe('Schema indexes', function () {
    describe('#indexes()', function () {
        it('Extract indexes', function () {
        var schema = {
                name: "users",
                primaryKey: "id",
                indexes: [
                   {fields: "firstName,lastName", unique: true},
                   {fields: "age"}
                ],
                properties: {
                    id: {type: "string"},
                    firstName : {type: "string"},
                    lastName : {type: "string", capabilities: "searchable"},
                    age : {type: "number"},
                    address: {
                        type: "object",
                        indexes: [{fields: "street"}],
                        properties: {
                            street : {type: "string", capabilities: "searchable"}
                            
                        }
                    } 
                }
            };            
            var indexes = indexesOfSchema(schema, true);
            assert.deepEqual(indexes, [
                    {fields: "id", unique: true}, 
                    {fields: "firstName,lastName", unique: true}, 
                    {fields: "age", unique: false}, 
                    {fields: "address.street", unique: false},
                    {fields: "lastName,address.street", text: true}
                    ]);

        });
        
    });

})
