import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/donors", donorRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("LifeLine API is running...");
});

export default app;