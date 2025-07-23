import { Request, Response, NextFunction } from "express";
import { PrismaClient, Major } from "@prisma/client";
import logger from "../utils/logger";
import Joi from "joi";

const prisma = new PrismaClient({ errorFormat: "pretty" });

// Schema validasi untuk create dan update
const SchoolInfoSchema = Joi.object({
  totalStudents: Joi.number().integer().min(0).required(),
  major: Joi.string().valid(...Object.values(Major)).required(),
});

const UpdateSchoolInfoSchema = Joi.object({
  totalStudents: Joi.number().integer().min(0).optional(),
  major: Joi.string().valid(...Object.values(Major)).optional(),
});

const DecreaseStudentSchema = Joi.object({
  major: Joi.string().valid(...Object.values(Major)).required(),
  amount: Joi.number().integer().min(1).required(),
});

// Interface untuk response yang konsisten
interface ApiResponse<T> {
  status: boolean;
  data?: T;
  message: string;
}

// Middleware untuk autentikasi
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.body.user;
  if (!user) {
    logger.error("User not authenticated");
    return res.status(401).json({
      status: false,
      message: "Unauthorized: User not authenticated",
    } as ApiResponse<null>);
  }
  next();
};

export const getSchoolInfo = async (req: Request, res: Response) => {
  try {
    const schoolInfoRecords = await prisma.schoolInfo.findMany({
      select: {
        id: true,
        totalStudents: true,
        major: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalStudents = schoolInfoRecords.reduce(
      (sum, record) => sum + record.totalStudents,
      0
    );

    const studentsByMajor = schoolInfoRecords.reduce((acc, record) => {
      const major = record.major || "UNSPECIFIED";
      acc[major] = (acc[major] || 0) + record.totalStudents;
      return acc;
    }, {} as Record<string, number>);

    logger.info(
      `Fetched school info: totalStudents=${totalStudents}, studentsByMajor=${JSON.stringify(studentsByMajor)}`
    );

    return res.status(200).json({
      status: true,
      data: {
        totalStudents,
        studentsByMajor,
        records: schoolInfoRecords,
      },
      message: "School information retrieved successfully",
    } as ApiResponse<any>);
  } catch (error: any) {
    logger.error(`Failed to fetch school info: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    } as ApiResponse<null>);
  }
};

export const createSchoolInfo = async (req: Request, res: Response) => {
  try {
    const { error, value } = SchoolInfoSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error(`Validation error: ${error.details.map(d => d.message).join(", ")}`);
      return res.status(400).json({
        status: false,
        message: error.details.map(d => d.message).join(", "),
      } as ApiResponse<null>);
    }

    const { totalStudents, major } = value;

    const newSchoolInfo = await prisma.schoolInfo.create({
      data: {
        totalStudents,
        major: major as Major,
      },
    });

    logger.info(`Created new school info: ${JSON.stringify(newSchoolInfo)}`);

    return res.status(201).json({
      status: true,
      data: newSchoolInfo,
      message: "School information created successfully",
    } as ApiResponse<any>);
  } catch (error: any) {
    logger.error(`Failed to create school info: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    } as ApiResponse<null>);
  }
};

export const updateSchoolInfo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { error, value } = UpdateSchoolInfoSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error(`Validation error: ${error.details.map(d => d.message).join(", ")}`);
      return res.status(400).json({
        status: false,
        message: error.details.map(d => d.message).join(", "),
      } as ApiResponse<null>);
    }

    const existing = await prisma.schoolInfo.findUnique({ where: { id } });
    if (!existing) {
      logger.warn(`School info not found for id: ${id}`);
      return res.status(404).json({
        status: false,
        message: "School info not found",
      } as ApiResponse<null>);
    }

    const updated = await prisma.schoolInfo.update({
      where: { id },
      data: {
        totalStudents: value.totalStudents ?? existing.totalStudents,
        major: value.major ? value.major as Major : existing.major,
      },
    });

    logger.info(`Updated school info: ${JSON.stringify(updated)}`);

    return res.status(200).json({
      status: true,
      data: updated,
      message: "School information updated successfully",
    } as ApiResponse<any>);
  } catch (error: any) {
    logger.error(`Failed to update school info: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    } as ApiResponse<null>);
  }
};

export const getSchoolInfoSummary = async (req: Request, res: Response) => {
  try {
    const [total, perMajor] = await Promise.all([
      prisma.schoolInfo.aggregate({
        _sum: { totalStudents: true },
      }),
      prisma.schoolInfo.groupBy({
        by: ["major"],
        _sum: { totalStudents: true },
      }),
    ]);

    return res.status(200).json({
      status: true,
      data: {
        totalStudents: total._sum.totalStudents || 0,
        perMajor: perMajor.map((m) => ({
          major: m.major || "UNSPECIFIED",
          totalStudents: m._sum.totalStudents || 0,
        })),
      },
      message: "School info summary retrieved successfully",
    } as ApiResponse<any>);
  } catch (error: any) {
    logger.error(`Failed to get school info summary: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    } as ApiResponse<null>);
  }
};

export const decreaseStudentsByMajor = async (req: Request, res: Response) => {
  try {
    const { error, value } = DecreaseStudentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error(`Validation error: ${error.details.map(d => d.message).join(", ")}`);
      return res.status(400).json({
        status: false,
        message: error.details.map(d => d.message).join(", "),
      } as ApiResponse<null>);
    }

    const { major, amount } = value;

    const records = await prisma.schoolInfo.findMany({
      where: { major: major as Major },
      orderBy: { id: "asc" },
      select: {
        id: true,
        totalStudents: true,
      },
    });

    if (records.length === 0) {
      logger.warn(`No records found for major: ${major}`);
      return res.status(404).json({
        status: false,
        message: `No records found for major ${major}`,
      } as ApiResponse<null>);
    }

    let remainingToSubtract = amount;

    const updates = records.map(async (record) => {
      if (remainingToSubtract <= 0) return;

      const subtractAmount = Math.min(record.totalStudents, remainingToSubtract);
      const newTotal = record.totalStudents - subtractAmount;

      if (isNaN(newTotal)) return;

      await prisma.schoolInfo.update({
        where: { id: record.id },
        data: { totalStudents: newTotal },
      });

      logger.info(
        `ID ${record.id}: Decreased ${subtractAmount} students, from ${record.totalStudents} to ${newTotal}`
      );

      remainingToSubtract -= subtractAmount;
    });

    await Promise.all(updates);

    if (remainingToSubtract > 0) {
      logger.warn(`Could not subtract ${remainingToSubtract} students: insufficient student count`);
      return res.status(400).json({
        status: false,
        message: `Could not subtract all requested students: insufficient student count`,
      } as ApiResponse<null>);
    }

    const afterUpdate = await prisma.schoolInfo.findMany({
      where: { major: major as Major },
    });

    return res.status(200).json({
      status: true,
      data: afterUpdate,
      message: `Successfully decreased ${amount} students from major ${major}`,
    } as ApiResponse<any>);
  } catch (error: any) {
    logger.error(`Failed to decrease students: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Internal server error: ${error.message}`,
    } as ApiResponse<null>);
  }
};