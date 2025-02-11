const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");
const MonthlyReport = require("../models/monthlyReport");
const User = require("../models/user");

describe("Cost API", () => {
    const testUserId = 999998; // A separate test user (NOT 123123)

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Insert a test user (not 123123)
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
        await Cost.deleteMany({ userid: { $ne: 123123 } }); // Deletes all except costs of 123123
        await MonthlyReport.deleteMany({ userid: { $ne: 123123 } }); //Deletes all except reports of 123123
    });

    afterAll(async () => {
        await Cost.deleteMany({ userid: { $ne: 123123 } }); // Deletes all except costs of 123123
        await MonthlyReport.deleteMany({ userid: { $ne: 123123 } }); //  Deletes all except reports of 123123
        await User.deleteMany({ id: { $ne: 123123 } }); //  Deletes all users except 123123
        await mongoose.connection.close();
    });


    /**
     * @test Retrieves a precomputed monthly report.
     */
    it("should return a precomputed monthly report", async () => {
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
        expect(res.body.costs.sport).toBeInstanceOf(Array); // ✅ Expect an array
        expect(res.body.costs.sport[0]).toMatchObject({
            sum: 50,
            description: "Total for sport",
            day: null
        });
    });
});
