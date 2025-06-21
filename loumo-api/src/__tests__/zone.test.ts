import request from "supertest";
import { Server } from "../index";

const server = new Server();

describe("Zone CRUD Endpoints", () => {
  let createdZoneId: number;

  beforeAll(async () => {
    // No dependencies for zone
  });

  afterAll(async () => {
    if (createdZoneId) {
      await request(server.app).delete(`/api/zones/${createdZoneId}`);
    }
  });

  it("should create a new zone", async () => {
    const res = await request(server.app).post("/api/zones/").send({
      name: "Test Zone",
      price: 1000,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdZoneId = res.body.id;
  });

  it("should get all zones", async () => {
    const res = await request(server.app).get("/api/zones/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a zone", async () => {
    const res = await request(server.app)
      .put(`/api/zones/${createdZoneId}`)
      .send({
        name: "Updated Zone",
        price: 2000,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Zone");
  });

  it("should delete a zone", async () => {
    const res = await request(server.app).delete(`/api/zones/${createdZoneId}`);
    expect([200, 204]).toContain(res.statusCode);
    createdZoneId = undefined as any;
  });
});
