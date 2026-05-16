import express from "express";
import {
  createReservation,
  getReservations,
  getTodayStats,
  updateReservationStatus,
  deleteReservation,
} from "../controllers/reservationController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — any donor (logged in or not) can submit a reservation
// optionalAuth means we attach req.user if a token is present, but don't block if not
router.post("/", protect, createReservation);                        // logged-in donors
// If you want guest (unauthenticated) donors to also reserve, swap the line above for:
// router.post("/", createReservation);

// Admin only
router.get("/",         protect, roleCheck(["admin"]), getReservations);
router.get("/stats",    protect, roleCheck(["admin"]), getTodayStats);
router.put("/:id",      protect, roleCheck(["admin"]), updateReservationStatus);
router.delete("/:id",   protect, roleCheck(["admin"]), deleteReservation);

export default router;