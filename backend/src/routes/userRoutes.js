import express from "express";
import {
  registerUser,
  loginUser,
  getDonors,
  getDonorById,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Welcome to protected profile",
    user: req.user,
  });
});

// Donor routes (under /api/users/donors)
router.get("/donors", getDonors);
router.get("/donors/:id", getDonorById);

export default router;