import express from "express";
import multer from "multer";
import {
  createSchoolInfo,
  getSchoolInfo,
  getSchoolInfoSummary,
  updateSchoolInfo,
  decreaseStudentsByMajor,
} from "../controllers/schoolInfoC";
import {
  verifyAddSchoolInfo,
  verifyUpdateSchoolInfo,
  verifyDecreaseStudent,
} from "../middlewares/verifiySchoolInfo";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Routes
router.get("/", getSchoolInfo);
router.get("/summary", getSchoolInfoSummary);
router.post("/", upload.none(), verifyAddSchoolInfo, createSchoolInfo);
router.put("/:id", upload.none(), verifyUpdateSchoolInfo, updateSchoolInfo);
router.patch("/decrease", upload.none(), verifyDecreaseStudent, decreaseStudentsByMajor);

export default router;