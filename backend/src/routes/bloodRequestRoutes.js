import express from "express";
import {
  createBloodRequest,
  getBloodRequests,
  getEmergencyRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
} from "../controllers/bloodRequestController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBloodRequests);
router.get("/emergency", getEmergencyRequests);
router.get("/:id", getBloodRequestById);

// Protected routes
router.post("/", protect, roleCheck(["receiver", "admin"]), createBloodRequest);
router.put("/:id", protect, roleCheck(["receiver", "admin"]), updateBloodRequest);
router.delete("/:id", protect, roleCheck(["receiver", "admin"]), deleteBloodRequest);

export default router;
