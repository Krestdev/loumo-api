import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { OrderItem } from "@prisma/client";
import { OrderItemLogic } from "../logic/orderItem";

const orderItemLogic = new OrderItemLogic();

const createOrderItemSchema = Joi.object({
  note: Joi.string(),
  orderId: Joi.number(),
  deliveryId: Joi.number().optional(),
  productVariantId: Joi.number(),
});

const updateOrderItemSchema = Joi.object({
  note: Joi.string().optional(),
  deliveryId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class OrderItemController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createOrderItemSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateOrderItemSchema.validate(request.body);
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
  createOrderItem = async (
    request: Request<
      object,
      object,
      Omit<OrderItem, "id"> & { orderId: number; deliveryId: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createOrderItemSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newOrderItem = await orderItemLogic.createOrderItem(request.body);
      response.status(201).json(newOrderItem);
    } catch (err) {
      throw new CustomError(
        "Failed to create orderItem",
        undefined,
        err as Error
      );
    }
  };

  updateOrderItem = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<OrderItem, "id" | "orderId">> & { deliveryId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateOrderItemSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedOrderItem = await orderItemLogic.updateOrderItem(
        Number(id),
        request.body
      );
      response.status(200).json(updatedOrderItem);
    } catch (err) {
      throw new CustomError(
        "Failed to update orderItem",
        undefined,
        err as Error
      );
    }
  };

  getOrderItems = async (request: Request, response: Response) => {
    try {
      const orderItems = await orderItemLogic.getAllOrderItems();
      response.status(200).json(orderItems);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch orderItems",
        undefined,
        err as Error
      );
    }
  };

  getAnOrderItem = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const orderItems = await orderItemLogic.getOrderItemById(id);
      response.status(200).json(orderItems);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch orderItems",
        undefined,
        err as Error
      );
    }
  };

  deleteOrderItem = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await orderItemLogic.deleteOrderItem(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete orderItem",
        undefined,
        err as Error
      );
    }
  };
}
