import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import sanitizeHtml from "sanitize-html";
import { BASE_URL } from "../global";
import logger from "../utils/logger";

export const getAllAchievement = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    let allAchievements;
    
    if (search) {
      allAchievements = await prisma.$queryRaw`
        SELECT * FROM Achievement 
        WHERE LOWER(alumniName) LIKE ${`%${search.toString().toLowerCase()}%`}
        ORDER BY createdAt DESC
      `;
    } else {
      allAchievements = await prisma.achievement.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return response
      .json({
        status: true,
        data: allAchievements,
        message: `Achievements retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const getAchievementById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const achievement = await prisma.achievement.findFirst({
      where: { id: Number(id) },
    });

    if (!achievement) {
      return response
        .status(404)
        .json({ status: false, message: `Achievement with id ${id} not found` });
    }

    return response
      .json({
        status: true,
        data: achievement,
        message: `Achievement retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const createAchievement = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { studentName, title, description, date, category} = request.body;
    let filename = request.file ? request.file.filename : "";
    const sanitizeDescription = description ? sanitizeHtml(description ) : null

    const newAchievement = await prisma.achievement.create({
      data: {
        uuid: uuidv4(),
        studentName: sanitizeHtml(studentName),
        title: sanitizeHtml(title),
        description: sanitizeHtml(description),
        date: date ? new Date(date) : undefined,
        category,
        image: filename ? `${BASE_URL}/public/achievement_images/${filename}` : null,
      },
    });

    return response
      .json({
        status: true,
        data: newAchievement,
        message: `Achievement created successfully`,
      })
      .status(201);
  } catch (error: any) {
    next(error);
  }
};

export const updateAchievement = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { studentName, title, description, date, category } = request.body;
    const sanitizedDescription = description ? sanitizeHtml(description) : null;


    const findAchievement = await prisma.achievement.findFirst({
      where: { id: Number(id) },
    });
    if (!findAchievement) {
      return response
        .status(404)
        .json({ status: false, message: `Achievement with id ${id} not found` });
    }

    let filename = findAchievement.image;
    if (request.file) {
      filename = `${BASE_URL}/public/achievement_images/${request.file.filename}`;
      if (findAchievement.image) {
        let oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          "achievement_images",
          path.basename(findAchievement.image)
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

    const updateAchievement = await prisma.achievement.update({
        where: { id: Number(id) },
      data: {
        studentName: studentName ? sanitizeHtml(studentName) : findAchievement.studentName || findAchievement.studentName,
        title: title ? sanitizeHtml(title) : findAchievement.title,
        description: sanitizedDescription ?? findAchievement.description,
        date: date ? new Date(date) : findAchievement.date,
        category: category || findAchievement.category,
        image: filename,
      },
    });

    return response
      .json({
        status: true,
        data: updateAchievement,
        message: `Achievement updated successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const deleteAchievement = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findAchievement = await prisma.achievement.findFirst({ where: { id: Number(id) } });
    if (!findAchievement) {
      return response
        .status(404)
        .json({ status: false, message: `Achievement with id ${id} not found` });
    }

    if (findAchievement.image) {
      let filePath = path.join(
        __dirname,
        "..",
        "public",
        "achievement_images",
        path.basename(findAchievement.image)
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
    const result = await prisma.achievement.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: result,
        message: `Achievement with id ${id} deleted successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};
