import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const addNewsSchema = Joi.object({
  title: Joi.string().required().max(255).messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
    "any.required": "Title is required",
  }),
  content: Joi.string().required().messages({
    "string.base": "Content must be a string",
    "string.empty": "Content is required",
    "any.required": "Content is required",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
  picture: Joi.any().optional(),
});

const updateNewsSchema = Joi.object({
  title: Joi.string().optional().max(255).messages({
    "string.base": "Title must be a string",
    "string.max": "Title must not exceed 255 characters",
  }),
  content: Joi.string().optional().messages({
    "string.base": "Content must be a string",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
  picture: Joi.any().optional(),
});

export const verifyAddNews = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addNewsSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    });
  }
  return next();
};

export const verifyUpdateNews = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = updateNewsSchema.validate(request.body, {
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
