"use strict";

export async function checkSchema(schema: any): Promise<void> {
    if (!schema.name)
        throw new Error("Invalid schema.name is missing.");
    if (!schema.primaryKey)
        throw new Error("Invalid schema schema.primaryKey is missing.");

}

function _enumCompositions(schema: any, path: string, isArray: boolean, value: any, cb: (prefix: string, cs: any, value: any, array: boolean) => boolean): void {
    if (!cb(path, schema, value, isArray)) return;
    Object.keys(schema.properties).forEach(function(name) {
        var prop = schema.properties[name];
        if (prop.type === "object") {
            let cp = path ? path + '.' + name : name;
            _enumCompositions(prop, cp, false, value ? value[name] : null, cb);
        } else if (prop.type === "array" && prop.items.type === 'object') {
            let cp = path ? path + '.' + name : name;
            _enumCompositions(prop.items, cp, true, value ? value[name] : null, cb);
        }
    });
}
function validateDate(scheama: any, value: any, propName: string, options: any) {

}

function validateDateTime(scheama: any, value: any, propName: string, options: any) {

}


function _checkObj(value: any, schema: any, options): void {
    let ps = Object.keys(schema.properties);
    ps.forEach(function(pn) {
        let ps = schema.properties[pn];
        switch (ps.type) {
            case "date":
                validateDate(ps, value, pn, options);
                break
            case "datetime":
                validateDateTime(ps, value, pn, options);
                break

        }
    });

}

export function validateObject(value: any, schema: any, options: any): void {
    _enumCompositions(schema, '', false, value, function(prefix: string, cs: any, cv: any, array: boolean): boolean {
        if (cv === null || cv === undefined) return false;
        if (array) {
            cv.forEach(function(item) {
                _checkObj(item, schema, options);
            });
        } else {
            _checkObj(cv, schema, options);
        }
        return true;
    });

}

export function indexesOfSchema(schema: any, addTextIndex: boolean): any[] {
    var res = [];
    // add primary key
    if (schema.primaryKey) {
        res.push({ unique: true, fields: schema.primaryKey });
    }
    // add Indexes
    _enumCompositions(schema, '', false, null, function(prefix: string, cs: any, cv: any, array: boolean): boolean {
        if (cs.indexes) {
            cs.indexes.forEach(function(ii) {
                let fields: string = ii.fields;
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
        _enumCompositions(schema, '', false, null, function(prefix: string, cs: any, cv: any, array: boolean): boolean {
            Object.keys(cs.properties).forEach(function(name) {
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

