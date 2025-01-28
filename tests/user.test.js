const request = require("supertest");
const app = require("../app");

/**
 * @file User API Tests
 * @description Tests for the `/api/users/:id` endpoint to verify user retrieval.
 */

describe("User API", () => {

    /**
     * @test Retrieves user details and total cost.
     * @description Sends a GET request to `/api/users/:id` for an existing user.
     * @returns {void}
     */
    it("should return user details and total cost", async () => {
        const res = await request(app).get("/api/users/123123");

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Validate that response contains user details and total cost
        expect(res.body).toHaveProperty("first_name", "mosh");
        expect(res.body).toHaveProperty("last_name", "israeli");
        expect(res.body).toHaveProperty("id", 123123);
        expect(res.body).toHaveProperty("total"); // Should be 0 if no costs exist
    });

    /**
     * @test Returns an error for a non-existing user.
     * @description Sends a GET request to `/api/users/:id` with an invalid ID.
     * @returns {void}
     */
    it("should return an error for a non-existing user", async () => {
        const res = await request(app).get("/api/users/999999");

        // Expect a 404 Not Found response for a user that does not exist
        expect(res.statusCode).toBe(404);
    });

});
