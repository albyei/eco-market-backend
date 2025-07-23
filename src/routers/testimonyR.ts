import express from "express";
import {
  getAllTestimony,
  getTestimontById,
  createTestimony,
  updateTestimony,
  deleteTestimony,
} from "../controllers/testimonyC";
import {verifyAddTestimony, verifyUpdateTestimony} from "../middlewares/verifyTestimony";
import uploadFileTestimony from "../middlewares/testimonyUpload";

const app = express();
app.use(express.json());

app.get(`/`, getAllTestimony);
app.get(`/:id`, getTestimontById);
app.post(`/create`, [uploadFileTestimony.single("photo"), verifyAddTestimony], createTestimony);
app.put(`/:id`, [uploadFileTestimony.single("photo"), verifyUpdateTestimony], updateTestimony);
app.delete(`/:id`, deleteTestimony);

export default app;