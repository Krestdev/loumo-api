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
  tel: Joi.string().required(),
  password: Joi.string().min(6).required(),
  address: Joi.array().items(Joi.number()),
  imgUrl: Joi.string(),
  // Add other fields as needed
});

// favorites
const addToFavSchema = Joi.object({
  productIds: Joi.array().items(Joi.number()),
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  tel: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  address: Joi.array().items(Joi.number()).optional(),
  verified: Joi.boolean().optional(),
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

const verifyAccountSchema = Joi.object({
  email: Joi.string().email(),
  otp: Joi.string(),
  newPassword: Joi.string().min(6).optional(),
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
      | "fav"
      | "verify"
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
      case "verify":
        result = verifyAccountSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "fav":
        result = addToFavSchema.validate(request.body);
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
    request: Request<object, object, Omit<User, "id">>,
    response: Response
  ) => {
    if (!this.validate(request, response, "userCreate")) return;

    try {
      const user = await userLogic.register(request.body);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError("Failed to Create User", undefined, error as Error);
    }
  };

  verifyEmail = async (
    request: Request<object, object, { email: string; otp: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "verify")) return;
    const { email, otp } = request.body;
    try {
      const user = await userLogic.verifyAccount(email, otp);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError(
        "Failed to verify account",
        undefined,
        error as Error
      );
    }
  };

  requestPasswordRecovery = async (
    request: Request<object, object, { email: string; otp: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "verify")) return;
    const { email } = request.body;
    try {
      const user = await userLogic.requestPasswordRecovery(email);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError(
        "Failed to validate pasword recover request",
        undefined,
        error as Error
      );
    }
  };

  validatePasswordRecoveryToken = async (
    request: Request<object, object, { email: string; otp: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "verify")) return;
    const { email, otp } = request.body;
    try {
      const user = await userLogic.validateOtpRecovery(email, otp);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError(
        "Failed to validate pasword recover request",
        undefined,
        error as Error
      );
    }
  };

  resetPassword = async (
    request: Request<
      object,
      object,
      { email: string; otp: string; newPassword: string }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "verify")) return;
    const { email, otp, newPassword } = request.body;
    try {
      const user = await userLogic.resetPassword(email, otp, newPassword);
      response.status(201).json(user);
    } catch (error) {
      throw new CustomError(
        "Failed to validate pasword recover request",
        undefined,
        error as Error
      );
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
      throw new CustomError("Failed to get a user", undefined, error as Error);
    }
  };

  login = async (
    request: Request<object, object, { email: string; password: string }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "login")) return;
    try {
      const { email, password } = request.body;
      const user = await userLogic.authenticateUser(email, password);
      if (!user) {
        response.status(404).json({ error: "User not found" });
        return;
      }
      response.json(user);
    } catch (error) {
      throw new CustomError("Failed to login user", undefined, error as Error);
    }
  };

  getAllUsers = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "queryData")) return;
    try {
      const query = request.query;
      const users = await userLogic.listUsers(query);
      response.json(users);
    } catch (error) {
      throw new CustomError("Failed to Create SHop", undefined, error as Error);
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

  addProductToFavorites = async (
    request: Request<{ id: string }, object, { productIds: number[] }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "paramId")) return;
    try {
      const id = Number(request.params.id);
      const addedProduct = await userLogic.updateUser(id, request.body);
      if (!addedProduct) {
        response.status(404).json({ error: "User or Product not found" });
      }
      response.json(addedProduct);
    } catch (error) {
      throw new CustomError(
        "Error adding product to user favorite",
        500,
        error as Error
      );
    }
  };

  assignRole = async (
    request: Request<{ id: string }, object, { roleId: number }>,
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
