import { Router } from "express";
import notificationController from "../controllers/notification";

export default class NotificationRouter {
  routes: Router = Router();
  private notificationController = new notificationController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.notificationController.getNotifications);
    this.routes.post("/", this.notificationController.createNotification);
    this.routes.put("/:id", this.notificationController.updateNotification);
    this.routes.delete("/:id", this.notificationController.deleteNotification);
  }
}
