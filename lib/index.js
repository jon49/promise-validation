export class ValidationResult {
    messages;
    message;
    constructor(messages) {
        if (typeof messages === "string") {
            this.messages = [];
            this.message = messages;
        }
        else {
            this.messages = messages;
            this.message = "";
        }
    }
}
export async function validate(promises) {
    const result = await Promise.allSettled(promises);
    const failed = [];
    for (const item of result)
        item.status === "rejected" && failed.push(item.reason);
    if (failed.length > 0)
        return Promise.reject(new ValidationResult(failed));
    return result.map((x) => x.value);
}
export async function validateObject(original, validator) {
    if (!original) {
        return Promise.reject(new ValidationResult("Object is undefined."));
    }
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
