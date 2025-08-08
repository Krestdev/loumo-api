import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { NotificationLogic } from "../logic/notification";
import { Notification } from "@prisma/client";

const notificationLogic = new NotificationLogic();

const createNotificationSchema = Joi.object({
  action: Joi.string(),
  description: Joi.string(),
  userId: Joi.number().optional(),
});

const updateNotificationSchema = Joi.object({
  action: Joi.string().optional(),
  description: Joi.string().optional(),
  userId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class notificationController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createNotificationSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateNotificationSchema.validate(request.body);
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
  createNotification = async (
    request: Request<
      object,
      object,
      Omit<Notification, "id"> & { userId: number }
    >,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createNotificationSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newNotification = await notificationLogic.createNotification(
        request.body
      );
      response.status(201).json(newNotification);
    } catch (err) {
      throw new CustomError(
        "Failed to create notification",
        undefined,
        err as Error
      );
    }
  };

  updateNotification = async (
    request: Request<
      { id: string },
      object,
      Partial<Omit<Notification, "id">> & { userId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateNotificationSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedNotification = await notificationLogic.updateNotification(
        Number(id),
        request.body
      );
      response.status(200).json(updatedNotification);
    } catch (err) {
      throw new CustomError(
        "Failed to update notification",
        undefined,
        err as Error
      );
    }
  };

  getNotifications = async (request: Request, response: Response) => {
    try {
      const notifications = await notificationLogic.getAllNotifications();
      response.status(200).json(notifications);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch notifications",
        undefined,
        err as Error
      );
    }
  };

  getANotification = async (request: Request, response: Response) => {
    if (!this.validate(request, response, "paramId")) return;
    const id = Number(request.params.id);
    try {
      const notifications = await notificationLogic.getNotificationById(id);
      response.status(200).json(notifications);
    } catch (err) {
      throw new CustomError(
        "Failed to fetch notifications",
        undefined,
        err as Error
      );
    }
  };

  deleteNotification = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await notificationLogic.deleteNotification(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError(
        "Failed to delete notification",
        undefined,
        err as Error
      );
    }
  };
}
