import { Router } from "express";
import AgentController from "../controllers/agent";

export default class AgentRouter {
  routes: Router = Router();
  private agentController = new AgentController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.get("/", this.agentController.getAgents);
    this.routes.post("/", this.agentController.createAgent);
    this.routes.put("/:id", this.agentController.updateAgent);
    this.routes.delete("/:id", this.agentController.deleteAgent);
  }
}
