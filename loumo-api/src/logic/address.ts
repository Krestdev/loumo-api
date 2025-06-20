import { PrismaClient, Address } from "../../generated/prisma";

const prisma = new PrismaClient();

export class AddressLogic {
  // Create a address and optionally connect to roles
  async createAddress(
    data: Omit<Address, "id" | "createdAt"> & { zoneId?: number }
  ): Promise<Address> {
    const { zoneId, ...addressData } = data;
    return prisma.address.create({
      data: {
        ...addressData,
        ...(zoneId && {
          zone: {
            connect: {
              id: zoneId,
            },
          },
        }),
      },
    });
  }

  // Get a address by id, including its roles
  async getAddressById(id: number): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  // Get all addresss, including their roles
  async getAllAddresss(): Promise<Address[]> {
    return prisma.address.findMany();
  }

  // Update a address and optionally update its roles
  async updateAddress(
    id: number,
    data: Partial<Omit<Address, "id">> & { zoneId?: number }
  ): Promise<Address | null> {
    const { zoneId, ...addressData } = data;
    return prisma.address.update({
      where: { id },
      data: {
        ...addressData,
        zone: {
          connect: {
            id: zoneId,
          },
        },
      },
    });
  }

  // Delete a address (removes from join table as well)
  async deleteAddress(id: number): Promise<Address | null> {
    return prisma.address.delete({
      where: { id },
    });
  }
}
