import { Address, PrismaClient, Shop, Zone } from "@prisma/client";

const prisma = new PrismaClient();

export class ShopLogic {
  // Create a log and optionally connect to roles
  async createShop(
    data: Omit<Shop, "id"> & {
      addressId?: number;
      zone?: Omit<Zone, "id">;
      address?: Omit<Address, "id" | "zoneId">;
    }
  ): Promise<Shop> {
    const { addressId, address, zone, ...shopData } = data;
    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
        include: { zone: true },
      });
      const shops = await prisma.shop.findMany({
        where: { addressId: address?.zone?.id },
      });
      console.log(address);
      if (shops.length > 0)
        throw new Error("You can not creat another shop in this zone");
    }

    return prisma.shop.create({
      data: {
        ...shopData,
        address: addressId
          ? {
              connect: {
                id: addressId,
              },
            }
          : address
            ? {
                create: { ...address, zone: zone ? { create: zone } : {} },
              }
            : {},
      },
      include: {
        address: {
          include: {
            zone: true,
          },
        },
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
    if (addressId) {
      const zone = await prisma.address.findUnique({
        where: { id: addressId },
        include: { zone: true },
      });
      const shops = await prisma.address.findMany({
        where: { zoneId: zone?.id },
        include: { shops: true },
      });
      if (shops.length > 0 && id === shops[0].id)
        throw new Error("You can not relocate the shop to this zone");
    }

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
