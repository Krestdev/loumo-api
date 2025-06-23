import { Router } from "express";
import ShopController from "../controllers/shop";

export default class ShopRouter {
  routes: Router = Router();
  private shopController = new ShopController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.shopController.getShops);
    this.routes.get("/:id", this.shopController.getOneShop);
    this.routes.post("/", this.shopController.createShop);
    this.routes.put("/:id", this.shopController.updateShop);
    this.routes.delete("/:id", this.shopController.deleteShop);
  }
}
