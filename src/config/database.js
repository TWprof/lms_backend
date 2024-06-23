const mongoose = require("mongoose");

// Database configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

module.exports = connectDB;
