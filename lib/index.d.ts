export declare class ValidationResult {
    reasons: ValidationError[];
    constructor(reasons: ValidationError[]);
}
export declare class ValidationError {
    reason: any;
    index: number;
    key: string;
    constructor(reason: any, index: number);
}
export declare function validate<T extends readonly unknown[] | readonly [unknown]>(promises: T): Promise<{
    -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P];
}>;
type Unwrap<T> = T extends Promise<infer U> ? U : T extends (...args: any) => Promise<infer U> ? U : T extends (...args: any) => infer U ? U : T;
export declare function validateObject<T extends {
    [Key in keyof T]: (value: any | undefined) => Promise<any>;
}>(original: any, validator: T): Promise<{ [Key in keyof T]: Unwrap<T[Key]>; }>;
export {};
