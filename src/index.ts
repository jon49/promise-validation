export class ValidationResult {
    reasons: ValidationError[]
    reason: string
    constructor(reasons: ValidationError[] | string) {
        if (typeof reasons === "string") {
            this.reasons = []
            this.reason = reasons
        } else {
            this.reasons = reasons
            this.reason = ""
        }
    }
}

export class ValidationError {
    reason: any
    index: number
    key = ''
    constructor(reason: any, index: number) {
        this.reason = reason
        this.index = index
    }
    
}

export async function validate<T extends readonly unknown[] | readonly [unknown]>(promises: T):
    Promise<{ -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P] }> {
    const result = await Promise.allSettled(<any[]><unknown>promises)
    const failed: ValidationError[] = []

    for (let i = 0; i < result.length; i++) {
        let item = result[i]
        if (item.status === "rejected") {
            failed.push(new ValidationError(item.reason, i))
        }
    }

    if (failed.length > 0)
        return Promise.reject(new ValidationResult(failed))
    return <any>result.map((x: any) => x.value)
}

type Unwrap<T> =
	T extends Promise<infer U> ? U :
	T extends (...args: any) => Promise<infer U> ? U :
	T extends (...args: any) => infer U ? U :
	T

export async function validateObject<T extends { [Key in keyof T]: (value: any | undefined) => Promise<any> }>(original: any, validator: T) {
    if (!original) {
        return Promise.reject(new ValidationResult("Object is undefined."))
    }

    let validatorKeys = Object.keys(validator)
    let validations = new Array(validatorKeys.length)
    let i = 0

    for (let validatorKey of validatorKeys) {
        // @ts-ignore: types aren't working out.
        validations[i++] = validator[validatorKey](original[validatorKey])
    }

    return validate(validations)
    .then(xs => {
        i = 0
        let o = <any>{}
        for (let validatorKey of validatorKeys) {
            o[validatorKey] = xs[i++]
        }
        return <{ [Key in keyof T]: Unwrap<T[Key]> }>o
    })
    .catch((result: ValidationResult) => {
        for (let reason of result.reasons) {
            reason.key = validatorKeys[reason.index]
        }
        return Promise.reject(result)
    })

}

