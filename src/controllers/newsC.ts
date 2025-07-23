import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import { BASE_URL } from "../global";

export const getAllNews = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    const allNews = await prisma.news.findMany({
      where: { title: { contains: search?.toString() || "" } },
      include: { author: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    return response
      .json({
        status: true,
        data: allNews,
        message: `News retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const getNewsById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const news = await prisma.news.findFirst({
      where: { id: Number(id) },
      include: { author: { select: { name: true } } },
    });

    if (!news) {
      return response
        .status(404)
        .json({ status: false, message: `News with id ${id} not found` });
    }

    return response
      .json({
        status: true,
        data: news,
        message: `News retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const createNews = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { title, content, date } = request.body;
    const uuid = uuidv4();
    let filename = request.file ? request.file.filename : "";
    const authorId = request.body.user?.id;

    const newNews = await prisma.news.create({
      data: {
        uuid,
        title,
        content,
        date: date ? new Date(date) : new Date(),
        image: filename ? `${BASE_URL}/public/news_images/${filename}` : null,
        authorId,
      },
    });

    return response
      .json({
        status: true,
        data: newNews,
        message: `News created successfully`,
      })
      .status(201);
  } catch (error: any) {
    next(error);
  }
};

export const updateNews = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { title, content, date } = request.body;

    const findNews = await prisma.news.findFirst({
      where: { id: Number(id) },
    });
    if (!findNews) {
      return response
        .status(404)
        .json({ status: false, message: `News with id ${id} not found` });
    }

    let filename = findNews.image;
    if (request.file) {
      filename = `${BASE_URL}/public/news_images/${request.file.filename}`;
      if (findNews.image) {
        let filePath = path.join(
          __dirname,
          "..",
          "public",
          "news_images",
          path.basename(findNews.image)
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const updateNews = await prisma.news.update({
      data: {
        title: title || findNews.title,
        content: content || findNews.content,
        date: date ? new Date(date) : findNews.date,
        image: filename,
      },
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: updateNews,
        message: `News updated successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const deleteNews = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findNews = await prisma.news.findFirst({ where: { id: Number(id) } });
    if (!findNews) {
      return response
        .status(404)
        .json({ status: false, message: `News with id ${id} not found` });
    }

    if (findNews.image) {
      let filePath = path.join(
        __dirname,
        "..",
        "public",
        "news_images",
        path.basename(findNews.image)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await prisma.news.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: result,
        message: `News with id ${id} deleted successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};
