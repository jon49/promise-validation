const o = require('ospec')
const { validate } = require('../temp/index.js')

o.spec("validate", () => {
    o("catches error when resolved also passed through", async () => {
        // Arrange/Act
        let results = await validate([
            Promise.reject(new Error("Hello!")),
            () => Promise.resolve("never")
        ]).catch(x => x)

        // Assert
        o(results.errors.length).equals(1)("One error should exist.")
        o(results.errors[0].message).equals("Hello!")
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

