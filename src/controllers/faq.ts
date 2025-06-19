import { Request, Response } from "express";
import Joi from "joi";
import { CustomError } from "../middleware/errorHandler";
import { Faq } from "../../generated/prisma";
import { FaqLogic } from "../logic/faq";

const faqLogic = new FaqLogic();

const createFaqSchema = Joi.object({
  question: Joi.string(),
  answer: Joi.string(),
  topicId: Joi.number(),
});

const updateFaqSchema = Joi.object({
  question: Joi.string().optional(),
  answer: Joi.string().optional(),
  topicId: Joi.number().optional(),
});

const paramSchema = Joi.object({
  id: Joi.number(),
});

export default class FaqController {
  validate = (
    request: Request<{ id?: number }>,
    response: Response,
    schema: "create" | "update" | "paramId"
  ) => {
    let result: Joi.ValidationResult | null = null;
    switch (schema) {
      case "create":
        result = createFaqSchema.validate(request.body);
        if (result.error) {
          response.status(400).json({ error: result.error.details[0].message });
        }
        break;
      case "update":
        result = updateFaqSchema.validate(request.body);
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
  createFaq = async (
    request: Request<{}, {}, Omit<Faq, "id"> & { topicId: number }>,
    response: Response
  ) => {
    if (!this.validate(request, response, "create")) return;
    const { error } = createFaqSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const newFaq = await faqLogic.createFaq(request.body);
      response.status(201).json(newFaq);
    } catch (err) {
      throw new CustomError("Failed to create faq", undefined, err as Error);
    }
  };

  updateFaq = async (
    request: Request<
      { id: string },
      {},
      Partial<Omit<Faq, "id">> & { topicId?: number }
    >,
    response: Response
  ) => {
    const { id } = request.params;
    const { error } = updateFaqSchema.validate(request.body);
    if (error) {
      response.status(400).json({ error: error.details[0].message });
      return;
    }
    try {
      const updatedFaq = await faqLogic.updateFaq(Number(id), request.body);
      response.status(200).json(updatedFaq);
    } catch (err) {
      throw new CustomError("Failed to update faq", undefined, err as Error);
    }
  };

  getFaqs = async (request: Request, response: Response) => {
    try {
      const faqs = await faqLogic.getAllFaqs();
      response.status(200).json(faqs);
    } catch (err) {
      throw new CustomError("Failed to fetch faqs", undefined, err as Error);
    }
  };

  deleteFaq = async (request: Request<{ id: string }>, response: Response) => {
    const { id } = request.params;
    try {
      await faqLogic.deleteFaq(Number(id));
      response.status(204).send();
    } catch (err) {
      throw new CustomError("Failed to delete faq", undefined, err as Error);
    }
  };
}
