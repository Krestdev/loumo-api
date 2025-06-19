import { Request, Response } from "express";
import Joi from "joi";
import { Role } from "../../generated/prisma";
import { RoleLogic } from "../logic/role";
import { CustomError } from "../middleware/errorHandler";

const roleLogic = new RoleLogic();

// Role schemas
const createRoleSchema = Joi.object({
  name: Joi.string(),
  ids: Joi.array().items(Joi.number()),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().optional(),
  ids: Joi.array().items(Joi.number()),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class RoleController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema: "roleCreate" | "roleUpdate" | "paramId" | "queryData"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "roleCreate":
        result = createRoleSchema.validate(request.body);
        if (result.error) {
          response
            .status(400)
            .json({ result: result.error.details[0].message });
        }
        break;
      case "roleUpdate":
        result = updateRoleSchema.validate(request.body);
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

  // Get all roles
  getRole = async (request: Request, response: Response) => {
    try {
      const roles = await roleLogic.listRoles();
      response.status(200).json(roles);
    } catch (error) {
      throw new CustomError("Failed to fetch roles", undefined, error as Error);
    }
  };

  // Get one role by ID
  getOneRole = async (
    request: Request<{ id: string }, {}, {}, {}>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const role = await roleLogic.getRoleById(id);
      if (!role) {
        response.status(404).json({ message: "Role not found" });
      }
      response.status(200).json(role);
    } catch (error) {
      throw new CustomError("Failed to fetch role", undefined, error as Error);
    }
  };

  // Create a new role
  createRole = async (
    request: Request<{}, {}, Omit<Role, "id"> & { ids: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "roleCreate")) return;
    try {
      const newRole = await roleLogic.createRole(request.body);
      response.status(201).json(newRole);
    } catch (error) {
      throw new CustomError("Failed to create role", undefined, error as Error);
    }
  };

  // Update an existing role
  updateRole = async (
    request: Request<{ id: string }, {}, Partial<Role> & { ids?: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "roleUpdate")) return;

    const id = Number(request.params.id);

    try {
      const updatedRole = await roleLogic.updateRole(id, request.body);
      if (!updatedRole) {
        response.status(404).json({ message: "Role not found" });
      }
      response.status(200).json(updatedRole);
    } catch (error) {
      throw new CustomError("Failed to update role", undefined, error as Error);
    }
  };

  // Delete a role
  deleteRole = async (request: Request<{ id: string }>, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;

    try {
      const id = Number(request.params.id);
      const deleted = await roleLogic.deleteRole(id);
      if (!deleted) {
        response.status(404).json({ message: "Role not found" });
      }
      response.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      throw new CustomError("Failed to delete role", undefined, error as Error);
    }
  };
}
