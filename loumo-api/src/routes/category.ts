import { Router } from "express";
import CategoryController from "../controllers/category";
import upload from "../utils/upload";

export default class CategoryRouter {
  routes: Router = Router();
  private categoryController = new CategoryController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.categoryController.getCategory);
    this.routes.get("/:id", this.categoryController.getOneCategory);
    this.routes.post(
      "/",
      upload.single("imgUrl"),
      this.categoryController.createCategory
    );
    this.routes.put(
      "/:id",
      upload.single("imgUrl"),
      this.categoryController.updateCategory
    );
    this.routes.delete("/:id", this.categoryController.deleteCategory);
  }
}
