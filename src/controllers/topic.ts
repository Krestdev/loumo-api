import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Topic } from "../../generated/prisma";
import { TopicLogic } from "../logic/topic";

const topicLogic = new TopicLogic();

const createTopicSchema = Joi.object({
  name: Joi.string(),
});

const updateTopicSchema = Joi.object({
  name: Joi.string().optional().optional(),
  faqIds: Joi.array().items(Joi.number()).optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class TopicController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createTopicSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateTopicSchema.validate(request.body);
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
  createTopic = async (
    request: Request<{}, {}, Omit<Topic, "id">>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createTopicSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newTopic = await topicLogic.createTopic(request.body);
      response.status(201).json(newTopic);
    } catch (err) {
      throw new CustomError("Failed to create topic", undefined, err as Error);
    }
  };

  updateTopic = async (
    request: Request<
      { id: string },
      {},
      Partial<Omit<Topic, "id">> & { faqIds?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateTopicSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedTopic = await topicLogic.updateTopic(
        Number(id),
        request.body
      );
      response.status(200).json(updatedTopic);
    } catch (err) {
      throw new CustomError("Failed to update topic", undefined, err as Error);
    }
  };

  getTopics = async (request: Request, response: Response) => {
    try {
      const topics = await topicLogic.getAllTopics();
      response.status(200).json(topics);
    } catch (err) {
      throw new CustomError("Failed to fetch topics", undefined, err as Error);
    }
  };

  deleteTopic = async (
    request: Request<{ id: string }>,
    response: Response
  ) => {
    const { id } = request.params;
    try {
      await topicLogic.deleteTopic(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete topic", undefined, err as Error);
    }
  };
}
