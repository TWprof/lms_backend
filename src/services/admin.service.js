const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responses = require("../utility/send.response");
const sendMail = require("../utility/mails/index");
const constants = require("../constants");
const crypto = require("crypto");

const createUser = async (payload) => {
  // User = Staff, Tutor
  const foundUser = await Admin.findOne({ email: payload.email });
  if (foundUser) {
    return responses.failureResponse(
      "Email already registered. Please provide another",
      403
    );
  }
  payload.registrationToken = crypto.randomBytes(20).toString("hex");
  payload.tokenExpiration = new Date(Date.now() + 3600000);
  await Admin.create(payload);
  const message = `
  <h1>Set password</h1>
            <p> Follow this link to set your password and you can proceed to login:</p>
            <a href="${process.env.ADMIN_HOST}set-password?registrationToken=${payload.registrationToken}">Set your password here</a>
  `;
  const emailPayload = {
    to: payload.email,
    subject: "Complete Your Registration",
    message: message,
  };
  // send email by calling sendMail function
  await sendMail(emailPayload, constants.mailTypes.setPassword);
  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  };
  return responses.successResponse("User created successfully", 200, data);
};

const setUserPassword = async (payload) => {
  const user = await Admin.findOne({
    registrationToken: payload.registrationToken,
    tokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    return responses.failureResponse("Invalid or Expired Token", 401);
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  const updateAdmin = await Admin.findByIdAndUpdate(
    { _id: user._id },
    { password: payload.password }
  );
  user.registrationToken = undefined;
  user.tokenExpiration = undefined;
  await user.save();
  return responses.successResponse(
    "Password updated successfully",
    200,
    updateAdmin
  );
};

const login = async (payload) => {
  const foundUser = await Admin.findOne({ email: payload.email });
  if (!foundUser) {
    return responses.failureResponse("Email incorrect", 400);
  }
  const foundPassword = await bcrypt.compare(
    payload.password,
    foundUser.password
  );
  if (!foundPassword) {
    return responses.failureResponse("Password Incorrect", 403);
  }
  const token = jwt.sign(
    {
      email: foundUser.email,
      id: foundUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  foundUser.accessToken = token;
  return responses.successResponse("Login successful", 200, foundUser);
};

module.exports = {
  createUser,
  setUserPassword,
  login,
};
