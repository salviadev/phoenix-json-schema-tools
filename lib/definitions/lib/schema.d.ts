export declare module phoenixJsonSchema {
    function checkSchema(schema: any): Promise<void>;
    function indexesOfSchema(schema: any, addTextIndex: boolean): any[];
}
