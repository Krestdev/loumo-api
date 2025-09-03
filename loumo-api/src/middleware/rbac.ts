import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../configs";
import { Permission, Role, User } from "@prisma/client";

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User & {
        role: Role & {
          permissions: Permission[];
        };
      };
    }
  }
}

// JWT Token verification middleware
const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, config.JWT.SECRET) as { userId: number };

    // Fetch user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    if (!user.active) {
      res.status(403).json({ error: "User account is not active" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
    } else {
      res.status(500).json({ error: "Authentication error" });
    }
  }
};

// Role-based access control middleware
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Permission-based access control middleware
const requirePermission = (requiredPermissions: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Get all user permissions (from role + direct permissions)
    const userPermissions = new Set<string>();

    // Add role permissions
    req.user.role.permissions.forEach((permission) => {
      userPermissions.add(permission.action);
    });

    // Add direct user permissions
    req.user.role.permissions.forEach((permission) => {
      userPermissions.add(permission.action);
    });

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        error: `Access denied. Required permissions: ${requiredPermissions.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Resource ownership middleware (for user-specific resources)
const requireOwnership = (resourceUserIdField: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Admin users can access all resources
    if (req.user.role.name === "admin") {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId =
      req.body[resourceUserIdField] || req.params[resourceUserIdField];

    if (resourceUserId && parseInt(resourceUserId) !== req.user.id) {
      res.status(403).json({
        error: "Access denied. You can only access your own resources.",
      });
      return;
    }

    next();
  };
};

// Public routes that don't require authentication
const publicRoutes = [
  "/health",
  "/api/users",
  "/api/roles",
  "/api/permissions",
  "/api/address",
  "/api/zones",
  "/api/logs",
  "/api/categories",
  "/api/products",
  "/api/productvariants",
  "/api/shops",
  "/api/stocks",
  "/api/promotions",
  "/api/orders",
  "/api/orderitems",
  "/api/agents",
  "/api/payments",
  "/api/deliveries",
  "/api/notifications",
  "/api/faqs",
  "/api/topics",
  "/api/settings",
  "/api/uploads",
];

const pawapay = ["/api/payments/order/updates"];

// Auth routes that don't require authentication (all methods)
const authRoutes = [
  "/api/users/login",
  "/api/users",
  "/api/users/password-reset",
];

// Check if route is public
const isPublicRoute = (req: Request): boolean => {
  // Check if it's an auth route (all methods allowed)
  const isAuthRoute = authRoutes.some((route) => req.path === route);

  // Check if it is an update from pawapay

  const isPawapay = pawapay.some((route) => req.path === route);

  // Check if it's a public content route (GET requests only)
  const isPublicPath = publicRoutes.some(
    (route) => req.path.startsWith(route) && req.method === "GET"
  );

  // Allow subscription to newsletter (POST requests to /api/subscribers)
  const isNewsletterSubscription =
    req.path === "/api/subscribers" && req.method === "POST";

  // Allow public access to specific resources by ID (GET requests only)
  const isPublicResource =
    req.path.match(
      /^\/(api\/products|api\/blogs|api\/events|api\/offers|api\/projects|api\/reviews|api\/team-members|api\/ads)\/\d+$/
    ) && req.method === "GET";

  return (
    isAuthRoute ||
    isPawapay ||
    isPublicPath ||
    isNewsletterSubscription ||
    !!isPublicResource
  );
};

// Main RBAC middleware
const RBACMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip authentication for public routes
    if (isPublicRoute(req)) {
      next();
      return;
    }

    // Apply authentication for all other routes
    await authenticateToken(req, res, next);
  } catch {
    res.status(500).json({ error: "RBAC middleware error" });
  }
};

// Convenience middleware for common roles
const requireAdmin = requireRole(["admin"]);
const requireManager = requireRole(["admin", "manager"]);
const requireEditor = requireRole(["admin", "manager", "editor"]);
const requireUser = requireRole(["admin", "manager", "editor", "user"]);

// Convenience middleware for common permissions
const requireUserManagement = requirePermission(["user:read", "user:write"]);
const requireContentManagement = requirePermission([
  "content:read",
  "content:write",
]);
const requireSystemManagement = requirePermission([
  "system:read",
  "system:write",
]);

// Export all middleware functions
export {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  RBACMiddleware,
  requireAdmin,
  requireManager,
  requireEditor,
  requireUser,
  requireUserManagement,
  requireContentManagement,
  requireSystemManagement,
};
