import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Log } from "@prisma/client";
import { LogLogic } from "../logic/log";

const logLogic = new LogLogic();

const createLogSchema = Joi.object({
  action: Joi.string(),
  description: Joi.string(),
  userId: Joi.number().optional(),
});

const updateLogSchema = Joi.object({
  action: Joi.string().optional(),
  description: Joi.string().optional(),
  userId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class LogController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createLogSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateLogSchema.validate(request.body);
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
  createLog = async (
    request: Request<object, object, Omit<Log, "id"> & { userId: number }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createLogSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newLog = await logLogic.createLog(request.body);
      response.status(201).json(newLog);
    } catch (err) {
      throw new CustomError("Failed to create log", undefined, err as Error);
    }
  };

  updateLog = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Log, "id">> & { userId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateLogSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedLog = await logLogic.updateLog(Number(id), request.body);
      response.status(200).json(updatedLog);
    } catch (err) {
      throw new CustomError("Failed to update log", undefined, err as Error);
    }
  };

  getLogs = async (request: Request, response: Response) => {
    try {
      const logs = await logLogic.getAllLogs();
      response.status(200).json(logs);
    } catch (err) {
      throw new CustomError("Failed to fetch logs", undefined, err as Error);
    }
  };

  deleteLog = async (request: Request<{ id: string }>, response: Response) => {
    const { id } = request.params;
    try {
      await logLogic.deleteLog(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete log", undefined, err as Error);
    }
  };
}
