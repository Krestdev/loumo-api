import { PrismaClient, Order, OrderItem } from "../../generated/prisma";

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
    return prisma.order.create({
      data: {
        ...orderData,
        status: "PENDING",
        createdAt: new Date(),
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

  // Get all orders, including their roles
  async getAllOrders(): Promise<Order[]> {
    return prisma.order.findMany({
      include: { address: true, user: true, orderItems: true, payment: true },
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
