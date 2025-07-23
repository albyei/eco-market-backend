import express from "express";
import {
  getAllAchievement,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementC";
import { verifyAddAchievement, verifyUpdateAchievement } from "../middlewares/verifyAchievement";
import uploadFileAchievement from "../middlewares/achievementUpload";
import { authenticate } from "../middlewares/auth"; // Assuming you have an authentication middleware

const router = express.Router();
router.use(express.json());

router.get("/", getAllAchievement);
router.get("/:id", getAchievementById);
router.post(
  "/create",
  [authenticate, uploadFileAchievement.single("image"), verifyAddAchievement],
  createAchievement
);
router.put(
  "/:id",
  [authenticate, uploadFileAchievement.single("image"), verifyUpdateAchievement],
  updateAchievement
);
router.delete("/:id", authenticate, deleteAchievement);

export default router;