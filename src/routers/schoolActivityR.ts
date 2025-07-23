import express from "express";
import {
    getAllSchoolActivity,
    getSchoolActivityById,
    createSchoolActivity,   
    updateSchoolActivity,
    deleteSchoolActivity,
} from "../controllers/schoolActivityC";
import { verifyAddschoolActivities, verifyUpdateschoolActivities } from "../middlewares/verifySchoolActivities";
import uploadFileSchoolActivity from "../middlewares/schoolActivitiesUpload";
import { authenticate } from "../middlewares/auth"; // Assuming you have an authentication middleware
const router = express.Router();
router.use(express.json());

router.get("/", getAllSchoolActivity);
router.get("/:id", getSchoolActivityById);
router.post(
  "/create",
  [authenticate, uploadFileSchoolActivity.single("image"), verifyAddschoolActivities],
  createSchoolActivity
);
router.put(
  "/:id",
  [authenticate, uploadFileSchoolActivity.single("image"), verifyUpdateschoolActivities,
  updateSchoolActivity]
);
router.delete("/:id", authenticate, deleteSchoolActivity);

export default router;