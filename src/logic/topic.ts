import { PrismaClient, Topic } from "@prisma/client";

const prisma = new PrismaClient();

export class TopicLogic {
  // Create a log and optionally connect to roles
  async createTopic(data: Omit<Topic, "id">): Promise<Topic> {
    const { ...topicData } = data;
    return prisma.topic.create({
      data: {
        ...topicData,
      },
    });
  }

  // Get a topic by id, including its roles
  async getTopicById(id: number): Promise<Topic | null> {
    return prisma.topic.findUnique({
      where: { id },
    });
  }

  // Get all topics, including their roles
  async getAllTopics(): Promise<Topic[]> {
    return prisma.topic.findMany({
      include: {
        faqs: true,
      },
    });
  }

  // Update a topic and optionally update its roles
  async updateTopic(
    id: number,
    data: Partial<Omit<Topic, "id">> & { faqsIds?: number[] }
  ): Promise<Topic | null> {
    const { faqsIds, ...topicData } = data;
    return prisma.topic.update({
      where: { id },
      data: {
        ...topicData,
        faqs: faqsIds
          ? {
              connect: faqsIds.map((id) => ({ id })),
            }
          : {},
      },
      include: {
        faqs: true,
      },
    });
  }

  // Delete a topic (removes from join table as well)
  async deleteTopic(id: number): Promise<Topic | null> {
    return prisma.topic.delete({
      where: { id },
    });
  }
}
