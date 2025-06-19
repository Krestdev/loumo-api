import { Agent, PrismaClient, Delivery } from "../../generated/prisma";

const prisma = new PrismaClient();

export class DeliveryLogic {
  async createDelivery(
    data: Omit<Delivery, "id" | "agentId"> & {
      orderId: number;
      orderItemsIds?: number[];
    }
  ): Promise<Delivery> {
    const { orderId, orderItemsIds, ...deliveryData } = data;
    return prisma.delivery.create({
      data: {
        ...deliveryData,
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
        orderItem: orderItemsIds
          ? {
              connect: orderItemsIds.map((id) => ({ id })),
            }
          : {},
      },
    });
  }

  async updateDelivery(
    id: number,
    data: Partial<Omit<Delivery, "id" | "orderId">> & { agentId?: number }
  ): Promise<Delivery> {
    const { agentId, ...deliveryData } = data;
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
      },
    });
  }

  async getDeliveryById(
    id: number
  ): Promise<(Delivery & { agent: Agent | null }) | null> {
    return prisma.delivery.findUnique({
      where: { id },
      include: { agent: true },
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
        agent: {},
      },
    });
  }

  async listDeliverys(): Promise<(Delivery & { agent: Agent | null })[]> {
    return prisma.delivery.findMany({
      include: { agent: true },
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
