// src/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.code === "P2002") {
    return res.status(400).json({
      status: false,
      message: `Unique constraint failed: ${error.meta?.target}`,
    });
  }

  return res.status(500).json({
    status: false,
    message: `Internal server error: ${error.message}`,
  });
};
