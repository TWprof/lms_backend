const Mongoose = require("mongoose");

const userSchema = new Mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPin: {
      type: Number,
    },
    resetPinExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Users", userSchema);
