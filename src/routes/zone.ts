import { Router } from "express";
import ZoneController from "../controllers/zone";

export default class ZoneRouter {
  routes: Router = Router();
  private zoneController = new ZoneController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.zoneController.getZone);
    this.routes.get("/:id", this.zoneController.getOneZone);
    this.routes.post("/", this.zoneController.createZone);
    this.routes.put("/:id", this.zoneController.updateZone);
    this.routes.delete("/:id", this.zoneController.deleteZone);
  }
}
