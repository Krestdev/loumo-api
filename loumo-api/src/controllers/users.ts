import { Request, Response } from "express";
import Joi from "joi";
import { UserLogic } from "../logic/user";
import { CustomError } from "../middleware/errorHandler";
import { User } from "../../generated/prisma";
const userLogic = new UserLogic();

// Joi schemas
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  address: Joi.array().items(Joi.number()),
  // Add other fields as needed
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  address: Joi.array().items(Joi.number()).optional(),
  // verified: Joi.boolean().optional(),
  // Add other fields as needed
}).min(1);

const assignRoleSchema = Joi.object({
  roleId: Joi.number(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
});

const querySchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().optional(),
  verified: Joi.boolean().optional(),
  skip: Joi.number().optional(),
  take: Joi.number().optional(),
  roleD: Joi.boolean().optional(),
  permissionsD: Joi.boolean().optional(),
  addressD: Joi.boolean().optional(),
  notifD: Joi.boolean().optional(),
  logD: Joi.boolean().optional(),
  ordersD: Joi.boolean().optional(),
});

export default class UserController {
  validate = (
    request: Request<{ id?: string }>,
    response: Response,
    schema:
      | "userCreate"
      | "userUpdate"
      | "paramId"
      | "queryData"
      | "assignRole"
      | "login"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "userCreate":
        result = createUserSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "userUpdate":
        result = updateUserSchema.validate(request.body);
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
      case "queryData":
        result = querySchema.validate(request.query);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "assignRole":
        result = assignRoleSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "login":
        result = loginSchema.validate(request.body);
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

  createUser = async (
    request: Request<{}, {}, Omit<User, "id">>,
    response: Response
  ) => {
    if (!this.validate(request, response, "userCreate")) return;

    try {
      const user = await userLogic.register(request.body);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError("", 500);
    }
  };

  getUserById = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    try {
      const userId = Number(request.params.id);
      const user = await userLogic.getUserById(userId);
      if (!user) {
        response.status(404).json({ error: "User not found" });
        return;
      }
      response.json(user);
    } catch (error) {
      throw new CustomError("", 500);
    }
  };

  login = async (
    request: Request<{}, {}, { email: string; password: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "login")) return;
    try {
      const { email, password } = request.body;
      const user = await userLogic.authenticateUser(email, password);
      console.log(user);
      if (!user) {
        response.status(404).json({ error: "User not found" });
        return;
      }
      response.json(user);
    } catch (error) {
      throw new CustomError("", 500);
    }
  };

  getAllUsers = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "queryData")) return;
    try {
      const query = request.query;
      const users = await userLogic.listUsers(query);
      response.json(users);
    } catch (error) {
      throw new CustomError("", 500);
    }
  };

  updateUser = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "userUpdate")) return;

    try {
      const userId = Number(request.params.id);
      const userDto = request.body;
      const updatedUser = await userLogic.updateUser(userId, userDto);
      if (!updatedUser) {
        response.status(404).json({ error: "User not found" });
      }
      response.json(updatedUser);
    } catch (error) {
      throw new CustomError("Error updating user", 500, error as Error);
    }
  };

  assignRole = async (
    request: Request<{ id: string }, {}, { roleId: number }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    if (!this.validate(request, response, "assignRole")) return;

    try {
      const userId = Number(request.params.id);
      const { roleId } = request.body;
      const updatedUser = await userLogic.assignRole(userId, roleId);
      if (!updatedUser) {
        response.status(404).json({ error: "User not found" });
      }
      response.json(updatedUser);
    } catch (error) {
      throw new CustomError("Error assigning role user", 500, error as Error);
    }
  };

  deleteUser = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    try {
      const userId = Number(request.params.id);
      const deleted = await userLogic.deleteUser(userId);
      if (!deleted) {
        response.status(404).json({ error: "User not found" });
      }
      response.status(204).send();
    } catch (error) {
      throw new CustomError("Error deleting user", 500, error as Error);
    }
  };
}
