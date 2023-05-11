import { validate, ValidationResult, ValidationError } from '../src/index.ts'
import { assertEquals, assert } from "https://deno.land/std@0.186.0/testing/asserts.ts"
import {
  describe,
  it,
} from "https://deno.land/std@0.186.0/testing/bdd.ts";

describe("validate", () => {

    it("catches error when resolved also passed through", async () => {
        // Arrange/Act
        const results = await validate([
            Promise.reject(new Error("Hello!")),
            () => Promise.resolve("never")
        ]).catch(x => x)

        // Assert
        assert(results instanceof ValidationResult, "Instance of ValidationResult")
        assertEquals(results.reasons.length, 1, "One error should exist.")

        assert(
            results.reasons[0] instanceof ValidationError,
            "Instance of ValidationError")
        assertEquals(results.reasons[0].reason.message, "Hello!")
    })

    it("returns resolved values when no error", async () => {
        // Arrange/Act
        const results = await validate([
            Promise.resolve({ i: "like cheese" }),
            Promise.resolve({ i: "like hotdogs"})
        ])

        // Assert
        assertEquals(results[0], { i: "like cheese" })
        assertEquals(results[1], { i: "like hotdogs" })
    })

})

