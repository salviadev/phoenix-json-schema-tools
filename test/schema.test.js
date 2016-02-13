var assert = require("assert");
var pschema = require("../index").schema;
describe('Schema indexes', function () {
    describe('#indexes()', function () {
        it('Extract indexes', function () {
            var schema = {
                name: "users",
                primaryKey: "id",
                indexes: [
                    { fields: "firstName,lastName", unique: true },
                    { fields: "age" }
                ],
                properties: {
                    id: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string", capabilities: "searchable" },
                    age: { type: "number" },
                    address: {
                        type: "object",
                        indexes: [{ fields: "street" }],
                        properties: {
                            street: { type: "string", capabilities: "searchable" }

                        }
                    }
                }
            };
            var indexes = pschema.indexesOfSchema(schema, true);
            assert.deepEqual(indexes, [
                { fields: "id", unique: true },
                { fields: "firstName,lastName", unique: true },
                { fields: "age", unique: false },
                { fields: "address.street", unique: false },
                { fields: "lastName,address.street", text: true }
            ]);

        });

    });
    describe('#types()', function () {
        
        it('typeOf', function () {
            var   schema2 = {
            "name": "SPO_OPERATION",
            "title": "Opérations",
            "primaryKey": "idop",
            "indexes": [{
                "unique": false,
                "fields": "commune"
            }],
            "properties": {
                "idop": {
                    "title": "Id Op",
                    "type": "string"
                },
                "dtfinphase2": {
                    "type": "date"
                }
            }
        };
            var tt = pschema.typeOfProperty('dtfinphase2', schema2);
            assert.equal(tt, 'date');
            
        });

    });

})
