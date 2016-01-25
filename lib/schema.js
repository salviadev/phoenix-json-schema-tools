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
function validateDate(scheama, value, propName, options) {
}
function validateDateTime(scheama, value, propName, options) {
}
function _checkObj(value, schema, options) {
    let ps = Object.keys(schema.properties);
    ps.forEach(function (pn) {
        let ps = schema.properties[pn];
        switch (ps.type) {
            case "date":
                validateDate(ps, value, pn, options);
                break;
            case "datetime":
                validateDateTime(ps, value, pn, options);
                break;
        }
    });
}
function validateObject(value, schema, options) {
    _enumCompositions(schema, '', false, value, function (prefix, cs, cv, array) {
        if (cv === null || cv === undefined)
            return false;
        if (array) {
            cv.forEach(function (item) {
                _checkObj(item, schema, options);
            });
        }
        else {
            _checkObj(cv, schema, options);
        }
        return true;
    });
}
exports.validateObject = validateObject;
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
