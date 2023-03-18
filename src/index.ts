export class AggregateError extends Error {
    errors: Error[]
    constructor(errors: Error[], message: string) {
        super(message)
        this.errors = errors
    }
}

export async function validate<T extends readonly unknown[] | readonly [unknown]>(promises: T):
    Promise<{ -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P] }> {
    const result = await Promise.allSettled(<Error[]><unknown>promises)
    const failed: Error[] = []
    for (const item of result)
        item.status === "rejected"
            && item.reason instanceof Error
            && failed.push(item.reason)
    if (failed.length > 0)
        return Promise.reject(new AggregateError(failed, "Validation Errors"))
    return <any>result.map((x: any) => x.value)
}

type Unwrap<T> =
	T extends Promise<infer U> ? U :
	T extends (...args: any) => Promise<infer U> ? U :
	T extends (...args: any) => infer U ? U :
	T

export async function validateObject<T extends { [Key in keyof T]: (value: any | undefined) => Promise<any> }>(original: any, validator: T) {
    if (!original) {
        return Promise.reject(new AggregateError([new Error("Object is undefined.")], "Validation Errors"))
    }
    let validatorKeys = Object.keys(validator)
    let validations = new Array(validatorKeys.length)
    let i = 0
    for (let validatorKey of validatorKeys) {
        // @ts-ignore
        validations[i++] = validator[validatorKey](original[validatorKey])
    }
    let xs = await validate(validations)
    i = 0
    let o = <any>{}
    for (let validatorKey of validatorKeys) {
        o[validatorKey] = xs[i++]
    }
    return <{ [Key in keyof T]: Unwrap<T[Key]> }>o
}

