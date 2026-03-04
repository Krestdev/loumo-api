// middleware/authorize.ts
import { Request, Response, NextFunction } from "express";
import { getUserIdFromRequest } from "../utils/auth-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * RBAC middleware for route protection.
 * Usage: rbac({ permissions: ["create:user"], roles: ["admin"] })
 * If either permissions or roles match, access is granted.
 */
export function rbac({
  permissions = [],
  roles = [],
}: {
  permissions?: string[];
  roles?: string[];
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: true } },
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userPermissions = user.role?.permissions.map((p) => p.action) || [];
    const userRole = user.role?.name;

    // Check for required permissions
    const hasPermission = permissions.some((perm) =>
      userPermissions.includes(perm)
    );
    // Check for required roles
    const hasRole = roles.some((role) => userRole === role);

    if (!hasPermission && !hasRole) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    // Optionally attach user to request for downstream use
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = {
      id: user.id,
      role: userRole,
      permissions: userPermissions,
    };
    next();
  };
}
