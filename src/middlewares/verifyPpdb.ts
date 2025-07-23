import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import logger from "../utils/logger";

const addPpdbSchema = Joi.object({
  title: Joi.string().required().max(255).trim().messages({
    "string.base": "Judul harus berupa string",
    "string.empty": "Judul wajib diisi",
    "string.max": "Judul tidak boleh melebihi 255 karakter",
    "any.required": "Judul wajib diisi",
  }),
  description: Joi.string().required().trim().messages({
    "string.base": "Deskripsi harus berupa string",
    "string.empty": "Deskripsi wajib diisi",
    "any.required": "Deskripsi wajib diisi",
  }),
  startDate: Joi.string().required().isoDate().messages({
    "string.base": "Tanggal mulai harus berupa string",
    "string.empty": "Tanggal mulai wajib diisi",
    "string.isoDate":
      "Tanggal mulai harus dalam format ISO 8601 (contoh: 2025-07-21 atau 2025-07-21T00:00:00.000Z)",
    "any.required": "Tanggal mulai wajib diisi",
  }),
  endDate: Joi.string()
    .required()
    .isoDate()
    .custom((value, helpers) => {
      const startDate = helpers.state.ancestors[0].startDate;
      if (startDate && new Date(value) <= new Date(startDate)) {
        return helpers.error("date.greater");
      }
      return value;
    })
    .messages({
      "string.base": "Tanggal selesai harus berupa string",
      "string.empty": "Tanggal selesai wajib diisi",
      "string.isoDate":
        "Tanggal selesai harus dalam format ISO 8601 (contoh: 2025-08-21 atau 2025-08-21T00:00:00.000Z)",
      "any.required": "Tanggal selesai wajib diisi",
      "date.greater": "Tanggal selesai harus setelah tanggal mulai",
    }),
  contactInfo: Joi.string().required().max(255).trim().messages({
    "string.base": "Informasi kontak harus berupa string",
    "string.empty": "Informasi kontak wajib diisi",
    "string.max": "Informasi kontak tidak boleh melebihi 255 karakter",
    "any.required": "Informasi kontak wajib diisi",
  }),
  document: Joi.string().optional().max(255).trim().messages({
    "string.base": "Dokumen harus berupa string",
    "string.max": "Dokumen tidak boleh melebihi 255 karakter",
  }),
});

const updatePpdbSchema = Joi.object({
  title: Joi.string().optional().max(255).trim().messages({
    "string.base": "Judul harus berupa string",
    "string.max": "Judul tidak boleh melebihi 255 karakter",
  }),
  description: Joi.string().optional().trim().messages({
    "string.base": "Deskripsi harus berupa string",
  }),
  startDate: Joi.string().optional().isoDate().messages({
    "string.base": "Tanggal mulai harus berupa string",
    "string.isoDate":
      "Tanggal mulai harus dalam format ISO 8601 (contoh: 2025-07-21 atau 2025-07-21T00:00:00.000Z)",
  }),
  endDate: Joi.string()
    .optional()
    .isoDate()
    .when("startDate", {
      is: Joi.exist(),
      then: Joi.string()
        .isoDate()
        .custom((value, helpers) => {
          const startDate = helpers.state.ancestors[0].startDate;
          if (startDate && new Date(value) <= new Date(startDate)) {
            return helpers.error("date.greater");
          }
          return value;
        }),
    })
    .messages({
      "string.base": "Tanggal selesai harus berupa string",
      "string.isoDate":
        "Tanggal selesai harus dalam format ISO 8601 (contoh: 2025-08-21 atau 2025-08-21T00:00:00.000Z)",
      "date.greater": "Tanggal selesai harus setelah tanggal mulai",
    }),
  contactInfo: Joi.string().optional().max(255).trim().messages({
    "string.base": "Informasi kontak harus berupa string",
    "string.max": "Informasi kontak tidak boleh melebihi 255 karakter",
  }),
  document: Joi.string().optional().max(255).trim().messages({
    "string.base": "Dokumen harus berupa string",
    "string.max": "Dokumen tidak boleh melebihi 255 karakter",
  }),
});

export const verifyAddPpdb = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info(
    `Sebelum validasi addPpdb: ${JSON.stringify(request.body, null, 2)}`
  );
  const { error } = addPpdbSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    logger.error(
      `Validasi gagal: ${error.details.map((it) => it.message).join(", ")}`
    );
    return response.status(400).json({
      status: false,
      message: error.details
        .map((it: { message: any }) => it.message)
        .join(", "),
    });
  }
  return next();
};

export const verifyUpdatePpdb = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info(
    `Sebelum validasi updatePpdb: ${JSON.stringify(request.body, null, 2)}`
  );
  const { error } = updatePpdbSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    logger.error(
      `Validasi gagal: ${error.details.map((it) => it.message).join(", ")}`
    );
    return response.status(400).json({
      status: false,
      message: error.details
        .map((it: { message: any }) => it.message)
        .join(", "),
    });
  }
  return next();
};
