import { Request, Response } from "express";
import Joi from "joi";
import { Payment } from "../../generated/prisma";
import { CustomError } from "../middleware/errorHandler";
import { PaymentLogic } from "../logic/payments";

const paymentLogic = new PaymentLogic();

// Payment schemas
const createPaymentSchema = Joi.object({
  name: Joi.string(),
  total: Joi.number(),
  status: Joi.string(),
  tel: Joi.string().required(),
  method: Joi.string().required(),
  ref: Joi.string(),
  ids: Joi.array().items(Joi.number()),
  orderId: Joi.number(),
});

const updatePaymentSchema = Joi.object({
  name: Joi.string().optional(),
  total: Joi.number().optional(),
  status: Joi.string().optional(),
  tel: Joi.string().optional(),
  method: Joi.string().optional(),
  ref: Joi.string().optional(),
  orderId: Joi.number(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class PaymentController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createPaymentSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updatePaymentSchema.validate(request.body);
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

  // Get all payments
  getPayment = async (request: Request, response: Response) => {
    try {
      const payments = await paymentLogic.listPayments();
      response.status(200).json(payments);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch payments",
        undefined,
        error as Error
      );
    }
  };

  // Get one payment by ID
  getOnePayment = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const payment = await paymentLogic.getPaymentById(id);
      if (!payment) {
        response.status(404).json({ message: "Payment not found" });
      }
      response.status(200).json(payment);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch payment",
        undefined,
        error as Error
      );
    }
  };

  // Create a new payment
  createPayment = async (
    request: Request<object, object, Omit<Payment, "id"> & { orderId: number }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newPayment = await paymentLogic.createPayment(request.body);
      response.status(201).json(newPayment);
    } catch (error) {
      throw new CustomError(
        "Failed to create payment",
        undefined,
        error as Error
      );
    }
  };

  // Update an existing payment
  updatePayment = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Payment, "id">> & { orderId: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      const updatedPayment = await paymentLogic.updatePayment(id, request.body);
      if (!updatedPayment) {
        response.status(404).json({ message: "Payment not found" });
      }
      response.status(200).json(updatedPayment);
    } catch (error) {
      throw new CustomError(
        "Failed to update payment",
        undefined,
        error as Error
      );
    }
  };

  // Delete a payment
  deletePayment = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await paymentLogic.deletePayment(id);
      if (!deleted) {
        response.status(404).json({ message: "Payment not found" });
      }
      response.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
      throw new CustomError(
        "Failed to delete payment",
        undefined,
        error as Error
      );
    }
  };
}
