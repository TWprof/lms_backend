const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Student signup
const userSignUp = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });
  if (foundUser) {
    return {
      message: "Email already exists",
      statusCode: 400,
    };
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  payload.role = "student";

  const registerUser = await User.create(payload);
  return {
    message: "Registration successful",
    statusCode: 201,
    data: registerUser,
  };
};

module.exports = { userSignUp };
