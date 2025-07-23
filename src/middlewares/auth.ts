import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Authentication failed: No token provided");
    return res.status(401).json({
      status: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as jwt.JwtPayload;

    // Validate that decoded is an object with the expected properties
    if (
      typeof decoded === "string" ||
      !decoded.id ||
      !decoded.email ||
      !decoded.role ||
      decoded.iat === undefined ||
      decoded.exp === undefined
    ) {
      logger.warn("Authentication failed: Invalid token payload");
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid token payload",
      });
    }

    // Assign decoded to req.user with the expected type
    req.user = {
      id: decoded.id,
      name: decoded.name || "", // Provide default if name is missing
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat, // TypeScript now knows iat is number
      exp: decoded.exp, // TypeScript now knows exp is number
    };
    next();
  } catch (error: any) {
    logger.error(`Authentication failed: ${error.message || "Unknown error"}`);
    return res.status(401).json({
      status: false,
      message: `Unauthorized: ${error.message || "Invalid token"}`,
    });
  }
};