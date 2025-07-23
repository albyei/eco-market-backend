import { Router } from "express";
import { getAllPpdb, getPpdbById, createPpdb, updatePpdb, deletePpdb } from "../controllers/ppdbC";
import { verifyAddPpdb, verifyUpdatePpdb } from "../middlewares/verifyPpdb";
import { authenticate } from "../middlewares/auth";
import uploadFilePpdb from "../middlewares/ppdbUpload";

const router = Router();

router.get("/", getAllPpdb);
router.get("/:id", getPpdbById);
router.post("/create", [authenticate, uploadFilePpdb.single("document"), verifyAddPpdb], createPpdb);
router.put("/:id", [authenticate, uploadFilePpdb.single("document"), verifyUpdatePpdb], updatePpdb);
router.delete("/:id", authenticate, deletePpdb);

export default router;