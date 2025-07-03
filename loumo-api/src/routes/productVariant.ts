import { Router } from "express";
import ProductVariantController from "../controllers/productVariants";
import upload from "../utils/upload";

export default class ProductVariantRouter {
  routes: Router = Router();
  private productVariantController = new ProductVariantController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.productVariantController.getProductVariants);
    this.routes.get("/:id", this.productVariantController.getOneProductVariant);
    this.routes.post(
      "/",
      upload.single("imgUrl"),
      this.productVariantController.createProductVariant
    );
    this.routes.put(
      "/:id",
      upload.single("imgUrl"),
      this.productVariantController.updateProductVariant
    );
    this.routes.delete(
      "/:id",
      this.productVariantController.deleteProductVariant
    );
  }
}
