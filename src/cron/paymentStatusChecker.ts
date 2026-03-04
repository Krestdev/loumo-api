import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { PawapayService } from "../services/payment";

const prisma = new PrismaClient();
const pawapay = new PawapayService();

// Runs every 5 minutes
cron.schedule("*/10 * * * * *", async () => {
  try {
    // Fetch all payments with status 'PENDING'
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING", "ACCEPTED", "FOUND"],
        },
      },
    });

    if (pendingPayments.length > 0) {
      console.info("Checking pending payments...");
    }

    for (const payment of pendingPayments) {
      if (!payment.depositId) continue; // Ensure depositId exists

      await pawapay
        .checkDepositstatus(payment.depositId)
        .then(async (payoutStatus) => {
          if (payoutStatus.data) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: payoutStatus.data.status },
            });
            console.info(
              `Payment ${payment.id} status updated to ${payoutStatus.data.status}`
            );
          } else if (payoutStatus.status !== payment.status) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: payoutStatus.status },
            });
            console.info(
              `Payment ${payment.id} status updated to ${payoutStatus.status}`
            );
          } else {
            console.info("array", payoutStatus.data, payoutStatus.status);
          }
        })
        .catch((error) => {
          console.error(
            `Failed to check/update status for payment ${payment.id}:`,
            error.message,
            error.response
          );
        });
    }
  } catch (err) {
    console.error("Error fetching pending payments:", err);
  }
});
