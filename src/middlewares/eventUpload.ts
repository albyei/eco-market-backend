import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import logger from "../utils/logger";

const uploadPath = path.join(__dirname, "../../public/event_images");


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
    logger.info(`Uploading acheivement image to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
    logger.info(`Saving event image as: ${filename}`);
    cb(null, filename);
  },
});

const uploadFileEvent = multer({
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

export default uploadFileEvent;