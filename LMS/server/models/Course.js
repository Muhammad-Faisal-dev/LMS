const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  materials: [
    {
      title: String,
      description: String,
      fileUrl: String,
      messageContent: String,
      type: {
        type: String,
        enum: ["file", "message", "link"],
        default: "file",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  assignments: [
    {
      title: String,
      description: String,
      dueDate: Date,
      totalPoints: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
