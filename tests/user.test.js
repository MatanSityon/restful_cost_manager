const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");

describe("User API", () => {
    const testUserId = 999998; // Test user (NOT 123123)

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Insert a different test user (not 123123)
        await User.findOneAndUpdate(
            { id: testUserId },
            {
                id: testUserId,
                first_name: "Another",
                last_name: "User",
                birthday: "1995-05-10",
                marital_status: "married"
            },
            { upsert: true, new: true }
        );
    });

    beforeEach(async () => {
        await User.deleteMany({ id: { $ne: 123123, $ne: testUserId } }); // Delete all users except `123123` & test user
    });

    afterAll(async () => {
        await User.deleteMany({ id: testUserId }); // Clean up test user after tests
        await mongoose.connection.close();
    });

    /**
     * @test Retrieves details for an existing test user (not 123123).
     */
    it("should return user details and total cost for another user", async () => {
        const res = await request(app).get(`/api/users/${testUserId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("first_name", "Another");
        expect(res.body).toHaveProperty("last_name", "User");
        expect(res.body).toHaveProperty("id", testUserId);
        expect(res.body).toHaveProperty("total");
    });

    /**
     * @test Returns 404 for a non-existing user.
     */
    it("should return an error for a non-existing user", async () => {
        const res = await request(app).get("/api/users/999999");

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User not found");
    });
});
