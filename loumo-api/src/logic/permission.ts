import { PrismaClient, Permission } from "../../generated/prisma";

const prisma = new PrismaClient();

export class PermissionLogic {
  // Create a permission and optionally connect to roles
  async createPermission(
    data: Omit<Permission, "id"> & { roleIds?: number[] }
  ): Promise<Permission> {
    const { roleIds, ...permissionData } = data;
    return prisma.permission.create({
      data: {
        ...permissionData,
        roles: roleIds
          ? {
              connect: roleIds.map((roleId) => ({ id: roleId })),
            }
          : undefined,
      },
    });
  }

  // Get a permission by id, including its roles
  async getPermissionById(
    id: number
  ): Promise<(Permission & { roles: any[] }) | null> {
    return prisma.permission.findUnique({
      where: { id },
      include: { roles: true },
    });
  }

  // Get all permissions, including their roles
  async getAllPermissions(): Promise<(Permission & { roles: any[] })[]> {
    return prisma.permission.findMany({
      include: { roles: true },
    });
  }

  // Update a permission and optionally update its roles
  async updatePermission(
    id: number,
    data: Partial<Omit<Permission, "id">> & { roleIds?: number[] }
  ): Promise<(Permission & { roles: any[] }) | null> {
    const { roleIds, ...permissionData } = data;
    return prisma.permission.update({
      where: { id },
      data: {
        ...permissionData,
        roles: roleIds
          ? {
              set: roleIds.map((roleId) => ({ id: roleId })),
            }
          : {},
      },
      include: { roles: true },
    });
  }

  // Delete a permission (removes from join table as well)
  async deletePermission(
    id: number
  ): Promise<(Permission & { roles: any[] }) | null> {
    return prisma.permission.delete({
      where: { id },
      include: { roles: true },
    });
  }
}
