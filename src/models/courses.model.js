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

    thumbnailURL: {
      type: String,
      required: false,
    },

    videoURL: {
      type: [String],
      required: true,
    },

    basicInformation: {
      language: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
    },

    price: {
      type: Number,
    },

    whatYouWillLearn: {
      type: [String],
      required: true,
    },

    lectureTitle: {
      lectureDescription: {
        type: String,
        required: false,
      },
      video: {
        type: [String],
        required: false,
      },
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

    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Course", courseSchema);
