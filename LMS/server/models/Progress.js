const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  completedMaterials: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  lastViewedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
