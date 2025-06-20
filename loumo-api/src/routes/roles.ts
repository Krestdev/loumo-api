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
    this.routes.get("/", authorize("read:role"), this.roleController.getRole);
    this.routes.get(
      "/:id",
      authorize("read:role"),
      this.roleController.getOneRole
    );
    this.routes.post(
      "/",
      authorize("create:role"),
      this.roleController.createRole
    );
    this.routes.put(
      "/:id",
      authorize("update:role"),
      this.roleController.updateRole
    );
    this.routes.delete(
      "/:id",
      authorize("delete:role"),
      this.roleController.deleteRole
    );
  }
}
