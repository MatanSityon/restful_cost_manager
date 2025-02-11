const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");

describe("Report API", () => {
    const testUserId = 999998; // Dedicated test user (NOT 123123)

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

    afterAll(async () => {
        // Do NOT delete the test user to ensure consistency across tests
        await mongoose.connection.close();
    });

    /**
     * @test Retrieves a grouped cost report for an existing user.
     */
    it("should return a grouped cost report for a user", async () => {
        const res = await request(app).get(`/api/report?id=${testUserId}&year=2025&month=2`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("costs");

        // ✅ Ensure categories exist, either as arrays (if expenses exist) or as 0
        Object.keys(res.body.costs).forEach(category => {
            if (Array.isArray(res.body.costs[category])) {
                expect(res.body.costs[category]).toBeInstanceOf(Array);
            } else {
                expect(res.body.costs[category]).toBe(0); // ✅ Empty categories should be 0
            }
        });
    });

    /**
     * @test Returns 404 for a non-existent user.
     */
    it("should return 404 when requesting a report for a non-existent user", async () => {
        const res = await request(app).get("/api/report?id=999999&year=2025&month=2");

        expect(res.statusCode).toBe(404); // ✅ Ensure missing user returns 404
        expect(res.body).toHaveProperty("error", "User with ID 999999 not found"); // ✅ Match exact error message
    });
});
