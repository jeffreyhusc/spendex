import { Request, Response, NextFunction } from "express";
import { verifyJwt, UserTokenPayload } from "../auth";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
