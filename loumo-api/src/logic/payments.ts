import { v4 as uuidv4 } from "uuid";
import { Payment, PrismaClient } from "@prisma/client";
import { PawapayService } from "../services/payment";

const prisma = new PrismaClient();
const pawapay = new PawapayService();

export class PaymentLogic {
  async createPayment(
    data: Omit<Payment, "id" | "depositId" | "ref"> & { orderId: number }
  ): Promise<Payment> {
    const { orderId, ...paymentData } = data;
    const depositId = uuidv4();
    const now = new Date();
    const ref = `TLS-${now.getTime()}`;
    const payOutData = await prisma.payment.create({
      data: {
        ...paymentData,
        depositId: depositId,
        ref: ref,
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    const payment = {
      depositId: depositId,
      payer: {
        type: "MMO",
        accountDetails: {
          phoneNumber: payOutData.tel,
          provider: payOutData.method,
        },
      },
      clientReferenceId: payOutData.id.toString(),
      // customerMessage: "Note of 4 to 22 chars",
      amount: payOutData.total.toString(),
      currency: "XAF",
      // metadata: [
      //   { orderId: "ORD-123456789" },
      //   { customerId: "customer@email.com", isPII: true },
      // ],
    };

    try {
      await pawapay
        .requestPayout(payment)
        .then((res) => {
          console.info("Payment processing", res.status);
        })
        .catch((err) => {
          console.error("Payment failed", err);
          throw err;
        });
    } catch (err) {
      console.error("Could not procid with Payment", err);
      throw err;
    }

    return payOutData;
  }

  // create cash payment

  async createCashPayment(
    data: Omit<Payment, "id" | "depositId" | "method" | "ref"> & {
      orderId: number;
    }
  ): Promise<Payment> {
    const { orderId, ...paymentData } = data;
    const depositId = `cash-${uuidv4()}`;
    const now = new Date();
    const ref = `TLS-${now.getTime()}`;
    const payOutData = await prisma.payment.create({
      data: {
        ...paymentData,
        depositId: depositId,
        ref: ref,
        method: "CASH",
        status: "COMPLETED",
        order: orderId
          ? {
              connect: {
                id: orderId,
              },
            }
          : {},
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    const deliveries = await prisma.delivery.findMany({
      where: {
        orderId,
      },
    });

    if (orderId && deliveries.every((x) => x.status === "COMPLETED")) {
      await prisma.order.update({
        where: {
          id: data.orderId,
        },
        data: {
          status: "COMPLETED",
        },
      });
    }

    return payOutData;
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
        updatedAt: new Date(),
      },
    });
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
    });
  }

  async addPaymentToOrder(
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

  // async removeOrderFromPayment(
  //   paymentId: number,
  //   orderId: number
  // ): Promise<Payment> {
  //   return prisma.payment.update({
  //     where: { id: paymentId },
  //     data: {
  //       order: {},
  //     },
  //   });
  // }

  async listPayments(): Promise<Payment[]> {
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
