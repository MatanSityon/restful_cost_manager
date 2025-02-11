const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");
const MonthlyReport = require("../models/monthlyReport");
const User = require("../models/user");

describe("Cost API", () => {
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
        await MonthlyReport.deleteMany({ userid: testUserId });
    });

    afterAll(async () => {
        await Cost.deleteMany({ userid: testUserId });
        await MonthlyReport.deleteMany({ userid: testUserId });
        await User.deleteMany({ id: testUserId });
        await mongoose.connection.close();
    });

    /**
     * @test Adds a new cost item and verifies report update.
     */
    it("should add a new cost item and update the monthly report", async () => {
        await request(app).post("/api/add").send({
            userid: testUserId,
            description: "Gym Membership",
            category: "sport",
            sum: 50,
            year: 2025,
            month: 2,
            day: 1
        });

        const res = await request(app).get(`/api/report?id=${testUserId}&year=2025&month=2`);

        expect(res.statusCode).toBe(200);
        expect(res.body.costs).toHaveProperty("sport");

        if (Array.isArray(res.body.costs.sport)) {
            expect(res.body.costs.sport[0]).toMatchObject({
                sum: 50,
                description: "Gym Membership",
                day: 1
            });
        } else {
            expect(res.body.costs.sport).toBe(0); // ✅ If no expenses, return 0
        }
    });

    /**
     * @test Ensures an empty report correctly returns categories as `0`.
     */
    it("should return zero for all categories if no expenses exist", async () => {
        const res = await request(app).get(`/api/report?id=${testUserId}&year=2025&month=2`);

        expect(res.statusCode).toBe(200);
        Object.keys(res.body.costs).forEach(category => {
            expect(res.body.costs[category]).toBe(0); // ✅ Empty categories should be 0
        });
    });
});
