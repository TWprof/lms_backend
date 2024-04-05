const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");

//Student signup
const userSignUp = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });
  if (foundUser) {
    return responses.failureResponse("Email already exists", 400);
  }
  payload.password = await bcrypt.hash(payload.password, 10);

  const registerUser = await User.create(payload);
  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  };
  return responses.successResponse("Registeration successful", 201, data);
};

// Student Login
const userLogin = async (payload) => {
  const foundUser = await User.findOne({ email: payload.email });
  if (!foundUser) {
    return responses.failureResponse("User details incorrect", 404);
  }
  const userPassword = await bcrypt.compare(
    payload.password,
    foundUser.password
  );
  if (!userPassword) {
    return responses.failureResponse("Invalid password", 400);
  }

  const token = jwt.sign(
    {
      email: foundUser.email,
      _id: foundUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  return responses.successResponse("Login successful", 200, foundUser, token);
};

module.exports = { userSignUp, userLogin };
