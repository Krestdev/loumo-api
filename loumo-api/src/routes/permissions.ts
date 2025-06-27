import { Router } from "express";
import PermissionController from "../controllers/permissions";

export default class PermissionRouter {
  routes: Router = Router();
  private permissionController = new PermissionController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.permissionController.getPermissions);
    this.routes.get("/:id", this.permissionController.getOnePermission);
    this.routes.post("/", this.permissionController.createPermission);
    this.routes.put("/:id", this.permissionController.updatePermission);
    this.routes.delete("/:id", this.permissionController.deletePermission);
  }
}
