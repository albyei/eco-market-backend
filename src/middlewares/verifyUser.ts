import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const updateDataSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(), // Ensure valid email for updates
  password: Joi.string().min(3).alphanum().optional(),
  role: Joi.string().valid("ADMIN", "STAFF").optional(),
  picture: Joi.allow().optional(),
  user: Joi.optional(),
});

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
});

const addDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(), // Add email validation
  password: Joi.string().min(3).required(), // Enforce minimum length for consistency
  role: Joi.string().valid("ADMIN", "STAFF").required(),
  picture: Joi.allow().optional(),
  user: Joi.optional(),
});

export const verifyUpdateUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = updateDataSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    return response.status(200).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    });
  }
  return next();
};

export const verifyAuthentification = (
  request: Request,
  response: Response,
  next: NextFunction      
) => {
  const { error } = authSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(200).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    });
  }
  return next();
};

export const verifyAddUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
    // Check specifically for email validation error
    const emailError = error.details.find((err) =>
      err.message.includes('"email" must be a valid email')
    );
    if (emailError) {
      return response.status(400).json({
        status: false,
        message: '"email" must be a valid email',
      });
    }
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }
  return next();
};
