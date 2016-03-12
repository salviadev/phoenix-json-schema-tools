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
function validateDate(scheama: any, value: any, propName: string) {

}

function validateDateTime(scheama: any, value: any, propName: string) {

}




function _type(schema): string {
    let type = schema.type;
    if (type === "string") {
        if (schema.format === "date")
            type = "date";
        else if (schema.format === "datetime")
            type = "datetime"
    }
    return type;

}

function _path2schema(path: string, schema: any): any {
    let segments = (path || 'cs').split('.');
    let cs = schema;
    for (let segment of segments) {
        if (cs.type === 'array')
            cs = cs.items;
        cs = cs.properties ? cs.properties[segment] : null;
        if (!cs) return null;
    }
    return cs;
}


export function primaryKeyFields(schema: any): string[] {
    return schema.primaryKey.split(',').map(function(item) {
        return item.trim();
    });
}

export function typeOfProperty(path: string, schema: any): string {
    let cs = _path2schema(path, schema);
    if (cs) {
        return _type(cs);
    }
    return '';
}

export function fields(schema: any): string[] {
    let res = [];
    if (schema.multiTenant)
        res.push('tenantId');
    _enumCompositions(schema, '', false, null, function(prefix, cs: any, cv: any, array) {
        if (cs && cs.properties) {
            // enum all properties
            Object.keys(cs.properties).forEach(function(pn) {
                res.push(prefix ? prefix + '.' + pn : pn);
            });
        }
        return true;
    });

    return res;
}

export function fieldsByType(schema: any, type: string): string[] {
    let res = [];
    _enumCompositions(schema, '', false, null, function(prefix, cs: any, cv: any, array) {
        if (cs && cs.properties) {
            // enum all properties
            Object.keys(cs.properties).forEach(function(pn) {
                let currentProp = cs.properties[pn];
                if (_type(currentProp) === type)
                    res.push(prefix ? prefix + '.' + pn : pn);
            });
        }
        return true;
    });
    return res;
}



export function enumProps(value: any, schema: any, cb: (propName: string, propType: string, schema, value: any) => void): void {
    _enumCompositions(schema, '', false, value, function(prefix: string, cs: any, cv: any, array: boolean): boolean {
        if (cv === null || cv === undefined) return false;
        if (cs && cs.properties) {
            // enum all properties
            Object.keys(cs.properties).forEach(function(pn) {
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


export function indexesOfSchema(schema: any, addTextIndex: boolean): { text?: boolean, unique?: boolean, fields: string }[] {
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

