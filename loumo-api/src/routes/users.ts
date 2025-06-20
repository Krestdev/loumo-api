import { Router } from "express";
import UserController from "../controllers/users";
import { authorize } from "../middleware/authorize";

export default class UserRouter {
  routes: Router = Router();
  userController = new UserController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get(
      "/",
      authorize("read:user"),
      this.userController.getAllUsers
    );
    this.routes.post("/login", this.userController.login);
    this.routes.get("/", this.userController.getAllUsers);
    this.routes.get("/:id", this.userController.getUserById);
    this.routes.post("/", this.userController.createUser);
    this.routes.put("/:id", this.userController.updateUser);
    this.routes.put("/role/:id", this.userController.assignRole);
    this.routes.delete("/:id", this.userController.deleteUser);
  }
}
