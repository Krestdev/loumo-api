import { Agent, PrismaClient, Delivery } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export class DeliveryLogic {
  async createDelivery(
    data: Omit<Delivery, "id" | "trackingCode"> & {
      orderId: number;
      orderItemsIds?: number[];
    }
  ): Promise<Delivery> {
    const { orderId, agentId, orderItemsIds, priority, ...deliveryData } = data;
    return prisma.delivery.create({
      data: {
        ...deliveryData,
        trackingCode: `TRK${uuidv4().replace(/-/g, "").slice(0, 10)}`,
        status: "NOTSTARTED", // "NOTSTARTED","STARTED","COMPLETED","CANCELED"
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
        agent: agentId
          ? {
              connect: {
                id: agentId,
                status: "PROCESSING", // "PROCESSING"
              },
            }
          : {},
        orderItem: orderItemsIds
          ? {
              connect: orderItemsIds.map((id) => ({ id })),
            }
          : {},
        priority: priority ? priority : "NORMAL",
      },
    });
  }

  async updateDelivery(
    id: number,
    data: Partial<Omit<Delivery, "id" | "orderId">> & { agentId?: number }
  ): Promise<Delivery> {
    const { agentId, priority, ...deliveryData } = data;
    return prisma.delivery.update({
      where: {
        id,
      },
      data: {
        ...deliveryData,
        agent: agentId
          ? {
              connect: {
                id: agentId,
              },
            }
          : {},
        priority: priority ? priority : "NORMAL",
      },
    });
  }

  async getDeliveryById(
    id: number
  ): Promise<(Delivery & { agent: Agent | null }) | null> {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        agent: true,
        order: {
          include: {
            user: true,
            address: {
              include: { zone: true },
            },
          },
        },
      },
    });
  }

  async addOagentToDelivery(
    deliveryId: number,
    agentId: number
  ): Promise<Delivery> {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    });
  }

  async removeAgentFromDelivery(
    deliveryId: number,
    agentId: number
  ): Promise<Delivery> {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        agent: {
          disconnect: {
            id: agentId,
          },
        },
      },
    });
  }

  async listDeliverys(): Promise<(Delivery & { agent: Agent | null })[]> {
    return prisma.delivery.findMany({
      include: {
        agent: {
          include: {
            zone: true,
          },
        },
        order: {
          include: {
            user: true,
            address: {
              include: {
                zone: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteDelivery(id: number): Promise<Delivery> {
    return prisma.delivery.delete({
      where: {
        id: id,
      },
    });
  }
}
