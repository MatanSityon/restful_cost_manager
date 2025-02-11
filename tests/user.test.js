const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");
const Cost = require("../models/cost");

describe("User API", () => {
    const testUserId = 999998;

    /**
     * @function beforeAll
     * @description Connects to the MongoDB database before all tests and ensures the test user exists in the database.
     * @returns {Promise<void>}
     */
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Ensure test user exists
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
     * @description Clears the costs for the test user before each test.
     * @returns {Promise<void>}
     */
    beforeEach(async () => {
        await Cost.deleteMany({ userid: testUserId });
    });

    /**
     * @function afterAll
     * @description Cleans up by deleting the test user's costs and the user itself after all tests.
     * @returns {Promise<void>}
     */
    afterAll(async () => {
        await Cost.deleteMany({ userid: testUserId });
        await User.deleteMany({ id: testUserId });
        await mongoose.connection.close();
    });

    /**
     * @test Retrieves details for an existing user.
     * @description Sends a GET request to `/api/users/{userId}` and expects user details and computed total cost.
     * @returns {void}
     */
    it("should return user details and computed total cost", async () => {
        // Add a test cost for user
        await request(app).post("/api/add").send({
            userid: testUserId,
            description: "Groceries",
            category: "food",
            sum: 20,
            year: 2025,
            month: 2,
            day: 5
        });

        // Retrieve user details
        const res = await request(app).get(`/api/users/${testUserId}`);

        // Check that the response contains user details and total cost
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("first_name", "Test");
        expect(res.body).toHaveProperty("last_name", "User");
        expect(res.body).toHaveProperty("id", testUserId);
        expect(res.body).toHaveProperty("total", 20);
    });

    /**
     * @test Returns 404 for a non-existing user.
     * @description Sends a GET request to `/api/users/{nonExistentUserId}` and expects a 404 error response.
     * @returns {void}
     */
    it("should return an error for a non-existing user", async () => {
        const res = await request(app).get("/api/users/9999999");

        // Check that the response is a 404 error for a non-existing user
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User not found");
    });
});
