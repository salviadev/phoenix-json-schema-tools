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
function _enumCompositions(schema, path, cb) {
    cb(path, schema);
    Object.keys(schema.$properties).forEach(function (name) {
        var prop = schema.$properties[name];
        if (prop.type === "object") {
            let cp = path ? path + '.' + name : name;
            cb(cp, prop);
            _enumCompositions(prop, cp, cb);
        }
        else if (prop.type === "array" && prop.items.type === 'object') {
            let cp = path ? path + '.' + name : name;
            cb(cp, prop.items);
            _enumCompositions(prop.items, cp, cb);
        }
    });
}
function indexesOfSchema(schema, addTextIndex) {
    var res = [];
    // add primary key
    res.push({ unique: true, fields: schema.primaryKey });
    // add Indexes
    _enumCompositions('', schema, function (prefix, cs) {
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
    });
    if (addTextIndex) {
        var textFields = [];
        _enumCompositions('', schema, function (prefix, cs) {
            Object.keys(cs.$properties).forEach(function (name) {
                var prop = cs.$properties[name];
                if (prop.$type === "string" && prop.capabilities && prop.capabilities.indexOf('search') >= 0) {
                    textFields.push(prefix ? prefix + '.' + name : name);
                }
            });
        });
        if (textFields.length)
            res.push({ text: true, fields: textFields.join(',') });
    }
    return res;
}
exports.indexesOfSchema = indexesOfSchema;
