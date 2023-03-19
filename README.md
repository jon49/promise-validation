# Promise Validation

Promise Validation in JavaScript library which uses promises in a
functional-like manner. It is light weight, composable, and really simple to
use.

## Installation

```
npm install promise-validation
```

Or just copy the file and paste it into your project.

## Top-level View

A composable way to validate and create objects. This is how you would create a
validator which will validate and transform your data to what you would like.

```typescript
const nameValidator = {
    firstName: createString25('First Name'),
    lastName: maybe(createString25('Last Name'))
}

const personValidator = {
    ...name,
    birthdate: createDate('Birthdate')
}
```

You can see how you can compose the validators to build new validators. You can
combine validators like `maybe` with `createString25` — this will say that the
string doesn't necessarily need to exist (it can be `null` or `undefined`) but
if it is something will validate that it is a string of maximum length of 25.
Then the name validator is composed into the person validator which adds the
birthdate validation.

Then when you pass it to the function to do the actual validation:

```typescript
const rawData = {
    firstName: "George",
    lastName: "Jungle",
    birthdate: "1967-09-09"
}

// No need to check anything about the person as you know it is a person and
// that person is there and the data just like you said it would be in the
// validator.
const person = await validateObject(rawData, personValidator)

console.log(person)
/*
{
    firstName: "George",
    lastName: "Jungle",
    birthdate: Date("1967-09-09")
}
*/
```

But what happens when the validation fails? Let us make one that fails for all
properties:

```typescript
const rawData = {
    lastName: "Jungle".repeat(5), // String length of 30
    birthdate: "1967-99-99"
}

// Returns x value in `catch` method. Normally you would catch this error higher
// up in the stack.
const failed = await validateObject(rawData, personValidator).catch(x => x)

console.log(failed)
/*
ValidationResult:
    message: "<This will have a value if the object is null>"
    messages:
        [
            ValidationMessage:
                name: "firstName"
                message: "'firstName' is undefined but is required."
            ValidationMessage:
                name: "lastName"
                message: "'lastName' is longer than 25."
            ValidationMessage:
                name: "birthdate"
                message: "'birthdate' is an invalid date."

        ]
*/
```

So, how would you normally do this?

```typescript
const person = validatePerson(data)
if (person == null) {
    return null
}
const firstName = person?.firstName ?? "No name"
```

Rather messy. But with the validation above you can know that if the async
function doesn't return an error that all your values are what they say they
are.

## More Details

So, how do we create the validation components?

```typescript
// Note that validation checks for an instance of an `Error` to be added to the
// list of failures. If it isn't an `Error` then it will be skipped.
class ValidationMessage {
    name: string
    message: string
    constructor(name: string, message: string) {
        this.message = `'${this.name}' ${this.message}`
        this.name = name
    }
}

function fail(name: string, message: string) {
    return Promise.reject(new ValidationMessage(name, message))
}

function required<T>(name: string, value: T) : Promise<T> {
    return !value ? fail(name, `is required but is falsey.`) : Promise.resolve(value)
}

async function createString(name: string, value: string, length: number) {
    const v = await required(name, value?.trim())
    return v.length <= length ? v : fail(name, `is longer than ${length} characters.`)
}

const createString25 =
    (name: string) =>
    (value: string | undefined) =>
        createString(name, value, 25)

const maybe =
    <T>(f: (val: T | undefined) => Promise<T>) =>
    (val: T | undefined) =>
        !val ? Promise.resolve(val) : f(val)

const createDate =
    (name: string) =>
    async (value: string | Date) => {
        let v = await required(name, value)
        if (v instanceof Date) {
            if (isNaN(+v)) {
                return fail(name, 'is not a valid date.')
            }
            return v
        }
        let d = new Date(v)
        if (isNaN(+d)) {
            return fail(name, `is not a valid date.`)
        }
        return d
    }
```

As you can see, you can build up all the different validations just like you
want to make them. They can be composable with high reuse of code in a
functional and declarative way. No need for `if` statements. Just a simple
async-await pattern gets you where you need to be!

## How to handle an array of data?

Glad you asked. You could do it like so:

```typescript
var results = Promise.all(data)
// OR if you want an aggregation
var results = validate(data)
// OR if you want partial results
var results = Promise.allSettled(data)
```

