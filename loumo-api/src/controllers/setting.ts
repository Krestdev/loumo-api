import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Setting } from "../../generated/prisma";
import { SettingLogic } from "../logic/setting";

const settingLogic = new SettingLogic();

const createSettingSchema = Joi.object({
  name: Joi.string(),
  content: Joi.string().optional(),
  value: Joi.number(),
  note: Joi.string().optional(),
  section: Joi.string(),
  date: Joi.date().optional(),
});

const updateSettingSchema = Joi.object({
  name: Joi.string().optional(),
  content: Joi.string().optional(),
  value: Joi.number().optional(),
  note: Joi.string().optional(),
  section: Joi.string().optional(),
  date: Joi.date().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

const querySchema = Joi.object({
  section: Joi.string(),
});

export default class SettingController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "query"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createSettingSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateSettingSchema.validate(request.body);
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
      case "query":
        result = querySchema.validate(request.params);
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
  createSetting = async (
    request: Request<object, object, Omit<Setting, "id">>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createSettingSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newSetting = await settingLogic.createSetting(request.body);
      response.status(201).json(newSetting);
    } catch (err) {
      throw new CustomError(
        "Failed to create setting",
        undefined,
        err as Error
      );
    }
  };

  updateSetting = async (
    request: Request<{ id: string }, object, Partial<Omit<Setting, "id">>>,
    response: Response
  ) => {
    const { id } = request.params;
    this.validate(request, response, "paramId");
    this.validate(request, response, "update");

    try {
      const updatedSetting = await settingLogic.updateSetting(
        Number(id),
        request.body
      );
      response.status(200).json(updatedSetting);
    } catch (err) {
      throw new CustomError(
        "Failed to update setting",
        undefined,
        err as Error
      );
    }
  };

  getSettings = async (
    request: Request<object, object, object, { section: string }>,
    response: Response
  ) => {
    this.validate(request, response, "query");
    const { section } = request.query;
    try {
      const settings = await settingLogic.getAllSettings(section);
      response.status(200).json(settings);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch settings",
        undefined,
        err as Error
      );
    }
  };

  deleteSetting = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await settingLogic.deleteSetting(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete setting",
        undefined,
        err as Error
      );
    }
  };
}
