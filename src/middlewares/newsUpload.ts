import { Request } from "express";
import multer from "multer";
import path from "path";
import logger from "../utils/logger";

const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(__dirname, "../../public/news_images");
    logger.info(`Uploading news image to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const filename = `${Date.now()}-${file.originalname}`;
    logger.info(`Saving news image as: ${filename}`);
    cb(null, filename);
  },
});

const uploadFileNews = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error("File type not supported. Only JPEG/PNG allowed."));
  },
});

export default uploadFileNews;
