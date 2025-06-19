import { Router } from "express";
import OrderController from "../controllers/orders";

export default class OrderRouter {
  routes: Router = Router();
  private orderController = new OrderController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.orderController.getOrders);
    this.routes.post("/", this.orderController.createOrder);
    this.routes.put("/:id", this.orderController.updateOrder);
    this.routes.delete("/:id", this.orderController.deleteOrder);
  }
}
