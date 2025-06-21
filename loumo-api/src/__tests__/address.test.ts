import request from "supertest";
import { Server } from "../index";

const server = new Server();

describe("Address CRUD Endpoints", () => {
  let createdZoneId: number;
  let createdAddressId: number;

  beforeAll(async () => {
    // Create a zone for the address
    const zoneRes = await request(server.app).post("/api/zones/").send({
      name: "Address Zone",
      price: 500,
    });
    createdZoneId = zoneRes.body.id;
  });

  afterAll(async () => {
    if (createdAddressId) {
      await request(server.app).delete(`/api/address/${createdAddressId}`);
    }
    if (createdZoneId) {
      await request(server.app).delete(`/api/zones/${createdZoneId}`);
    }
  });

  it("should create a new address", async () => {
    const res = await request(server.app).post("/api/address/").send({
      street: "Home",
      local: "Primary residence",
      published: true,
      zoneId: createdZoneId,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdAddressId = res.body.id;
  });

  it("should get all addresses", async () => {
    const res = await request(server.app).get("/api/address/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update an address", async () => {
    const res = await request(server.app)
      .put(`/api/address/${createdAddressId}`)
      .send({
        street: "Work Home",
        local: "Office location",
        published: false,
        zoneId: createdZoneId,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("street", "Work Home");
  });

  it("should delete an address", async () => {
    const res = await request(server.app).delete(
      `/api/address/${createdAddressId}`
    );
    expect(res.statusCode).toBe(204);
    createdAddressId = undefined as any;
  });
});
