import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

await connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5175",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Bug Tracker API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});