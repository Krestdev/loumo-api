import { Router } from "express";
import RoleController from "../controllers/roles";
import { requireRole } from "../middleware/rbac";

export default class RoleRouter {
  routes: Router = Router();
  private roleController = new RoleController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", requireRole(["admin"]), this.roleController.getRole);
    this.routes.get(
      "/:id",
      requireRole(["admin"]),
      this.roleController.getOneRole
    );
    this.routes.post(
      "/",
      requireRole(["admin"]),
      this.roleController.createRole
    );
    this.routes.put(
      "/:id",
      requireRole(["admin"]),
      this.roleController.updateRole
    );
    this.routes.delete(
      "/:id",
      requireRole(["admin"]),
      this.roleController.deleteRole
    );
  }
}
