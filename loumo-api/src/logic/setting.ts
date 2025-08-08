import { PrismaClient, Setting } from "@prisma/client";

const prisma = new PrismaClient();

export class SettingLogic {
  // Create a log and optionally connect to roles
  async createSetting(data: Omit<Setting, "id">): Promise<Setting> {
    const { ...settingData } = data;
    return prisma.setting.create({
      data: {
        ...settingData,
      },
    });
  }

  // Get a setting by id, including its roles
  async getSettingById(id: number): Promise<Setting | null> {
    return prisma.setting.findUnique({
      where: { id },
    });
  }

  // Get all settings, including their roles
  async getAllSettings(section?: string): Promise<Setting[]> {
    return prisma.setting.findMany({
      where: section
        ? {
            section,
          }
        : {},
    });
  }

  // Update a setting and optionally update its roles
  async updateSetting(
    id: number,
    data: Partial<Omit<Setting, "id">>
  ): Promise<Setting | null> {
    const { ...settingData } = data;
    return prisma.setting.update({
      where: { id },
      data: {
        ...settingData,
      },
    });
  }

  // Delete a setting (removes from join table as well)
  async deleteSetting(id: number): Promise<Setting | null> {
    return prisma.setting.delete({
      where: { id },
    });
  }
}
