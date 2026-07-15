const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["students", "teachers", "both"],
      required: true,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add method to check if a user has read this message
MessageSchema.methods.isReadByUser = function (userId) {
  return this.readBy.some(
    (record) => record.user.toString() === userId.toString()
  );
};

// Add a virtual property to get number of readers
MessageSchema.virtual("readCount").get(function () {
  return this.readBy.length;
});

module.exports = mongoose.model("Message", MessageSchema);
