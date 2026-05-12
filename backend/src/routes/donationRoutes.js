import express from "express";
import {
  createDonation,
  getDonations,
  getDonorHistory,
  getReceiverDonations,
  getTopDonors,
} from "../controllers/donationController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getDonations);
router.get("/top/donors", getTopDonors);

// Protected routes
router.post("/", protect, roleCheck(["donor", "admin"]), createDonation);
router.get("/donor/history", protect, roleCheck(["donor"]), getDonorHistory);
router.get("/receiver/donations", protect, roleCheck(["receiver"]), getReceiverDonations);

export default router;
