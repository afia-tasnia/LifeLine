import express from "express";
import {
  createBloodRequest,
  getEmergencyUsageToday,
  getBloodRequests,
  getEmergencyRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  getLiveStats,
} from "../controllers/bloodRequestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateBloodRequest } from "../middleware/validators.js";

const router = express.Router();

// Public — specific routes MUST come before /:id to avoid param capture
router.get("/",                      getBloodRequests);
router.get("/emergency",             getEmergencyRequests);
router.get("/stats",                 getLiveStats);

// Protected — specific routes before /:id
router.post("/",                     protect, validateBloodRequest, createBloodRequest);
router.get("/emergency-usage/today", protect, getEmergencyUsageToday);

// Param routes last
router.get("/:id",                   getBloodRequestById);
router.put("/:id",                   protect, updateBloodRequest);
router.delete("/:id",                protect, deleteBloodRequest);

export default router;