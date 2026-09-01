import express from "express";
import multer from "multer";
import path from "path";
import Bug from "../models/Bug.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("backend/uploads")),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", protect, async (req, res, next) => {
  try {
    const { search = "", status, priority, severity, assignedTo, project, sort = "-createdAt" } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (severity) filter.severity = severity;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (project) filter.project = project;

    const bugs = await Bug.find(filter)
      .populate("project", "name")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email role")
      .sort(sort);
    res.json(bugs);
  } catch (e) { next(e); }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("project", "name")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name role")
      .populate("activity.user", "name role");
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  } catch (e) { next(e); }
});

router.post("/", protect, upload.array("attachments", 5), async (req, res, next) => {
  try {
    const {
      title, description, stepsToReproduce, expectedResult, actualResult,
      priority, severity, project, assignedTo
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({ message: "Title, description and project are required" });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ message: "Project not found" });

    const attachments = (req.files || []).map(f => `/uploads/${f.filename}`);
    const bug = await Bug.create({
      title, description, stepsToReproduce, expectedResult, actualResult,
      priority, severity, project, assignedTo: assignedTo || null,
      reportedBy: req.user._id, attachments,
      activity: [{ user: req.user._id, action: "Bug created" }]
    });

    res.status(201).json(await bug.populate([
      { path: "project", select: "name" },
      { path: "reportedBy", select: "name email" },
      { path: "assignedTo", select: "name email role" }
    ]));
  } catch (e) { next(e); }
});

router.put("/:id", protect, upload.array("attachments", 5), async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    const fields = ["title","description","stepsToReproduce","expectedResult","actualResult","priority","severity","status","project","assignedTo"];
    for (const field of fields) {
      if (req.body[field] !== undefined) bug[field] = req.body[field];
    }
    if (req.files?.length) bug.attachments.push(...req.files.map(f => `/uploads/${f.filename}`));

    bug.activity.push({
      user: req.user._id,
      action: `Bug updated${req.body.status ? `: status changed to ${req.body.status}` : ""}`
    });
    await bug.save();

    res.json(await bug.populate([
      { path: "project", select: "name" },
      { path: "reportedBy", select: "name email" },
      { path: "assignedTo", select: "name email role" },
      { path: "comments.user", select: "name role" },
      { path: "activity.user", select: "name role" }
    ]));
  } catch (e) { next(e); }
});

router.patch("/:id/status", protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["open","in-progress","resolved","closed","reopened"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    bug.status = status;
    bug.activity.push({ user: req.user._id, action: `Status changed to ${status}` });
    await bug.save();
    res.json(bug);
  } catch (e) { next(e); }
});

router.patch("/:id/assign", protect, async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    bug.assignedTo = assignedTo || null;
    bug.activity.push({ user: req.user._id, action: assignedTo ? "Bug assigned" : "Bug unassigned" });
    await bug.save();
    res.json(bug);
  } catch (e) { next(e); }
});

router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment is required" });
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    bug.comments.push({ user: req.user._id, text });
    bug.activity.push({ user: req.user._id, action: "Comment added" });
    await bug.save();
    await bug.populate("comments.user", "name role");
    res.status(201).json(bug.comments.at(-1));
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can delete bugs" });
    const deleted = await Bug.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Bug not found" });
    res.json({ message: "Bug deleted" });
  } catch (e) { next(e); }
});

export default router;