const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");
const Cost = require("../models/cost");

const TEST_USER_ID = 999999; // ✅ Dedicated test user ID

describe("Report API", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // ✅ Ensure the test user exists
        await User.findOneAndUpdate(
            { id: TEST_USER_ID },
            {
                id: TEST_USER_ID,
                first_name: "Report",
                last_name: "Tester",
                birthday: "1995-05-10",
                marital_status: "single"
            },
            { upsert: true, new: true }
        );
    });

    beforeEach(async () => {
        // ✅ Only delete test user's costs
        await Cost.deleteMany({ userid: TEST_USER_ID });
    });

    afterAll(async () => {
        // ✅ Clean up ONLY the test user’s data
        await Cost.deleteMany({ userid: TEST_USER_ID });
        await User.deleteMany({ id: TEST_USER_ID });

        await mongoose.connection.close();
    });

    /**
     * @test Ensures report returns zero for all categories if no costs exist.
     */
    it("should return [0] for all categories if no expenses exist", async () => {
        const res = await request(app).get(`/api/report?id=${TEST_USER_ID}&year=2025&month=3`);

        expect(res.statusCode).toBe(200);
        expect(res.body.costs.food).toEqual([0]); // ✅ Expect an array instead of a number
        expect(res.body.costs.sport).toEqual([0]);
        expect(res.body.costs.education).toEqual([0]);
        expect(res.body.costs.health).toEqual([0]);
        expect(res.body.costs.housing).toEqual([0]);
    });

    /**
     * @test Returns 404 for a non-existent user fetching a report.
     */
    it("should return 404 when requesting a report for a non-existent user", async () => {
        const res = await request(app).get(`/api/report?id=888888&year=2025&month=2`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User with ID 888888 not found");
    });
});
