export declare var schema: {
    indexesOfSchema: (schema: any, addTextIndex: boolean) => {
        text?: boolean;
        unique?: boolean;
        fields: string;
    }[];
    checkSchema: (schema: any) => Promise<void>;
    enumProps: (value: any, schema: any, cb: (propName: string, propType: string, schema: any, value: any) => void) => void;
};
