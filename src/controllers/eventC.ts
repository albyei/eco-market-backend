import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import sanitizeHtml from "sanitize-html";
import { BASE_URL } from "../global";
import logger from "../utils/logger";

export const getAllEvent = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { search } = request.query;
    let allEvent;
    
    if (search) {
      allEvent = await prisma.$queryRaw`
        SELECT * FROM Event 
        WHERE LOWER(title) LIKE ${`%${search.toString().toLowerCase()}%`}
        ORDER BY createdAt DESC
      `;
    } else {
      allEvent = await prisma.event.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return response
      .json({
        status: true,
        data: allEvent,
        message: `Event retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const getEventById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const event = await prisma.event.findFirst({
      where: { id: Number(id) },
    });

    if (!event) {
      return response
        .status(404)
        .json({ status: false, message: `Event with id ${id} not found` });
    }

    return response
      .json({
        status: true,
        data: event,
        message: `Event retrieved successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const createEvent = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { title, date, location, description} = request.body;
    let filename = request.file ? request.file.filename : "";
    const sanitizeDescription = description ? sanitizeHtml(description ) : null

    const newEvent = await prisma.event.create({
      data: {
        title: sanitizeHtml(title),
        date: date ? new Date(date) : undefined,
        location: sanitizeHtml(location),
        description: sanitizeHtml(description),
        image: filename ? `${BASE_URL}/public/event_images/${filename}` : null,
      },
    });

    return response
      .json({
        status: true,
        data: newEvent,
        message: `Event created successfully`,
      })
      .status(201);
  } catch (error: any) {
    next(error);
  }
};


export const updateEvent = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const { title, date, location, description } = request.body;
    const sanitizedDescription = description ? sanitizeHtml(description) : null;


    const findEvent = await prisma.event.findFirst({
      where: { id: Number(id) },
    });
    if (!findEvent) {
      return response
        .status(404)
        .json({ status: false, message: `Event with id ${id} not found` });
    }

    let filename = findEvent.image;
    if (request.file) {
      filename = `${BASE_URL}/public/event_images/${request.file.filename}`;
      if (findEvent.image) {
        let oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          "event_images",
          path.basename(findEvent.image)
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
     const updateEvent = await prisma.event.update({
        where: { id: Number(id) },
      data: {
        title: title ? sanitizeHtml(title) : findEvent.title,
        date: date ? new Date(date) : findEvent.date,
        location: location ? sanitizeHtml(location) : findEvent.location,
        description: sanitizedDescription ?? findEvent.description,
        image: filename,
      },
    });

    return response
      .json({
        status: true,
        data: updateEvent,
        message: `Event updated successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};

export const deleteEvent = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params;
    const findEvent = await prisma.event.findFirst({ where: { id: Number(id) } });
    if (!findEvent) {
      return response
        .status(404)
        .json({ status: false, message: `Event with id ${id} not found` });
    }

    if (findEvent.image) {
      let filePath = path.join(
        __dirname,
        "..",
        "public",
        "event_images",
        path.basename(findEvent.image)
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
    const result = await prisma.event.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: result,
        message: `Event with id ${id} deleted successfully`,
      })
      .status(200);
  } catch (error: any) {
    next(error);
  }
};
