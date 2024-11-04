const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
