import express  from "express";
import multer   from "multer";
import path     from "path";
import { fileURLToPath } from "url";
import {
  registerUser, loginUser, updateProfile, uploadAvatar,
  getDonors, getDonorById,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import loginRateLimiter from "../middleware/loginRateLimiter.js";
import { validateRegister } from "../middleware/validators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();

// ── Multer config ──────────────────────────────────────────────────────────────
//
// IMPORTANT: the destination MUST match the `uploadsDir` used in app.js so that
// multer writes files to the same folder that express.static("/uploads", ...) serves.
//
// app.js resolves: path.join(__dirname_of_app, "..", "uploads")
//   = backend/uploads/
//
// This file lives at backend/src/routes/userRoutes.js, so:
//   path.join(__dirname, "..", "..", "uploads")
//   = backend/uploads/   ✓ same folder
//
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Routes ────────────────────────────────────────────────────────────────────
router.post("/register", validateRegister, registerUser);
router.post("/login",    loginRateLimiter,  loginUser);

router.get("/profile",  protect, (req, res) => res.json({ user: req.user }));
router.put("/profile",  protect, updateProfile);

// Avatar upload — multer runs before the controller so req.file is available
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

router.get("/donors",     getDonors);
router.get("/donors/:id", getDonorById);

export default router;