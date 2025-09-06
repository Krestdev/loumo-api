import { Request, Response } from "express";
import Joi from "joi";
import { Product, ProductVariant, Stock } from "@prisma/client";
import { ProductLogic } from "../logic/products";
import { CustomError } from "../middleware/errorHandler";

const productLogic = new ProductLogic();

const createProductSchema = Joi.object({
  name: Joi.string(),
  slug: Joi.string(),
  description: Joi.string(),
  weight: Joi.number(),
  status: Joi.boolean(),
  categoryId: Joi.number().optional(),
  variantImages: Joi.array().items(Joi.string()),
  variants: Joi.array().items(
    Joi.object({
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
    })
  ),
});

const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string(),
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
        // eslint-disable-next-line no-case-declarations
        const { variants: variantsA } = request.body;
        result = createProductSchema.validate({
          ...request.body,
          variants: variantsA
            ? JSON.parse(variantsA as unknown as string)
            : undefined,
        });
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
      Omit<Product, "id" | "updatedAt" | "createdAt"> & {
        categoryId: number;
        variantImages: string[];
        variants?: (ProductVariant & { stock: Stock[] })[];
      }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      let data: Omit<Product, "id" | "updatedAt" | "createdAt" | "ref"> & {
        categoryId?: number;
        variants?: (ProductVariant & { stock: Stock[] })[];
      };
      let { variants } = request.body;
      if (variants) {
        variants = JSON.parse(variants as unknown as string);
        let files = null;
        if (request.files) {
          files = request.files as Express.Multer.File[];
        }
        const enrichedVariants = variants?.map(
          (variant: ProductVariant & { stock: Stock[] }, index: number) => {
            if (files && files.length > 0) {
              return {
                ...variant,
                imgUrl: files[index].filename
                  ? `/uploads/${files[index].filename}`
                  : null,
              };
            } else {
              return variant;
            }
          }
        );

        data = {
          name: request.body.name,
          slug: request.body.slug,
          description: request.body.description,
          weight: Number(request.body.weight),
          status: Boolean(request.body.status),
          categoryId: Number(request.body.categoryId),
          variants: enrichedVariants,
        };
      } else {
        data = {
          ...request.body,
        };
      }
      const newProduct = await productLogic.createProduct(data);
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
