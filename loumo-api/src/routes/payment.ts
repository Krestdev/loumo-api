import { Router } from "express";
import PaymentController from "../controllers/payment";

export default class PaymentRouter {
  routes: Router = Router();
  private paymentController = new PaymentController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.paymentController.getPayment);
    this.routes.get("/:id", this.paymentController.getOnePayment);
    this.routes.post("/", this.paymentController.createPayment);
    this.routes.put("/:id", this.paymentController.updatePayment);
    this.routes.delete("/:id", this.paymentController.deletePayment);
  }
}
