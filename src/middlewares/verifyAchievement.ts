import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const addAchievementSchema = Joi.object({
  studentName: Joi.string().required().max(255).trim().messages({
    "string.base": "Student name must be a string",
    "string.empty": "Student name is required",
    "string.max": "Student name must not exceed 255 characters",
    "any.required": "Student name is required",
  }),
  title: Joi.string().required().max(255).trim().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().required().trim().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
  category: Joi.string()
    .valid("ACADEMIC", "SPORTS", "ARTS")
    .required()
    .messages({
      "string.base": "Category must be a string",
      "string.empty": "Category is required",
      "any.only": "Category must be one of ACADEMIC, SPORTS, ARTS",
      "any.required": "Category is required",
    }),
  image: Joi.any().optional(),
});

const UpdateAchievementSchema = Joi.object({
  studentName: Joi.string().optional().max(255).trim().messages({
    "string.base": "Student name must be a string",
    "string.max": "Student name must not exceed 255 characters",
  }),
  title: Joi.string().optional().max(255).trim().messages({
    "string.base": "Title must be a string",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().optional().trim().messages({
    "string.base": "Description must be a string",
  }),
  date: Joi.date().optional().allow(null).messages({
    "date.base": "Date must be a valid date",
  }),
  category: Joi.string()
    .valid("ACADEMIC", "SPORTS", "ARTS")
    .optional()
    .messages({
      "string.base": "Category must be a string",
      "any.only": "Category must be one of ACADEMIC, SPORTS, ARTS",
    }),
  image: Joi.any().optional(),
});

export const verifyAddAchievement = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addAchievementSchema.validate(request.body, {
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

export const verifyUpdateAchievement = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = UpdateAchievementSchema.validate(request.body, {
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
