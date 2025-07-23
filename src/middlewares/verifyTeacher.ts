import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import logger from "../utils/logger";

const teacherSchema = Joi.object({
  name: Joi.string().trim().min(1).required().max(255).messages({
    "string.base": "Nama harus berupa string",
    "string.empty": "Nama wajib diisi",
    "string.min": "Nama wajib diisi",
    "string.max": "Nama tidak boleh melebihi 255 karakter",
    "any.required": "Nama wajib diisi",
  }),
  subject: Joi.string().trim().min(1).optional().max(255).messages({
    "string.base": "Jabatan harus berupa string",
    "string.empty": "Jabatan tidak boleh kosong",
    "string.max": "Jabatan tidak boleh melebihi 255 karakter",
  }),
  photo: Joi.any().optional(),
  user: Joi.optional(),
}).unknown(true);

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(
      `Validating teacher input: ${JSON.stringify(req.body, null, 2)}`
    );
    const { error } = teacherSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      logger.warn(`Validation failed: ${errorMessage}`);
      return res.status(400).json({ status: false, message: errorMessage });
    }
    logger.info(`Validation passed for teacher input`);
    next();
  } catch (error: any) {
    logger.error(`Validation error: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
