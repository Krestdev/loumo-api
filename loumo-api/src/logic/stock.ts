import { ProductVariant, PrismaClient, Stock } from "../../generated/prisma";

const prisma = new PrismaClient();

export class StockLogic {
  async createStock(
    data: Omit<Stock, "id" | "promotionId"> & {
      shopId: number;
    }
  ): Promise<Stock> {
    const { shopId, productVariantId, ...stockData } = data;
    return prisma.stock.create({
      data: {
        ...stockData,
        shop: shopId
          ? {
              connect: {
                id: shopId,
              },
            }
          : {},
        productVariant: productVariantId
          ? {
              connect: {
                id: productVariantId,
              },
            }
          : {},
      },
    });
  }

  async updateStock(
    id: number,
    data: Partial<Omit<Stock, "id" | "shopId" | "productVariantId">> & {
      promotionId?: number;
    }
  ): Promise<Stock> {
    const { promotionId, ...stockData } = data;
    return prisma.stock.update({
      where: {
        id,
      },
      data: {
        ...stockData,
        promotion: promotionId
          ? {
              connect: {
                id: promotionId,
              },
            }
          : {},
      },
    });
  }

  async getStockById(
    id: number
  ): Promise<(Stock & { productVariant: ProductVariant | null }) | null> {
    return prisma.stock.findUnique({
      where: { id },
      include: { productVariant: true },
    });
  }

  async addOproductVariantToStock(
    stockId: number,
    promotionId: number
  ): Promise<Stock> {
    return prisma.stock.update({
      where: { id: stockId },
      data: {
        productVariant: {
          connect: {
            id: promotionId,
          },
        },
      },
    });
  }

  async removeProductVariantFromStock(
    stockId: number,
    promotionId: number
  ): Promise<Stock> {
    return prisma.stock.update({
      where: { id: stockId },
      data: {
        productVariant: {},
        promotion: {
          disconnect: {
            id: promotionId,
          },
        },
      },
    });
  }

  async listStocks(): Promise<
    (Stock & { productVariant: ProductVariant | null })[]
  > {
    return prisma.stock.findMany({
      include: { productVariant: true },
    });
  }

  async deleteStock(id: number): Promise<Stock> {
    return prisma.stock.delete({
      where: {
        id: id,
      },
    });
  }
}
