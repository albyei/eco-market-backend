import express from "express";
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../controllers/newsC";
import { verifyAddNews, verifyUpdateNews } from "../middlewares/verifyNews";
import uploadFileNews from "../middlewares/newsUpload";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.get(`/`, getAllNews);
app.get(`/:id`, getNewsById);
app.post(`/create`, [verifyToken, verifyRole(["ADMIN"]), uploadFileNews.single("picture"), verifyAddNews], createNews);
app.put(`/:id`, [verifyToken, verifyRole(["ADMIN"]), uploadFileNews.single("picture"), verifyUpdateNews], updateNews);
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteNews);

export default app;