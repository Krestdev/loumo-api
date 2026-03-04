import { Router } from "express";
import PromotionController from "../controllers/promotion";

export default class PromotionRouter {
  routes: Router = Router();
  private promotionController = new PromotionController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.promotionController.getPromotion);
    this.routes.get("/:id", this.promotionController.getOnePromotion);
    this.routes.post("/", this.promotionController.createPromotion);
    this.routes.put("/:id", this.promotionController.updatePromotion);
    this.routes.delete("/:id", this.promotionController.deletePromotion);
  }
}
