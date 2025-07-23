import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import logger from "../utils/logger";

const uploadPath = path.join(__dirname, "../../public/alumni_images");

// Pastikan direktori ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  logger.info(`Created upload directory: ${uploadPath}`);
}

const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    logger.info(`Uploading alumni photo to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const filename = `${Date.now()}-${file.originalname}`;
    logger.info(`Saving alumni photo as: ${filename}`);
    cb(null, filename);
  },
});

const uploadFileTestimony = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    const error = new Error("File type not supported. Only JPEG/PNG allowed.");
    logger.error(`File upload failed: ${error.message}`);
    cb(error);
  },
});

export default uploadFileTestimony;