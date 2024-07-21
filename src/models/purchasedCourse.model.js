const Mongoose = require("mongoose");

const purchasedCourseSchema = new Mongoose.Schema({
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
  isCompleted: {
    type: Number,
    default: 0,
  },
  minutesSpent: {
    type: Number,
    default: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Mongoose.model("Purchased Courses", purchasedCourseSchema);
