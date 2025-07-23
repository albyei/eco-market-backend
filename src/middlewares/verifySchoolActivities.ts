import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const addSchoolActivitiesSchema = Joi.object({
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
    media: Joi.string().optional().allow(null).messages({
        "string.base": "Media must be a string",
    }),
    image: Joi.any().optional(),
});


const UpdateSchoolActivitiesSchema = Joi.object({
    title: Joi.string().optional().max(255).trim().messages({
        "string.base": "Title must be a string",
        "string.empty": "Title is required",
        "string.max": "Title must not exceed 255 characters",
    }),
    description: Joi.string().required().trim().messages({
        "string.base": "Description must be a string",
        "string.empty": "Description is required",
    }),
    date: Joi.date().optional().allow(null).messages({
        "date.base": "Date must be a valid date",
    }),
    media: Joi.string().optional().allow(null).messages({
        "string.base": "Media must be a string",
    }),
    image: Joi.any().optional(),
});


export const verifyAddschoolActivities = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addSchoolActivitiesSchema.validate(request.body, {
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

export const verifyUpdateschoolActivities = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = UpdateSchoolActivitiesSchema.validate(request.body, {
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
