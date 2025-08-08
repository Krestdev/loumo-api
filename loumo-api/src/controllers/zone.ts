import { Request, Response } from "express";
import Joi from "joi";
import { Zone } from "@prisma/client";
import { ZoneLogic } from "../logic/zone";
import { CustomError } from "../middleware/errorHandler";

const zoneLogic = new ZoneLogic();

// Zone schemas
const createZoneSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number(),
  ids: Joi.array().items(Joi.number()),
  status: Joi.string().required(),
  description: Joi.string(),
});

const updateZoneSchema = Joi.object({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  description: Joi.string().optional(),
  status: Joi.string(),
  addressIds: Joi.array().items(Joi.number()).optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class ZoneController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createZoneSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateZoneSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "paramId":
        result = paramSchema.validate(request.params);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
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

  // Get all zones
  getZone = async (request: Request, response: Response) => {
    try {
      const zones = await zoneLogic.getAllZones();
      response.status(200).json(zones);
    } catch (error) {
      throw new CustomError("Failed to fetch zones", undefined, error as Error);
    }
  };

  // Get one zone by ID
  getOneZone = async (request: Request<{ id: string }>, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const zone = await zoneLogic.getZoneById(id);
      if (!zone) {
        response.status(404).json({ message: "Zone not found" });
      }
      response.status(200).json(zone);
    } catch (error) {
      throw new CustomError("Failed to fetch zone", undefined, error as Error);
    }
  };

  // Create a new zone
  createZone = async (
    request: Request<
      object,
      object,
      Omit<Zone, "id"> & { addressIds?: number[] }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newZone = await zoneLogic.createZone(request.body);
      response.status(201).json(newZone);
    } catch (error) {
      throw new CustomError("Failed to create zone", undefined, error as Error);
    }
  };

  // Update an existing zone
  updateZone = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Zone, "id">> & { addressIds: number[] }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedZone = await zoneLogic.updateZone(id, request.body);
      if (!updatedZone) {
        response.status(404).json({ message: "Zone not found" });
      }
      response.status(200).json(updatedZone);
    } catch (error) {
      throw new CustomError("Failed to update zone", undefined, error as Error);
    }
  };

  // Delete a zone
  deleteZone = async (request: Request<{ id: string }>, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await zoneLogic.deleteZone(id);
      if (!deleted) {
        response.status(404).json({ message: "Zone not found" });
      }
      response.status(200).json({ message: "Zone deleted successfully" });
    } catch (error) {
      throw new CustomError("Failed to delete zone", undefined, error as Error);
    }
  };
}
