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

    videoURL: {
      type: String,
      required: true,
    },

    thumbnailURL: {
      type: String,
      required: false,
    },

    price: {
      type: Number,
    },

    whatYouWillLearn: {
      type: [String],
      required: true,
    },

    tutor: {
      type: Mongoose.Types.ObjectId,
      ref: "1", // tutor
      required: true,
    },

    tutorName: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Course", courseSchema);
