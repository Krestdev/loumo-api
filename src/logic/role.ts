import { Permission, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export class RoleLogic {
  async createRole(
    data: Omit<Role, "id"> & { permissionIds?: number[] }
  ): Promise<Role> {
    const { permissionIds, ...roleData } = data;
    return prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              connect: permissionIds.map((id) => ({ id })),
            }
          : {},
      },
    });
  }

  async updateRole(
    id: number,
    data: Partial<Omit<Role, "id">> & { permissionIds?: number[] }
  ): Promise<Role> {
    const { permissionIds, ...roleData } = data;
    return prisma.role.update({
      where: {
        id,
      },
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              connect: permissionIds.map((id) => ({ id })),
            }
          : {},
      },
    });
  }

  async getRoleById(
    id: number
  ): Promise<(Role & { permissions: Permission[] }) | null> {
    return prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
  }

  async addPermissionsToRole(
    roleId: number,
    permissionIds: number[]
  ): Promise<Role> {
    return prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
    });
  }

  async removePermissionsFromRole(
    roleId: number,
    permissionIds: number[]
  ): Promise<Role> {
    return prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: permissionIds.map((id) => ({ id })),
        },
      },
    });
  }

  async listRoles(): Promise<(Role & { permissions: Permission[] })[]> {
    return prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async deleteRole(id: number): Promise<{ name: string; id: number }> {
    return prisma.role.delete({
      where: {
        id: id,
      },
    });
  }
}
