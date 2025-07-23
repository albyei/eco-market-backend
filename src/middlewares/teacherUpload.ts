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
    const uploadPath = path.join(__dirname, "../../public/teacher_photos");
    logger.info(`Uploading teacher photo to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const filename = `${Date.now()}-${file.originalname}`;
    logger.info(`Saving teacher photo as: ${filename}`);
    cb(null, filename);
  },
});

const uploadFileTeacher = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maks 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype.toLowerCase());

    if (mimetype) {
      cb(null, true);
    } else {
      // ❗ Jangan throw error, agar form-data tetap bisa diproses walau file tidak valid
      cb(null, false);
    }
  },
});

export default uploadFileTeacher;
