import { Agent, Delivery, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DeliveryLogic {
  async createDelivery(
    data: Omit<Delivery, "id" | "trackingCode"> & {
      orderId: number;
      orderItemsIds?: number[];
    },
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
    data: Partial<Omit<Delivery, "id" | "orderId">> & { agentId?: number },
  ): Promise<Delivery> {
    const { agentId, priority, ...deliveryData } = data;

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
      include: {
        order: true,
      },
    });

    const payment = await prisma.payment.findMany({
      where: {
        orderId: delivery.order.id,
      },
    });

    if (data.status === "COMPLETED" && payment.length > 0) {
      await prisma.order.update({
        where: {
          id: delivery.order.id,
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

  async completeDelivery(
    id: number,
    code: string,
    signatureUrl?: string,
    proofUrl?: string,
  ): Promise<Delivery> {
    const deliveryToComplete = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!deliveryToComplete) {
      throw Error("Delivery Not found");
    }

    const { closeDeliveryCode, codeExpiryTime } = deliveryToComplete;
    const currentTime = new Date();

    console.log(closeDeliveryCode, code);
    if (!closeDeliveryCode || !code.includes(closeDeliveryCode)) {
      throw Error("Wrong Code");
    }
    if (!codeExpiryTime || currentTime > codeExpiryTime) {
      throw Error("Code Expired");
    }

    const delivery = await prisma.delivery.update({
      where: {
        id,
      },
      data: {
        status: "COMPLETED",
        deliveredTime: new Date(),
        signatureUrl,
        proofUrl,
      },
      include: {
        order: true,
      },
    });

    // Update order status if payment is completed
    const payment = await prisma.payment.findMany({
      where: {
        orderId: delivery.order.id,
      },
    });

    if (payment.length > 0 && payment.some((p) => p.status === "COMPLETED")) {
      await prisma.order.update({
        where: {
          id: delivery.order.id,
        },
        data: {
          status: "COMPLETED",
        },
      });
    }

    return delivery;
  }

  async getDeliveryById(
    id: number,
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
    agentId: number,
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
    agentId: number,
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
