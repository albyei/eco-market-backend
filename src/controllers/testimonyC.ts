import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import { BASE_URL } from "../global";
import logger from "../utils/logger";


export const getAllTestimony = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    let allTestimonies;
    
    if (search) {
      allTestimonies = await prisma.$queryRaw`
        SELECT * FROM Testimony 
        WHERE LOWER(alumniName) LIKE ${`%${search.toString().toLowerCase()}%`}
        ORDER BY createdAt DESC
      `;
    } else {
      allTestimonies = await prisma.testimony.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return response
      .json({
        status: true,
        data: allTestimonies,
        message: `Testimonies retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const getTestimontById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const testimony = await prisma.testimony.findFirst({
      where: { id: Number(id) },
    });

    if (!testimony) {
      return response
        .status(404)
        .json({ status: false, message: `Testimony with id ${id} not found` });
    }

    return response
      .json({
        status: true,
        data: testimony,
        message: `Testimony retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const createTestimony = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { alumniName, testimony, graduationYear} = request.body;
    let filename = request.file ? request.file.filename : "";

    const newTestimony = await prisma.testimony.create({
      data: {
        alumniName,
        testimony,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        photo: filename ? `${BASE_URL}/public/alumni_images/${filename}` : null,
      },
    });

    return response
      .json({
        status: true,
        data: newTestimony,
        message: `Testimony created successfully`,
      })
      .status(201);
  } catch (error: any) {
    next(error);
  }
};

export const updateTestimony = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { alumniName, testimony, graduationYear } = request.body;

    const findTestimony = await prisma.testimony.findFirst({
      where: { id: Number(id) },
    });
    if (!findTestimony) {
      return response
        .status(404)
        .json({ status: false, message: `Testimony with id ${id} not found` });
    }

    let filename = findTestimony.photo;
    if (request.file) {
      filename = `${BASE_URL}/public/alumni_images/${request.file.filename}`;
      if (findTestimony.photo) {
        let oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          "alumni_images",
          path.basename(findTestimony.photo)
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

    const updateTestimony = await prisma.testimony.update({
        where: { id: Number(id) },
      data: {
        alumniName: alumniName || findTestimony.alumniName,
        testimony: testimony || findTestimony.testimony,
        graduationYear: graduationYear ? Number(graduationYear) : findTestimony.graduationYear,
        photo: filename,
      },
    });

    return response
      .json({
        status: true,
        data: updateTestimony,
        message: `Testimony updated successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const deleteTestimony = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findTestimony = await prisma.testimony.findFirst({ where: { id: Number(id) } });
    if (!findTestimony) {
      return response
        .status(404)
        .json({ status: false, message: `Testimony with id ${id} not found` });
    }

    if (findTestimony.photo) {
      let filePath = path.join(
        __dirname,
        "..",
        "public",
        "alumni_images",
        path.basename(findTestimony.photo)
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
    const result = await prisma.testimony.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: result,
        message: `Testimony with id ${id} deleted successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};
