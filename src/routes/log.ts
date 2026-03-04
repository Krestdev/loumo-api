import { Router } from "express";
import LogController from "../controllers/log";

export default class LogRouter {
  routes: Router = Router();
  private logController = new LogController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.logController.getLogs);
    this.routes.post("/", this.logController.createLog);
    this.routes.put("/:id", this.logController.updateLog);
    this.routes.delete("/:id", this.logController.deleteLog);
  }
}
