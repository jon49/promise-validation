const o = require('ospec')
const { validateObject } = require('../temp/index.js')
const { maybe, createString5, createIdNumber } = require('./object-validators.js')

const personValidator = {
    firstName: createString5("First Name"),
    id: createIdNumber("ID"),
    lastName: maybe(createString5("Last Name"))
}

o.spec("validateObject", () => {
    o("catches error when resolved also passed through", async () => {
        // Arrange
        const value = {
            firstName: "George",
            id: 0,
            lastName: "Burns"
        }

        // Act
        const results =
            await validateObject(value, personValidator)
            .catch(x => x)

        // Assert
        o(results.reasons.length).equals(2)("2 errors should exist")

        o(results.reasons[0].key).equals("firstName")
        o(results.reasons[0].reason).equals(`"First Name" must be less than 5 characters.`)

        o(results.reasons[1].key).equals("id")
        o(results.reasons[1].reason).equals(`"ID" must be 1 or greater. But was given '0'.`)
    })

    o("returns resolved values when no error", async () => {
        // Arrange
        const value = {
            firstName: "Jay",
            id: 1,
            lastName: "Burns",
        }

        // Act
        const result = await validateObject(value, personValidator)

        // Assert
        o(result).deepEquals({ firstName: "Jay", id: 1, lastName: "Burns" })
    })

    o("removes any extra properties", async () => {
        // Arrange
        const value = {
            firstName: "Jay",
            id: 1,
            lastName: "Burns",
            additionalProperty: "whatever"
        }

        // Act
        const result = await validateObject(value, personValidator)

        // Assert
        o(result.additionalProperty).equals(undefined)
    })

    o("null value returns error", async () => {
        // Arrange
        const value = null

        // Act
        const result = await validateObject(value, personValidator).catch(x => x)

        // Assert
        o(result.reason).equals("Object is undefined.")
    })
})

