import { Agent, Delivery, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DeliveryLogic {
  async createDelivery(
    data: Omit<Delivery, "id" | "trackingCode"> & {
      orderId: number;
      orderItemsIds?: number[];
    }
  ): Promise<Delivery> {
    const { orderId, agentId, orderItemsIds, priority, ...deliveryData } = data;
    // Generate tracking code using current timestamp and base64 encoding
    const now = new Date();
    // const day = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    // const timePart = now.getTime().toString(36); // base36 for compactness
    const ref = `LIV-${now.getTime()}`;

    return prisma.delivery.create({
      data: {
        ...deliveryData,
        ref,
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
    data: Partial<Omit<Delivery, "id">> & { agentId?: number }
  ): Promise<Delivery> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agentId, priority, orderId, ...deliveryData } = data;

    const delivery = await prisma.delivery.update({
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

    const payment = await prisma.payment.findMany({
      where: {
        orderId: data.orderId,
      },
    });

    if (data.status === "COMPLETED" || payment.length > 0) {
      await prisma.order.update({
        where: {
          id: data.orderId,
          payment: {
            status: "COMPLETED",
          },
        },
        data: {
          status: "COMPLETED",
        },
      });
    }

    return delivery;
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
