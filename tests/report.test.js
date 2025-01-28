const request = require("supertest");
const app = require("../app");

/**
 * @file Report API Tests
 * @description Tests for the `/api/report` endpoint to verify cost report retrieval and error handling.
 */

describe("Report API", () => {

    /**
     * @test Retrieves a grouped cost report for a user.
     * @description Sends a GET request to `/api/report` with a valid user ID, year, and month.
     * Expects a 200 response and a valid object structure.
     * @returns {void}
     */
    it("should return a grouped cost report for a user", async () => {
        const res = await request(app).get("/api/report?id=123123&year=2025&month=2");

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response is an object (grouped costs)
        expect(res.body).toBeInstanceOf(Object);
    });

    /**
     * @test Returns an error for missing query parameters.
     * @description Sends a GET request to `/api/report` without required parameters.
     * Expects a 500 response indicating an internal server error due to missing parameters.
     * @returns {void}
     */
    it("should return an error for missing parameters", async () => {
        const res = await request(app).get("/api/report");

        // Expect a 500 Internal Server Error response due to missing parameters
        expect(res.statusCode).toBe(500);
    });

});
