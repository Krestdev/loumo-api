// __tests__/health.test.ts
import request from "supertest";
import { Server } from "..";

const server = new Server();
describe("GET /health", () => {
  it("should return status ok", async () => {
    const res = await request(server.app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
