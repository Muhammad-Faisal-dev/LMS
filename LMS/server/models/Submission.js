const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  assignmentId: {
    type: String,
    required: true,
    index: true,
  },
  assignmentTitle: {
    type: String,
    required: true,
    trim: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  submissionText: {
    type: String,
    default: "",
    trim: true,
  },
  attachmentUrl: {
    type: String,
    default: "",
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "graded", "returned"],
    default: "submitted",
  },
  grade: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: "",
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: {
    type: Date,
    default: null,
  },
});

SubmissionSchema.index({ course: 1, assignmentId: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
