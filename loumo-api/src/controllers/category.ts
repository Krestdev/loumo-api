import { Request, Response } from "express";
import Joi from "joi";
import { Category } from "@prisma/client";
import { CustomError } from "../middleware/errorHandler";
import { CategoryLogic } from "../logic/category";

const categoryLogic = new CategoryLogic();

// Category schemas
const createCategorySchema = Joi.object({
  name: Joi.string(),
  parentId: Joi.number(),
  umgUrl: Joi.string(),
  weight: Joi.number(),
  display: Joi.boolean(),
  status: Joi.boolean().optional(),
  ids: Joi.array().items(Joi.number()),
  children: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      umgUrl: Joi.string(),
      weight: Joi.number(),
      display: Joi.boolean(),
      status: Joi.boolean().optional(),
      ids: Joi.array().items(Joi.number()),
    })
  ),
  childrenIds: Joi.array().items(Joi.number()),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.number(),
  umgUrl: Joi.string().optional(),
  weight: Joi.number().optional(),
  display: Joi.boolean(),
  status: Joi.boolean().optional(),
  productIds: Joi.array().items(Joi.number()).optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class CategoryController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createCategorySchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateCategorySchema.validate(request.body);
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

  // Get all categorys
  getCategory = async (request: Request, response: Response) => {
    try {
      const categorys = await categoryLogic.getAllCategorys();
      response.status(200).json(categorys);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch categorys",
        undefined,
        error as Error
      );
    }
  };

  // Get one category by ID
  getOneCategory = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const category = await categoryLogic.getCategoryById(id);
      if (!category) {
        response.status(404).json({ message: "Category not found" });
      }
      response.status(200).json(category);
    } catch (error) {
      throw new CustomError(
        "Failed to fetch category",
        undefined,
        error as Error
      );
    }
  };

  // Create a new category
  createCategory = async (
    request: Request<
      object,
      object,
      Omit<Category, "id"> & { productIds?: number[]; childrenIds?: number[] }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      request.body.imgUrl = request.file?.filename ?? null;
      const newCategory = await categoryLogic.createCategory(request.body);
      response.status(201).json(newCategory);
    } catch (error) {
      throw new CustomError(
        "Failed to create category",
        undefined,
        error as Error
      );
    }
  };

  // Update an existing category
  updateCategory = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Category, "id">> & { productIds: number[] }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "update")) return;

    const id = Number(request.params.id);
    try {
      if (request.file) request.body.imgUrl = request.file?.filename;
      const updatedCategory = await categoryLogic.updateCategory(
        id,
        request.body
      );
      if (!updatedCategory) {
        response.status(404).json({ message: "Category not found" });
      }
      response.status(200).json(updatedCategory);
    } catch (error) {
      throw new CustomError(
        "Failed to update category",
        undefined,
        error as Error
      );
    }
  };

  // Delete a category
  deleteCategory = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await categoryLogic.deleteCategory(id);
      if (!deleted) {
        response.status(404).json({ message: "Category not found" });
      }
      response.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      throw new CustomError(
        "Failed to delete category",
        undefined,
        error as Error
      );
    }
  };
}
