import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import userR from "./routers/userR";
import newsR from "./routers/newsR";
import schoolInfoR from "./routers/schoolInfoR";
import teacherR from "./routers/teacherR";
import testimonyR from "./routers/testimonyR";
import achievementR from "./routers/achievementR";
import eventR from "./routers/eventR";
import schoolActivityR from "./routers/schoolActivityR";
import ppdbR from "./routers/PpdbR";
import path from "path";
import logger from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";

const PORT: number = 9000;
const app = express();

// Middleware untuk mencegah permintaan berulang
const processedRequests = new Set<string>();
app.use((req, res, next) => {
  if (req.method === "POST" && req.url === "/user/create/") {
    const idempotencyKey = req.headers["idempotency-key"] as string;
    if (idempotencyKey && processedRequests.has(idempotencyKey)) {
      return res.status(409).json({ status: false, message: "Request already processed" });
    }
    if (idempotencyKey) processedRequests.add(idempotencyKey);
  }
  next();
});

// Middleware untuk parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk mencatat permintaan
app.use((req, res, next) => {
  const safeBody = { ...req.body };
  if (safeBody.password) {
    safeBody.password = "****"; // Mask password
  }
  const logBody = req.method === "GET" ? "none" : JSON.stringify(safeBody, null, 2);
  logger.info(
    `Permintaan masuk: ${req.method} ${req.url}, body: ${logBody}, headers: ${JSON.stringify(req.headers, null, 2)}`
  );
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(`/user`, userR);
app.use(`/news`, newsR);
app.use(`/school-info`, schoolInfoR);
app.use(`/teacher`, teacherR);
app.use(`/testimony`, testimonyR);
app.use(`/achievement`, achievementR);
app.use(`/event`, eventR);
app.use(`/school-activity`, schoolActivityR);
app.use(`/ppdb`, ppdbR);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`[Server]: Server berjalan di http://localhost:${PORT}`);
});