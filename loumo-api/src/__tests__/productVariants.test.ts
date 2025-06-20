import request from "supertest";
import { Server } from "../index";

const server = new Server();

describe("Product Variant Endpoints", () => {
  let createdProductId: number;
  let createdVariantId: number;

  beforeAll(async () => {
    // Create a product to associate with the variant
    const productRes = await request(server.app).post("/api/products/").send({
      name: "Variant Test Product",
      weight: 50,
      status: true,
      categoryId: 1,
    });
    createdProductId = productRes.body.id;
    // console.log(productRes.body);
  });

  afterAll(async () => {
    // Clean up: delete the product
    await request(server.app).delete(`/api/products/${createdProductId}`);
  });

  it("should create a new product variant", async () => {
    const res = await request(server.app).post("/api/productvariants/").send({
      name: "Test Variant",
      weight: 100,
      price: 10000,
      status: true,
      productId: createdProductId,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdVariantId = res.body.id;
  });

  it("should get all product variants", async () => {
    const res = await request(server.app).get("/api/productvariants/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get a single product variant by ID", async () => {
    // createdVariantId = 1;
    const res = await request(server.app).get(
      `/api/productvariants/${createdVariantId}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", createdVariantId);
  });

  it("should update a product variant by ID", async () => {
    // createdVariantId = 1;
    const res = await request(server.app)
      .put(`/api/productvariants/${createdVariantId}`)
      .send({
        name: "Updated Variant",
        weight: 100,
        price: 10000,
        status: true,
        productId: createdProductId,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Variant");
  });

  it("should delete a product variant by ID", async () => {
    // createdVariantId = 1;
    const res = await request(server.app).delete(
      `/api/productvariants/${createdVariantId}`
    );
    expect(res.statusCode).toBe(204);
  });
});
