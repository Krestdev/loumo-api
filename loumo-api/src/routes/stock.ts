import { Router } from "express";
import StockController from "../controllers/stock";

export default class StockRouter {
  routes: Router = Router();
  private stockController = new StockController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.stockController.getStock);
    this.routes.get("/:id", this.stockController.getOneStock);
    this.routes.post("/", this.stockController.createStock);
    this.routes.put("/:id", this.stockController.updateStock);
    this.routes.delete("/:id", this.stockController.deleteStock);
  }
}
