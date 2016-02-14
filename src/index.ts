"use strict";

import  {indexesOfSchema, checkSchema, enumProps, typeOfProperty, primaryKeyFields}  from './lib/schema';
export var schema = {
    indexesOfSchema: indexesOfSchema,
    checkSchema: checkSchema,
    enumProps: enumProps,
    typeOfProperty: typeOfProperty,
    pkFields: primaryKeyFields
}
