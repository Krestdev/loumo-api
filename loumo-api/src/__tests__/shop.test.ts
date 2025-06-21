import request from "supertest";
import { Server } from "../index";

const server = new Server();

describe("Shop CRUD Endpoints", () => {
  let createdZoneId: number;
  let createdAddressId: number;
  let createdShopId: number;

  beforeAll(async () => {
    // Create a zone
    const zoneRes = await request(server.app).post("/api/zones/").send({
      name: "Shop Zone",
      price: 800,
    });
    createdZoneId = zoneRes.body.id;

    // Create an address for the shop
    const addressRes = await request(server.app).post("/api/address/").send({
      name: "Shop Address",
      description: "Shop location",
      published: true,
      zoneId: createdZoneId,
    });
    createdAddressId = addressRes.body.id;
  });

  afterAll(async () => {
    if (createdShopId) {
      await request(server.app).delete(`/api/shops/${createdShopId}`);
    }
    if (createdAddressId) {
      await request(server.app).delete(`/api/address/${createdAddressId}`);
    }
    if (createdZoneId) {
      await request(server.app).delete(`/api/zones/${createdZoneId}`);
    }
  });

  it("should create a new shop", async () => {
    const res = await request(server.app).post("/api/shops/").send({
      name: "Main Street Shop",
      addressId: createdAddressId,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdShopId = res.body.id;
  });

  it("should get all shops", async () => {
    const res = await request(server.app).get("/api/shops/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a shop", async () => {
    const res = await request(server.app)
      .put(`/api/shops/${createdShopId}`)
      .send({
        name: "Downtown Shop",
        addressId: createdAddressId,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Downtown Shop");
  });

  it("should delete a shop", async () => {
    const res = await request(server.app).delete(`/api/shops/${createdShopId}`);
    expect([200, 204]).toContain(res.statusCode);
    createdShopId = undefined as any;
  });
});
