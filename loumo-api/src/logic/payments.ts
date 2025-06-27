import { Order, PrismaClient, Payment } from "../../generated/prisma";
import { PawapayService } from "../services/payment";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const pawapay = new PawapayService();

export class PaymentLogic {
  async createPayment(
    data: Omit<Payment, "id"> & { orderId: number }
  ): Promise<Payment> {
    const { orderId, ...paymentData } = data;
    const payoutId = uuidv4();
    const payOutData = await prisma.payment.create({
      data: {
        ...paymentData,
        payoutId: payoutId,
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

    try {
      const payout = await pawapay.requestPayout({
        payoutId: payoutId,
        amount: payOutData.total.toString(),
        currency: "XAF",
        country: "CMR",
        created: new Date().toISOString(),
        correspondent: payOutData.method, // "ORANGE_CM" | "MTN_MOMO_CMR"
        customerTimestamp: new Date().toISOString(),
        recipient: {
          type: "MSISDN",
          address: { value: payOutData.tel },
        },
        statementDescription: "Order 1234",
      });

      // this.updatePayment(payOutData.id,{...payOutData,status:payout.status})
      console.log(payout);
    } catch (err) {
      console.log("Could not procid with Payment", err);
      throw err;
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
