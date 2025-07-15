import { Router } from "express";
import RoleController from "../controllers/roles";
import { authorize } from "../middleware/authorize";

export default class RoleRouter {
  routes: Router = Router();
  private roleController = new RoleController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", authorize("admin"), this.roleController.getRole);
    this.routes.get("/:id", authorize("admin"), this.roleController.getOneRole);
    this.routes.post("/", authorize("admin"), this.roleController.createRole);
    this.routes.put("/:id", authorize("admin"), this.roleController.updateRole);
    this.routes.delete(
      "/:id",
      authorize("admin"),
      this.roleController.deleteRole
    );
  }
}
