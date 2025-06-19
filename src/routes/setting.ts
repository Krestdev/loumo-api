import { Router } from "express";
import SettingController from "../controllers/setting";

export default class SettingRouter {
  routes: Router = Router();
  private settingController = new SettingController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.settingController.getSettings);
    this.routes.post("/", this.settingController.createSetting);
    this.routes.put("/:id", this.settingController.updateSetting);
    this.routes.delete("/:id", this.settingController.deleteSetting);
  }
}
