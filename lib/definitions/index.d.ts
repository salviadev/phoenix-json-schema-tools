export declare var schema: {
    indexesOfSchema: (schema: any, addTextIndex: boolean) => {
        text?: boolean;
        unique?: boolean;
        fields: string;
    }[];
    checkSchema: (schema: any) => Promise<void>;
};
