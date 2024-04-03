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

const userLogin = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });
  if (!foundUser) {
    return {
      message: "User details incorrect",
      success: false,
      statusCode: 404,
    };
  }
  const userPassword = await bcrypt.compare(
    payload.password,
    foundUser.password
  );
  if (!userPassword) {
    return {
      message: "Invalid password",
      success: false,
      statusCode: 400,
    };
  }

  const token = jwt.sign(
    {
      email: foundUser.email,
      _id: foundUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5min",
    }
  );
  return {
    message: "Login successful",
    success: true,
    statusCode: 200,
    data: foundUser,
    token: token,
  };
};

module.exports = { userSignUp, userLogin };
