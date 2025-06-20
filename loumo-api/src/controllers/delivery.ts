import { Request, Response } from "express";
import Joi from "joi";
import { Delivery } from "../../generated/prisma";
import { CustomError } from "../middleware/errorHandler";
import { DeliveryLogic } from "../logic/delivery";

const deliveryLogic = new DeliveryLogic();

// Delivery schemas
const createDeliverySchema = Joi.object({
  status: Joi.string(),
  agentId: Joi.number(),
  orderItemsIds: Joi.array().items(Joi.number()).optional(),
  orderId: Joi.number(),
});

const updateDeliverySchema = Joi.object({
  status: Joi.string().optional(),
  agentId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class DeliveryController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createDeliverySchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateDeliverySchema.validate(request.body);
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

  // Get all deliverys
  getDelivery = async (request: Request, response: Response) => {
    try {
      const deliverys = await deliveryLogic.listDeliverys();
      response.status(200).json(deliverys);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch deliverys",
        undefined,
        error as Error
      );
    }
  };

  // Get one delivery by ID
  getOneDelivery = async (
    request: Request<{ id: string }, {}, {}, {}>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const delivery = await deliveryLogic.getDeliveryById(id);
      if (!delivery) {
        response.status(404).json({ message: "Delivery not found" });
      }
      response.status(200).json(delivery);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch delivery",
        undefined,
        error as Error
      );
    }
  };

  // Create a new delivery
  createDelivery = async (
    request: Request<
      {},
      {},
      Omit<Delivery, "id" | "agentId"> & {
        orderId: number;
        orderItemsIds?: number[];
      }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newDelivery = await deliveryLogic.createDelivery(request.body);
      response.status(201).json(newDelivery);
    } catch (error) {
      throw new CustomError(
        "Failed to create delivery",
        undefined,
        error as Error
      );
    }
  };

  // Update an existing delivery
  updateDelivery = async (
    request: Request<
      { id: string },
      {},
      Partial<Omit<Delivery, "id" | "orderId">> & { agentId?: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedDelivery = await deliveryLogic.updateDelivery(
        id,
        request.body
      );
      if (!updatedDelivery) {
        response.status(404).json({ message: "Delivery not found" });
      }
      response.status(200).json(updatedDelivery);
    } catch (error) {
      throw new CustomError(
        "Failed to update delivery",
        undefined,
        error as Error
      );
    }
  };

  // Delete a delivery
  deleteDelivery = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await deliveryLogic.deleteDelivery(id);
      if (!deleted) {
        response.status(404).json({ message: "Delivery not found" });
      }
      response.status(200).json({ message: "Delivery deleted successfully" });
    } catch (error) {
      throw new CustomError(
        "Failed to delete delivery",
        undefined,
        error as Error
      );
    }
  };
}
