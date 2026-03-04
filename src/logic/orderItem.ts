import { PrismaClient, OrderItem } from "@prisma/client";

const prisma = new PrismaClient();

export class OrderItemLogic {
  // Create a log and optionally connect to roles
  async createOrderItem(
    data: Omit<OrderItem, "id"> & {
      orderId: number;
      deliveryId?: number;
      productVariantId: number;
    }
  ): Promise<OrderItem> {
    const { orderId, deliveryId, productVariantId, ...orderItemData } = data;
    return prisma.orderItem.create({
      data: {
        ...orderItemData,
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
        delivery: deliveryId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
        productVariant: productVariantId
          ? {
              connect: {
                id: deliveryId,
              },
            }
          : {},
      },
    });
  }

  // Get a orderItem by id, including its roles
  async getOrderItemById(id: number): Promise<OrderItem | null> {
    return prisma.orderItem.findUnique({
      where: { id },
    });
  }

  // Get all orderItems, including their roles
  async getAllOrderItems(): Promise<OrderItem[]> {
    return prisma.orderItem.findMany({ include: { order: true } });
  }

  // Update a orderItem and optionally update its roles
  async updateOrderItem(
    id: number,
    data: Partial<Omit<OrderItem, "id" | "orderId" | "productVariantId">> & {
      deliveryId?: number;
    }
  ): Promise<OrderItem | null> {
    const { deliveryId, ...orderItemData } = data;
    return prisma.orderItem.update({
      where: { id },
      data: {
        ...orderItemData,
        delivery: deliveryId
          ? {
              connect: {
                id: deliveryId,
              },
            }
          : {},
      },
    });
  }

  // Delete a orderItem (removes from join table as well)
  async deleteOrderItem(id: number): Promise<OrderItem | null> {
    return prisma.orderItem.delete({
      where: { id },
    });
  }
}
