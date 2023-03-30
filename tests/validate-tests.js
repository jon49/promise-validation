const o = require('ospec')
const { validate, ValidationResult, ValidationError } = require('../temp/index.js')

o.spec("validate", () => {
    o("catches error when resolved also passed through", async () => {
        // Arrange/Act
        let results = await validate([
            Promise.reject(new Error("Hello!")),
            () => Promise.resolve("never")
        ]).catch(x => x)

        // Assert
        o(results instanceof ValidationResult).equals(true)("Instance of ValidationResult")
        o(results.reasons.length).equals(1)("One error should exist.")

        o(results.reasons[0] instanceof ValidationError).equals(true)("Instance of ValidationError")
        o(results.reasons[0].reason.message).equals("Hello!")
    })

    o("returns resolved values when no error", async () => {
        // Arrange/Act
        let results = await validate([
            Promise.resolve({ i: "like cheese" }),
            Promise.resolve({ i: "like hotdogs"})
        ])

        // Assert
        o(results[0]).deepEquals({ i: "like cheese" })
        o(results[1]).deepEquals({ i: "like hotdogs" })
    })
})

