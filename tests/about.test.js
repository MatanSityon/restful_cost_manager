const request = require("supertest");
const app = require("../app");

/**
 * @file About API Tests
 * @description Tests the `/api/about` endpoint to ensure it returns team member details.
 */

describe("About API", () => {

    /**
     * @test Retrieves team members' names.
     * @description Sends a GET request to `/api/about` and expects an array of objects with `first_name` and `last_name`.
     * @returns {void}
     */
    it("should return team members' names", async () => {
        // Sends a GET request to the `/api/about` endpoint
        const res = await request(app).get("/api/about");

        // Expect a 200 OK response status
        /**
         * @type {number}
         */
        expect(res.statusCode).toBe(200);

        // Ensure the response body is an array
        /**
         * @type {boolean}
         */
        expect(Array.isArray(res.body)).toBe(true);

        // Validate that the first object in the array contains `first_name` and `last_name` properties
        /**
         * @type {Object}
         */
        expect(res.body[0]).toHaveProperty("first_name");
        /**
         * @type {Object}
         */
        expect(res.body[0]).toHaveProperty("last_name");
    });

});
