import { PrismaClient, Notification } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationLogic {
  // Create a log and optionally connect to roles
  async createNotification(
    data: Omit<Notification, "id"> & { userId?: number }
  ): Promise<Notification> {
    const { userId, ...notificationData } = data;
    return prisma.notification.create({
      data: {
        ...notificationData,
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
      },
    });
  }

  // Get a notification by id, including its roles
  async getNotificationById(id: number): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  // Get all notifications, including their roles
  async getAllNotifications(): Promise<Notification[]> {
    return prisma.notification.findMany();
  }

  // Update a notification and optionally update its roles
  async updateNotification(
    id: number,
    data: Partial<Omit<Notification, "id">> & { userId?: number }
  ): Promise<Notification | null> {
    const { userId, ...notificationData } = data;
    return prisma.notification.update({
      where: { id },
      data: {
        ...notificationData,
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : {},
      },
    });
  }

  // Delete a notification (removes from join table as well)
  async deleteNotification(id: number): Promise<Notification | null> {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
