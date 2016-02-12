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
function checkSchema(schema) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!schema.name)
            throw new Error("Invalid schema.name is missing.");
        if (!schema.primaryKey)
            throw new Error("Invalid schema schema.primaryKey is missing.");
    });
}
exports.checkSchema = checkSchema;
function _enumCompositions(schema, path, isArray, value, cb) {
    if (!cb(path, schema, value, isArray))
        return;
    Object.keys(schema.properties).forEach(function (name) {
        var prop = schema.properties[name];
        if (prop.type === "object") {
            let cp = path ? path + '.' + name : name;
            _enumCompositions(prop, cp, false, value ? value[name] : null, cb);
        }
        else if (prop.type === "array" && prop.items.type === 'object') {
            let cp = path ? path + '.' + name : name;
            _enumCompositions(prop.items, cp, true, value ? value[name] : null, cb);
        }
    });
}
function validateDate(scheama, value, propName) {
}
function validateDateTime(scheama, value, propName) {
}
function _type(schema) {
    let type = schema.type;
    if (type === "string") {
        if (schema.format === "date")
            type = "date";
        else if (schema.format === "datetime")
            schema = "datetime";
    }
    return type;
}
function _path2schema(path, schema) {
    let segments = (path || 'cs').split('.');
    let cs = schema;
    for (let segment of segments) {
        if (cs.type === 'array')
            cs = cs.items;
        cs = cs.properties ? cs.properties[segment] : null;
        if (!cs)
            return null;
    }
    return cs;
}
function typeOfProperty(path, schema) {
    let cs = _path2schema(path, schema);
    if (cs) {
        return _type(cs);
    }
    return '';
}
exports.typeOfProperty = typeOfProperty;
function enumProps(value, schema, cb) {
    _enumCompositions(schema, '', false, value, function (prefix, cs, cv, array) {
        if (cv === null || cv === undefined)
            return false;
        if (cs && cs.properties) {
            // enum all properties
            Object.keys(cs.properties).forEach(function (pn) {
                let cps = cs.properties[pn];
                if (array)
                    cv.forEach(elementitem => {
                        cb(pn, _type(cps), cps, cv);
                    });
                else
                    cb(pn, _type(cps), cps, cv);
            });
        }
    });
}
exports.enumProps = enumProps;
function indexesOfSchema(schema, addTextIndex) {
    var res = [];
    // add primary key
    if (schema.primaryKey) {
        res.push({ unique: true, fields: schema.primaryKey });
    }
    // add Indexes
    _enumCompositions(schema, '', false, null, function (prefix, cs, cv, array) {
        if (cs.indexes) {
            cs.indexes.forEach(function (ii) {
                let fields = ii.fields;
                if (prefix) {
                    fields = fields.split(',').map((item) => {
                        return prefix + '.' + item.trim();
                    }).join(',');
                }
                res.push({ unique: !!ii.unique, fields: fields });
            });
        }
        return true;
    });
    if (addTextIndex) {
        var textFields = [];
        _enumCompositions(schema, '', false, null, function (prefix, cs, cv, array) {
            Object.keys(cs.properties).forEach(function (name) {
                var prop = cs.properties[name];
                if (prop.type === "string" && prop.capabilities && prop.capabilities.indexOf('searchable') >= 0) {
                    textFields.push(prefix ? prefix + '.' + name : name);
                }
            });
            return true;
        });
        if (textFields.length)
            res.push({ text: true, fields: textFields.join(',') });
    }
    return res;
}
exports.indexesOfSchema = indexesOfSchema;
