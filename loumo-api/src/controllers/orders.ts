import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Order, OrderItem } from "@prisma/client";
import { OrderLogic } from "../logic/order";

const orderLogic = new OrderLogic();

const createOrderSchema = Joi.object({
  note: Joi.string(),
  status: Joi.string(),
  weight: Joi.number().required().required(),
  addressId: Joi.number().optional(),
  userId: Joi.number().optional(),
  total: Joi.number().required().required(),
  deliveryFee: Joi.number().required(),
  orderItems: Joi.array().items(
    Joi.object({
      note: Joi.string().min(0),
      total: Joi.number(),
      orderId: Joi.number(),
      productVariantId: Joi.number(),
      quantity: Joi.number(),
      deliveryId: Joi.number(),
    })
  ),
});

const updateOrderSchema = Joi.object({
  note: Joi.string().optional(),
  status: Joi.string().optional(),
  weight: Joi.number().optional(),
  addressId: Joi.number().optional(),
  userId: Joi.number().optional(),
  total: Joi.number(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class OrderController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createOrderSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateOrderSchema.validate(request.body);
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
  createOrder = async (
    request: Request<
      object,
      object,
      Omit<Order, "id"> & {
        addressId: number;
        userId: number;
        orderItems: Omit<OrderItem, "id">[];
      }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createOrderSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newOrder = await orderLogic.createOrder(request.body);
      response.status(201).json(newOrder);
    } catch (err) {
      throw new CustomError("Failed to create order", undefined, err as Error);
    }
  };

  updateOrder = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Order, "id">> & { addressId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateOrderSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedOrder = await orderLogic.updateOrder(
        Number(id),
        request.body
      );
      response.status(200).json(updatedOrder);
    } catch (err) {
      throw new CustomError("Failed to update order", undefined, err as Error);
    }
  };

  getOrders = async (request: Request, response: Response) => {
    try {
      const orders = await orderLogic.getAllOrders();
      response.status(200).json(orders);
    } catch (err) {
      throw new CustomError("Failed to fetch orders", undefined, err as Error);
    }
  };

  getOneOrder = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const orders = await orderLogic.getOrderById(id);
      response.status(200).json(orders);
    } catch (err) {
      throw new CustomError("Failed to fetch orders", undefined, err as Error);
    }
  };

  deleteOrder = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await orderLogic.deleteOrder(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete order", undefined, err as Error);
    }
  };
}
