import express from "express";
import Bug from "../models/Bug.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, async (req, res, next) => {
  try {
    const [total, open, inProgress, resolved, closed, critical] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: "open" }),
      Bug.countDocuments({ status: "in-progress" }),
      Bug.countDocuments({ status: "resolved" }),
      Bug.countDocuments({ status: "closed" }),
      Bug.countDocuments({ priority: "critical" })
    ]);

    const byPriority = await Bug.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const byStatus = await Bug.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    res.json({ total, open, inProgress, resolved, closed, critical, byPriority, byStatus });
  } catch (e) { next(e); }
});

export default router;