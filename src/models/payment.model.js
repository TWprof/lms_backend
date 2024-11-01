const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "initiated", "failed"],
      default: "pending",
    },
    reference: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    cartIds: {
      type: [String],
      required: true,
    },
    currency: {
      type: String,
    },
    channel: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
