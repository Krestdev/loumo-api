import { Address, PrismaClient, Zone } from "../../generated/prisma";

const prisma = new PrismaClient();

export class ZoneLogic {
  // Create a zone and optionally connect to addresses
  async createZone(
    data: Omit<Zone, "id"> & { addressIds?: number[] }
  ): Promise<Zone> {
    const { addressIds, ...zoneData } = data;
    return prisma.zone.create({
      data: {
        ...zoneData,
        addresses: addressIds
          ? {
              connect: addressIds.map((addressId) => ({ id: addressId })),
            }
          : undefined,
      },
    });
  }

  // Get a zone by id, including its addresses
  async getZoneById(
    id: number
  ): Promise<(Zone & { addresses: Address[] }) | null> {
    return prisma.zone.findUnique({
      where: { id },
      include: { addresses: true },
    });
  }

  // Get all zones, including their addresses
  async getAllZones(): Promise<(Zone & { addresses: Address[] })[]> {
    return prisma.zone.findMany({
      include: {
        addresses: {
          include: {
            orders: true,
            shops: true,
          },
        },
      },
    });
  }

  // Update a zone and optionally update its addresses
  async updateZone(
    id: number,
    data: Partial<Omit<Zone, "id">> & { addressIds?: number[] }
  ): Promise<(Zone & { addresses: Address[] }) | null> {
    const { addressIds, ...zoneData } = data;
    return prisma.zone.update({
      where: { id },
      data: {
        ...zoneData,
        addresses: addressIds
          ? {
              connect: addressIds.map((roleId) => ({ id: roleId })),
            }
          : {},
      },
      include: { addresses: true },
    });
  }

  // Delete a zone (removes from join table as well)
  async deleteZone(
    id: number
  ): Promise<(Zone & { addresses: Address[] }) | null> {
    return prisma.zone.delete({
      where: { id },
      include: { addresses: true },
    });
  }
}
