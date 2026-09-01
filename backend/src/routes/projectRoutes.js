import express from "express";
import Project from "../models/Project.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const projects = await Project.find().populate("createdBy", "name email").populate("members", "name email role").sort({ createdAt: -1 });
    res.json(projects);
  } catch (e) { next(e); }
});

router.post("/", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { name, description, members = [] } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required" });
    const project = await Project.create({ name, description, members, createdBy: req.user._id });
    res.status(201).json(await project.populate(["createdBy", "members"]));
  } catch (e) { next(e); }
});

router.patch("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("createdBy", "name email").populate("members", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (e) { next(e); }
});

export default router;