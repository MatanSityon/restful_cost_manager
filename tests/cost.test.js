const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Cost = require("../models/cost");

describe("Cost API", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should add a new cost item", async () => {
        const res = await request(app).post("/api/add").send({
            userid: 111111,
            description: "Milk",
            category: "food",
            sum: 10
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("description", "Milk");
    });

    it("should return grouped monthly report", async () => {
        const res = await request(app).get("/api/report?id=123123&year=2025&month=2");
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
    });
});
