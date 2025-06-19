import { Router } from "express";
import CategoryController from "../controllers/category";

export default class CategoryRouter {
  routes: Router = Router();
  private categoryController = new CategoryController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.categoryController.getCategory);
    this.routes.get("/:id", this.categoryController.getOneCategory);
    this.routes.post("/", this.categoryController.createCategory);
    this.routes.put("/:id", this.categoryController.updateCategory);
    this.routes.delete("/:id", this.categoryController.deleteCategory);
  }
}
