const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");

/**
 * @file Cost API Tests
 * @description Tests for the `/api/add` and `/api/report` endpoints to verify cost item creation and monthly report retrieval.
 */

describe("Cost API", () => {

    /**
     * Connects to MongoDB before running tests.
     * Ensures a fresh connection for database operations.
     */
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    /**
     * Closes the MongoDB connection after all tests are completed.
     * Prevents open handles causing Jest to hang.
     */
    afterAll(async () => {
        await mongoose.connection.close();
    });

    /**
     * @test Adds a new cost item.
     * @description Sends a POST request to `/api/add` with a sample cost item.
     * Expects a successful response containing the correct description.
     * @returns {void}
     */
    it("should add a new cost item", async () => {
        const res = await request(app).post("/api/add").send({
            userid: 111111,
            description: "Milk",
            category: "food",
            sum: 10
        });

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response contains the correct description
        expect(res.body).toHaveProperty("description", "Milk");
    });

    /**
     * @test Retrieves a grouped monthly report.
     * @description Sends a GET request to `/api/report` with a valid user ID, year, and month.
     * Expects a 200 response and a valid object structure in the body.
     * @returns {void}
     */
    it("should return grouped monthly report", async () => {
        const res = await request(app).get("/api/report?id=123123&year=2025&month=2");

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response is an object (grouped costs)
        expect(res.body).toBeInstanceOf(Object);
    });

});
