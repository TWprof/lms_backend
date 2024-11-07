const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ["Admin", "User"],
      required: true,
    },

    senderId: {
      type: mongoose.Types.ObjectId,
      refPath: senderType,
      required: true,
    },

    receiverType: {
      type: String,
      enum: ["Admin", "User"],
      required: true,
    },

    receiverId: {
      type: mongoose.Types.ObjectId,
      refPath: receiverType,
      required: true,
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
