import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import { BASE_URL } from "../global";
import logger from "../utils/logger";

interface CustomRequest extends Request {
  user?: any;
}

export const getAllTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Fetched ${teachers.length} teachers`);

    return res.status(200).json({
      status: true,
      data: teachers,
      message: "Teachers retrieved successfully",
    });
  } catch (error: any) {
    logger.error(`Failed to fetch teachers: ${error.message}`);
    next(error);
  }
};

export const createTeacher = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, subject } = req.body;
    const user = req.user;

    if (!user) {
      logger.error("User not authenticated in createTeacher");
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    let photoUrl = null;

    if (Array.isArray(req.files)) {
      const photoFile = req.files.find(
        (file) => file.fieldname === "photo"
      ) as Express.Multer.File;

      if (photoFile) {
        photoUrl = `${BASE_URL}/public/teacher_photos/${photoFile.filename}`;
        logger.info(`Teacher photo uploaded: ${photoUrl}`);
      }
    }

    if (!photoUrl && req.body.photo) {
      photoUrl = req.body.photo;
      logger.info(`Teacher photo URL provided: ${photoUrl}`);
    }

    const teacher = await prisma.teacher.create({
      data: {
        name,
        subject,
        photo: photoUrl,
      },
    });

    logger.info(`Teacher created: id=${teacher.id}, name=${name}`);
    return res.status(201).json({
      status: true,
      data: teacher,
      message: "Teacher created successfully",
    });
  } catch (error: any) {
    logger.error(`Failed to create teacher: ${error.message}`);
    next(error);
  }
};

export const updateTeacher = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, subject } = req.body;
    const user = req.user;

    if (!user) {
      logger.error("User not authenticated in updateTeacher");
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });
    if (!teacher) {
      logger.warn(`Teacher not found: id=${id}`);
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    let photoUrl = teacher.photo;

    if (Array.isArray(req.files)) {
      const photoFile = req.files.find(
        (file) => file.fieldname === "photo"
      ) as Express.Multer.File;

      if (photoFile) {
        photoUrl = `${BASE_URL}/public/teacher_photos/${photoFile.filename}`;
        logger.info(`Teacher photo updated: ${photoUrl}`);

        if (teacher.photo) {
          const oldPhotoPath = path.join(
            __dirname,
            "../../public/teacher_photos",
            path.basename(teacher.photo)
          );

          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
            logger.info(`Deleted old teacher photo: ${oldPhotoPath}`);
          }
        }
      }
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        name,
        subject,
        photo: photoUrl,
      },
    });

    logger.info(`Teacher updated: id=${id}, name=${name}`);
    return res.status(200).json({
      status: true,
      data: updatedTeacher,
      message: "Teacher updated successfully",
    });
  } catch (error: any) {
    logger.error(`Failed to update teacher: ${error.message}`);
    next(error);
  }
};

export const deleteTeacher = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      logger.error("User not authenticated in deleteTeacher");
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });
    if (!teacher) {
      logger.warn(`Teacher not found: id=${id}`);
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    if (teacher.photo) {
      const photoPath = path.join(
        __dirname,
        "../../public/teacher_photos",
        path.basename(teacher.photo)
      );
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
        logger.info(`Deleted teacher photo: ${photoPath}`);
      }
    }

    await prisma.teacher.delete({ where: { id: parseInt(id) } });

    logger.info(`Teacher deleted: id=${id}`);
    return res.status(200).json({
      status: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Failed to delete teacher: ${error.message}`);
    next(error);
  }
};
