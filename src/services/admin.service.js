const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");

// ADMIN CREATION X SIGNUP
const createAdmin = async (payload) => {
  const foundEmail = await Admin.findOne({ email: payload.email });
  if (foundEmail) {
    return responses.failureResponse("Email already registered", 400);
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  const createStaff = await Admin.create(payload);
  const data = {
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
  };
  return responses.successResponse(
    "Staff/Tutor created successfully",
    200,
    data
  );
};

// ADMIN LOGIN
const loginStaff = async (payload) => {
  /**
   * check if user email exists
   * check  if provided password is correct or not
   * log staff in
   */
  const foundStaff = await Admin.findOne({ email: payload.email });
  if (!foundStaff) {
    return responses.failureResponse("Email incorrect", 400);
  }
  const foundPassword = await bcrypt.compare(
    payload.password,
    foundStaff.password
  );
  payload.role = "Staff";
  if (!foundPassword) {
    return responses.failureResponse("Password Incorrect", 403);
  }
  const token = jwt.sign(
    {
      email: foundStaff.email,
      id: foundStaff._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  foundStaff.accessToken = token;
  return responses.successResponse("Login successful", 200, foundStaff);
};

// TUTOR LOGIN
const tutorLogin = async (payload) => {
  /**
   * check if user email exists
   * check  if provided password is correct or not
   * log tutor in
   */
  const foundTutor = await Admin.findOne({ email: payload.email });
  if (!foundTutor) {
    return responses.failureResponse("Invalid email address", 404);
  }
  payload.role = "Tutor";
  const savedPassword = await bcrypt.compare(
    payload.password,
    foundTutor.password
  );
  if (!savedPassword) {
    return responses.failureResponse("Password Incorrect", 400);
  }
  const token = jwt.sign(
    {
      email: foundTutor.email,
      id: foundTutor._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  foundTutor.accessToken = token;
  return responses.successResponse("Login successful", 200, foundTutor);
};
module.exports = { createAdmin, loginStaff, tutorLogin };
