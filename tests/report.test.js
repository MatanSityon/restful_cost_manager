const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");
const Cost = require("../models/cost");

describe("Report API", () => {
    const testUserId = 999998; // A separate test user (NOT 123123)

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Insert test user (not 123123)
        await User.findOneAndUpdate(
            { id: testUserId },
            {
                id: testUserId,
                first_name: "Report",
                last_name: "Tester",
                birthday: "1995-05-10",
                marital_status: "single"
            },
            { upsert: true, new: true }
        );
    });

    beforeEach(async () => {
        await Cost.deleteMany({ userid: { $ne: 123123 } }); // Deletes all costs except 123123
    });

    afterAll(async () => {
        await Cost.deleteMany({ userid: { $ne: 123123 } }); // Deletes all costs except 123123
        await User.deleteMany({ id: { $ne: 123123 } }); // Deletes all users except 123123
        await mongoose.connection.close();
    });

    /**
     * @test Ensures report returns zero for all categories if no costs exist.
     */
    it("should return [0] for all categories if no expenses exist", async () => {
        const res = await request(app).get(`/api/report?id=${testUserId}&year=2025&month=3`);

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
        const res = await request(app).get(`/api/report?id=999999&year=2025&month=2`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User with ID 999999 not found");
    });
});
