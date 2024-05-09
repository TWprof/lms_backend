const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    registrationToken: {
      type: String,
    },
    tokenExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", staffSchema);
