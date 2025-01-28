const request = require("supertest");
const app = require("../app");

/**
 * @file Cost API Tests
 * @description Tests for the `/api/add` endpoint to verify cost item creation.
 */

describe("Cost API", () => {

    /**
     * @test Adds a new cost item.
     * @description Sends a POST request to `/api/add` with a sample cost item.
     * Expects a successful response.
     * @returns {void}
     */
    it("should add a new cost item", async () => {
        const res = await request(app).post("/api/add").send({
            userid: 123123, // Using the existing user
            description: "Gym Membership",
            category: "sport",
            sum: 50,
            year: 2025,
            month: 2,
            day: 1
        });

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response contains the correct data
        expect(res.body).toHaveProperty("description", "Gym Membership");
        expect(res.body).toHaveProperty("category", "sport");
        expect(res.body).toHaveProperty("userid", 123123);
        expect(res.body).toHaveProperty("sum", 50);
    });

});
