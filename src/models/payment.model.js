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
    default: "pending",
  },
  reference: {
    type: String,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
  },
  ipAdress: {
    type: String,
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
