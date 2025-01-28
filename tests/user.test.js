const request = require("supertest");
const app = require("../app");

describe("User API", () => {
    it("should return user details and total cost", async () => {
        const res = await request(app).get("/api/users/123123");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("first_name");
        expect(res.body).toHaveProperty("last_name");
        expect(res.body).toHaveProperty("id", 123123);
        expect(res.body).toHaveProperty("total");
    });

    it("should return an error for non-existing user", async () => {
        const res = await request(app).get("/api/users/999999");
        expect(res.statusCode).toBe(404);
    });
});
