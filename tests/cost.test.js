const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");
const MonthlyReport = require("../models/monthlyReport");
const User = require("../models/user");

const TEST_USER_ID = 999999; // ✅ Dedicated test user ID

describe("Cost API", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // ✅ Ensure the test user exists
        await User.findOneAndUpdate(
            { id: TEST_USER_ID },
            {
                id: TEST_USER_ID,
                first_name: "Test",
                last_name: "User",
                birthday: "2000-01-01",
                marital_status: "single"
            },
            { upsert: true, new: true }
        );
    });

    beforeEach(async () => {
        // ✅ Only delete the test user's data, NOT 123123
        await Cost.deleteMany({ userid: TEST_USER_ID });
        await MonthlyReport.deleteMany({ userid: TEST_USER_ID });
    });

    afterAll(async () => {
        // ✅ Clean up ONLY the test user’s data
        await Cost.deleteMany({ userid: TEST_USER_ID });
        await MonthlyReport.deleteMany({ userid: TEST_USER_ID });
        await User.deleteMany({ id: TEST_USER_ID });

        await mongoose.connection.close();
    });

    /**
     * @test Retrieves a precomputed monthly report.
     */
    it("should return a precomputed monthly report", async () => {
        await request(app).post("/api/add").send({
            userid: TEST_USER_ID, // ✅ Using only test user
            description: "Gym Membership",
            category: "sport",
            sum: 50,
            year: 2025,
            month: 2,
            day: 1
        });

        const res = await request(app).get(`/api/report?id=${TEST_USER_ID}&year=2025&month=2`);

        expect(res.statusCode).toBe(200);
        expect(res.body.costs.sport).toBeInstanceOf(Array); // ✅ Expect an array
        expect(res.body.costs.sport[0]).toMatchObject({
            sum: 50,
            description: "Total for sport",
            day: null
        });
    });
});
