"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
var schema_1 = require('./lib/schema');
exports.schema = {
    indexesOfSchema: schema_1.indexesOfSchema,
    checkSchema: schema_1.checkSchema,
    enumProps: schema_1.enumProps,
    typeOfProperty: schema_1.typeOfProperty,
    pkFields: schema_1.primaryKeyFields,
    fields: schema_1.fields,
    fieldsByType: schema_1.fieldsByType
};
