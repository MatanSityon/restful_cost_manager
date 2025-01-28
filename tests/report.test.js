const request = require("supertest");
const app = require("../app");

describe("Report API", () => {
    it("should return a grouped cost report for a user", async () => {
        const res = await request(app).get("/api/report?id=123123&year=2025&month=2");
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    it("should return an error for missing parameters", async () => {
        const res = await request(app).get("/api/report");
        expect(res.statusCode).toBe(500);
    });
});
