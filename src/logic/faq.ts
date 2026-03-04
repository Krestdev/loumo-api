import { PrismaClient, Faq } from "@prisma/client";

const prisma = new PrismaClient();

export class FaqLogic {
  // Create a log and optionally connect to roles
  async createFaq(data: Omit<Faq, "id"> & { topicId?: number }): Promise<Faq> {
    const { topicId, ...faqData } = data;
    return prisma.faq.create({
      data: {
        ...faqData,
        topic: topicId
          ? {
              connect: {
                id: topicId,
              },
            }
          : {},
      },
    });
  }

  // Get a faq by id, including its roles
  async getFaqById(id: number): Promise<Faq | null> {
    return prisma.faq.findUnique({
      where: { id },
    });
  }

  // Get all faqs, including their roles
  async getAllFaqs(): Promise<Faq[]> {
    return prisma.faq.findMany();
  }

  // Update a faq and optionally update its roles
  async updateFaq(
    id: number,
    data: Partial<Omit<Faq, "id">> & { topicId?: number }
  ): Promise<Faq | null> {
    const { topicId, ...faqData } = data;
    return prisma.faq.update({
      where: { id },
      data: {
        ...faqData,
        topic: topicId
          ? {
              connect: {
                id: topicId,
              },
            }
          : {},
      },
      include: {
        topic: true,
      },
    });
  }

  // Delete a faq (removes from join table as well)
  async deleteFaq(id: number): Promise<Faq | null> {
    return prisma.faq.delete({
      where: { id },
    });
  }
}
