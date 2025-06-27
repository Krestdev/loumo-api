import { Request, Response } from "express";
import Joi from "joi";
import { PermissionLogic } from "../logic/permission";
import { CustomError } from "../middleware/errorHandler";
import { Permission } from "../../generated/prisma";

const permissionLogic = new PermissionLogic();

const createPermissionSchema = Joi.object({
  action: Joi.string(),
  ids: Joi.array().items(Joi.number()),
});

const updatePermissionSchema = Joi.object({
  action: Joi.string(),
  ids: Joi.array().items(Joi.number()),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class PermissionController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "create" | "update" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createPermissionSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "update":
        result = updatePermissionSchema.validate(request.body);
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

  createPermission = async (
    request: Request<object, object, { action: string; ids: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;

    try {
      const newPermission = await permissionLogic.createPermission(
        request.body
      );
      response.status(201).json(newPermission);
    } catch (err) {
      throw new CustomError(
        "Failed to create permission",
        undefined,
        err as Error
      );
    }
  };

  updatePermission = async (
    request: Request<
      { id: string },
      object,
      { action?: string; ids?: number[] }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    if (!this.validate(request, response, "update")) return;
    if (!this.validate(request, response, "paramId")) return;
    try {
      const updatedPermission = await permissionLogic.updatePermission(
        Number(id),
        request.body as Permission
      );
      response.status(200).json(updatedPermission);
    } catch (err) {
      throw new CustomError(
        "Failed to update permission",
        undefined,
        err as Error
      );
    }
  };

  getPermissions = async (request: Request, response: Response) => {
    try {
      const permissions = await permissionLogic.getAllPermissions();
      response.status(200).json(permissions);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch permissions",
        undefined,
        err as Error
      );
    }
  };

  getOnePermission = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const permissions = await permissionLogic.getPermissionById(id);
      response.status(200).json(permissions);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch permissions",
        undefined,
        err as Error
      );
    }
  };

  deletePermission = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    if (!this.validate(request, response, "paramId")) return;
    try {
      await permissionLogic.deletePermission(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete permission",
        undefined,
        err as Error
      );
    }
  };
}
