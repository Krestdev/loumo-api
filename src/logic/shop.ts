import { PrismaClient, Shop } from "../../generated/prisma";

const prisma = new PrismaClient();

export class ShopLogic {
  // Create a log and optionally connect to roles
  async createShop(
    data: Omit<Shop, "id"> & { addressId?: number }
  ): Promise<Shop> {
    const { addressId, ...shopData } = data;
    return prisma.shop.create({
      data: {
        ...shopData,
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

  // Get a shop by id, including its roles
  async getShopById(id: number): Promise<Shop | null> {
    return prisma.shop.findUnique({
      where: { id },
    });
  }

  // Get all shops, including their roles
  async getAllShops(): Promise<Shop[]> {
    return prisma.shop.findMany({ include: { address: true } });
  }

  // Update a shop and optionally update its roles
  async updateShop(
    id: number,
    data: Partial<Omit<Shop, "id">> & { addressId?: number }
  ): Promise<Shop | null> {
    const { addressId, ...shopData } = data;
    return prisma.shop.update({
      where: { id },
      data: {
        ...shopData,
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

  // Delete a shop (removes from join table as well)
  async deleteShop(id: number): Promise<Shop | null> {
    return prisma.shop.delete({
      where: { id },
    });
  }
}
