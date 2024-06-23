const Mongoose = require("mongoose");

const cartSChema = new Mongoose.Schema({
  userId: {
    type: Mongoose.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: Mongoose.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success"],
    default: "pending",
  },
});

module.exports = Mongoose.model("Cart", cartSChema);
