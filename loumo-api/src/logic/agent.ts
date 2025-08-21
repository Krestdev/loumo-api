import { PrismaClient, Agent } from "@prisma/client";

const prisma = new PrismaClient();

export class AgentLogic {
  // Create a log and optionally connect to roles
  async createAgent(
    data: Omit<Agent, "id" | "code"> & { userId: number; zoneIds: number[] }
  ): Promise<Agent> {
    const { userId, zoneIds, ...agentData } = data;
    // const { zoneId, ...restAgentData } = agentData as any;
    const now = new Date();
    const day = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timePart = now.getTime().toString(36); // base36 for compactness
    const ref = `LIV-${day}-${timePart}`;

    return prisma.agent.create({
      data: {
        ...agentData,
        ref,
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
        zone: zoneIds
          ? {
              connect: zoneIds.map((zoneId) => ({ id: zoneId })),
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
    return prisma.agent.findMany({
      include: { user: true, delivery: true, zone: true },
    });
  }

  // Update a agent and optionally update its roles
  async updateAgent(
    id: number,
    data: Partial<Omit<Agent, "id" | "code">>
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
