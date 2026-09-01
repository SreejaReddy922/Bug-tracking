import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();
await connectDB();

const password = await bcrypt.hash("Admin@123", 10);
await User.findOneAndUpdate(
  { email: "admin@example.com" },
  { name: "System Admin", email: "admin@example.com", password, role: "admin" },
  { upsert: true, new: true }
);
console.log("Seeded admin@example.com / Admin@123");
process.exit(0);