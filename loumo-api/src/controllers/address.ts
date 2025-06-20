import { Request, Response } from "express";
import Joi from "joi";
import { AddressLogic } from "../logic/address";
import { CustomError } from "../middleware/errorHandler";
import { Address } from "../../generated/prisma";

const addressLogic = new AddressLogic();

const createAddressSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  published: Joi.boolean().optional(),
  zoneId: Joi.number().optional(),
});

const updateAddressSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  published: Joi.boolean().optional(),
  zoneId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class AddressController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createAddressSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateAddressSchema.validate(request.body);
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
  createAddress = async (
    request: Request<object, object, Address & { zoneId?: number }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createAddressSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newAddress = await addressLogic.createAddress(request.body);
      response.status(201).json(newAddress);
    } catch (err) {
      console.log(err);
      throw new CustomError(
        "Failed to create address",
        undefined,
        err as Error
      );
    }
  };

  updateAddress = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Address, "id">> & { zoneId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateAddressSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedAddress = await addressLogic.updateAddress(
        Number(id),
        request.body
      );
      response.status(200).json(updatedAddress);
    } catch (err) {
      throw new CustomError(
        "Failed to update address",
        undefined,
        err as Error
      );
    }
  };

  getAddresss = async (request: Request, response: Response) => {
    try {
      const addresss = await addressLogic.getAllAddresss();
      response.status(200).json(addresss);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch addresss",
        undefined,
        err as Error
      );
    }
  };

  deleteAddress = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await addressLogic.deleteAddress(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete address",
        undefined,
        err as Error
      );
    }
  };
}
