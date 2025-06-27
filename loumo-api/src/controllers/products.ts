import { Request, Response } from "express";
import Joi, { boolean } from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Product } from "../../generated/prisma";
import { ProductLogic } from "../logic/products";

const productLogic = new ProductLogic();

const createProductSchema = Joi.object({
  name: Joi.string(),
  slug: Joi.string(),
  weight: Joi.number(),
  status: Joi.boolean(),
  categoryId: Joi.number().optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  slug: Joi.string().optional(),
  weight: Joi.number().optional(),
  status: Joi.boolean().optional(),
  categoryId: Joi.number().optional(),
});

const bulkUpdateProductSchema = Joi.object({
  product: Joi.array().items(
    Joi.object({
      name: Joi.string().optional(),
      slug: Joi.string().optional(),
      weight: Joi.number().optional(),
      status: Joi.boolean().optional(),
      categoryId: Joi.number().optional(),
    })
  ),
  status: Joi.boolean(),
  categoryId: Joi.number(),
});

const bulkDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number()),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

const slugSchema = Joi.object({
  slug: Joi.string(),
});

export default class ProductController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema:
      | "create"
      | "update"
      | "bulkUpdate"
      | "paramId"
      | "slug"
      | "bulckDelete"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createProductSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateProductSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "bulkUpdate":
        result = bulkUpdateProductSchema.validate(request.body);
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
      case "slug":
        result = slugSchema.validate(request.params);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "bulckDelete":
        result = bulkDeleteSchema.validate(request.body);
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
  createProduct = async (
    request: Request<
      object,
      object,
      Omit<Product, "id" | "createdAt"> & { categoryId: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createProductSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newProduct = await productLogic.createProduct(request.body);
      response.status(201).json(newProduct);
    } catch (err) {
      throw new CustomError(
        "Failed to create product",
        undefined,
        err as Error
      );
    }
  };

  updateProduct = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Product, "id">> & { categoryId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateProductSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedProduct = await productLogic.updateProduct(
        Number(id),
        request.body
      );
      response.status(200).json(updatedProduct);
    } catch (err) {
      throw new CustomError(
        "Failed to update product",
        undefined,
        err as Error
      );
    }
  };

  updateBulkProduct = async (
    request: Request<
      object,
      { product: Partial<Product>[]; categoryId?: number; status?: boolean }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "bulkUpdate")) return;
    try {
      const updatedProduct = await productLogic.updateBulkProduct(
        request.body.product,
        request.body.categoryId,
        request.body.status
      );
      response.status(200).json(updatedProduct);
    } catch (err) {
      throw new CustomError(
        "Failed to update product",
        undefined,
        err as Error
      );
    }
  };

  getProducts = async (request: Request, response: Response) => {
    try {
      const products = await productLogic.getAllProducts();
      response.status(200).json(products);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch products",
        undefined,
        err as Error
      );
    }
  };

  getOneProduct = async (request: Request, response: Response) => {
    const { id } = request.params;
    if (!this.validate(request, response, "paramId")) return;
    try {
      const products = await productLogic.getProductById(Number(id));
      response.status(200).json(products);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch products",
        undefined,
        err as Error
      );
    }
  };

  getSlugProduct = async (request: Request, response: Response) => {
    const { slug } = request.params;
    if (!this.validate(request, response, "slug")) return;
    try {
      const products = await productLogic.getProductBySlug(slug);
      response.status(200).json(products);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch products",
        undefined,
        err as Error
      );
    }
  };

  deleteProduct = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await productLogic.deleteProduct(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete product",
        undefined,
        err as Error
      );
    }
  };

  bulkDeleteProduct = async (
    request: Request<object, object, { ids: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "bulckDelete")) return;
    const { ids } = request.body;
    try {
      await productLogic.deleteBulkProduct(ids);
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete products",
        undefined,
        err as Error
      );
    }
  };
}
