import { Router } from "express";
import DeliveryController from "../controllers/delivery";

export default class DeliveryRouter {
  routes: Router = Router();
  private deliveryController = new DeliveryController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.deliveryController.getDelivery);
    this.routes.get("/:id", this.deliveryController.getOneDelivery);
    this.routes.post("/", this.deliveryController.createDelivery);
    this.routes.put("/:id", this.deliveryController.updateDelivery);
    this.routes.delete("/:id", this.deliveryController.deleteDelivery);
  }
}
