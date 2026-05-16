import express from "express";
import cors    from "cors";
import path    from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import userRoutes         from "./routes/userRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";
import donationRoutes     from "./routes/donationRoutes.js";
import reservationRoutes  from "./routes/reservationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Uploads directory ─────────────────────────────────────────────────────────
// Place the uploads folder at the project root (one level above src/) so that
// multer and the static server always agree on the same absolute path.
//
// Directory layout:
//   backend/
//     src/
//       app.js          ← __dirname points here
//     uploads/          ← files land here (served as GET /uploads/<filename>)
//
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static uploads ────────────────────────────────────────────────────────────
// Serve uploaded avatars as:  GET /uploads/<filename>
// e.g.  http://localhost:5000/uploads/avatar-abc123-1716000000000.jpg
app.use("/uploads", express.static(uploadsDir));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/users",          userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donations",      donationRoutes);
app.use("/api/reservations",   reservationRoutes);

// ── Health-check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("LifeLine API is running...");
});

// ── Multer / generic error handler ───────────────────────────────────────────
// Must come after all routes, before the default Express error handler.
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum size is 5 MB." });
  }
  if (err.message?.includes("Only JPEG")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

export default app;