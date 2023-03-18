const o = require('ospec')
const { validateObject } = require('../temp/index.js')
const { maybe, createString5, createIdNumber } = require('./object-validators.js')

const personValidator = {
    firstName: createString5("firstName"),
    id: createIdNumber("id"),
    lastName: maybe(createString5("lastName"))
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
        const results = await validateObject(value, personValidator).catch(x => x)

        // Assert
        o(results.errors.length).equals(2)("2 errors should exist")
        o(results.errors[0].message).equals("'firstName' must be less than 5 characters.")
        o(results.errors[1].message).equals("'id' must be 1 or greater. But was given '0'.")
    })

    o("returns resolved values when no error", async () => {
        // Arrange
        const value = {
            firstName: "Jay",
            id: 1,
            lastName: "Burns"
        }

        // Act
        const result = await validateObject(value, personValidator)

        // Assert
        o(result).deepEquals({ firstName: "Jay", id: 1, lastName: "Burns" })
    })
})


