import { NextFunction, Request, Response } from "express";
import Joi from "joi";
const addTestimonySchema = Joi.object({
  alumniName: Joi.string().required().max(255).messages({
    "string.base": "Alumni name must be a string",
    "string.empty": "Alumni name is required",
    "string.max": "Alumni name must not exceed 255 characters",
    "any.required": "Alumni name is required",
  }),
  testimony: Joi.string().required().messages({
    "string.base": "Testimony must be a string",
    "string.empty": "Testimony is required",
    "any.required": "Testimony is required",
  }),
  graduationYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().allow(null).messages({
    "number.base": "Graduation year must be a number",
    "number.integer": "Graduation year must be an integer",
    "number.min": "Graduation year must be at least 1900",
    "number.max": `Graduation year cannot be in the future`,
  }),
  photo: Joi.any().optional(),
});

const updateTestimonySchema = Joi.object({
  alumniName: Joi.string().optional().max(255).messages({
    "string.base": "Alumni name must be a string",
    "string.max": "Alumni name must not exceed 255 characters",
  }),
  testimony: Joi.string().optional().messages({
    "string.base": "Testimony must be a string",
  }),
  graduationYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().allow(null).messages({
    "number.base": "Graduation year must be a number",
    "number.integer": "Graduation year must be an integer",
    "number.min": "Graduation year must be at least 1900",
    "number.max": `Graduation year cannot be in the future`,
  }),
  photo: Joi.any().optional(),
});


export const verifyAddTestimony = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addTestimonySchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }
  return next();
};

export const verifyUpdateTestimony = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = updateTestimonySchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }
  return next();
};
