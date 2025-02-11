const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");
const Cost = require("../models/cost");

describe("User API", () => {
    const testUserId = 999998; // Dedicated test user (NOT 123123)

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

    beforeEach(async () => {
        await Cost.deleteMany({ userid: testUserId });
    });

    afterAll(async () => {
        await Cost.deleteMany({ userid: testUserId });
        await User.deleteMany({ id: testUserId });
        await mongoose.connection.close();
    });

    /**
     * @test Retrieves details for an existing user.
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

        const res = await request(app).get(`/api/users/${testUserId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("first_name", "Test");
        expect(res.body).toHaveProperty("last_name", "User");
        expect(res.body).toHaveProperty("id", testUserId);
        expect(res.body).toHaveProperty("total", 20); // ✅ Computed total should match sum of costs
    });

    /**
     * @test Returns 404 for a non-existing user.
     */
    it("should return an error for a non-existing user", async () => {
        const res = await request(app).get("/api/users/9999999");

        expect(res.statusCode).toBe(404); // ✅ Ensures a missing user returns 404
        expect(res.body).toHaveProperty("error", "User not found");
    });
});
