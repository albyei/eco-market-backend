import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import sanitizeHtml from "sanitize-html";
import logger from "../utils/logger";
import path from "path";
import fs from "fs";

export const getAllPpdb = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    let allPpdb;

    if (search) {
      allPpdb = await prisma.pPDB.findMany({
        where: {
          title: {
            contains: search.toString(),
            // mode: "insensitive" // Aktifkan jika Prisma versi >= 2.20.0
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      allPpdb = await prisma.pPDB.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return response
      .json({
        status: true,
        data: allPpdb,
        message: `PPDB berhasil diambil`,
      })
      .status(200);
  } catch (error: any) {
    logger.error(`Gagal mengambil PPDB: ${error.message}`);
    next(error);
  }
};

export const getPpdbById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const ppdb = await prisma.pPDB.findFirst({
      where: { id: Number(id) },
    });

    if (!ppdb) {
      return response.status(404).json({
        status: false,
        message: `PPDB dengan id ${id} tidak ditemukan`,
      });
    }

    return response
      .json({
        status: true,
        data: ppdb,
        message: `PPDB berhasil diambil`,
      })
      .status(200);
  } catch (error: any) {
    logger.error(
      `Gagal mengambil PPDB dengan id ${request.params.id || "unknown"}: ${
        error.message
      }`
    );
    next(error);
  }
};

export const createPpdb = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `Data masuk di createPpdb: ${JSON.stringify(request.body, null, 2)}`
    );
    const { title, description, startDate, endDate, contactInfo, document } =
      request.body;

    const newPpdb = await prisma.pPDB.create({
      data: {
        uuid: uuidv4(),
        title: sanitizeHtml(title),
        description: sanitizeHtml(description),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        contactInfo: contactInfo ? sanitizeHtml(contactInfo) : null,
        document: sanitizeHtml(document),
      },
    });

    logger.info(`PPDB created: ${title}`);
    return response
      .json({
        status: true,
        data: newPpdb,
        message: `PPDB berhasil dibuat`,
      })
      .status(201);
  } catch (error: any) {
    logger.error(`Gagal membuat PPDB: ${error.message}`);
    next(error);
  }
};

export const updatePpdb = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { title, description, startDate, endDate, contactInfo, document } =
      request.body;
    const sanitizeDescription = description ? sanitizeHtml(description) : null;
    const sanitizeDocument = document ? sanitizeHtml(document) : null;

    const findPpdb = await prisma.pPDB.findFirst({
      where: { id: Number(id) },
    });

    if (!findPpdb) {
      return response.status(404).json({
        status: false,
        message: `PPDB dengan id ${id} tidak ditemukan`,
      });
    }

    // Hapus file lama jika ada file baru dan file lama ada
    // if (request.file && findPpdb.document) {
    //   const oldFilePath = path.join(
    //     __dirname,
    //     "..",
    //     "..",
    //     "public",
    //     "ppdb_documents",
    //     findPpdb.document
    //   );
    //   if (fs.existsSync(oldFilePath)) {
    //     fs.unlinkSync(oldFilePath);
    //   }
    // }

    const updatePpdb = await prisma.pPDB.update({
      where: { id: Number(id) },
      data: {
        title: title ? sanitizeHtml(title) : findPpdb.title,
        description: sanitizeDescription ?? findPpdb.description,
        startDate: startDate ? new Date(startDate) : findPpdb.startDate,
        endDate: endDate ? new Date(endDate) : findPpdb.endDate,
        contactInfo: contactInfo
          ? sanitizeHtml(contactInfo)
          : findPpdb.contactInfo,
        document: sanitizeDocument ?? findPpdb.document,
      },
    });

    logger.info(`PPDB updated: ${title || findPpdb.title}`);
    return response
      .json({
        status: true,
        data: updatePpdb,
        message: `PPDB berhasil diperbarui`,
      })
      .status(200);
  } catch (error: any) {
    logger.error(
      `Gagal memperbarui PPDB dengan id ${request.params.id || "unknown"}: ${
        error.message
      }`
    );
    next(error);
  }
};

export const deletePpdb = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findPpdb = await prisma.pPDB.findFirst({ where: { id: Number(id) } });

    if (!findPpdb) {
      return response.status(404).json({
        status: false,
        message: `PPDB dengan id ${id} tidak ditemukan`,
      });
    }

    // Hapus file terkait jika ada
    if (findPpdb.document) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "ppdb_documents",
        findPpdb.document
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await prisma.pPDB.delete({
      where: { id: Number(id) },
    });

    logger.info(`PPDB deleted: id ${id}`);
    return response
      .json({
        status: true,
        data: result,
        message: `PPDB dengan id ${id} berhasil dihapus`,
      })
      .status(200);
  } catch (error: any) {
    logger.error(
      `Gagal menghapus PPDB dengan id ${request.params.id || "unknown"}: ${
        error.message
      }`
    );
    next(error);
  }
};
