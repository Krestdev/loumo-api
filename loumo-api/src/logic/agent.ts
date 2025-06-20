import { PrismaClient, Agent } from "../../generated/prisma";

const prisma = new PrismaClient();

export class AgentLogic {
  // Create a log and optionally connect to roles
  async createAgent(
    data: Omit<Agent, "id"> & { userId?: number }
  ): Promise<Agent> {
    const { userId, ...agentData } = data;
    return prisma.agent.create({
      data: {
        ...agentData,
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
      },
    });
  }

  // Get a agent by id, including its roles
  async getAgentById(id: number): Promise<Agent | null> {
    return prisma.agent.findUnique({
      where: { id },
    });
  }

  // Get all agents, including their roles
  async getAllAgents(): Promise<Agent[]> {
    return prisma.agent.findMany({ include: { user: true, delivery: true } });
  }

  // Update a agent and optionally update its roles
  async updateAgent(
    id: number,
    data: Partial<Omit<Agent, "id">>
  ): Promise<Agent | null> {
    const { ...agentData } = data;
    return prisma.agent.update({
      where: { id },
      data: {
        ...agentData,
      },
      include: {
        user: true,
      },
    });
  }

  // Delete a agent (removes from join table as well)
  async deleteAgent(id: number): Promise<Agent | null> {
    return prisma.agent.delete({
      where: { id },
    });
  }
}
