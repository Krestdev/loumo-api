// middleware/authorize.ts
import { Request, Response, NextFunction } from "express";
import { getUserIdFromRequest } from "../utils/auth-utils"; // JWT extraction
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserIdFromRequest(req); // parse JWT token

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const permissions = user.role?.permissions.map((rp) => rp.action);

    if (!permissions?.includes(requiredPermission)) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    // All good, continue
    next();
  };
}
