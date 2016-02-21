"use strict";

import  {indexesOfSchema, checkSchema, enumProps, typeOfProperty, primaryKeyFields, fields, fieldsByType}  from './lib/schema';
export var schema = {
    indexesOfSchema: indexesOfSchema,
    checkSchema: checkSchema,
    enumProps: enumProps,
    typeOfProperty: typeOfProperty,
    pkFields: primaryKeyFields,
    fields: fields,
    fieldsByType: fieldsByType
}
