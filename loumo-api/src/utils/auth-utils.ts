// middleware/auth-utils.ts
import { Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "../configs";

export function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  try {
    const jwtSecret = config.JWT.SECRET;
    if (!jwtSecret) return null;
    const decoded = jwt.verify(token, jwtSecret) as unknown as {
      userId: number;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}
