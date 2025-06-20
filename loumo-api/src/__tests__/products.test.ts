import request from "supertest";
import { Server } from "..";

const server = new Server();

describe("Product Endpoints", () => {
  let createdProductId: number;

  it("should create a new product", async () => {
    const res = await request(server.app).post("/api/products/").send({
      name: "Test Product",
      weight: 100,
      status: true,
      categoryId: 1,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdProductId = res.body.id;
  });

  it("should get all products", async () => {
    const res = await request(server.app).get("/api/products/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get a single product by ID", async () => {
    const res = await request(server.app).get(
      `/api/products/${createdProductId}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", createdProductId);
  });

  it("should update a product by ID", async () => {
    const res = await request(server.app)
      .put(`/api/products/${createdProductId}`)
      .send({
        name: "Updated Product",
        weight: 120,
        status: false,
        categoryId: 1,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Product");
  });

  it("should delete a product by ID", async () => {
    const res = await request(server.app).delete(
      `/api/products/${createdProductId}`
    );
    expect(res.statusCode).toBe(204);
  });
});
