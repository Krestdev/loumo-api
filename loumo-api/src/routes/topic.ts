import { Router } from "express";
import TopicController from "../controllers/topic";

export default class TopicRouter {
  routes: Router = Router();
  private topicController = new TopicController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.topicController.getTopics);
    this.routes.post("/", this.topicController.createTopic);
    this.routes.put("/:id", this.topicController.updateTopic);
    this.routes.delete("/:id", this.topicController.deleteTopic);
  }
}
