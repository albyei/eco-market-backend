import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { Major } from "@prisma/client";
import logger from "../utils/logger";

export const SchoolInfoSchema = Joi.object({
  totalStudents: Joi.number().integer().min(0).required(),
  major: Joi.string().valid(...Object.values(Major)).required(),
});

export const UpdateSchoolInfoSchema = Joi.object({
  totalStudents: Joi.number().integer().min(0).optional(),
  major: Joi.string().valid(...Object.values(Major)).optional(),
});

export const DecreaseStudentSchema = Joi.object({
  major: Joi.string().valid(...Object.values(Major)).required(),
  amount: Joi.number().integer().min(1).required(),
});

export const verifyAddSchoolInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = {
    totalStudents: Number(req.body.totalStudents),
    major: req.body.major,
  };

  const { error } = SchoolInfoSchema.validate(parsedBody, { abortEarly: false });
  if (error) {
    logger.error(`Validation error in verifyAddSchoolInfo: ${error.details.map(d => d.message).join(", ")}`);
    return res.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }

  req.body = parsedBody;
  return next();
};

export const verifyUpdateSchoolInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = {
    totalStudents:
      req.body.totalStudents !== undefined
        ? Number(req.body.totalStudents)
        : undefined,
    major: req.body.major,
  };

  const { error } = UpdateSchoolInfoSchema.validate(parsedBody, {
    abortEarly: false,
  });

  if (error) {
    logger.error(`Validation error in verifyUpdateSchoolInfo: ${error.details.map(d => d.message).join(", ")}`);
    return res.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }

  req.body = parsedBody;
  return next();
};

export const verifyDecreaseStudent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedBody = {
    major: req.body.major,
    amount: Number(req.body.amount),
  };

  const { error } = DecreaseStudentSchema.validate(parsedBody, { abortEarly: false });
  if (error) {
    logger.error(`Validation error in verifyDecreaseStudent: ${error.details.map(d => d.message).join(", ")}`);
    return res.status(400).json({
      status: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  req.body = parsedBody;
  return next();
};