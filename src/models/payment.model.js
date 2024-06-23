const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
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
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  reference: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
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
  transactionId: {
    type: Number,
  },
  paidAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
