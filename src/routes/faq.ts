import { Router } from "express";
import FaqController from "../controllers/faq";

export default class FaqRouter {
  routes: Router = Router();
  private faqController = new FaqController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.faqController.getFaqs);
    this.routes.get("/", this.faqController.getAnFaq);
    this.routes.post("/", this.faqController.createFaq);
    this.routes.put("/:id", this.faqController.updateFaq);
    this.routes.delete("/:id", this.faqController.deleteFaq);
  }
}
