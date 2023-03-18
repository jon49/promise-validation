export class AggregateError extends Error {
    errors;
    constructor(errors, message) {
        super(message);
        this.errors = errors;
    }
}
export async function validate(promises) {
    const result = await Promise.allSettled(promises);
    const failed = [];
    for (const item of result)
        item.status === "rejected"
            && item.reason instanceof Error
            && failed.push(item.reason);
    if (failed.length > 0)
        return Promise.reject(new AggregateError(failed, "Validation Errors"));
    return result.map((x) => x.value);
}
export async function validateObject(original, validator) {
    let validatorKeys = Object.keys(validator);
    let validations = new Array(validatorKeys.length);
    let i = 0;
    for (let validatorKey of validatorKeys) {
        // @ts-ignore
        validations[i++] = validator[validatorKey](original[validatorKey]);
    }
    let xs = await validate(validations);
    i = 0;
    let o = {};
    for (let validatorKey of validatorKeys) {
        o[validatorKey] = xs[i++];
    }
    return o;
}
