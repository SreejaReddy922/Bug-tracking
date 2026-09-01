import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  createdAt: { type: Date, default: Date.now }
});

const bugSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  stepsToReproduce: { type: String, default: "" },
  expectedResult: { type: String, default: "" },
  actualResult: { type: String, default: "" },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  severity: { type: String, enum: ["minor", "major", "critical", "blocker"], default: "major" },
  status: { type: String, enum: ["open", "in-progress", "resolved", "closed", "reopened"], default: "open" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  attachments: [{ type: String }],
  comments: [commentSchema],
  activity: [activitySchema]
}, { timestamps: true });

export default mongoose.model("Bug", bugSchema);