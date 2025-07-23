import express from "express";
import {
  getAllEvent,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventC";
import { verifyAddEvent, verifyUpdateEvent } from "../middlewares/verifyEvent";
import uploadFileEvent from "../middlewares/eventUpload";
import { authenticate } from "../middlewares/auth"; // Assuming you have an authentication middleware


const router = express.Router();
router.use(express.json());

router.get("/", getAllEvent);
router.get("/:id", getEventById);
router.post(
  "/create",
  [authenticate, uploadFileEvent.single("image"), verifyAddEvent],
  createEvent
);
router.put(
  "/:id",
  [authenticate, uploadFileEvent.single("image"), verifyUpdateEvent],
  updateEvent
);
router.delete("/:id", authenticate, deleteEvent);

export default router;