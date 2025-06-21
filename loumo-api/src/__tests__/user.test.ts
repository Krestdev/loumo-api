import request from "supertest";
import { Server } from "../index";

const server = new Server();

describe("User CRUD Endpoints", () => {
  let createdUserId: number;
  let createdAddressId: number;
  let createdZoneId: number;

  beforeAll(async () => {
    // Create a zone
    const zoneRes = await request(server.app).post("/api/zones/").send({
      name: "Test Zone",
      price: 2500,
    });
    expect(zoneRes.statusCode).toBe(201);
    createdZoneId = zoneRes.body.id;

    // Create an address with the zoneId
    const addressRes = await request(server.app).post("/api/address/").send({
      local: "Testville",
      street: "123 Test St",
      zoneId: createdZoneId,
    });
    expect(addressRes.statusCode).toBe(201);
    createdAddressId = addressRes.body.id;
  });

  afterAll(async () => {
    // Delete user if still exists
    if (createdUserId) {
      await request(server.app).delete(`/api/users/${createdUserId}`);
    }
    // Delete address
    if (createdAddressId) {
      await request(server.app).delete(`/api/address/${createdAddressId}`);
    }
    // Delete zone
    if (createdZoneId) {
      await request(server.app).delete(`/api/zones/${createdZoneId}`);
    }
  });

  it("should create a new user", async () => {
    const res = await request(server.app)
      .post("/api/users/")
      .send({
        name: "User",
        email: "user@example.com",
        tel: "123456789",
        password: "Password123!",
        address: [createdAddressId],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdUserId = res.body.id;
  });

  it("should get all users", async () => {
    const res = await request(server.app).get("/api/users/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a user", async () => {
    const res = await request(server.app)
      .put(`/api/users/${createdUserId}`)
      .send({
        name: "Updated",
        email: "updateduser@example.com",
        tel: "987654321",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated");
  });

  it("should delete a user", async () => {
    const res = await request(server.app).delete(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(204);
    createdUserId = undefined as any;
  });
});
