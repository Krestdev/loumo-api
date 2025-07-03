import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Agent } from "../../generated/prisma";
import { AgentLogic } from "../logic/agent";

const agentLogic = new AgentLogic();

const createAgentSchema = Joi.object({
  status: Joi.string(),
  zoneId: Joi.number(),
  userId: Joi.number().optional(),
});

const updateAgentSchema = Joi.object({
  zoneId: Joi.number().optional(),
  status: Joi.string(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class AgentController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createAgentSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateAgentSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "paramId":
        result = paramSchema.validate(request.params);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;

      default:
        break;
    }
    if (result !== null && result.error) {
      return false;
    }
    return true;
  };
  createAgent = async (
    request: Request<
      object,
      object,
      Omit<Agent, "id" | "code"> & { userId: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createAgentSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newAgent = await agentLogic.createAgent(request.body);
      response.status(201).json(newAgent);
    } catch (err) {
      throw new CustomError("Failed to create agent", undefined, err as Error);
    }
  };

  updateAgent = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Agent, "id" | "code">>
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateAgentSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedAgent = await agentLogic.updateAgent(
        Number(id),
        request.body
      );
      response.status(200).json(updatedAgent);
    } catch (err) {
      throw new CustomError("Failed to update agent", undefined, err as Error);
    }
  };

  getAgents = async (request: Request, response: Response) => {
    try {
      const agents = await agentLogic.getAllAgents();
      response.status(200).json(agents);
    } catch (err) {
      throw new CustomError("Failed to fetch agents", undefined, err as Error);
    }
  };

  getOneAgent = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const agents = await agentLogic.getAgentById(id);
      response.status(200).json(agents);
    } catch (err) {
      throw new CustomError("Failed to fetch agents", undefined, err as Error);
    }
  };

  deleteAgent = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await agentLogic.deleteAgent(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete agent", undefined, err as Error);
    }
  };
}
