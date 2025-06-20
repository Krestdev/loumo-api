import { PrismaClient, Log } from "../../generated/prisma";

const prisma = new PrismaClient();

export class LogLogic {
  // Create a log and optionally connect to roles
  async createLog(data: Omit<Log, "id"> & { userId?: number }): Promise<Log> {
    const { userId, ...logData } = data;
    return prisma.log.create({
      data: {
        ...logData,
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

  // Get a log by id, including its roles
  async getLogById(id: number): Promise<Log | null> {
    return prisma.log.findUnique({
      where: { id },
    });
  }

  // Get all logs, including their roles
  async getAllLogs(): Promise<Log[]> {
    return prisma.log.findMany();
  }

  // Update a log and optionally update its roles
  async updateLog(
    id: number,
    data: Partial<Omit<Log, "id">> & { userId?: number }
  ): Promise<Log | null> {
    const { userId, ...logData } = data;
    return prisma.log.update({
      where: { id },
      data: {
        ...logData,
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

  // Delete a log (removes from join table as well)
  async deleteLog(id: number): Promise<Log | null> {
    return prisma.log.delete({
      where: { id },
    });
  }
}
