import { Router } from "express";
import RoleController from "../controllers/roles";
import { authenticateToken, requireRole } from "../middleware/rbac";

export default class RoleRouter {
  routes: Router = Router();
  private roleController = new RoleController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get(
      "/",
      [authenticateToken, requireRole(["admin"])],
      this.roleController.getRole
    );
    this.routes.get(
      "/:id",
      authenticateToken,
      requireRole(["admin"]),
      this.roleController.getOneRole
    );
    this.routes.post(
      "/",
      authenticateToken,
      requireRole(["admin"]),
      this.roleController.createRole
    );
    this.routes.put(
      "/:id",
      authenticateToken,
      requireRole(["admin"]),
      this.roleController.updateRole
    );
    this.routes.delete(
      "/:id",
      authenticateToken,
      requireRole(["admin"]),
      this.roleController.deleteRole
    );
  }
}
