import { Router } from "express";
import ProductController from "../controllers/products";

export default class ProductRouter {
  routes: Router = Router();
  private productController = new ProductController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.productController.getProducts);
    this.routes.get("/:id", this.productController.getOneProduct);
    this.routes.get("/slug/:slug", this.productController.getSlugProduct);
    this.routes.post("/", this.productController.createProduct);
    this.routes.put("/:id", this.productController.updateProduct);
    this.routes.delete("/:id", this.productController.deleteProduct);
  }
}
