const request = require("supertest");
const app = require("../app");

describe("About API", () => {
    it("should return team members' names", async () => {
        const res = await request(app).get("/api/about");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty("first_name");
        expect(res.body[0]).toHaveProperty("last_name");
    });
});
