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
        o(results.messages.length).equals(2)("2 errors should exist")
        o(results.messages[0].name).equals("First Name")
        o(results.messages[0].message).equals("'First Name' must be less than 5 characters.")
        o(results.messages[1].message).equals("'ID' must be 1 or greater. But was given '0'.")
        o(results.messages[1].name).equals("ID")
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
        o(result.message).equals("Object is undefined.")
    })
})

