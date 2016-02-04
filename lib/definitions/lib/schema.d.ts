export declare function checkSchema(schema: any): Promise<void>;
export declare function validateObject(value: any, schema: any, options: any): void;
export declare function indexesOfSchema(schema: any, addTextIndex: boolean): {
    text?: boolean;
    unique?: boolean;
    fields: string;
}[];
