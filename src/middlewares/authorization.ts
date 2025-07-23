import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import logger from "../utils/logger";

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error(
      `No valid Authorization header provided: ${authHeader || "none"}`
    );
    return res
      .status(401)
      .json({
        status: false,
        message: `Access denied. No valid token provided.`,
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      logger.error("JWT_SECRET is not defined in environment variables");
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = verify(token, secretKey) as JwtPayload;
    logger.info(`Token verified for user: ${decoded.email}, id: ${decoded.id}`);

    // Initialize req.body if undefined
    req.body = req.body || {};
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    logger.error(`Token verification failed: ${error.message}`);
    return res
      .status(401)
      .json({ status: false, message: `Invalid token: ${error.message}` });
  }
};

export const verifyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload;
    if (!user || !roles.includes(user.role)) {
      logger.warn(
        `Access denied for user ${user?.email || "unknown"}: Insufficient role`
      );
      return res
        .status(403)
        .json({ status: false, message: `Access denied. Insufficient role.` });
    }
    next();
  };
};
