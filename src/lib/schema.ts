"use strict";
export async function checkSchema(schema: any) {
    if (!schema.name)
        throw new Error("Invalid schema.name is missing.");
    if (!schema.primaryKey)
        throw new Error("Invalid schema schema.primaryKey is missing.");

}

function _enumCompositions(schema: any, path: string, cb: (prefix: string, Object: any) => void): void {
    cb(path, schema);
    Object.keys(schema.$properties).forEach(function(name) {
        var prop = schema.$properties[name];
        if (prop.type === "object") {
            let cp = path ? path + '.' + name : name;
            cb(cp, prop);
            _enumCompositions(prop, cp, cb);
        } else if (prop.type === "array" && prop.items.type === 'object') {
            let cp = path ? path + '.' + name : name;
            cb(cp, prop.items);
            _enumCompositions(prop.items, cp, cb);
        }
    });
}


export function indexesOfSchema(schema: any, addTextIndex: boolean) {
    var res = [];
    // add primary key
    res.push({ unique: true, fields: schema.primaryKey });
    // add Indexes
    _enumCompositions('', schema, function(prefix, cs) {
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
    });
    if (addTextIndex) {
        var textFields = [];
        _enumCompositions('', schema, function(prefix, cs) {
            Object.keys(cs.$properties).forEach(function(name) {
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
