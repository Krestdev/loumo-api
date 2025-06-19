import { Router } from "express";
import ProductVariantController from "../controllers/productVariants";

export default class ProductVariantRouter {
  routes: Router = Router();
  private productVariantController = new ProductVariantController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.productVariantController.getProductVariants);
    this.routes.post("/", this.productVariantController.createProductVariant);
    this.routes.put("/:id", this.productVariantController.updateProductVariant);
    this.routes.delete(
      "/:id",
      this.productVariantController.deleteProductVariant
    );
  }
}
