export declare function checkSchema(schema: any): Promise<void>;
export declare function typeOfProperty(path: string, schema: any): string;
export declare function enumProps(value: any, schema: any, cb: (propName: string, propType: string, schema, value: any) => void): void;
export declare function indexesOfSchema(schema: any, addTextIndex: boolean): {
    text?: boolean;
    unique?: boolean;
    fields: string;
}[];
