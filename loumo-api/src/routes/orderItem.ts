import { Router } from "express";
import OrderItemController from "../controllers/ordersItem";

export default class OrderItemRouter {
  routes: Router = Router();
  private orderItemController = new OrderItemController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.orderItemController.getOrderItems);
    this.routes.post("/", this.orderItemController.createOrderItem);
    this.routes.put("/:id", this.orderItemController.updateOrderItem);
    this.routes.delete("/:id", this.orderItemController.deleteOrderItem);
  }
}
