import { validateObject } from '../src/index.ts'
import { maybe, createString5, createIdNumber } from './object-validators.js'
import { assertEquals, assert } from "https://deno.land/std@0.186.0/testing/asserts.ts"
import {
  describe,
  it,
} from "https://deno.land/std@0.186.0/testing/bdd.ts";

const personValidator = {
    firstName: createString5("First Name"),
    id: createIdNumber("ID"),
    lastName: maybe(createString5("Last Name"))
}

describe("validateObject", () => {
    it("catches error when resolved also passed through", async () => {
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
        assertEquals(results.reasons.length, 2, "2 errors should exist")

        assertEquals(results.reasons[0].key, "firstName")
        assertEquals(results.reasons[0].reason, `"First Name" must be less than 5 characters.`)

        assertEquals(results.reasons[1].key, "id")
        assertEquals(results.reasons[1].reason, `"ID" must be 1 or greater. But was given '0'.`)
    })

    it("returns resolved values when no error", async () => {
        // Arrange
        const value = {
            firstName: "Jay",
            id: 1,
            lastName: "Burns",
        }

        // Act
        const result = await validateObject(value, personValidator)

        // Assert
        assertEquals(result, { firstName: "Jay", id: 1, lastName: "Burns" })
    })

    it("removes any extra properties", async () => {
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
        assert(!('additionalProperty' in result))
    })

    it("null value returns error", async () => {
        // Arrange
        const value = null

        // Act
        const result = await validateObject(value, personValidator).catch(x => x)

        // Assert
        assertEquals(result.reason, "Object is undefined.")
    })
})

