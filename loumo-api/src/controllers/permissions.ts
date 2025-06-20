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

export default class PermissionController {
  createPermission = async (
    request: Request<{}, {}, { action: string; ids: number[] }>,
    response: Response
  ) => {
    const { action, ids } = request.body;
    const { error } = createPermissionSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newPermission = await permissionLogic.createPermission(
        request.body
      );
      response.status(201).json(newPermission);
    } catch (err) {
      console.log(err);
      throw new CustomError(
        "Failed to create permission",
        undefined,
        err as Error
      );
    }
  };

  updatePermission = async (
    request: Request<{ id: string }, {}, { action?: string; ids?: number[] }>,
    response: Response
  ) => {
    const { id } = request.params;
    const { action, ids } = request.body;
    const { error } = updatePermissionSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
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

  deletePermission = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
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
