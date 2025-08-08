import { PrismaClient, Promotion, Stock } from "@prisma/client";

const prisma = new PrismaClient();

export class PromotionLogic {
  // Create a promotion and optionally connect to stock
  async createPromotion(
    data: Omit<Promotion, "id"> & { stockIds?: number[] }
  ): Promise<Promotion> {
    const { stockIds, ...promotionData } = data;
    return prisma.promotion.create({
      data: {
        ...promotionData,
        stock: stockIds
          ? {
              connect: stockIds.map((stockId) => ({ id: stockId })),
            }
          : undefined,
      },
    });
  }

  // Get a promotion by id, including its stock
  async getPromotionById(
    id: number
  ): Promise<(Promotion & { stock: Stock[] }) | null> {
    return prisma.promotion.findUnique({
      where: { id },
      include: { stock: true },
    });
  }

  // Get all promotions, including their stock
  async getAllPromotions(): Promise<(Promotion & { stock: Stock[] })[]> {
    return prisma.promotion.findMany({
      include: { stock: true },
    });
  }

  // Update a promotion and optionally update its stock
  async updatePromotion(
    id: number,
    data: Partial<Omit<Promotion, "id">> & { stockIds?: number[] }
  ): Promise<(Promotion & { stock: Stock[] }) | null> {
    const { stockIds, ...promotionData } = data;
    return prisma.promotion.update({
      where: { id },
      data: {
        ...promotionData,
        stock: stockIds
          ? {
              connect: stockIds.map((roleId) => ({ id: roleId })),
            }
          : {},
        updatedAt: new Date().toISOString(),
      },
      include: { stock: true },
    });
  }

  // Delete a promotion (removes from join table as well)
  async deletePromotion(
    id: number
  ): Promise<(Promotion & { stock: Stock[] }) | null> {
    return prisma.promotion.delete({
      where: { id },
      include: { stock: true },
    });
  }
}
