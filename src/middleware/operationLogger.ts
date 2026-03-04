import { Request, Response, NextFunction } from "express";
import { OperationLogger } from "../utils/logger";

// Helper to determine action from HTTP method
function getAction(method: string): string | null {
  switch (method) {
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return null;
  }
}

// Middleware factory for a given entity type
export function operationLoggerMiddleware(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const action = getAction(req.method);
    if (!action) return next();

    // Save old values for update/delete if needed (optional, can be improved)
    const before = req.body.before || null;
    const after = req.body || null;

    // Get user info (assumes req.user is set by auth middleware)
    const performed_by = req.user?.id?.toString() || "system";
    const ip_address = req.ip;
    const entity_ids =
      req.params.id || req.body.id || req.body.entityId || "unknown";

    // Wait for response to finish to log changes
    res.on("finish", async () => {
      // Only log if operation was successful
      if (res.statusCode >= 200 && res.statusCode < 400) {
        await OperationLogger.log({
          entity_type: entityType,
          entity_ids: entity_ids.toString(),
          action,
          performed_by,
          ip_address,
          changes: { before, after },
          description: `${action} on ${entityType} by ${performed_by}`,
        });
      }
    });
    next();
  };
}
