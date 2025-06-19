import { Order, PrismaClient, Payment } from "../../generated/prisma";

const prisma = new PrismaClient();

export class PaymentLogic {
  async createPayment(
    data: Omit<Payment, "id"> & { orderId: number }
  ): Promise<Payment> {
    const { orderId, ...paymentData } = data;
    return prisma.payment.create({
      data: {
        ...paymentData,
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
      },
    });
  }

  async updatePayment(
    id: number,
    data: Partial<Omit<Payment, "id">>
  ): Promise<Payment> {
    const { ...paymentData } = data;
    return prisma.payment.update({
      where: {
        id,
      },
      data: {
        ...paymentData,
      },
    });
  }

  async getPaymentById(
    id: number
  ): Promise<(Payment & { order: Order }) | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async addOorderToPayment(
    paymentId: number,
    orderId: number
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        order: {
          connect: {
            id: orderId,
          },
        },
      },
    });
  }

  async removeOrderFromPayment(
    paymentId: number,
    orderId: number
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        order: {},
      },
    });
  }

  async listPayments(): Promise<(Payment & { order: Order })[]> {
    return prisma.payment.findMany({
      include: { order: true },
    });
  }

  async deletePayment(id: number): Promise<{ name: string; id: number }> {
    return prisma.payment.delete({
      where: {
        id: id,
      },
    });
  }
}
