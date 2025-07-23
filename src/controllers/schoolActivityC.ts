import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import sanitizeHtml from "sanitize-html";
import { BASE_URL } from "../global";
import logger from "../utils/logger";

export const getAllSchoolActivity = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    let allSchoolActivity;

    if (search) {
      allSchoolActivity = await prisma.$queryRaw`
        SELECT * FROM SchoolActivity 
        WHERE LOWER(title) LIKE ${`%${search.toString().toLowerCase()}%`}
        ORDER BY createdAt DESC
      `;
    } else {
      allSchoolActivity = await prisma.schoolActivity.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return response
      .json({
        status: true,
        data: allSchoolActivity,
        message: `School Activity retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const getSchoolActivityById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const schoolActivity = await prisma.schoolActivity.findFirst({
      where: { id: Number(id) },
    });

    if (!schoolActivity) {
      return response
        .status(404)
        .json({
          status: false,
          message: `School Activity with id ${id} not found`,
        });
    }

    return response
      .json({
        status: true,
        data: schoolActivity,
        message: `School Activity retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const createSchoolActivity = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { title, description, date, media } = request.body;
    let filename = request.file ? request.file.filename : "";
    const sanitizeDescription = description ? sanitizeHtml(description) : null;

    const newSchoolActivity = await prisma.schoolActivity.create({
      data: {
        title: sanitizeHtml(title),
        description: sanitizeHtml(description),
        date: date ? new Date(date) : undefined,
        media: media ? sanitizeHtml(media) : null,
        image: filename ? `${BASE_URL}/public/schoolActivity_images/${filename}` : null,
      },
    });

    return response
      .json({
        status: true,
        data: newSchoolActivity,
        message: `School Activity created successfully`,
      })
      .status(201);
  } catch (error: any) {
    next(error);
  }
};

export const updateSchoolActivity = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { title, description, date, media } = request.body;
    const sanitizedDescription = description ? sanitizeHtml(description) : null;

    const findschoolActivity = await prisma.schoolActivity.findFirst({
      where: { id: Number(id) },
    });
    if (!findschoolActivity) {
      return response
        .status(404)
        .json({
          status: false,
          message: `School Activity with id ${id} not found`,
        });
    }

    let filename = findschoolActivity.image;
    if (request.file) {
      filename = `${BASE_URL}/public/schoolActivity_images/${request.file.filename}`;
      if (findschoolActivity.image) {
        let oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          "schoolActivity_images",
          path.basename(findschoolActivity.image)
        );
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            logger.error(`Failed to delete old photo: ${err}`);
          }
        }
      }
    }
    const updateSchoolActivity = await prisma.schoolActivity.update({
      where: { id: Number(id) },
      data: {
        title: title ? sanitizeHtml(title) : findschoolActivity.title,
        description: sanitizedDescription ?? findschoolActivity.description,
        date: date ? new Date(date) : findschoolActivity.date,
        media: media ? sanitizeHtml(media) : findschoolActivity.media,
        image: filename,
      },
    });

    return response
      .json({
        status: true,
        data: updateSchoolActivity,
        message: `School Activity updated successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};


export const deleteSchoolActivity = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findschoolActivity = await prisma.schoolActivity.findFirst({ where: { id: Number(id) } });
    if (!findschoolActivity) {
      return response
        .status(404)
        .json({ status: false, message: `School Activity with id ${id} not found` });
    }

    if (findschoolActivity.image) {
      let filePath = path.join(
        __dirname,
        "..",
        "public",
        "schoolActivity_images",
        path.basename(findschoolActivity.image)
      );
     if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`Deleted photo: ${filePath}`);
        } catch (err) {
          logger.error(`Failed to delete photo: ${err}`);
        }
      }
    }
    const result = await prisma.schoolActivity.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: result,
        message: `School Activity with id ${id} deleted successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};
