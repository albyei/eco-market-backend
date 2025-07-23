import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const addEventSchema = Joi.object({
  title: Joi.string().required().max(255).trim().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
    "any.required": "Title is required",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
    location: Joi.string().required().max(255).trim().messages({
        "string.base": "Location must be a string",
        "string.empty": "Location is required",
        "string.max": "Location must not exceed 255 characters",
        "any.required": "Location is required",
    }),
  description: Joi.string().required().trim().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  image: Joi.any().optional(),
});


const UpdateEventSchema = Joi.object({
  title: Joi.string().optional().max(255).trim().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
    location: Joi.string().optional().max(255).trim().messages({
        "string.base": "Location must be a string",
        "string.empty": "Location is required",
        "string.max": "Location must not exceed 255 characters",
    }),
  description: Joi.string().optional().trim().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
  }),
  image: Joi.any().optional(),
});


export const verifyAddEvent = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addEventSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details
        .map((it: { message: any }) => it.message)
        .join(", "),
    });
  }
  return next();
};

export const verifyUpdateEvent = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = UpdateEventSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details
        .map((it: { message: any }) => it.message)
        .join(", "),
    });
  }
  return next();
};
