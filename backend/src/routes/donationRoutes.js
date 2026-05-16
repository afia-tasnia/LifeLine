import express from "express";
import {
  createDonation,
  getCooldownStatus,
  getDonations,
  getDonorHistory,
  getDonationsByDonorId,
  deleteDonation,
  getReceiverDonations,
  getTopDonors,
} from "../controllers/donationController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/top-donors",          getTopDonors);
router.get("/donor/:donorId",      getDonationsByDonorId); // public donor history page

// Protected — specific routes before /:id
router.post("/",                   protect, roleCheck(["donor"]), createDonation);
router.get("/cooldown-status",     protect, roleCheck(["donor"]), getCooldownStatus);
router.get("/my-history",          protect, roleCheck(["donor"]), getDonorHistory);
router.get("/received",            protect, roleCheck(["receiver"]), getReceiverDonations);
router.get("/",                    protect, roleCheck(["admin"]),  getDonations);

// Delete own donation (donor only)
router.delete("/:id",              protect, roleCheck(["donor"]), deleteDonation);

export default router;