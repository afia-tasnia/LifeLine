import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donations", donationRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("LifeLine API is running...");
});

export default app;