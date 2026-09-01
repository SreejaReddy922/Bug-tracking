import express from "express";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (e) { next(e); }
});

router.patch("/:id/role", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["admin", "developer", "tester"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
});

export default router;