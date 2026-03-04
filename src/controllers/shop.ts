import { Request, Response } from "express";
import Joi from "joi";
import { Address, Shop, Zone } from "@prisma/client";
import { ShopLogic } from "../logic/shop";
import { CustomError } from "../middleware/errorHandler";

const shopLogic = new ShopLogic();

const createShopSchema = Joi.object({
  name: Joi.string(),
  addressId: Joi.number().optional(),
  zone: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
    status: Joi.string(),
    addresses: Joi.array().items(
      Joi.object({
        description: Joi.string(),
        local: Joi.string(),
        street: Joi.string(),
        published: Joi.boolean(),
        createdAt: Joi.string(),
        updatedAt: Joi.string(),
      })
    ),
  }),
  address: Joi.object({
    description: Joi.string(),
    local: Joi.string(),
    street: Joi.string(),
    published: Joi.boolean(),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
  }),
});

const updateShopSchema = Joi.object({
  name: Joi.string().optional(),
  addressId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class ShopController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createShopSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateShopSchema.validate(request.body);
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
  createShop = async (
    request: Request<
      object,
      object,
      Omit<Shop, "id"> & {
        addressId?: number;
        zone?: Omit<Zone, "id"> & {
          addressIds?: number[];
          addresses?: Address[];
        };
        address?: Omit<Address, "id" | "zoneId">;
      }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createShopSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newShop = await shopLogic.createShop(request.body);
      response.status(201).json(newShop);
    } catch (err) {
      throw new CustomError("Failed to create shop", undefined, err as Error);
    }
  };

  updateShop = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Shop, "id">> & { addressId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateShopSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedShop = await shopLogic.updateShop(Number(id), request.body);
      response.status(200).json(updatedShop);
    } catch (err) {
      throw new CustomError("Failed to update shop", undefined, err as Error);
    }
  };

  getShops = async (request: Request, response: Response) => {
    try {
      const shops = await shopLogic.getAllShops();
      response.status(200).json(shops);
    } catch (err) {
      throw new CustomError("Failed to fetch shops", undefined, err as Error);
    }
  };

  getOneShop = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const shops = await shopLogic.getShopById(id);
      response.status(200).json(shops);
    } catch (err) {
      throw new CustomError("Failed to fetch shops", undefined, err as Error);
    }
  };

  deleteShop = async (request: Request<{ id: string }>, response: Response) => {
    const { id } = request.params;
    try {
      await shopLogic.deleteShop(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete shop", undefined, err as Error);
    }
  };
}
