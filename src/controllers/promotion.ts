import { Request, Response } from "express";
import Joi from "joi";
import { Promotion } from "../../generated/prisma";
import { CustomError } from "../middleware/errorHandler";
import { PromotionLogic } from "../logic/promotion";

const promotionLogic = new PromotionLogic();

// Promotion schemas
const createPromotionSchema = Joi.object({
  code: Joi.string(),
  percentage: Joi.number(),
  expireAt: Joi.date().optional(),
  stockIds: Joi.array().items(Joi.number()),
});

const updatePromotionSchema = Joi.object({
  code: Joi.string().optional(),
  percentage: Joi.number().optional(),
  expireAt: Joi.date().optional(),
  stockIds: Joi.array().items(Joi.number()),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class PromotionController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createPromotionSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updatePromotionSchema.validate(request.body);
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

  // Get all promotions
  getPromotion = async (request: Request, response: Response) => {
    try {
      const promotions = await promotionLogic.getAllPromotions();
      response.status(200).json(promotions);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch promotions",
        undefined,
        error as Error
      );
    }
  };

  // Get one promotion by ID
  getOnePromotion = async (
    request: Request<{ id: string }, {}, {}, {}>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const promotion = await promotionLogic.getPromotionById(id);
      if (!promotion) {
        response.status(404).json({ message: "Promotion not found" });
      }
      response.status(200).json(promotion);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch promotion",
        undefined,
        error as Error
      );
    }
  };

  // Create a new promotion
  createPromotion = async (
    request: Request<{}, {}, Omit<Promotion, "id"> & { stockIds?: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newPromotion = await promotionLogic.createPromotion(request.body);
      response.status(201).json(newPromotion);
    } catch (error) {
      throw new CustomError(
        "Failed to create promotion",
        undefined,
        error as Error
      );
    }
  };

  // Update an existing promotion
  updatePromotion = async (
    request: Request<
      { id: string },
      {},
      Partial<Omit<Promotion, "id">> & { stockIds: number[] }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedPromotion = await promotionLogic.updatePromotion(
        id,
        request.body
      );
      if (!updatedPromotion) {
        response.status(404).json({ message: "Promotion not found" });
      }
      response.status(200).json(updatedPromotion);
    } catch (error) {
      throw new CustomError(
        "Failed to update promotion",
        undefined,
        error as Error
      );
    }
  };

  // Delete a promotion
  deletePromotion = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await promotionLogic.deletePromotion(id);
      if (!deleted) {
        response.status(404).json({ message: "Promotion not found" });
      }
      response.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
      throw new CustomError(
        "Failed to delete promotion",
        undefined,
        error as Error
      );
    }
  };
}
