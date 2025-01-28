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
        const res = await request(app).get("/api/about");

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response is an array
        expect(Array.isArray(res.body)).toBe(true);

        // Validate that each item in the array has `first_name` and `last_name`
        expect(res.body[0]).toHaveProperty("first_name");
        expect(res.body[0]).toHaveProperty("last_name");
    });

});
