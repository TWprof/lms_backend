const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "1",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
