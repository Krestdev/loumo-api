import { Request, Response } from "express";
import Joi from "joi";
import { Stock } from "@prisma/client";
import { CustomError } from "../middleware/errorHandler";
import { StockLogic } from "../logic/stock";

const stockLogic = new StockLogic();

// Stock schemas
const createStockSchema = Joi.object({
  quantity: Joi.number(),
  productVariantId: Joi.number(),
  shopId: Joi.number(),
  threshold: Joi.number(),
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().optional(),
  promotionId: Joi.number().optional(),
  threshold: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class StockController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createStockSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateStockSchema.validate(request.body);
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

  // Get all stocks
  getStock = async (request: Request, response: Response) => {
    try {
      const stocks = await stockLogic.listStocks();
      response.status(200).json(stocks);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch stocks",
        undefined,
        error as Error
      );
    }
  };

  // Get one stock by ID
  getOneStock = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const stock = await stockLogic.getStockById(id);
      if (!stock) {
        response.status(404).json({ message: "Stock not found" });
      }
      response.status(200).json(stock);
    } catch (error) {
      throw new CustomError("Failed to fetch stock", undefined, error as Error);
    }
  };

  // Create a new stock
  createStock = async (
    request: Request<
      object,
      object,
      Omit<Stock, "id" | "promotionId"> & {
        orderId: number;
        orderItemsIds?: number[];
      }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newStock = await stockLogic.createStock(request.body);
      response.status(201).json(newStock);
    } catch (error) {
      throw new CustomError(
        "Failed to create stock",
        undefined,
        error as Error
      );
    }
  };

  // Create a new stock
  reStock = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Stock, "id" | "promotionId">>
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedStock = await stockLogic.updateStock(id, request.body);
      if (!updatedStock) {
        response.status(404).json({ message: "Stock not found" });
      }
      response.status(200).json(updatedStock);
    } catch (error) {
      throw new CustomError(
        "Failed to create stock",
        undefined,
        error as Error
      );
    }
  };

  // Update an existing stock
  updateStock = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Stock, "id" | "productVariantId">> & { promotionId?: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedStock = await stockLogic.updateStock(id, request.body);
      if (!updatedStock) {
        response.status(404).json({ message: "Stock not found" });
      }
      response.status(200).json(updatedStock);
    } catch (error) {
      throw new CustomError(
        "Failed to update stock",
        undefined,
        error as Error
      );
    }
  };

  // Delete a stock
  deleteStock = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await stockLogic.deleteStock(id);
      if (!deleted) {
        response.status(404).json({ message: "Stock not found" });
      }
      response.status(200).json({ message: "Stock deleted successfully" });
    } catch (error) {
      throw new CustomError(
        "Failed to delete stock",
        undefined,
        error as Error
      );
    }
  };
}
