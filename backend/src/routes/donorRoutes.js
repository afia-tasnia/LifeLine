import express from "express";
import {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
} from "../controllers/donorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonor);
router.get("/", getDonors);
router.get("/:id", getDonorById);
router.put("/:id", protect, updateDonor);

export default router;
