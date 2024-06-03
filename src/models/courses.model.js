const Mongoose = require("mongoose");

const courseSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
        required: true,
      },
    ],
    thumbnailURL: {
      type: String,
      required: true,
    },
    pricing: {
      type: Number,
    },
    tutor: {
      type: Mongoose.Types.ObjectId,
      ref: "1", // tutor
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Course", courseSchema);
