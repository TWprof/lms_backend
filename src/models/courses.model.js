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

    price: {
      type: Number,
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

    whatYouWillLearn: {
      type: [String],
      required: true,
    },

    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
        videoURLs: {
          type: [String],
          required: false,
        },
        lectureNumber: {
          type: Number,
          required: true,
        },
      },
    ],

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

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Course", courseSchema);
