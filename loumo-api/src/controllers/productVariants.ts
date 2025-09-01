import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { ProductVariant, Stock } from "@prisma/client";
import { ProductVariantLogic } from "../logic/productVariants";

const productVariantLogic = new ProductVariantLogic();

const createProductVariantSchema = Joi.object({
  name: Joi.string(),
  weight: Joi.number(),
  price: Joi.number(),
  quantity: Joi.number(),
  unit: Joi.string(),
  status: Joi.boolean(),
  imgUrl: Joi.string(),
  productId: Joi.number().optional(),
  stock: Joi.array().items(
    Joi.object({
      quantity: Joi.number(),
      productVariantId: Joi.number(),
      shopId: Joi.number(),
      threshold: Joi.number(),
    })
  ),
});

const updateProductVariantSchema = Joi.object({
  name: Joi.string(),
  weight: Joi.number(),
  price: Joi.number(),
  quantity: Joi.number(),
  unit: Joi.string(),
  status: Joi.boolean(),
  imgUrl: Joi.string(),
  productId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class ProductVariantController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createProductVariantSchema.validate({
          ...request.body,
        });
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateProductVariantSchema.validate(request.body);
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
  createProductVariant = async (
    request: Request<
      object,
      object,
      Omit<ProductVariant, "id"> & { productId: number; stock?: Stock[] }
    >,
    response: Response
  ) => {
    request.body.stock = request.body.stock
      ? JSON.parse(request.body.stock as unknown as string)
      : [];
    if (!this.validate(request, response, "create")) return;
    const { error } = createProductVariantSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      request.body.imgUrl = request.file?.filename ?? null;
      const newProductVariant = await productVariantLogic.createProduct(
        request.body
      );
      response.status(201).json(newProductVariant);
    } catch (err) {
      throw new CustomError(
        "Failed to create productVariant",
        undefined,
        err as Error
      );
    }
  };

  updateProductVariant = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<ProductVariant, "id">> & {
        productId?: number;
      }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateProductVariantSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      if (request.file) request.body.imgUrl = request.file?.filename;
      const updatedProductVariant = await productVariantLogic.updateProduct(
        Number(id),
        request.body
      );
      response.status(200).json(updatedProductVariant);
    } catch (err) {
      throw new CustomError(
        "Failed to update productVariant",
        undefined,
        err as Error
      );
    }
  };

  getProductVariants = async (request: Request, response: Response) => {
    try {
      const productVariants = await productVariantLogic.getAllProducts();
      response.status(200).json(productVariants);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch productVariants",
        undefined,
        err as Error
      );
    }
  };

  getOneProductVariant = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const productVariants = await productVariantLogic.getProductById(id);
      response.status(200).json(productVariants);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch productVariants",
        undefined,
        err as Error
      );
    }
  };

  deleteProductVariant = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await productVariantLogic.deleteProduct(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete productVariant",
        undefined,
        err as Error
      );
    }
  };
}
