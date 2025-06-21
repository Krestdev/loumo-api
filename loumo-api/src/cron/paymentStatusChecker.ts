import cron from "node-cron";
import { PrismaClient } from "../../generated/prisma";
import { PawapayService } from "../services/payment";

const prisma = new PrismaClient();
const pawapay = new PawapayService();

// Runs every 5 minutes
cron.schedule("*/1 * * * *", async () => {
  try {
    // Fetch all payments with status 'PENDING'
    const pendingPayments = await prisma.payment.findMany({
      where: { status: "PENDING" },
    });

    if (pendingPayments.length > 0) {
      console.log("Checking pending payments...");
    }

    for (const payment of pendingPayments) {
      if (!payment.payoutId) continue; // Ensure payoutId exists

      await pawapay
        .checkPayoutStatus(payment.payoutId)
        .then(async (payoutStatusArr) => {
          const payoutStatus = payoutStatusArr[0]?.status;
          if (payoutStatus && payoutStatus !== payment.status) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: payoutStatus },
            });
            console.log(
              `Payment ${payment.id} status updated to ${payoutStatus}`
            );
          } else {
            console.log(payoutStatusArr);
          }
        })
        .catch((error) => {
          console.error(
            `Failed to check/update status for payment ${payment.id}:`,
            error
          );
        });
    }
  } catch (err) {
    console.error("Error fetching pending payments:", err);
  }
});
