import { PrismaClient, Order, OrderItem } from "@prisma/client";

const prisma = new PrismaClient();

export class OrderLogic {
  // Create a log and optionally connect to roles
  async createOrder(
    data: Omit<Order, "id"> & {
      addressId: number;
      userId: number;
      orderItems: Omit<OrderItem, "id">[];
    }
  ): Promise<Order> {
    const { addressId, orderItems, userId, ...orderData } = data;
    const now = new Date();
    // const day = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    // const timePart = now.getTime().toString(36); // base36 for compactness
    const ref = `ORD-${now.getTime()}`;
    return prisma.order.create({
      data: {
        ...orderData,
        status: "PENDING",
        createdAt: new Date(),
        ref,
        address: addressId
          ? {
              connect: {
                id: addressId,
              },
            }
          : {},
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
        orderItems: {
          create: orderItems,
        },
      },
    });
  }

  // Get a order by id, including its roles
  async getOrderById(id: number): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
    });
  }

  // Get a order by id, including its roles
  async terminateOrderById(id: number): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    const delivery = await prisma.delivery.findMany({
      where: {
        orderId: id,
      },
    });

    const payment = await prisma.payment.findMany({
      where: {
        orderId: id,
      },
    });

    const isDelivered = delivery.every((x) => x.status === "COMPLETED");
    const isPayed = payment.some((x) => x.status === "COMPLETED");

    if (isDelivered && isPayed) {
      return prisma.order.update({
        where: {
          id: id,
        },
        data: {
          status: "COMPLETED",
        },
      });
    } else {
      throw new Error("Can not terminate command");
    }
  }

  // Get all orders, including their roles
  async getAllOrders(): Promise<Order[]> {
    return prisma.order.findMany({
      include: {
        address: true,
        user: true,
        orderItems: {
          include: {
            productVariant: true,
          },
        },
        payment: true,
      },
    });
  }

  // Update a order and optionally update its roles
  async updateOrder(
    id: number,
    data: Partial<Omit<Order, "id" | "userId">> & { addressId?: number }
  ): Promise<Order | null> {
    const { addressId, ...orderData } = data;
    return prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        address: addressId
          ? {
              connect: {
                id: addressId,
              },
            }
          : {},
      },
    });
  }

  // Delete a order (removes from join table as well)
  async deleteOrder(id: number): Promise<Order | null> {
    return prisma.order.delete({
      where: { id },
    });
  }
}
