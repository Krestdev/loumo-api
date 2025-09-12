import { PrismaClient, Order, OrderItem, Notification } from "@prisma/client";

const prisma = new PrismaClient();

export class OrderLogic {
  // Create a log and optionally connect to roles
  async createOrder(
    data: Omit<Order, "id"> & {
      addressId: number;
      userId: number;
      orderItems: (Omit<OrderItem, "id"> & { shopId: number })[];
    }
  ): Promise<Order> {
    const { addressId, orderItems, userId, ...orderData } = data;
    const now = new Date();
    const ref = `ORD-${now.getTime()}`;

    const order = await prisma.order.create({
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
          create: orderItems.map((x) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { shopId, ...orderItm } = x;
            return orderItm;
          }),
        },
      },
      include: {
        address: true,
      },
    });

    let orderNotification: Omit<Notification, "id"> | null = null;
    const stockNotification: Omit<Notification, "id">[] = [];

    // 2. Loop through ordered items and decrement stock
    for (const item of orderItems) {
      // Find the stock entry for the product variant
      const stock = await prisma.stock.findFirst({
        where: {
          productVariantId: item.productVariantId,
          shopId: item.shopId, // If stock depends on shop, we must filter by shop
        },
      });

      if (!stock) {
        throw new Error(
          `Stock not found for product variant ${item.productVariantId} in shop ${item.shopId}`
        );
      }

      if (stock.quantity < item.quantity) {
        throw new Error(
          `Not enough stock for product variant ${item.productVariantId}`
        );
      }

      // Decrement stock safely
      const pStock = await prisma.stock.update({
        where: { id: stock.id },
        data: {
          quantity: stock.quantity - item.quantity,
        },
        include: {
          shop: true,
          productVariant: true,
        },
      });

      if (pStock.quantity <= pStock.threshold) {
        stockNotification.push({
          variant: "DANGER", // WARNING, INFO, SUCCESS
          type: "STOCK", // ORDER, PAYMENT, STOCK
          stockId: pStock.id,
          orderId: order.id,
          paymentId: null,
          action: `Order Submission`,
          description: `Stock decrease from order submission`,
          createdAt: new Date(),
          userId,
        });
      }
    }

    orderNotification = {
      variant: "INFO",
      type: "ORDER",
      stockId: null,
      orderId: order.id,
      paymentId: null,
      action: "Order Created",
      description: `A new order is made`,
      createdAt: new Date(),
      userId,
    };

    await prisma.notification.create({
      data: orderNotification,
    });

    await prisma.notification.createMany({
      data: stockNotification,
    });

    return order;
  }

  // Get a order by id, including its roles
  async getOrderById(id: number): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
    });
  }

  // Get a order by id, including its roles
  async terminateOrderById(id: number): Promise<Order | null> {
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

    if (payment.length > 0 || delivery.some((x) => x.status === "COMPLETED")) {
      throw new Error("Can not Terminate a processed command");
    }

    // const isDelivered = delivery.every((x) => x.status === "COMPLETED");
    // const isPayed = payment.some((x) => x.status === "COMPLETED");

    return prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: "REJECTED",
      },
    });
  }

  // Get a order by id, including its roles
  async cancelOrderById(id: number): Promise<Order | null> {
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

    if (
      (payment.length > 0 && payment.some((x) => x.status === "COMPLETED")) ||
      delivery.some((x) => x.status === "COMPLETED")
    ) {
      throw new Error("Can not Cancel a processed command");
    }

    // const isDelivered = delivery.every((x) => x.status === "COMPLETED");
    // const isPayed = payment.some((x) => x.status === "COMPLETED");

    return prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: "CANCELED",
      },
    });
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
        delivery: true,
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
