const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");

describe("Report API", () => {
    const testUserId = 999998;

    /**
     * @function beforeAll
     * @description Connects to the MongoDB database before all tests and ensures the test user exists in the database.
     * @returns {Promise<void>}
     */
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Ensure the test user exists before tests run
        await User.findOneAndUpdate(
            { id: testUserId },
            {
                id: testUserId,
                first_name: "Test",
                last_name: "User",
                birthday: "1995-05-10",
                marital_status: "married"
            },
            { upsert: true, new: true }
        );
    });

    /**
     * @function beforeEach
     * @description Ensures that the test user exists before each test.
     * @returns {Promise<void>}
     */
    beforeEach(async () => {
        // Ensure the user is NOT deleted by mistake
        const existingUser = await User.findOne({ id: testUserId });
        if (!existingUser) {
            await User.create({
                id: testUserId,
                first_name: "Test",
                last_name: "User",
                birthday: "1995-05-10",
                marital_status: "married"
            });
        }
    });

    /**
     * @function afterAll
     * @description Closes the MongoDB connection after all tests without deleting the test user.
     * @returns {Promise<void>}
     */
    afterAll(async () => {
        // Do NOT delete the test user to ensure consistency across tests
        await mongoose.connection.close();
    });

    /**
     * @test Retrieves a grouped cost report for an existing user.
     * @description Sends a GET request to `/api/report` and expects a grouped cost report for a user.
     * @returns {void}
     */
    it("should return a grouped cost report for a user", async () => {
        const res = await request(app).get(`/api/report?id=${testUserId}&year=2025&month=2`);

        // Expect a 200 OK response
        expect(res.statusCode).toBe(200);

        // Ensure the response contains a `costs` property
        expect(res.body).toHaveProperty("costs");

        // Ensure categories exist, either as arrays (if expenses exist) or as 0
        Object.keys(res.body.costs).forEach(category => {
            if (Array.isArray(res.body.costs[category])) {
                expect(res.body.costs[category]).toBeInstanceOf(Array);
            } else {
                expect(res.body.costs[category]).toBe(0);
            }
        });
    });

    /**
     * @test Returns 404 for a non-existent user.
     * @description Sends a GET request to `/api/report` with a non-existent user ID and expects a 404 response.
     * @returns {void}
     */
    it("should return 404 when requesting a report for a non-existent user", async () => {
        const res = await request(app).get("/api/report?id=999999&year=2025&month=2");

        // Expect a 404 response for a non-existent user
        expect(res.statusCode).toBe(404);

        // Ensure the error message matches the expected response
        expect(res.body).toHaveProperty("error", "User with ID 999999 not found");
    });
});
