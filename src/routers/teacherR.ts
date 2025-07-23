import { Router } from "express";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherC";
import verifyTeacher from "../middlewares/verifyTeacher";
import uploadFileTeacher from "../middlewares/teacherUpload";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const app = Router();

app.get(`/`, verifyToken, verifyRole(["ADMIN", "STAFF"]), getAllTeachers);

// 🛠️ PERBAIKAN DI SINI:
app.post(
  `/`,
  verifyToken,
  verifyRole(["ADMIN"]),
  uploadFileTeacher.any(), // GANTI .single("photo") ➜ .any()
  verifyTeacher,
  createTeacher
);

app.put(
  `/:id`,
  verifyToken,
  verifyRole(["ADMIN"]),
  uploadFileTeacher.any(), // GANTI juga di PUT
  verifyTeacher,
  updateTeacher
);

app.delete(`/:id`, verifyToken, verifyRole(["ADMIN"]), deleteTeacher);

export default app;
