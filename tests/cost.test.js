const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");

describe("Cost API", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should add a new cost item", async () => {
        const res = await request(app).post("/api/add").send({
            description: "Milk",
            category: "food",
            userid: 123123,
            sum: 10
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("description", "Milk");
        expect(res.body).toHaveProperty("sum", 10);
    });
});
